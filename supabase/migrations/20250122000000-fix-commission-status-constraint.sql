-- ========================================
-- CORREÇÃO DA CONSTRAINT DE STATUS - COMISSÕES
-- Data: 2025-01-22
-- Descrição: Corrige constraint para aceitar valores em inglês
-- ========================================

-- Primeiro, atualizar registros existentes se houver algum valor em português
UPDATE commissions 
SET status = CASE 
    WHEN status = 'aprovado' THEN 'approved'
    WHEN status = 'cancelado' THEN 'cancelled'
    WHEN status = 'em_andamento' THEN 'in_progress'
    ELSE status
END
WHERE status IN ('aprovado', 'cancelado', 'em_andamento');

-- Remover a constraint antiga
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_status_check;

-- Adicionar nova constraint com valores em inglês que o código usa
ALTER TABLE commissions 
ADD CONSTRAINT commissions_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'paid', 'cancelled'));

-- Relatório de correção
DO $$
BEGIN
    RAISE NOTICE '✅ CONSTRAINT DE STATUS CORRIGIDA!';
    RAISE NOTICE '📊 Valores aceitos agora: pending, in_progress, completed, approved, paid, cancelled';
END $$; 