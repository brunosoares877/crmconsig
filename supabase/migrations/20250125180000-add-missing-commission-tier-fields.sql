-- Adicionar todas as colunas faltantes para suportar comissões por valor e prazo
-- Esta migração corrige o erro "Could not find the 'commission_type' column"

-- Adicionar coluna para tipo de comissão (percentual ou fixa)
ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed'));

-- Adicionar coluna para valor fixo da comissão
ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS fixed_value NUMERIC;

-- Adicionar colunas para configuração por prazo (número de parcelas)
ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS min_period INTEGER;

ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS max_period INTEGER;

-- Adicionar coluna para tipo de faixa (por valor ou por prazo)
ALTER TABLE commission_tiers 
ADD COLUMN IF NOT EXISTS tier_type VARCHAR(20) DEFAULT 'value' CHECK (tier_type IN ('value', 'period'));

-- Adicionar comentários para documentação
COMMENT ON COLUMN commission_tiers.commission_type IS 'Tipo de comissão: percentage (percentual) ou fixed (valor fixo)';
COMMENT ON COLUMN commission_tiers.fixed_value IS 'Valor fixo da comissão quando commission_type = fixed';
COMMENT ON COLUMN commission_tiers.min_period IS 'Período mínimo para esta faixa (em parcelas)';
COMMENT ON COLUMN commission_tiers.max_period IS 'Período máximo para esta faixa (em parcelas, NULL = sem limite)';
COMMENT ON COLUMN commission_tiers.tier_type IS 'Tipo da faixa: value (por valor) ou period (por prazo)';

-- Atualizar registros existentes para usar os valores padrão
UPDATE commission_tiers 
SET commission_type = 'percentage', 
    tier_type = 'value' 
WHERE commission_type IS NULL OR tier_type IS NULL; 