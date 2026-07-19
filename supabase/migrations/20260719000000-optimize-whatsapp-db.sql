-- ====================================================================
-- LEADCONSIG - OTIMIZAÇÃO DE ESCALABILIDADE DO WHATSAPP
-- ====================================================================

-- 1. Tratar dados duplicados antes de aplicar o constraint unique
DO $$
DECLARE
    r RECORD;
    target_id UUID;
BEGIN
    FOR r IN 
        SELECT telefone, instance_id, count(*) 
        FROM whatsapp_conversations 
        GROUP BY telefone, instance_id 
        HAVING count(*) > 1
    LOOP
        -- Identificar a conversa mais recente para manter
        SELECT id INTO target_id 
        FROM whatsapp_conversations 
        WHERE telefone = r.telefone AND instance_id = r.instance_id 
        ORDER BY updated_at DESC, created_at DESC 
        LIMIT 1;

        -- Mover mensagens das duplicatas para a conversa que será mantida
        UPDATE whatsapp_messages 
        SET conversation_id = target_id 
        WHERE conversation_id IN (
            SELECT id 
            FROM whatsapp_conversations 
            WHERE telefone = r.telefone AND instance_id = r.instance_id AND id != target_id
        );

        -- Excluir as conversas duplicadas antigas
        DELETE FROM whatsapp_conversations 
        WHERE telefone = r.telefone AND instance_id = r.instance_id AND id != target_id;
    END LOOP;
END $$;

-- 2. Adicionar o Unique Constraint na combinação (telefone, instance_id)
ALTER TABLE whatsapp_conversations 
  DROP CONSTRAINT IF EXISTS unique_telefone_instance;

ALTER TABLE whatsapp_conversations 
  ADD CONSTRAINT unique_telefone_instance UNIQUE (telefone, instance_id);

-- 3. Criar índices para acelerar buscas nas mensagens
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_evolution_id 
  ON whatsapp_messages(evolution_message_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_telefone_instance 
  ON whatsapp_conversations(telefone, instance_id);
