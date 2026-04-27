-- ================================================================
-- RxFlow - Migração: Módulo de Medicamentos de Uso Contínuo
-- Execute no SQL Editor do Supabase (em ordem)
-- ================================================================

-- 1. TABELA DE CLIENTES/PACIENTES
-- ================================================================
CREATE TABLE IF NOT EXISTS rx_customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  cpf             TEXT,
  birth_date      DATE,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  postal_code     TEXT,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_rx_customers_tenant    ON rx_customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rx_customers_phone     ON rx_customers(phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rx_customers_cpf ON rx_customers(tenant_id, cpf) WHERE cpf IS NOT NULL;

-- RLS
ALTER TABLE rx_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_customers" ON rx_customers
  USING (tenant_id IN (SELECT tenant_id FROM rx_tenant_users WHERE user_id = auth.uid() AND is_active = true));


-- 2. NOVOS CAMPOS NO INVENTÁRIO (Uso Contínuo)
-- ================================================================
ALTER TABLE rx_inventory
  ADD COLUMN IF NOT EXISTS is_continuous_use    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS quantity_per_package INTEGER; -- ex: 30 comprimidos por caixa


-- 3. TABELA DE POSOLOGIA POR CLIENTE
-- ================================================================
CREATE TABLE IF NOT EXISTS rx_customer_medications (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES rx_tenants(id) ON DELETE CASCADE,
  customer_id              UUID NOT NULL REFERENCES rx_customers(id) ON DELETE CASCADE,
  inventory_id             UUID NOT NULL REFERENCES rx_inventory(id),
  is_active                BOOLEAN DEFAULT true,

  -- Posologia
  daily_dosage_times       INTEGER NOT NULL DEFAULT 1,        -- quantas vezes por dia
  daily_dosage_quantity    DECIMAL(10,2) NOT NULL DEFAULT 1,  -- quantidade por dose
  dosage_unit              TEXT DEFAULT 'comprimido',         -- comprimido, ml, gotas
  dosage_instructions      TEXT,                              -- instruções livres

  -- Controle de Compra
  last_purchase_date       DATE,
  last_purchase_order_id   UUID REFERENCES rx_orders(id),

  -- Controle de Notificação
  alert_days_before        INTEGER DEFAULT 5,                 -- avisar X dias antes
  last_notified_at         TIMESTAMPTZ,
  preferred_contact_channel TEXT DEFAULT 'whatsapp',

  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rx_cust_meds_tenant   ON rx_customer_medications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rx_cust_meds_customer ON rx_customer_medications(customer_id);
CREATE INDEX IF NOT EXISTS idx_rx_cust_meds_active   ON rx_customer_medications(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE rx_customer_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_cust_meds" ON rx_customer_medications
  USING (tenant_id IN (SELECT tenant_id FROM rx_tenant_users WHERE user_id = auth.uid() AND is_active = true));


-- 4. VIEW AUXILIAR: Medicamentos a vencer (uso interno / n8n)
-- ================================================================
CREATE OR REPLACE VIEW rx_medication_alerts_preview AS
SELECT
  cm.id,
  cm.tenant_id,
  cm.customer_id,
  cm.inventory_id,
  cm.daily_dosage_times,
  cm.daily_dosage_quantity,
  cm.dosage_unit,
  cm.last_purchase_date,
  cm.alert_days_before,
  cm.last_notified_at,
  cm.preferred_contact_channel,
  c.full_name          AS customer_name,
  c.phone              AS customer_phone,
  c.email              AS customer_email,
  i.medication_name,
  i.quantity_per_package,
  -- Cálculo de dias restantes
  (cm.daily_dosage_times * cm.daily_dosage_quantity) AS daily_usage,
  FLOOR(i.quantity_per_package / (cm.daily_dosage_times * cm.daily_dosage_quantity)) AS duration_days,
  (cm.last_purchase_date + FLOOR(i.quantity_per_package / (cm.daily_dosage_times * cm.daily_dosage_quantity)) * INTERVAL '1 day')::DATE AS estimated_end_date,
  ((cm.last_purchase_date + FLOOR(i.quantity_per_package / (cm.daily_dosage_times * cm.daily_dosage_quantity)) * INTERVAL '1 day')::DATE - CURRENT_DATE) AS days_remaining
FROM rx_customer_medications cm
JOIN rx_customers  c ON c.id = cm.customer_id
JOIN rx_inventory  i ON i.id = cm.inventory_id
WHERE cm.is_active = true
  AND cm.last_purchase_date IS NOT NULL
  AND i.quantity_per_package IS NOT NULL;


-- 5. EXEMPLO DE DADOS (opcional — para testar)
-- ================================================================
-- Descomente e ajuste os IDs para testar na sua farmácia:

-- INSERT INTO rx_customers (tenant_id, full_name, phone, cpf)
-- VALUES ('SEU_TENANT_ID', 'João Silva', '5511999990000', '123.456.789-00');

-- INSERT INTO rx_customer_medications
--   (tenant_id, customer_id, inventory_id, daily_dosage_times, daily_dosage_quantity, dosage_unit, last_purchase_date, alert_days_before)
-- VALUES
--   ('SEU_TENANT_ID', 'ID_DO_CLIENTE', 'ID_DO_MEDICAMENTO_NO_INVENTARIO', 2, 1, 'comprimido', CURRENT_DATE - 25, 5);
-- (Caixa com 30 comprimidos, 2x/dia = 15 dias de duração → alerta em 5 dias antes = avisa no 10º dia)
