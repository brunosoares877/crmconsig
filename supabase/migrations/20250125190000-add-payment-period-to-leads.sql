-- Adicionar campo de prazo de pagamento (número de parcelas) na tabela leads
-- Permite integração completa com sistema de comissões por prazo

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS payment_period INTEGER;

-- Adicionar constraint para garantir que o prazo seja válido (6 a 96 parcelas)
ALTER TABLE leads 
ADD CONSTRAINT payment_period_range CHECK (payment_period IS NULL OR (payment_period >= 6 AND payment_period <= 96));

-- Adicionar comentário para documentação
COMMENT ON COLUMN leads.payment_period IS 'Número de parcelas do empréstimo (6 a 96 parcelas)';

-- Atualizar leads existentes com um valor padrão se necessário
-- (por enquanto deixaremos NULL para leads existentes)
UPDATE leads 
SET payment_period = NULL 
WHERE payment_period IS NOT NULL AND (payment_period < 6 OR payment_period > 96); 