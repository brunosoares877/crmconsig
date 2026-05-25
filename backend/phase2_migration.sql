-- Phase 2 Migration: CRM Features

-- 1. Update LEADS table to support CRM data and Kanban
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS proposal_value NUMERIC(10, 2); -- 15000.00
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5, 2); -- 1.50
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'novo'; -- 'novo', 'em_analise', 'aprovado'

-- 2. Update LEAD_MESSAGES table for Internal Notes
ALTER TABLE lead_messages ADD COLUMN IF NOT EXISTS is_internal_note BOOLEAN DEFAULT false;
-- message_type might already exist, but ensuring constraints
ALTER TABLE lead_messages DROP CONSTRAINT IF EXISTS lead_messages_direction_check;
ALTER TABLE lead_messages ADD CONSTRAINT lead_messages_direction_check CHECK (direction IN ('inbound', 'outbound'));

-- 3. Create Index for pipeline queries (Kanban performance)
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
