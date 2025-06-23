-- ========================================================
-- MIGRAÇÕES COMPLETAS - SISTEMA DE COMISSÕES POR PRAZO
-- ========================================================

-- 1. CAMPOS PARA COMMISSION_TIERS
ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed'));

ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS fixed_value NUMERIC;

ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS min_period INTEGER;

ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS max_period INTEGER;

ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS tier_type VARCHAR(20) DEFAULT 'value' CHECK (tier_type IN ('value', 'period'));

-- 2. CAMPO PARA LEADS
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS payment_period INTEGER;

ALTER TABLE leads 
ADD CONSTRAINT IF NOT EXISTS payment_period_range CHECK (payment_period IS NULL OR (payment_period >= 6 AND payment_period <= 96));

-- 3. ATUALIZAR DADOS EXISTENTES
UPDATE commission_tiers 
SET commission_type = 'percentage', 
    tier_type = 'value' 
WHERE commission_type IS NULL OR tier_type IS NULL; 