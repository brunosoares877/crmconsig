-- ÍNDICE AVANÇADO 3: FILTROS POR DATA
-- Execute este comando separadamente no Supabase Dashboard

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_date_range 
ON leads(user_id, date DESC) 
WHERE date IS NOT NULL;

-- Benefício: Filtros por período super-rápidos 