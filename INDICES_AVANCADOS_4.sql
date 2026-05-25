-- ÍNDICE AVANÇADO 4: REMINDERS POR PRIORIDADE
-- Execute este comando separadamente no Supabase Dashboard

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_priority_status 
ON reminders(user_id, priority, is_completed, due_date DESC);

-- Benefício: Dashboard de lembretes instantâneo 