-- ========================================================
-- MIGRAÇÃO CRÍTICA - PARTE 1: OTIMIZAÇÕES SEM ÍNDICES CONCORRENTES
-- Data: 2025-01-28
-- Descrição: Estruturas e funções para escalabilidade
-- ========================================================

-- ==========================================
-- 1. FUNÇÕES PARA PARTICIONAMENTO
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
-- 2. MATERIALISED VIEWS PARA AGREGAÇÕES
-- ==========================================

-- View materializada para estatísticas de usuários
CREATE MATERIALIZED VIEW IF NOT EXISTS user_stats_summary AS
SELECT 
    l.user_id,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE l.status = 'novo') as new_leads,
    COUNT(*) FILTER (WHERE l.status = 'qualificado') as qualified_leads,
    COUNT(*) FILTER (WHERE l.status = 'convertido') as converted_leads,
    COALESCE(SUM(CASE WHEN l.amount ~ '^[0-9]+\.?[0-9]*$' THEN l.amount::numeric ELSE 0 END), 0) as total_revenue,
    MAX(l.created_at) as last_activity,
    CURRENT_TIMESTAMP as last_updated
FROM leads l
GROUP BY l.user_id;

-- Função para atualizar estatísticas
CREATE OR REPLACE FUNCTION refresh_user_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_stats_summary;
EXCEPTION
    WHEN OTHERS THEN
        -- Se não conseguir fazer concorrently, fazer normal
        REFRESH MATERIALIZED VIEW user_stats_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. VIEWS OTIMIZADAS PARA DASHBOARD
-- ==========================================

-- View otimizada para dashboard
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT 
    us.user_id,
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
-- 4. FUNÇÕES DE MONITORAMENTO
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
EXCEPTION
    WHEN OTHERS THEN
        -- Se pg_stat_statements não estiver disponível, retornar vazio
        RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. JOBS DE MANUTENÇÃO AUTOMÁTICA (OPCIONAL)
-- ==========================================

-- Jobs de cron desabilitados pois pg_cron não está habilitado por padrão
-- Para habilitar: vá em Database > Extensions e ative "pg_cron"
/*
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
*/

-- ==========================================
-- 6. ÍNDICES BÁSICOS (NÃO CONCORRENTES)
-- ==========================================

-- Índices básicos para performance imediata
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON reminders(user_id, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, date DESC);

-- ==========================================
-- 7. FINALIZAÇÃO PARTE 1
-- ==========================================

-- Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRAÇÃO PARTE 1 CONCLUÍDA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 Views materializadas criadas';
    RAISE NOTICE '🔄 Jobs de manutenção: OPCIONAIS (pg_cron desabilitado)';
    RAISE NOTICE '⚡ Índices básicos aplicados';
    RAISE NOTICE '🚀 Agora execute a PARTE 2 para índices avançados';
    RAISE NOTICE '========================================';
END $$; 