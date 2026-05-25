-- Adicionar campos de prazo para comissões variáveis por período de pagamento
-- Permite configurar comissões baseadas em prazo (ex: 8x a 12x = 2%, 13x a 24x = 1.5%)

ALTER TABLE commission_tiers 
ADD COLUMN min_period INTEGER,
ADD COLUMN max_period INTEGER,
ADD COLUMN tier_type VARCHAR(20) DEFAULT 'value' CHECK (tier_type IN ('value', 'period'));

-- Adicionar comentários para documentação
COMMENT ON COLUMN commission_tiers.min_period IS 'Período mínimo para esta faixa (em parcelas)';
COMMENT ON COLUMN commission_tiers.max_period IS 'Período máximo para esta faixa (em parcelas, NULL = sem limite)';
COMMENT ON COLUMN commission_tiers.tier_type IS 'Tipo da faixa: value (por valor) ou period (por prazo)'; 