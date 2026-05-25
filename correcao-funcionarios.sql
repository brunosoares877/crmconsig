-- VERIFICAR E CORRIGIR DADOS DE FUNCIONÁRIOS
-- Execute no Supabase Dashboard > SQL Editor

-- 1. Verificar leads e funcionários
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

-- 2. Verificar comissões e funcionários
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

-- 3. CORRIGIR: Copiar funcionário do lead para a comissão
UPDATE commissions 
SET employee = l.employee
FROM leads l 
WHERE commissions.lead_id = l.id 
AND l.employee IS NOT NULL 
AND l.employee != ''
AND (commissions.employee IS NULL OR commissions.employee = '');

-- 4. Verificar resultado
SELECT 
    c.id,
    c.employee as commission_employee,
    l.name as lead_name,
    l.employee as lead_employee
FROM commissions c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE c.employee IS NOT NULL 
AND c.employee != ''
ORDER BY c.created_at DESC
LIMIT 10; 