-- Adicionar coluna payment_date à tabela commissions
-- Execute este SQL no Supabase Dashboard > SQL Editor

ALTER TABLE commissions 
ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;

-- Opcional: Adicionar comentário para documentar a coluna
COMMENT ON COLUMN commissions.payment_date IS 'Data e hora em que a comissão foi marcada como paga';

-- Opcional: Criar índice para melhorar performance de consultas por data de pagamento
CREATE INDEX IF NOT EXISTS idx_commissions_payment_date ON commissions(payment_date);

-- Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'commissions' 
AND column_name = 'payment_date'; 