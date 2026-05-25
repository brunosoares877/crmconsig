-- VERIFICAR DADOS DE FUNCIONÁRIOS NAS TABELAS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar leads e seus funcionários
SELECT 
    id, 
    name, 
    employee,
    product,
    created_at
FROM leads 
WHERE employee IS NOT NULL 
AND employee != ''
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar comissões e seus funcionários
SELECT 
    c.id,
    c.employee as commission_employee,
    l.name as lead_name,
    l.employee as lead_employee,
    c.product,
    c.created_at
FROM commissions c
LEFT JOIN leads l ON c.lead_id = l.id
ORDER BY c.created_at DESC
LIMIT 10;

-- 3. Verificar funcionários cadastrados
SELECT 
    id,
    name,
    created_at
FROM employees
ORDER BY created_at DESC;

-- 4. Contar leads por funcionário
SELECT 
    employee,
    COUNT(*) as total_leads
FROM leads 
WHERE employee IS NOT NULL 
AND employee != ''
GROUP BY employee
ORDER BY total_leads DESC;

-- 5. Contar comissões sem funcionário
SELECT 
    COUNT(*) as total_sem_funcionario,
    COUNT(CASE WHEN c.employee IS NOT NULL AND c.employee != '' THEN 1 END) as com_funcionario_commission,
    COUNT(CASE WHEN l.employee IS NOT NULL AND l.employee != '' THEN 1 END) as com_funcionario_lead
FROM commissions c
LEFT JOIN leads l ON c.lead_id = l.id; 