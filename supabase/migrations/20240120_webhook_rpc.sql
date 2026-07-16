-- ============================================================
-- SQL: Webhook RPC (Roda no Supabase SQL Editor)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_whatsapp_webhook(payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instance_name TEXT;
  v_remote_jid TEXT;
  v_message_text TEXT;
  v_timestamp TIMESTAMPTZ;
  v_instance_id UUID;
  v_user_id UUID;
  v_conversation_id UUID;
  v_push_name TEXT;
BEGIN
  -- Extrair dados
  v_instance_name := payload->>'instance';
  v_remote_jid := payload->'data'->'key'->>'remoteJid';
  
  -- Ignorar mensagens enviadas pelo proprio bot ou sistema
  IF (payload->'data'->'key'->>'fromMe')::boolean = true THEN
    RETURN;
  END IF;

  -- Ignorar grupos e status
  IF v_remote_jid LIKE '%@g.us' OR v_remote_jid = 'status@broadcast' THEN
    RETURN;
  END IF;

  v_message_text := payload->'data'->'message'->>'conversation';
  IF v_message_text IS NULL THEN
    v_message_text := payload->'data'->'message'->'extendedTextMessage'->>'text';
  END IF;
  
  IF v_message_text IS NULL THEN
    RETURN; -- ignorar imagens/audio por enquanto
  END IF;

  v_push_name := payload->'data'->>'pushName';
  v_timestamp := to_timestamp((payload->'data'->>'messageTimestamp')::numeric);

  -- Localizar a instância e o user_id
  SELECT id, user_id INTO v_instance_id, v_user_id 
  FROM whatsapp_instances 
  WHERE instance_name = v_instance_name;

  IF v_instance_id IS NULL THEN RETURN; END IF;

  -- Localizar ou criar a conversa (Coluna CORRETA: telefone)
  SELECT id INTO v_conversation_id 
  FROM whatsapp_conversations 
  WHERE instance_id = v_instance_id AND telefone = v_remote_jid;

  IF v_conversation_id IS NULL THEN
    INSERT INTO whatsapp_conversations (
      user_id, instance_id, telefone, nome_contato, nao_lidas, 
      status, ultima_mensagem, ultima_mensagem_at, direcao_ultima
    )
    VALUES (
      v_user_id, v_instance_id, v_remote_jid, v_push_name, 1, 
      'aberta', v_message_text, v_timestamp, 'recebida'
    )
    RETURNING id INTO v_conversation_id;
  ELSE
    UPDATE whatsapp_conversations 
    SET nao_lidas = nao_lidas + 1, 
        ultima_mensagem_at = v_timestamp, 
        ultima_mensagem = v_message_text,
        direcao_ultima = 'recebida',
        nome_contato = COALESCE(nome_contato, v_push_name),
        updated_at = NOW()
    WHERE id = v_conversation_id;
  END IF;

  -- Inserir a mensagem (Colunas CORRETAS)
  INSERT INTO whatsapp_messages (
    conversation_id, direcao, tipo, conteudo, status, timestamp_whatsapp
  )
  VALUES (
    v_conversation_id, 'recebida', 'texto', v_message_text, 'lido', v_timestamp
  );

END;
$$;
