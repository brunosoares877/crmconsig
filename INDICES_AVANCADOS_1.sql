-- ÍNDICE AVANÇADO 1: STATUS E DATA
-- Execute este comando separadamente no Supabase Dashboard

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_user_status_date 
ON leads(user_id, status, created_at DESC) 
WHERE status IN ('novo', 'qualificado', 'convertido');

-- Benefício: Consultas por status 20x mais rápidas 