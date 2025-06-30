-- ==========================================
-- CORREÇÃO DO ERRO DE CHAVE ESTRANGEIRA
-- ==========================================
-- 
-- Este arquivo corrige o erro:
-- "update or delete on table leads violates foreign key constraint appointments_lead_id_fkey"
--
-- PROBLEMA: Constraint não permitia deletar leads com appointments/reminders relacionados
-- SOLUÇÃO: Atualizar constraints para CASCADE ou SET NULL conforme apropriado
--
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ==========================================

-- 1. CORRIGIR CONSTRAINT DE APPOINTMENTS
-- Remove constraint antiga e cria nova com CASCADE
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_lead_id_fkey;
ALTER TABLE appointments 
ADD CONSTRAINT appointments_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;

-- 2. CORRIGIR CONSTRAINT DE REMINDERS  
-- Remove constraint antiga e cria nova com SET NULL (para preservar lembretes)
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_lead_id_fkey;
ALTER TABLE reminders 
ADD CONSTRAINT reminders_lead_id_fkey 
FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

-- 3. VERIFICAR SE AS CONSTRAINTS FORAM APLICADAS CORRETAMENTE
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('appointments', 'reminders')
    AND kcu.column_name LIKE '%lead_id%'
ORDER BY tc.table_name;

-- ==========================================
-- RESULTADO ESPERADO:
-- ==========================================
-- appointments | appointments_lead_id_fkey | lead_id | CASCADE  | NO ACTION
-- reminders    | reminders_lead_id_fkey    | lead_id | SET NULL | NO ACTION
--
-- ✅ CASCADE: Quando lead for deletado, appointments são deletados automaticamente
-- ✅ SET NULL: Quando lead for deletado, lembretes mantidos mas lead_id fica NULL
-- ==========================================

-- COMENTÁRIOS:
-- - Esta correção resolve o erro de foreign key constraint
-- - Appointments são deletados junto com o lead (CASCADE)
-- - Reminders são preservados mas perdem a referência (SET NULL)
-- - O código TypeScript também foi atualizado para deletar relacionamentos antes da exclusão
-- ========================================== 