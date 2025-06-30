-- ÍNDICE AVANÇADO 5: ÍNDICE ÚNICO PARA ESTATÍSTICAS
-- Execute este comando separadamente no Supabase Dashboard

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_user_stats_summary_user_id 
ON user_stats_summary (user_id);

-- Benefício: Permite refresh concorrente das estatísticas 