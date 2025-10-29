-- Atualizar constraint do payment_period para aceitar valores de 1 a 999 parcelas
-- Migração criada em 28/01/2025

-- Remover a constraint antiga que limitava entre 6 e 96
ALTER TABLE leads DROP CONSTRAINT IF EXISTS payment_period_range;

-- Adicionar nova constraint com faixa ampliada (1 a 999 parcelas)
ALTER TABLE leads ADD CONSTRAINT payment_period_range 
CHECK (payment_period IS NULL OR (payment_period >= 1 AND payment_period <= 999));

-- Atualizar o comentário da coluna para refletir a nova faixa
COMMENT ON COLUMN leads.payment_period IS 'Número de parcelas do empréstimo (1 a 999 parcelas)';

-- Adicionar índice para performance (opcional)
CREATE INDEX IF NOT EXISTS idx_leads_payment_period ON leads(payment_period) WHERE payment_period IS NOT NULL; 