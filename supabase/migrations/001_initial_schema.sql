-- ============================================================
-- RxFlow - SaaS de Automação WhatsApp para Farmácias
-- Database Schema Migration v001
-- All tables use the rx_ prefix convention
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 0. rx_profiles (Perfis de Usuário mapeados do Auth)
-- ============================================================
CREATE TABLE rx_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 1. rx_tenants (Farmácias)
-- ============================================================
CREATE TABLE rx_tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  plan VARCHAR(50) DEFAULT 'basic' CHECK (plan IN ('basic', 'professional', 'enterprise')),
  monthly_conversation_limit INT DEFAULT 1000,
  monthly_conversations_used INT DEFAULT 0,
  max_concurrent_conversations INT DEFAULT 10,
  enable_ai_agent BOOLEAN DEFAULT TRUE,
  enable_inventory_management BOOLEAN DEFAULT TRUE,
  enable_delivery_scheduling BOOLEAN DEFAULT TRUE,
  enable_reports BOOLEAN DEFAULT TRUE,
  custom_llm_config JSONB DEFAULT '{}',
  whatsapp_business_token VARCHAR(500),
  whatsapp_business_phone_id VARCHAR(255),
  whatsapp_webhook_verify_token VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX idx_rx_tenants_cnpj ON rx_tenants(cnpj);
CREATE INDEX idx_rx_tenants_email ON rx_tenants(email);
CREATE INDEX idx_rx_tenants_status ON rx_tenants(status);

-- ============================================================
-- 2. rx_tenant_users (Usuários por Farmácia)
-- ============================================================
CREATE TABLE rx_tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'operator')),
  permission_flags JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX idx_rx_tenant_users_tenant ON rx_tenant_users(tenant_id);
CREATE INDEX idx_rx_tenant_users_user ON rx_tenant_users(user_id);

-- ============================================================
-- 3. rx_integrations (Configurações de Integrações)
-- ============================================================
CREATE TABLE rx_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rest', 'soap', 'graphql', 'database', 'custom')),
  base_url VARCHAR(500),
  auth_type VARCHAR(50) CHECK (auth_type IN ('bearer_token', 'basic_auth', 'api_key', 'oauth2', 'none')),
  auth_credentials JSONB DEFAULT '{}',
  endpoints JSONB DEFAULT '{}',
  field_mappings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_tested_at TIMESTAMPTZ,
  last_test_status VARCHAR(50) CHECK (last_test_status IN ('success', 'failed')),
  last_test_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_rx_integrations_tenant ON rx_integrations(tenant_id);
CREATE INDEX idx_rx_integrations_active ON rx_integrations(is_active);

-- ============================================================
-- 4. rx_ai_configs (Configuração do Agente IA)
-- ============================================================
CREATE TABLE rx_ai_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID UNIQUE NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  llm_provider VARCHAR(50) DEFAULT 'openai' CHECK (llm_provider IN ('openai', 'anthropic', 'google')),
  llm_model VARCHAR(100) DEFAULT 'gpt-4o',
  llm_temperature FLOAT DEFAULT 0.7 CHECK (llm_temperature >= 0 AND llm_temperature <= 2),
  llm_max_tokens INT DEFAULT 500,
  openai_api_key VARCHAR(500),
  anthropic_api_key VARCHAR(500),
  google_api_key VARCHAR(500),
  system_prompt TEXT DEFAULT 'Você é um assistente de atendimento ao cliente de uma farmácia. Responda dúvidas sobre medicamentos, consulte disponibilidade e preços, e auxilie na compra e agendamento de entrega. Seja cordial e profissional. Responda sempre em português.',
  guardrails JSONB DEFAULT '{"max_order_value": 5000, "require_prescription_validation": true, "blocked_categories": [], "escalation_keywords": ["receita controlada", "emergência", "alergia grave"]}',
  knowledge_base_enabled BOOLEAN DEFAULT TRUE,
  knowledge_base_documents JSONB DEFAULT '[]',
  tone VARCHAR(50) DEFAULT 'professional' CHECK (tone IN ('formal', 'professional', 'casual', 'friendly')),
  enable_suggestions BOOLEAN DEFAULT TRUE,
  suggestion_type VARCHAR(50) DEFAULT 'recommendations' CHECK (suggestion_type IN ('recommendations', 'upsell', 'complementary', 'all')),
  pharmacy_name VARCHAR(255),
  pharmacy_hours VARCHAR(255),
  pharmacy_delivery_radius VARCHAR(100),
  pharmacy_policies TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_ai_configs_tenant ON rx_ai_configs(tenant_id);

-- ============================================================
-- 5. rx_conversations (Histórico de Conversas)
-- ============================================================
CREATE TABLE rx_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  conversation_id VARCHAR(255) UNIQUE NOT NULL DEFAULT ('conv_' || replace(uuid_generate_v4()::text, '-', '')),
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'escalated', 'archived')),
  escalated_to_human BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  human_agent_id UUID REFERENCES auth.users(id),
  conversation_summary TEXT,
  conversation_intent VARCHAR(100),
  sentiment VARCHAR(50) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  message_count INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_conversations_tenant ON rx_conversations(tenant_id);
CREATE INDEX idx_rx_conversations_phone ON rx_conversations(customer_phone);
CREATE INDEX idx_rx_conversations_status ON rx_conversations(status);
CREATE INDEX idx_rx_conversations_started ON rx_conversations(started_at);
CREATE INDEX idx_rx_conversations_conv_id ON rx_conversations(conversation_id);

-- ============================================================
-- 6. rx_messages (Mensagens Individuais)
-- ============================================================
CREATE TABLE rx_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES rx_conversations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location')),
  sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN ('customer', 'ai_agent', 'human_agent')),
  sender_id VARCHAR(255),
  intent_detected VARCHAR(100),
  entities_extracted JSONB DEFAULT '{}',
  confidence_score FLOAT,
  response_text TEXT,
  response_llm_provider VARCHAR(50),
  response_llm_model VARCHAR(100),
  response_generated_at TIMESTAMPTZ,
  response_tokens_used INT,
  consulted_systems JSONB DEFAULT '[]',
  api_responses JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'escalated')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_messages_conversation ON rx_messages(conversation_id);
CREATE INDEX idx_rx_messages_tenant ON rx_messages(tenant_id);
CREATE INDEX idx_rx_messages_sender ON rx_messages(sender_type);
CREATE INDEX idx_rx_messages_created ON rx_messages(created_at);

-- ============================================================
-- 7. rx_orders (Pedidos)
-- ============================================================
CREATE TABLE rx_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES rx_conversations(id),
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('RX-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0')),
  customer_phone VARCHAR(20),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  items JSONB DEFAULT '[]',
  total_items INT DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_value DECIMAL(10,2) DEFAULT 0,
  delivery_address TEXT,
  delivery_city VARCHAR(100),
  delivery_state VARCHAR(2),
  delivery_postal_code VARCHAR(10),
  scheduled_delivery_date DATE,
  scheduled_delivery_time VARCHAR(10),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  external_order_id VARCHAR(255),
  synced_to_external_system BOOLEAN DEFAULT FALSE,
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_rx_orders_tenant ON rx_orders(tenant_id);
CREATE INDEX idx_rx_orders_phone ON rx_orders(customer_phone);
CREATE INDEX idx_rx_orders_status ON rx_orders(status);
CREATE INDEX idx_rx_orders_payment ON rx_orders(payment_status);
CREATE INDEX idx_rx_orders_created ON rx_orders(created_at);

-- ============================================================
-- 8. rx_inventory (Estoque)
-- ============================================================
CREATE TABLE rx_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  medication_code VARCHAR(50) NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  current_stock INT DEFAULT 0,
  minimum_stock INT DEFAULT 10,
  maximum_stock INT DEFAULT 1000,
  unit_price DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  requires_prescription BOOLEAN DEFAULT FALSE,
  age_restricted BOOLEAN DEFAULT FALSE,
  last_synced_at TIMESTAMPTZ,
  sync_source VARCHAR(50) CHECK (sync_source IN ('api', 'manual', 'database')),
  external_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, medication_code)
);

CREATE INDEX idx_rx_inventory_tenant ON rx_inventory(tenant_id);
CREATE INDEX idx_rx_inventory_name ON rx_inventory(medication_name);
CREATE INDEX idx_rx_inventory_stock_alert ON rx_inventory(tenant_id, current_stock, minimum_stock);
CREATE INDEX idx_rx_inventory_active ON rx_inventory(active);

-- ============================================================
-- 9. rx_inventory_alerts (Alertas de Estoque)
-- ============================================================
CREATE TABLE rx_inventory_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES rx_inventory(id) ON DELETE CASCADE,
  medication_name VARCHAR(255),
  current_stock INT,
  minimum_stock INT,
  alert_type VARCHAR(50) DEFAULT 'low_stock' CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock', 'expiring')),
  urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  notified_to_manager BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  notification_method VARCHAR(50) CHECK (notification_method IN ('email', 'slack', 'webhook', 'sms')),
  reorder_requested BOOLEAN DEFAULT FALSE,
  reorder_quantity INT,
  reorder_requested_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_inventory_alerts_tenant ON rx_inventory_alerts(tenant_id);
CREATE INDEX idx_rx_inventory_alerts_resolved ON rx_inventory_alerts(resolved);
CREATE INDEX idx_rx_inventory_alerts_urgency ON rx_inventory_alerts(urgency);

-- ============================================================
-- 10. rx_knowledge_base (Base de Conhecimento)
-- ============================================================
CREATE TABLE rx_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) CHECK (category IN ('faq', 'policies', 'medications', 'procedures', 'general')),
  content TEXT,
  file_url VARCHAR(500),
  file_type VARCHAR(50) CHECK (file_type IN ('pdf', 'docx', 'txt', 'markdown')),
  tags JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_rx_knowledge_base_tenant ON rx_knowledge_base(tenant_id);
CREATE INDEX idx_rx_knowledge_base_category ON rx_knowledge_base(category);
CREATE INDEX idx_rx_knowledge_base_active ON rx_knowledge_base(is_active);

-- ============================================================
-- 11. rx_n8n_logs (Logs de Execução n8n)
-- ============================================================
CREATE TABLE rx_n8n_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES rx_conversations(id),
  workflow_id VARCHAR(255),
  workflow_name VARCHAR(255),
  execution_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) CHECK (status IN ('success', 'failed', 'timeout', 'running')),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  execution_time_ms INT,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  integration_called VARCHAR(255),
  llm_call_made BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_n8n_logs_tenant ON rx_n8n_logs(tenant_id);
CREATE INDEX idx_rx_n8n_logs_status ON rx_n8n_logs(status);
CREATE INDEX idx_rx_n8n_logs_created ON rx_n8n_logs(created_at);

-- ============================================================
-- 12. rx_reports_cache (Cache de Relatórios)
-- ============================================================
CREATE TABLE rx_reports_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  report_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(tenant_id, report_type, period_start, period_end)
);

CREATE INDEX idx_rx_reports_cache_tenant ON rx_reports_cache(tenant_id);
CREATE INDEX idx_rx_reports_cache_expires ON rx_reports_cache(expires_at);

-- ============================================================
-- 13. rx_audit_log (Auditoria)
-- ============================================================
CREATE TABLE rx_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(255),
  actor_id UUID REFERENCES auth.users(id),
  actor_email VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_audit_log_tenant ON rx_audit_log(tenant_id);
CREATE INDEX idx_rx_audit_log_action ON rx_audit_log(action);
CREATE INDEX idx_rx_audit_log_created ON rx_audit_log(created_at);
CREATE INDEX idx_rx_audit_log_actor ON rx_audit_log(actor_id);

-- ============================================================
-- 14. rx_ai_suggestions (Sugestões Inteligentes)
-- ============================================================
CREATE TABLE rx_ai_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES rx_conversations(id),
  order_id UUID REFERENCES rx_orders(id),
  suggestion_type VARCHAR(50) NOT NULL CHECK (suggestion_type IN ('upsell', 'complementary', 'alternative', 'discount')),
  original_medication VARCHAR(255),
  suggested_medication VARCHAR(255),
  suggested_message TEXT,
  confidence_score FLOAT DEFAULT 0,
  shown_to_customer BOOLEAN DEFAULT FALSE,
  customer_accepted BOOLEAN,
  revenue_impact DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rx_ai_suggestions_tenant ON rx_ai_suggestions(tenant_id);
CREATE INDEX idx_rx_ai_suggestions_conversation ON rx_ai_suggestions(conversation_id);
CREATE INDEX idx_rx_ai_suggestions_type ON rx_ai_suggestions(suggestion_type);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION rx_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rx_tenants_updated_at
  BEFORE UPDATE ON rx_tenants
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

CREATE TRIGGER trg_rx_tenant_users_updated_at
  BEFORE UPDATE ON rx_tenant_users
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

CREATE TRIGGER trg_rx_integrations_updated_at
  BEFORE UPDATE ON rx_integrations
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

CREATE TRIGGER trg_rx_ai_configs_updated_at
  BEFORE UPDATE ON rx_ai_configs
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

CREATE TRIGGER trg_rx_messages_updated_at
  BEFORE UPDATE ON rx_messages
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

CREATE TRIGGER trg_rx_inventory_updated_at
  BEFORE UPDATE ON rx_inventory
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

CREATE TRIGGER trg_rx_knowledge_base_updated_at
  BEFORE UPDATE ON rx_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION rx_update_updated_at_column();

-- Auto-create public profile on signup
CREATE OR REPLACE FUNCTION public.rx_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.rx_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.rx_handle_new_user();

-- Audit order status changes
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

    -- Set timestamp based on new status
    IF NEW.status = 'confirmed' THEN NEW.confirmed_at = NOW();
    ELSIF NEW.status = 'shipped' THEN NEW.shipped_at = NOW();
    ELSIF NEW.status = 'delivered' THEN NEW.delivered_at = NOW();
    ELSIF NEW.status = 'cancelled' THEN NEW.cancelled_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rx_orders_status_audit
  BEFORE UPDATE ON rx_orders
  FOR EACH ROW EXECUTE FUNCTION rx_audit_order_status_change();

-- Update tenant conversation count
CREATE OR REPLACE FUNCTION rx_update_tenant_conversation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rx_tenants SET monthly_conversations_used = monthly_conversations_used + 1
    WHERE id = NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rx_conversations_count
  AFTER INSERT ON rx_conversations
  FOR EACH ROW EXECUTE FUNCTION rx_update_tenant_conversation_count();

-- Update message count on conversation
CREATE OR REPLACE FUNCTION rx_update_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rx_conversations
  SET message_count = message_count + 1,
      last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rx_messages_count
  AFTER INSERT ON rx_messages
  FOR EACH ROW EXECUTE FUNCTION rx_update_message_count();

-- ============================================================
-- PL/pgSQL FUNCTIONS
-- ============================================================

-- Create or return existing conversation
CREATE OR REPLACE FUNCTION rx_create_conversation(
  p_tenant_id UUID,
  p_customer_phone VARCHAR,
  p_customer_name VARCHAR DEFAULT NULL
)
RETURNS rx_conversations AS $$
DECLARE
  v_conversation rx_conversations;
BEGIN
  -- Check for existing active conversation
  SELECT * INTO v_conversation
  FROM rx_conversations
  WHERE tenant_id = p_tenant_id
    AND customer_phone = p_customer_phone
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_conversation.id IS NOT NULL THEN
    RETURN v_conversation;
  END IF;

  -- Create new conversation
  INSERT INTO rx_conversations (tenant_id, customer_phone, customer_name)
  VALUES (p_tenant_id, p_customer_phone, p_customer_name)
  RETURNING * INTO v_conversation;

  RETURN v_conversation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add message to conversation
CREATE OR REPLACE FUNCTION rx_add_message_to_conversation(
  p_conversation_id UUID,
  p_tenant_id UUID,
  p_message_text TEXT,
  p_sender_type VARCHAR,
  p_sender_id VARCHAR DEFAULT NULL
)
RETURNS rx_messages AS $$
DECLARE
  v_message rx_messages;
BEGIN
  INSERT INTO rx_messages (conversation_id, tenant_id, message_text, sender_type, sender_id)
  VALUES (p_conversation_id, p_tenant_id, p_message_text, p_sender_type, p_sender_id)
  RETURNING * INTO v_message;

  RETURN v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register inventory alert
CREATE OR REPLACE FUNCTION rx_register_inventory_alert(
  p_tenant_id UUID,
  p_inventory_id UUID,
  p_alert_type VARCHAR DEFAULT 'low_stock'
)
RETURNS rx_inventory_alerts AS $$
DECLARE
  v_alert rx_inventory_alerts;
  v_inventory rx_inventory;
BEGIN
  SELECT * INTO v_inventory FROM rx_inventory WHERE id = p_inventory_id;

  -- Don't create duplicate unresolved alerts
  SELECT * INTO v_alert
  FROM rx_inventory_alerts
  WHERE inventory_id = p_inventory_id AND resolved = FALSE AND alert_type = p_alert_type
  LIMIT 1;

  IF v_alert.id IS NOT NULL THEN
    RETURN v_alert;
  END IF;

  INSERT INTO rx_inventory_alerts (
    tenant_id, inventory_id, medication_name, current_stock, minimum_stock,
    alert_type, urgency
  ) VALUES (
    p_tenant_id, p_inventory_id, v_inventory.medication_name,
    v_inventory.current_stock, v_inventory.minimum_stock,
    p_alert_type,
    CASE
      WHEN v_inventory.current_stock = 0 THEN 'critical'
      WHEN v_inventory.current_stock <= v_inventory.minimum_stock * 0.5 THEN 'high'
      WHEN v_inventory.current_stock <= v_inventory.minimum_stock THEN 'medium'
      ELSE 'low'
    END
  ) RETURNING * INTO v_alert;

  RETURN v_alert;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create order
CREATE OR REPLACE FUNCTION rx_create_order(
  p_tenant_id UUID,
  p_conversation_id UUID,
  p_customer_phone VARCHAR,
  p_customer_name VARCHAR,
  p_items JSONB,
  p_delivery_address TEXT DEFAULT NULL,
  p_payment_method VARCHAR DEFAULT NULL
)
RETURNS rx_orders AS $$
DECLARE
  v_order rx_orders;
  v_total_items INT;
  v_total_value DECIMAL(10,2);
  v_item JSONB;
BEGIN
  -- Calculate totals from items
  v_total_items := 0;
  v_total_value := 0;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_total_items := v_total_items + COALESCE((v_item->>'quantity')::INT, 1);
    v_total_value := v_total_value + COALESCE((v_item->>'subtotal')::DECIMAL, 0);
  END LOOP;

  INSERT INTO rx_orders (
    tenant_id, conversation_id, customer_phone, customer_name,
    items, total_items, total_value, final_value,
    delivery_address, payment_method
  ) VALUES (
    p_tenant_id, p_conversation_id, p_customer_phone, p_customer_name,
    p_items, v_total_items, v_total_value, v_total_value,
    p_delivery_address, p_payment_method
  ) RETURNING * INTO v_order;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update inventory after sale
CREATE OR REPLACE FUNCTION rx_update_inventory_after_sale(
  p_tenant_id UUID,
  p_medication_code VARCHAR,
  p_quantity INT
)
RETURNS rx_inventory AS $$
DECLARE
  v_inventory rx_inventory;
BEGIN
  UPDATE rx_inventory
  SET current_stock = GREATEST(current_stock - p_quantity, 0)
  WHERE tenant_id = p_tenant_id AND medication_code = p_medication_code
  RETURNING * INTO v_inventory;

  -- Auto-create alert if stock is low
  IF v_inventory.current_stock <= v_inventory.minimum_stock THEN
    PERFORM rx_register_inventory_alert(
      p_tenant_id, v_inventory.id,
      CASE WHEN v_inventory.current_stock = 0 THEN 'out_of_stock' ELSE 'low_stock' END
    );
  END IF;

  RETURN v_inventory;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REPORT FUNCTIONS
-- ============================================================

-- Conversation Report
CREATE OR REPLACE FUNCTION rx_get_conversation_report(
  p_tenant_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_conversations', (
      SELECT COUNT(*) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'total_messages', (
      SELECT COALESCE(SUM(message_count), 0) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'resolved_conversations', (
      SELECT COUNT(*) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND status = 'closed'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'escalated_conversations', (
      SELECT COUNT(*) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND escalated_to_human = TRUE
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'avg_messages_per_conversation', (
      SELECT COALESCE(ROUND(AVG(message_count), 1), 0) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'top_intents', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT conversation_intent AS intent, COUNT(*) AS count
        FROM rx_conversations
        WHERE tenant_id = p_tenant_id AND conversation_intent IS NOT NULL
          AND created_at::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY conversation_intent ORDER BY count DESC LIMIT 10
      ) t
    ),
    'sentiment_distribution', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT sentiment, COUNT(*) AS count
        FROM rx_conversations
        WHERE tenant_id = p_tenant_id AND sentiment IS NOT NULL
          AND created_at::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY sentiment
      ) t
    ),
    'daily_conversations', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT created_at::DATE AS date, COUNT(*) AS count
        FROM rx_conversations
        WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY created_at::DATE ORDER BY date
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sales Report
CREATE OR REPLACE FUNCTION rx_get_sales_report(
  p_tenant_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', (
      SELECT COUNT(*) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(final_value), 0) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND payment_status = 'completed'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'avg_order_value', (
      SELECT COALESCE(ROUND(AVG(final_value), 2), 0) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND payment_status = 'completed'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'completed_orders', (
      SELECT COUNT(*) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND status = 'delivered'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'pending_orders', (
      SELECT COUNT(*) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND status = 'pending'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'cancelled_orders', (
      SELECT COUNT(*) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND status = 'cancelled'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'top_medications', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT item->>'name' AS medication, SUM((item->>'quantity')::INT) AS total_sold,
               SUM((item->>'subtotal')::DECIMAL) AS total_revenue
        FROM rx_orders, jsonb_array_elements(items) AS item
        WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY item->>'name' ORDER BY total_sold DESC LIMIT 10
      ) t
    ),
    'daily_revenue', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT created_at::DATE AS date, SUM(final_value) AS revenue, COUNT(*) AS orders
        FROM rx_orders
        WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
        GROUP BY created_at::DATE ORDER BY date
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inventory Report
CREATE OR REPLACE FUNCTION rx_get_inventory_report(p_tenant_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_medications', (
      SELECT COUNT(*) FROM rx_inventory WHERE tenant_id = p_tenant_id AND active = TRUE
    ),
    'low_stock_count', (
      SELECT COUNT(*) FROM rx_inventory
      WHERE tenant_id = p_tenant_id AND active = TRUE AND current_stock <= minimum_stock AND current_stock > 0
    ),
    'out_of_stock_count', (
      SELECT COUNT(*) FROM rx_inventory
      WHERE tenant_id = p_tenant_id AND active = TRUE AND current_stock = 0
    ),
    'total_inventory_value', (
      SELECT COALESCE(SUM(current_stock * unit_price), 0) FROM rx_inventory
      WHERE tenant_id = p_tenant_id AND active = TRUE
    ),
    'medications_by_stock_level', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT medication_name, medication_code, current_stock, minimum_stock, maximum_stock,
               unit_price, requires_prescription,
               CASE
                 WHEN current_stock = 0 THEN 'out_of_stock'
                 WHEN current_stock <= minimum_stock THEN 'low_stock'
                 WHEN current_stock >= maximum_stock THEN 'overstock'
                 ELSE 'normal'
               END AS stock_level
        FROM rx_inventory WHERE tenant_id = p_tenant_id AND active = TRUE
        ORDER BY current_stock ASC
      ) t
    ),
    'recent_alerts', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
        SELECT ia.*, i.medication_code
        FROM rx_inventory_alerts ia
        JOIN rx_inventory i ON ia.inventory_id = i.id
        WHERE ia.tenant_id = p_tenant_id
        ORDER BY ia.created_at DESC LIMIT 20
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SaaS KPIs
CREATE OR REPLACE FUNCTION rx_get_saas_kpis(
  p_tenant_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_current_revenue DECIMAL;
  v_prev_revenue DECIMAL;
  v_period_days INT;
BEGIN
  v_period_days := p_end_date - p_start_date;

  SELECT COALESCE(SUM(final_value), 0) INTO v_current_revenue
  FROM rx_orders
  WHERE tenant_id = p_tenant_id AND payment_status = 'completed'
    AND created_at::DATE BETWEEN p_start_date AND p_end_date;

  SELECT COALESCE(SUM(final_value), 0) INTO v_prev_revenue
  FROM rx_orders
  WHERE tenant_id = p_tenant_id AND payment_status = 'completed'
    AND created_at::DATE BETWEEN (p_start_date - v_period_days) AND (p_start_date - 1);

  SELECT json_build_object(
    'total_revenue', v_current_revenue,
    'total_orders', (
      SELECT COUNT(*) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'total_conversations', (
      SELECT COUNT(*) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'unique_customers', (
      SELECT COUNT(DISTINCT customer_phone) FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'avg_order_value', (
      SELECT COALESCE(ROUND(AVG(final_value), 2), 0) FROM rx_orders
      WHERE tenant_id = p_tenant_id AND payment_status = 'completed'
        AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'conversation_resolution_rate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE status = 'closed')::DECIMAL / COUNT(*)::DECIMAL) * 100, 1
        )
      END
      FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'escalation_rate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE escalated_to_human = TRUE)::DECIMAL / COUNT(*)::DECIMAL) * 100, 1
        )
      END
      FROM rx_conversations
      WHERE tenant_id = p_tenant_id AND created_at::DATE BETWEEN p_start_date AND p_end_date
    ),
    'monthly_growth_percent', (
      CASE WHEN v_prev_revenue = 0 THEN 0
      ELSE ROUND(((v_current_revenue - v_prev_revenue) / v_prev_revenue) * 100, 1)
      END
    ),
    'pending_alerts', (
      SELECT COUNT(*) FROM rx_inventory_alerts
      WHERE tenant_id = p_tenant_id AND resolved = FALSE
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION rx_get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM rx_tenant_users
    WHERE user_id = auth.uid() AND is_active = TRUE
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE rx_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_n8n_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_reports_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rx_ai_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: rx_tenants
CREATE POLICY "Users can view their own tenant" ON rx_tenants
  FOR SELECT USING (id = rx_get_user_tenant_id());
CREATE POLICY "Admins can update their tenant" ON rx_tenants
  FOR UPDATE USING (
    id = rx_get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM rx_tenant_users
      WHERE user_id = auth.uid() AND tenant_id = rx_tenants.id AND role = 'admin'
    )
  );
CREATE POLICY "Anyone can insert tenant during registration" ON rx_tenants
  FOR INSERT WITH CHECK (TRUE);

-- RLS Policies: rx_tenant_users
CREATE POLICY "Users can view their tenant members" ON rx_tenant_users
  FOR SELECT USING (tenant_id = rx_get_user_tenant_id());
CREATE POLICY "Admins can manage tenant members" ON rx_tenant_users
  FOR ALL USING (
    tenant_id = rx_get_user_tenant_id()
    AND EXISTS (
      SELECT 1 FROM rx_tenant_users tu
      WHERE tu.user_id = auth.uid() AND tu.tenant_id = rx_tenant_users.tenant_id AND tu.role = 'admin'
    )
  );
CREATE POLICY "Users can insert themselves during registration" ON rx_tenant_users
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for data tables (tenant isolation)
CREATE POLICY "Tenant isolation" ON rx_integrations
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_ai_configs
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_conversations
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_messages
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_orders
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_inventory
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_inventory_alerts
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_knowledge_base
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_n8n_logs
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_reports_cache
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_audit_log
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());

CREATE POLICY "Tenant isolation" ON rx_ai_suggestions
  FOR ALL USING (tenant_id = rx_get_user_tenant_id());
