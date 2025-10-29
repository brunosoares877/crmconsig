-- ÍNDICE AVANÇADO 2: BUSCA TEXTUAL COMPLETA
-- Execute este comando separadamente no Supabase Dashboard

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_search_text 
ON leads USING gin(to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(cpf, '') || ' ' || COALESCE(phone, '')));

-- Benefício: Busca por nome/CPF/telefone instantânea 