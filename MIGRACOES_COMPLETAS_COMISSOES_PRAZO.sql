-- ========================================================
-- MIGRAÇÕES COMPLETAS - SISTEMA DE COMISSÕES POR PRAZO
-- ========================================================
-- Execute este código SQL no Supabase para implementar todas as funcionalidades

-- 1. MIGRAÇÃO: Adicionar campos para comissões variáveis (valor e prazo)
-- ============================================================

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

-- Atualizar registros existentes para usar os valores padrão
UPDATE commission_tiers 
SET commission_type = 'percentage', 
    tier_type = 'value' 
WHERE commission_type IS NULL OR tier_type IS NULL;

-- 2. MIGRAÇÃO: Adicionar campo de prazo na tabela leads
-- ====================================================

-- Adicionar campo de prazo de pagamento (número de parcelas) na tabela leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS payment_period INTEGER;

-- Adicionar constraint para garantir que o prazo seja válido (6 a 96 parcelas)
ALTER TABLE leads 
ADD CONSTRAINT IF NOT EXISTS payment_period_range CHECK (payment_period IS NULL OR (payment_period >= 6 AND payment_period <= 96));

-- 3. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ==================================

COMMENT ON COLUMN commission_tiers.commission_type IS 'Tipo de comissão: percentage (percentual) ou fixed (valor fixo)';
COMMENT ON COLUMN commission_tiers.fixed_value IS 'Valor fixo da comissão quando commission_type = fixed';
COMMENT ON COLUMN commission_tiers.min_period IS 'Período mínimo para esta faixa (em parcelas)';
COMMENT ON COLUMN commission_tiers.max_period IS 'Período máximo para esta faixa (em parcelas, NULL = sem limite)';
COMMENT ON COLUMN commission_tiers.tier_type IS 'Tipo da faixa: value (por valor) ou period (por prazo)';
COMMENT ON COLUMN leads.payment_period IS 'Número de parcelas do empréstimo (6 a 96 parcelas)';

-- 4. EXEMPLOS DE CONFIGURAÇÃO (OPCIONAL)
-- ======================================

-- Exemplo: Configurar comissão por prazo para CRÉDITO CLT
-- Descomente as linhas abaixo se quiser inserir exemplos de configuração

/*
-- Prazo 8x a 12x: 1.0%
INSERT INTO commission_tiers (user_id, product, name, tier_type, min_period, max_period, commission_type, percentage, active)
SELECT auth.uid(), 'CREDITO CLT', '8x a 12x', 'period', 8, 12, 'percentage', 1.0, true
WHERE auth.uid() IS NOT NULL;

-- Prazo 13x a 24x: 1.5%
INSERT INTO commission_tiers (user_id, product, name, tier_type, min_period, max_period, commission_type, percentage, active)
SELECT auth.uid(), 'CREDITO CLT', '13x a 24x', 'period', 13, 24, 'percentage', 1.5, true
WHERE auth.uid() IS NOT NULL;

-- Prazo 25x a 36x: 2.0%
INSERT INTO commission_tiers (user_id, product, name, tier_type, min_period, max_period, commission_type, percentage, active)
SELECT auth.uid(), 'CREDITO CLT', '25x a 36x', 'period', 25, 36, 'percentage', 2.0, true
WHERE auth.uid() IS NOT NULL;
*/

-- ========================================================
-- VERIFICAÇÃO: Para confirmar se funcionou
-- ========================================================

-- Verificar estrutura da tabela commission_tiers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'commission_tiers' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela leads
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leads' AND column_name = 'payment_period'; 