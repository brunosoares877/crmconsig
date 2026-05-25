-- 🔍 VERIFICAÇÃO ESTRUTURA TABELA LEADS - CAMPO EMPLOYEE

-- 1. VERIFICAR SE CAMPO EMPLOYEE EXISTE
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
    AND table_schema = 'public'
    AND column_name = 'employee';

-- 2. VERIFICAR ESTRUTURA COMPLETA DA TABELA LEADS
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'leads' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR POLÍTICAS RLS PARA TABELA LEADS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'leads';

-- 4. TESTAR UPDATE DIRETO DO CAMPO EMPLOYEE
-- (Execute apenas se não houver leads importantes)
/*
UPDATE leads 
SET employee = 'TESTE SQL DIRETO - JANE'
WHERE name = 'LeadConsig'
RETURNING id, name, employee;
*/

-- 5. VERIFICAR LEADS EXISTENTES COM EMPLOYEE
SELECT 
    id,
    name,
    employee,
    created_at
FROM leads 
WHERE employee IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 6. VERIFICAR LEAD ESPECÍFICO "LeadConsig"
SELECT 
    id,
    name,
    employee,
    bank,
    product,
    amount,
    created_at,
    updated_at
FROM leads 
WHERE name ILIKE '%leadconsig%'
ORDER BY created_at DESC;

-- 7. TESTE DE PERMISSÃO - VERIFICAR SE USER ATUAL PODE FAZER UPDATE
-- (Substitua USER_ID_AQUI pelo ID do usuário atual)
/*
UPDATE leads 
SET employee = 'TESTE PERMISSAO'
WHERE name = 'LeadConsig'
    AND user_id = 'USER_ID_AQUI'
RETURNING id, name, employee, user_id;
*/

-- RESULTADOS ESPERADOS:
-- ✅ Campo employee deve existir (tipo TEXT ou VARCHAR)
-- ✅ Políticas RLS devem permitir UPDATE para o owner
-- ✅ Leads com employee devem aparecer na consulta
-- ✅ Update direto deve funcionar sem erro

-- SE ALGUM TESTE FALHAR:
-- ❌ Campo employee não existe → Criar o campo
-- ❌ RLS bloqueia update → Ajustar políticas
-- ❌ Constraints bloqueiam → Verificar foreign keys
-- ❌ Permissões negadas → Verificar auth 