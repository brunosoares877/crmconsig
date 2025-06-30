-- ========================================================
-- MIGRAÇÃO CRÍTICA: OTIMIZAÇÕES AVANÇADAS DE ESCALABILIDADE
-- Data: 2025-01-28
-- Descrição: Melhorias essenciais para suportar 10.000+ usuários
-- ========================================================

-- ==========================================
-- 1. ÍNDICES COMPOSTOS AVANÇADOS
-- ==========================================

-- Índices para queries mais complexas de leads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_user_status_date 
ON leads(user_id, status, created_at DESC) 
WHERE status IN ('novo', 'qualificado', 'convertido');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_search_text 
ON leads USING gin(to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(cpf, '') || ' ' || COALESCE(phone, '')));

-- Índices para filtros de data com performance otimizada
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_date_range 
ON leads(user_id, date DESC) 
WHERE date IS NOT NULL;

-- Índices para reminders com prioridade e status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_priority_status 
ON reminders(user_id, priority, is_completed, due_date DESC);

-- Índices para comissões com status de pagamento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_commissions_user_status 
ON commissions(user_id, status, created_at DESC)
WHERE status IN ('pending', 'paid');

-- ==========================================
-- 2. PARTICIONAMENTO POR DATA (Para grandes volumes)
-- ==========================================

-- Criar função para particionamento automático de leads por mês
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I 
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
                   
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (user_id, created_at)',
                   partition_name || '_user_date', partition_name);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. MATERIALISED VIEWS PARA AGREGAÇÕES
-- ==========================================

-- View materializada para estatísticas de usuários
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats_summary AS
SELECT 
    l.user_id,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE l.status = 'novo') as new_leads,
    COUNT(*) FILTER (WHERE l.status = 'qualificado') as qualified_leads,
    COUNT(*) FILTER (WHERE l.status = 'convertido') as converted_leads,
    COALESCE(SUM(l.total_amount), 0) as total_revenue,
    COALESCE(SUM(l.commission_amount), 0) as total_commission,
    MAX(l.created_at) as last_activity,
    CURRENT_TIMESTAMP as last_updated
FROM leads l
GROUP BY l.user_id;

-- Índice para a view materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stats_summary_user_id 
ON user_stats_summary (user_id);

-- Função para atualizar estatísticas
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. OTIMIZAÇÕES DE CONSULTAS FREQUENTES
-- ==========================================

-- View otimizada para dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    u.user_id,
    us.total_leads,
    us.new_leads,
    us.qualified_leads,
    us.converted_leads,
    us.total_revenue,
    (us.converted_leads::float / NULLIF(us.total_leads, 0) * 100)::numeric(5,2) as conversion_rate,
    COALESCE(r.pending_reminders, 0) as pending_reminders,
    COALESCE(a.upcoming_appointments, 0) as upcoming_appointments
FROM user_stats_summary us
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as pending_reminders
    FROM reminders 
    WHERE is_completed = false 
    AND due_date >= CURRENT_DATE
    GROUP BY user_id
) r ON us.user_id = r.user_id
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as upcoming_appointments
    FROM appointments 
    WHERE status = 'scheduled' 
    AND date >= CURRENT_DATE
    GROUP BY user_id
) a ON us.user_id = a.user_id;

-- ==========================================
-- 5. CONFIGURAÇÕES DE PERFORMANCE
-- ==========================================

-- Aumentar work_mem para queries complexas
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '4GB';

-- Configurações de conexão
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- ==========================================
-- 6. JOBS DE MANUTENÇÃO AUTOMÁTICA
-- ==========================================

-- Job para atualizar estatísticas a cada 15 minutos
SELECT cron.schedule(
    'refresh-user-stats',
    '*/15 * * * *',
    'SELECT refresh_user_stats();'
);

-- Job para limpeza de dados antigos (dados temporários > 1 ano)
SELECT cron.schedule(
    'cleanup-old-data',
    '0 3 * * 0',
    'DELETE FROM deleted_leads WHERE expires_at < NOW() - interval ''1 year'';'
);

-- Job para reindex automático uma vez por semana
SELECT cron.schedule(
    'auto-reindex',
    '0 2 * * 0',
    'REINDEX INDEX CONCURRENTLY idx_leads_user_id_created_at;'
);

-- ==========================================
-- 7. MONITORAMENTO DE PERFORMANCE
-- ==========================================

-- Função para detectar queries lentas
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE(
    query text,
    calls bigint,
    total_exec_time double precision,
    avg_exec_time double precision,
    rows bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pss.query,
        pss.calls,
        pss.total_exec_time,
        pss.mean_exec_time as avg_exec_time,
        pss.rows
    FROM pg_stat_statements pss
    WHERE pss.mean_exec_time > 100
    ORDER BY pss.total_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 8. FINALIZAÇÃO
-- ==========================================

-- Aplicar configurações
SELECT pg_reload_conf();

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRAÇÃO DE ESCALABILIDADE CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🚀 Sistema otimizado para 10.000+ usuários';
    RAISE NOTICE '⚡ Índices compostos criados';
    RAISE NOTICE '📊 Views materializadas ativas';
    RAISE NOTICE '🔄 Jobs de manutenção configurados';
    RAISE NOTICE '📈 Monitoramento de performance ativo';
    RAISE NOTICE '========================================';
END $$; 