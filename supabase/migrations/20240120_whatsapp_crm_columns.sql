-- ============================================================
-- SQL: Adicionar colunas CRM para Caixa de Entrada WhatsApp
-- ============================================================

-- Adiciona a coluna para armazenar as etiquetas (Tags)
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Adiciona a coluna para armazenar a etapa do funil de vendas
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS funnel_stage TEXT DEFAULT 'novo_contato';

-- Atualiza as conversas antigas para a etapa inicial, se estiverem vazias
UPDATE whatsapp_conversations SET funnel_stage = 'novo_contato' WHERE funnel_stage IS NULL;
