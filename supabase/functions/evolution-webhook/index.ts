import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req: Request) => {
  // ── Verificação de saúde ──────────────────────────────────
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'evolution-webhook' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // ── Filtrar apenas eventos de mensagens recebidas ─────────
  const event = body.event as string | undefined;
  if (event !== 'messages.upsert') {
    // Ignorar outros eventos (status, qr-code, etc.)
    return new Response(JSON.stringify({ ignored: true, event }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const instance = body.instance as string | undefined;
  const data = body.data as Record<string, unknown> | undefined;

  if (!instance || !data) {
    return new Response(JSON.stringify({ error: 'Missing instance or data' }), { status: 400 });
  }

  // ── Extrair dados da mensagem ─────────────────────────────
  const key = data.key as Record<string, unknown> | undefined;
  const remoteJid = key?.remoteJid as string | undefined;
  const fromMe = key?.fromMe as boolean | undefined;

  // Ignorar mensagens enviadas pela própria instância
  if (fromMe) {
    return new Response(JSON.stringify({ ignored: true, reason: 'fromMe' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Ignorar mensagens de grupos (jid termina com @g.us)
  if (remoteJid?.endsWith('@g.us')) {
    return new Response(JSON.stringify({ ignored: true, reason: 'group_message' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messageData = data.message as Record<string, unknown> | undefined;
  const messageType = data.messageType as string | undefined;

  // Extrair texto da mensagem (suporta texto simples e extended text)
  let messageText = '';
  let mediaUrl: string | null = null;

  if (messageType === 'conversation') {
    messageText = messageData?.conversation as string ?? '';
  } else if (messageType === 'extendedTextMessage') {
    const ext = messageData?.extendedTextMessage as Record<string, unknown> | undefined;
    messageText = ext?.text as string ?? '';
  } else if (messageType === 'imageMessage') {
    const img = messageData?.imageMessage as Record<string, unknown> | undefined;
    messageText = img?.caption as string ?? '[Imagem enviada]';
    mediaUrl = img?.url as string ?? null;
  } else if (messageType === 'audioMessage') {
    messageText = '[Áudio enviado]';
  } else if (messageType === 'documentMessage') {
    const doc = messageData?.documentMessage as Record<string, unknown> | undefined;
    messageText = `[Documento: ${doc?.fileName ?? 'arquivo'}]`;
    mediaUrl = doc?.url as string ?? null;
  } else {
    // Tipo não suportado — ignorar silenciosamente
    return new Response(JSON.stringify({ ignored: true, reason: `unsupported_type:${messageType}` }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!messageText && !mediaUrl) {
    return new Response(JSON.stringify({ ignored: true, reason: 'empty_message' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Normalizar número de telefone (remover @s.whatsapp.net)
  const customerPhone = remoteJid?.replace('@s.whatsapp.net', '') ?? '';
  const pushName = data.pushName as string | undefined;

  // ── Buscar tenant pela instância Evolution ────────────────
  const { data: tenant, error: tenantError } = await supabase
    .rpc('rx_get_tenant_by_evolution_instance', { p_instance: instance })
    .single();

  if (tenantError || !tenant) {
    console.error(`[evolution-webhook] Tenant não encontrado para instância: ${instance}`);
    // Retornar 200 para a Evolution API não reenviar
    return new Response(JSON.stringify({ error: 'Tenant not found', instance }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tenantId: string = (tenant as Record<string, unknown>).id as string;
  const n8nWebhookUrl: string | null = (tenant as Record<string, unknown>).n8n_webhook_url as string | null;

  // ── Criar ou retomar conversa ─────────────────────────────
  const { data: conversation, error: convError } = await supabase
    .rpc('rx_create_conversation', {
      p_tenant_id: tenantId,
      p_customer_phone: customerPhone,
      p_customer_name: pushName ?? null,
    })
    .single();

  if (convError || !conversation) {
    console.error('[evolution-webhook] Erro ao criar conversa:', convError);
    return new Response(JSON.stringify({ error: 'Failed to create conversation' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const conv = conversation as Record<string, unknown>;
  const conversationId: string = conv.id as string;
  const escalatedToHuman: boolean = conv.escalated_to_human as boolean ?? false;

  // ── Gravar mensagem do cliente no banco ───────────────────
  const { error: msgError } = await supabase
    .from('rx_messages')
    .insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      message_text: messageText,
      message_type: mediaUrl ? 'image' : 'text',
      sender_type: 'customer',
      sender_id: customerPhone,
    });

  if (msgError) {
    console.error('[evolution-webhook] Erro ao gravar mensagem:', msgError);
  }

  // ── Resposta imediata para a Evolution API ────────────────
  // (não esperar o n8n processar — evita timeout)
  const responsePayload = {
    received: true,
    tenant_id: tenantId,
    conversation_id: conversationId,
    escalated_to_human: escalatedToHuman,
    dispatched_to_n8n: false,
  };

  // ── Despachar para n8n (se não escalada para humano) ──────
  if (!escalatedToHuman && n8nWebhookUrl) {
    // Fire-and-forget: não aguarda resposta do n8n
    const n8nPayload = {
      tenant_id: tenantId,
      conversation_id: conversationId,
      customer_phone: customerPhone,
      customer_name: pushName ?? null,
      message_text: messageText,
      message_type: messageType,
      media_url: mediaUrl,
      instance,
    };

    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    }).catch((err) => {
      console.error('[evolution-webhook] Erro ao chamar n8n:', err);
    });

    responsePayload.dispatched_to_n8n = true;
  } else if (escalatedToHuman) {
    console.log(`[evolution-webhook] Conversa ${conversationId} está escalada — não enviando para n8n`);
  } else {
    console.warn(`[evolution-webhook] n8n_webhook_url não configurado para tenant ${tenantId}`);
  }

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
