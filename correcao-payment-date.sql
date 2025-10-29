-- CORREÇÃO: Adicionar coluna payment_date à tabela commissions
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Adicionar a coluna payment_date
ALTER TABLE commissions 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Comentário para documentar a coluna
COMMENT ON COLUMN commissions.payment_date IS 'Data e hora em que a comissão foi marcada como paga';

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_commissions_payment_date ON commissions(payment_date);

-- Verificar se funcionou
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'commissions' 
AND column_name = 'payment_date'; 