-- ====================================================================
-- LEADCONSIG - CRIAR TABELA DE REGRAS DE OPORTUNIDADES
-- ====================================================================

CREATE TABLE IF NOT EXISTS opportunity_rules (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_source        TEXT        NOT NULL,
  days_after            INTEGER     NOT NULL CHECK (days_after >= 0),
  opportunity_title     TEXT        NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE opportunity_rules ENABLE ROW LEVEL SECURITY;

-- Criar Políticas de RLS
CREATE POLICY "opportunity_rules_owner" 
  ON opportunity_rules 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "service_role_opportunity_rules" 
  ON opportunity_rules 
  FOR ALL 
  TO service_role 
  USING (true);
