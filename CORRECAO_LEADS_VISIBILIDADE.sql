-- 🔧 CORREÇÃO DE VISIBILIDADE DOS LEADS

-- 1. VERIFICAR LEADS EXISTENTES
SELECT 
    id,
    name,
    employee,
    status,
    created_at,
    user_id
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. CRIAR LEAD DE TESTE FORÇADO (substitua USER_ID_AQUI pelo seu ID)
/*
INSERT INTO leads (
    user_id,
    name,
    employee,
    phone,
    amount,
    product,
    status,
    created_at,
    date
) VALUES (
    'USER_ID_AQUI',
    'LEAD TESTE FORÇADO',
    'JANE ✓',
    '(11) 99999-9999',
    '5000',
    'CREDITO CLT',
    'novo',
    NOW(),
    CURRENT_DATE
);
*/

-- 3. VERIFICAR SE O LEAD FOI CRIADO
SELECT 
    id,
    name,
    employee,
    status,
    created_at
FROM leads 
WHERE name ILIKE '%teste%' OR name ILIKE '%leadconsig%'
ORDER BY created_at DESC;

-- 4. VERIFICAR POLÍTICAS RLS QUE PODEM ESTAR BLOQUEANDO
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'leads'
  AND cmd = 'SELECT';

-- 5. TESTE DE PERMISSÃO DE SELECT
-- (Execute como o usuário da aplicação)
/*
SELECT COUNT(*) as total_leads_visiveis
FROM leads 
WHERE user_id = 'USER_ID_AQUI';
*/ 