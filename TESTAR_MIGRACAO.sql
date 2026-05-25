-- =========================================================
-- TESTE DA MIGRAÇÃO DE ESCALABILIDADE
-- Execute estas queries para verificar se tudo funcionou
-- =========================================================

-- 1. VERIFICAR SE VIEW MATERIALIZADA FOI CRIADA
SELECT 
    schemaname,
    matviewname,
    definition
FROM pg_matviews 
WHERE matviewname = 'user_stats_summary';

-- 2. VERIFICAR SE ÍNDICES FORAM CRIADOS
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- 3. TESTAR PERFORMANCE - CONSULTA DE LEADS
EXPLAIN ANALYZE
SELECT id, name, status, created_at 
FROM leads 
WHERE user_id = auth.uid() 
AND status = 'novo' 
ORDER BY created_at DESC 
LIMIT 20;

-- 4. TESTAR BUSCA TEXTUAL (SE ÍNDICE EXISTIR)
EXPLAIN ANALYZE
SELECT id, name, phone, cpf 
FROM leads 
WHERE user_id = auth.uid() 
AND to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(cpf, '') || ' ' || COALESCE(phone, '')) 
    @@ plainto_tsquery('portuguese', 'teste')
LIMIT 10;

-- 5. VERIFICAR ESTATÍSTICAS MATERIALIZADAS
SELECT * FROM user_stats_summary WHERE user_id = auth.uid();

-- 6. VERIFICAR DASHBOARD METRICS
SELECT * FROM dashboard_metrics WHERE user_id = auth.uid();

-- 7. VERIFICAR JOBS AGENDADOS
SELECT 
    jobname,
    schedule,
    command,
    active
FROM cron.job 
WHERE jobname IN ('refresh-user-stats', 'cleanup-old-data');

-- 8. VERIFICAR FUNÇÕES CRIADAS
SELECT 
    proname as function_name,
    prosrc as function_code
FROM pg_proc 
WHERE proname IN ('create_monthly_partition', 'refresh_user_stats');

-- =========================================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- =========================================================

-- ✅ SUCESSO SE:
-- 1. View materializada existe (resultado não vazio)
-- 2. Pelo menos 4 índices com prefixo 'idx_' existem
-- 3. EXPLAIN ANALYZE mostra "Index Scan" em vez de "Seq Scan"
-- 4. Estatísticas materializadas retornam dados
-- 5. Dashboard metrics funciona
-- 6. Jobs foram criados (2 jobs)
-- 7. Funções foram criadas (2 funções)

-- ❌ PROBLEMA SE:
-- - Qualquer query retorna erro
-- - EXPLAIN ANALYZE mostra "Seq Scan" (consulta sequencial)
-- - View materializada vazia
-- - Menos de 4 índices criados

-- =========================================================
-- TESTE FINAL: PERFORMANCE DE CARREGAMENTO
-- =========================================================

-- Esta query deve ser MUITO RÁPIDA (< 50ms):
\timing on
SELECT 
    total_leads,
    new_leads,
    qualified_leads,
    converted_leads,
    conversion_rate,
    pending_reminders,
    upcoming_appointments
FROM dashboard_metrics 
WHERE user_id = auth.uid();
\timing off 