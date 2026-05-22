import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface SendWhatsAppRequest {
  tenant_id: string;
  to_phone: string;           // Formato: 5511999999999
  message_text?: string;
  media_url?: string;         // URL pública da mídia (imagem, documento)
  media_type?: 'image' | 'document' | 'audio';
  media_caption?: string;
  conversation_id?: string;   // Se informado, grava em rx_messages
  sender_type?: 'ai_agent' | 'human_agent';
}

serve(async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', service: 'send-whatsapp' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: SendWhatsAppRequest;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { tenant_id, to_phone, message_text, media_url, media_type, media_caption, conversation_id, sender_type = 'ai_agent' } = payload;

  if (!tenant_id || !to_phone) {
    return new Response(JSON.stringify({ error: 'tenant_id and to_phone are required' }), { status: 400 });
  }

  if (!message_text && !media_url) {
    return new Response(JSON.stringify({ error: 'message_text or media_url is required' }), { status: 400 });
  }

  // ── Buscar configurações da Evolution API do tenant ───────
  const { data: tenant, error: tenantError } = await supabase
    .from('rx_tenants')
    .select('evolution_api_url, evolution_api_key, evolution_instance')
    .eq('id', tenant_id)
    .single();

  if (tenantError || !tenant) {
    return new Response(JSON.stringify({ error: 'Tenant not found' }), { status: 404 });
  }

  const { evolution_api_url, evolution_api_key, evolution_instance } = tenant as {
    evolution_api_url: string | null;
    evolution_api_key: string | null;
    evolution_instance: string | null;
  };

  if (!evolution_api_url || !evolution_instance) {
    return new Response(
      JSON.stringify({ error: 'Evolution API not configured for this tenant' }),
      { status: 422 }
    );
  }

  // Formatar número de destino para o formato da Evolution API
  const toJid = to_phone.includes('@') ? to_phone : `${to_phone}@s.whatsapp.net`;

  let evoResponse: Response;

  try {
    if (media_url) {
      // ── Enviar mídia ──────────────────────────────────────
      const mediaEndpointMap: Record<string, string> = {
        image: 'sendMedia',
        document: 'sendMedia',
        audio: 'sendWhatsAppAudio',
      };
      const endpoint = mediaEndpointMap[media_type ?? 'image'] ?? 'sendMedia';

      evoResponse = await fetch(
        `${evolution_api_url}/message/${endpoint}/${evolution_instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: evolution_api_key ?? '',
          },
          body: JSON.stringify({
            number: toJid,
            mediatype: media_type ?? 'image',
            media: media_url,
            caption: media_caption ?? message_text ?? '',
          }),
        }
      );
    } else {
      // ── Enviar texto ──────────────────────────────────────
      evoResponse = await fetch(
        `${evolution_api_url}/message/sendText/${evolution_instance}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: evolution_api_key ?? '',
          },
          body: JSON.stringify({
            number: toJid,
            text: message_text,
          }),
        }
      );
    }
  } catch (err) {
    console.error('[send-whatsapp] Erro ao chamar Evolution API:', err);
    return new Response(JSON.stringify({ error: 'Failed to reach Evolution API' }), { status: 502 });
  }

  const evoData = await evoResponse.json().catch(() => ({}));

  if (!evoResponse.ok) {
    console.error('[send-whatsapp] Evolution API retornou erro:', evoResponse.status, evoData);
    return new Response(
      JSON.stringify({ error: 'Evolution API error', status: evoResponse.status, detail: evoData }),
      { status: 502 }
    );
  }

  // ── Gravar mensagem enviada em rx_messages (se informado conversation_id) ──
  if (conversation_id) {
    const { error: msgError } = await supabase.from('rx_messages').insert({
      conversation_id,
      tenant_id,
      message_text: message_text ?? media_caption ?? '',
      message_type: media_url ? (media_type ?? 'image') : 'text',
      sender_type,
    });

    if (msgError) {
      console.error('[send-whatsapp] Erro ao gravar mensagem no banco:', msgError);
    }
  }

  return new Response(
    JSON.stringify({ success: true, evolution_response: evoData }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
