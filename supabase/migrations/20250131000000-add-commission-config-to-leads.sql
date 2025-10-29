-- Adicionar campo commission_config à tabela leads
-- Este campo armazenará as configurações de comissão selecionadas pelo usuário

-- Adicionar coluna commission_config como JSONB
ALTER TABLE leads 
ADD COLUMN commission_config JSONB;

-- Adicionar comentário na coluna
COMMENT ON COLUMN leads.commission_config IS 'Configurações de comissão selecionadas para este lead em formato JSON';

-- Adicionar índice GIN para consultas eficientes no JSON
CREATE INDEX idx_leads_commission_config ON leads USING GIN (commission_config);

-- Verificar se a coluna foi criada corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'leads' AND column_name = 'commission_config'; 