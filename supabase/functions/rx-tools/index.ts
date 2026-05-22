import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ── Tipos de ações disponíveis ────────────────────────────────
type Action =
  | 'get_ai_config'
  | 'check_stock'
  | 'create_order'
  | 'get_knowledge'
  | 'escalate_to_human'
  | 'notify_delivery'
  | 'get_conversation_history';

serve(async (req: Request) => {
  if (req.method === 'GET') {
    return json({ status: 'ok', service: 'rx-tools', actions: ['get_ai_config', 'check_stock', 'create_order', 'get_knowledge', 'escalate_to_human', 'notify_delivery', 'get_conversation_history'] });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const action = body.action as Action | undefined;
  if (!action) return json({ error: 'action is required' }, 400);

  switch (action) {
    // ── Buscar configuração completa do agente ─────────────
    case 'get_ai_config': {
      const tenantId = body.tenant_id as string;
      if (!tenantId) return json({ error: 'tenant_id required' }, 400);

      const { data, error } = await supabase
        .from('rx_ai_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({ config: data });
    }

    // ── Verificar estoque e preço de medicamento ───────────
    case 'check_stock': {
      const tenantId = body.tenant_id as string;
      const medicationName = body.medication_name as string;

      if (!tenantId || !medicationName) {
        return json({ error: 'tenant_id and medication_name required' }, 400);
      }

      const { data, error } = await supabase
        .from('rx_inventory')
        .select('medication_name, medication_code, current_stock, unit_price, requires_prescription, description, category')
        .eq('tenant_id', tenantId)
        .eq('active', true)
        .ilike('medication_name', `%${medicationName}%`)
        .limit(5);

      if (error) return json({ error: error.message }, 500);

      if (!data || data.length === 0) {
        return json({ found: false, message: `Medicamento "${medicationName}" não encontrado no estoque.` });
      }

      return json({
        found: true,
        results: data.map((item) => ({
          name: item.medication_name,
          code: item.medication_code,
          stock: item.current_stock,
          price: item.unit_price,
          available: (item.current_stock ?? 0) > 0,
          requires_prescription: item.requires_prescription,
          category: item.category,
        })),
      });
    }

    // ── Criar pedido de venda ──────────────────────────────
    case 'create_order': {
      const tenantId = body.tenant_id as string;
      const conversationId = body.conversation_id as string;
      const customerPhone = body.customer_phone as string;
      const customerName = body.customer_name as string | undefined;
      const items = body.items as Array<{ medication_code: string; medication_name: string; quantity: number; unit_price: number; subtotal: number }>;
      const deliveryAddress = body.delivery_address as string | undefined;
      const requiresPrescription = body.requires_prescription as boolean | undefined;

      if (!tenantId || !customerPhone || !items?.length) {
        return json({ error: 'tenant_id, customer_phone and items required' }, 400);
      }

      // Buscar configuração de modo autônomo do tenant
      const { data: aiConfig } = await supabase
        .from('rx_ai_configs')
        .select('autonomous_mode, autonomous_max_value')
        .eq('tenant_id', tenantId)
        .single();

      const autonomousMode = (aiConfig as Record<string, unknown>)?.autonomous_mode ?? true;
      const maxValue = ((aiConfig as Record<string, unknown>)?.autonomous_max_value as number) ?? 500;

      const totalValue = items.reduce((acc, item) => acc + (item.subtotal ?? 0), 0);
      const isAboveLimit = totalValue > maxValue;

      // Determinar status do pedido baseado no modo autônomo
      const orderStatus = (!autonomousMode || isAboveLimit) ? 'pending_approval' : 'confirmed';

      const { data: order, error: orderError } = await supabase.rpc('rx_create_order', {
        p_tenant_id: tenantId,
        p_conversation_id: conversationId ?? null,
        p_customer_phone: customerPhone,
        p_customer_name: customerName ?? null,
        p_items: items,
        p_delivery_address: deliveryAddress ?? null,
        p_payment_method: null,
      });

      if (orderError) return json({ error: orderError.message }, 500);

      // Se modo autônomo e dentro do limite, confirmar e baixar estoque
      if (autonomousMode && !isAboveLimit && !requiresPrescription) {
        await supabase
          .from('rx_orders')
          .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('id', (order as Record<string, unknown>).id);

        for (const item of items) {
          await supabase.rpc('rx_update_inventory_after_sale', {
            p_tenant_id: tenantId,
            p_medication_code: item.medication_code,
            p_quantity: item.quantity,
          });
        }
      }

      return json({
        order_created: true,
        order_id: (order as Record<string, unknown>).id,
        order_number: (order as Record<string, unknown>).order_number,
        status: orderStatus,
        total_value: totalValue,
        autonomous_mode: autonomousMode,
        requires_human_approval: !autonomousMode || isAboveLimit || !!requiresPrescription,
        message: orderStatus === 'pending_approval'
          ? 'Pedido criado e aguardando aprovação do atendente.'
          : 'Pedido confirmado e estoque reservado com sucesso.',
      });
    }

    // ── Buscar documentos da base de conhecimento ──────────
    case 'get_knowledge': {
      const tenantId = body.tenant_id as string;
      const query = body.query as string;

      if (!tenantId || !query) return json({ error: 'tenant_id and query required' }, 400);

      const { data, error } = await supabase
        .from('rx_knowledge_base')
        .select('title, content, category, tags')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(3);

      if (error) return json({ error: error.message }, 500);

      return json({
        found: (data?.length ?? 0) > 0,
        documents: data ?? [],
      });
    }

    // ── Escalar conversa para humano ───────────────────────
    case 'escalate_to_human': {
      const conversationId = body.conversation_id as string;
      const reason = body.reason as string | undefined;

      if (!conversationId) return json({ error: 'conversation_id required' }, 400);

      const { error } = await supabase
        .from('rx_conversations')
        .update({
          escalated_to_human: true,
          escalated_at: new Date().toISOString(),
          status: 'escalated',
          flag_reason: reason ?? 'Solicitado pelo agente IA',
        })
        .eq('id', conversationId);

      if (error) return json({ error: error.message }, 500);
      return json({ escalated: true, conversation_id: conversationId });
    }

    // ── Notificar entregador via WhatsApp ──────────────────
    case 'notify_delivery': {
      const tenantId = body.tenant_id as string;
      const orderId = body.order_id as string;
      const customerAddress = body.customer_address as string | undefined;

      if (!tenantId || !orderId) return json({ error: 'tenant_id and order_id required' }, 400);

      // Verificar se tenant quer notificação automática
      const { data: aiConfig } = await supabase
        .from('rx_ai_configs')
        .select('autonomous_notify_delivery')
        .eq('tenant_id', tenantId)
        .single();

      const autoNotify = (aiConfig as Record<string, unknown>)?.autonomous_notify_delivery ?? true;

      if (!autoNotify) {
        return json({
          notified: false,
          message: 'Notificação automática desativada. Pedido aguarda ação manual no dashboard.',
        });
      }

      // Buscar entregador ativo
      const { data: agents } = await supabase
        .from('rx_delivery_agents' as never)
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .limit(1);

      if (!agents || agents.length === 0) {
        return json({ notified: false, message: 'Nenhum entregador ativo cadastrado.' });
      }

      // Buscar detalhes do pedido
      const { data: order } = await supabase
        .from('rx_orders')
        .select('order_number, customer_name, customer_phone, items')
        .eq('id', orderId)
        .single();

      const agent = agents[0] as Record<string, unknown>;
      const orderData = order as Record<string, unknown> | null;

      const message = `🚚 *Novo Pedido para Entrega*\n\n*Pedido:* ${orderData?.order_number ?? orderId}\n*Cliente:* ${orderData?.customer_name ?? 'Não informado'}\n*Tel:* ${orderData?.customer_phone ?? ''}\n*Endereço:* ${customerAddress ?? 'Verificar no dashboard'}\n\nConfirme o recebimento respondendo esta mensagem.`;

      // Chamar send-whatsapp para notificar o entregador
      const sendUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp`;
      await fetch(sendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          to_phone: agent.phone as string,
          message_text: message,
        }),
      });

      return json({
        notified: true,
        agent_name: agent.name as string,
        agent_phone: agent.phone as string,
      });
    }

    // ── Buscar histórico da conversa (contexto para o LLM) ─
    case 'get_conversation_history': {
      const conversationId = body.conversation_id as string;
      const limit = (body.limit as number) ?? 10;

      if (!conversationId) return json({ error: 'conversation_id required' }, 400);

      const { data, error } = await supabase
        .from('rx_messages')
        .select('message_text, sender_type, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return json({ error: error.message }, 500);

      // Retornar em ordem cronológica (mais antigas primeiro)
      const messages = (data ?? []).reverse().map((m) => ({
        role: m.sender_type === 'customer' ? 'user' : 'assistant',
        content: m.message_text,
      }));

      return json({ messages });
    }

    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
});

// ── Helper ─────────────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
