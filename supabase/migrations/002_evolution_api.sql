-- ============================================================
-- RxFlow - Migration 002: Evolution API + Modo Autônomo
-- Totalmente idempotente: pode rodar múltiplas vezes sem erro
-- ============================================================

-- ============================================================
-- 1. rx_tenants — Campos da Evolution API
-- ============================================================
ALTER TABLE rx_tenants
  ADD COLUMN IF NOT EXISTS evolution_api_url   VARCHAR(500),
  ADD COLUMN IF NOT EXISTS evolution_api_key   VARCHAR(500),
  ADD COLUMN IF NOT EXISTS evolution_instance  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS n8n_webhook_url     VARCHAR(500);

-- ============================================================
-- 2. rx_orders — Suporte a Receita Médica e Aprovação Manual
-- ============================================================
ALTER TABLE rx_orders
  ADD COLUMN IF NOT EXISTS prescription_url      TEXT,
  ADD COLUMN IF NOT EXISTS requires_prescription BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved_by           UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS approved_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by           UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason      TEXT;

-- Atualizar constraint de status para incluir pending_approval e rejected
ALTER TABLE rx_orders
  DROP CONSTRAINT IF EXISTS rx_orders_status_check;

ALTER TABLE rx_orders
  ADD CONSTRAINT rx_orders_status_check
  CHECK (status IN (
    'pending', 'pending_approval', 'confirmed', 'processing',
    'shipped', 'delivered', 'cancelled', 'rejected'
  ));

-- ============================================================
-- 3. rx_ai_configs — Modo Autônomo e Configurações de Fluxo
-- ============================================================
ALTER TABLE rx_ai_configs
  ADD COLUMN IF NOT EXISTS autonomous_mode                 BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS autonomous_max_value            DECIMAL(10,2) DEFAULT 500.00,
  ADD COLUMN IF NOT EXISTS autonomous_notify_delivery      BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS autonomous_require_confirmation BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tool_check_stock                BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tool_create_order               BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tool_request_prescription       BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tool_notify_delivery            BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS msg_greeting                    TEXT DEFAULT 'Olá! Sou o assistente virtual da farmácia. Como posso te ajudar hoje?',
  ADD COLUMN IF NOT EXISTS msg_waiting                     TEXT DEFAULT 'Um momento, estou verificando isso para você...',
  ADD COLUMN IF NOT EXISTS msg_prescription_request        TEXT DEFAULT 'Este medicamento requer receita médica. Poderia nos enviar uma foto da receita para prosseguir com o pedido?',
  ADD COLUMN IF NOT EXISTS msg_controlled_warning          TEXT DEFAULT 'Este é um medicamento controlado. Você precisará de receita médica válida para adquiri-lo. Deseja efetuar o pedido já enviando a receita?',
  ADD COLUMN IF NOT EXISTS msg_closing                     TEXT DEFAULT 'Atendimento encerrado. Obrigado por escolher nossa farmácia! 💊',
  ADD COLUMN IF NOT EXISTS msg_escalation                  TEXT DEFAULT 'Vou transferir você para um de nossos atendentes. Um momento, por favor.';

-- ============================================================
-- 4. rx_delivery_agents — Entregadores cadastrados
-- ============================================================
CREATE TABLE IF NOT EXISTS rx_delivery_agents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rx_delivery_agents_tenant ON rx_delivery_agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rx_delivery_agents_active ON rx_delivery_agents(is_active);

-- Trigger updated_at (CREATE OR REPLACE é idempotente no PG14+)
CREATE OR REPLACE TRIGGER trg_rx_delivery_agents_updated_at
  BEFORE UPDATE ON rx_delivery_agents
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

-- RLS
ALTER TABLE rx_delivery_agents ENABLE ROW LEVEL SECURITY;

-- Policy (drop se existir antes de recriar)
DROP POLICY IF EXISTS "Tenant isolation" ON rx_delivery_agents;
CREATE POLICY "Tenant isolation" ON rx_delivery_agents
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

-- ============================================================
-- 5. Atualizar trigger de auditoria para novos status de pedido
-- ============================================================
CREATE OR REPLACE FUNCTION rx_audit_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO rx_audit_log (tenant_id, action, resource_type, resource_id, old_values, new_values)
    VALUES (
      NEW.tenant_id,
      'order_status_change',
      'order',
      NEW.id::TEXT,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );

    IF NEW.status = 'confirmed'      THEN NEW.confirmed_at = NOW();
    ELSIF NEW.status = 'shipped'     THEN NEW.shipped_at   = NOW();
    ELSIF NEW.status = 'delivered'   THEN NEW.delivered_at = NOW();
    ELSIF NEW.status = 'cancelled'   THEN NEW.cancelled_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 6. Função helper — buscar tenant pelo nome de instância Evolution
-- ============================================================
CREATE OR REPLACE FUNCTION rx_get_tenant_by_evolution_instance(p_instance VARCHAR)
RETURNS rx_tenants AS $$
DECLARE
  v_tenant rx_tenants;
BEGIN
  SELECT * INTO v_tenant
  FROM rx_tenants
  WHERE evolution_instance = p_instance
    AND status = 'active'
  LIMIT 1;
  RETURN v_tenant;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 7. Função para aprovar pedido (operador humano)
-- ============================================================
CREATE OR REPLACE FUNCTION rx_approve_order(
  p_order_id    UUID,
  p_approver_id UUID
)
RETURNS rx_orders AS $$
DECLARE
  v_order rx_orders;
  v_item  JSONB;
BEGIN
  UPDATE rx_orders
  SET
    status       = 'confirmed',
    approved_by  = p_approver_id,
    approved_at  = NOW(),
    confirmed_at = NOW()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  -- Baixa o estoque para cada item do pedido
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items) LOOP
    PERFORM rx_update_inventory_after_sale(
      v_order.tenant_id,
      v_item->>'medication_code',
      COALESCE((v_item->>'quantity')::INT, 1)
    );
  END LOOP;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. Função para rejeitar pedido (operador humano)
-- ============================================================
CREATE OR REPLACE FUNCTION rx_reject_order(
  p_order_id UUID,
  p_agent_id UUID,
  p_reason   TEXT DEFAULT NULL
)
RETURNS rx_orders AS $$
DECLARE
  v_order rx_orders;
BEGIN
  UPDATE rx_orders
  SET
    status           = 'rejected',
    rejected_by      = p_agent_id,
    rejected_at      = NOW(),
    rejection_reason = p_reason
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIM DA MIGRATION 002
-- ============================================================
