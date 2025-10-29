-- =========================================================
-- CORREÇÃO: Erro SUM(text) no campo amount
-- Execute PRIMEIRO antes da migração principal
-- =========================================================

-- Este arquivo corrige o erro:
-- ERROR: function sum(text) does not exist
-- HINT: No function matches the given name and argument types.

-- PROBLEMA IDENTIFICADO:
-- O campo 'amount' na tabela 'leads' é do tipo TEXT
-- Mas estamos tentando usar SUM() que só funciona com números

-- SOLUÇÃO:
-- Converter o campo text para numeric quando válido
-- Usar 0 quando não for um número válido

-- 1. VERIFICAR DADOS EXISTENTES NO CAMPO AMOUNT
SELECT 
    amount,
    CASE 
        WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN 'VÁLIDO'
        ELSE 'INVÁLIDO'
    END as status,
    COUNT(*) as total
FROM leads 
WHERE amount IS NOT NULL
GROUP BY amount, (CASE WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN 'VÁLIDO' ELSE 'INVÁLIDO' END)
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 2. TESTAR A CONVERSÃO SEGURA
SELECT 
    SUM(CASE WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN amount::numeric ELSE 0 END) as total_revenue_teste,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN amount ~ '^[0-9]+\.?[0-9]*$' THEN 1 END) as leads_com_valor_valido
FROM leads;

-- 3. OPCIONAL: LIMPAR DADOS INVÁLIDOS (EXECUTE APENAS SE NECESSÁRIO)
-- UPDATE leads 
-- SET amount = NULL 
-- WHERE amount IS NOT NULL 
-- AND NOT (amount ~ '^[0-9]+\.?[0-9]*$');

-- =========================================================
-- ✅ Após executar este arquivo, pode executar:
-- EXECUTE_NO_SUPABASE_DASHBOARD.sql
-- =========================================================

-- ========================================
-- CORREÇÃO: Row Level Security para Profiles
-- ========================================
-- 
-- ERRO: "new row violates row-level security policy for table 'profiles'"
-- SOLUÇÃO: Configurar políticas RLS corretas para tabela profiles
--
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ========================================

-- 1. HABILITAR RLS NA TABELA PROFILES (se ainda não estiver)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. CRIAR POLÍTICAS CORRETAS PARA PROFILES

-- Política para VER o próprio perfil
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Política para INSERIR o próprio perfil
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Política para ATUALIZAR o próprio perfil
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. VERIFICAR SE A TABELA PROFILES TEM AS COLUNAS NECESSÁRIAS
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 5. VERIFICAR ESTRUTURA FINAL
-- Esta query mostra como ficou a tabela:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position; 