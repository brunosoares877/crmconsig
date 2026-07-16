-- ============================================================
-- SQL: Webhook RPC com suporte a Mídias (Roda no Supabase SQL Editor)
-- ============================================================

-- 1. Remover a restrição da coluna "tipo" para aceitar "video" e outros formatos sem dar erro
ALTER TABLE whatsapp_messages DROP CONSTRAINT IF EXISTS whatsapp_messages_tipo_check;

-- 2. Atualizar a função do Webhook
CREATE OR REPLACE FUNCTION handle_whatsapp_webhook(payload JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instance_name TEXT;
  v_remote_jid TEXT;
  v_message_text TEXT;
  v_message_tipo TEXT;
  v_media_url TEXT;
  v_direcao_msg TEXT;
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

  -- ─── Identificar o Tipo da Mensagem ───
  v_message_text := payload->'data'->'message'->>'conversation';
  
  IF v_message_text IS NULL THEN
    v_message_text := payload->'data'->'message'->'extendedTextMessage'->>'text';
  END IF;

  IF v_message_text IS NOT NULL THEN
    v_message_tipo := 'texto';
  ELSIF payload->'data'->'message'->'imageMessage' IS NOT NULL THEN
    v_message_tipo := 'imagem';
    v_message_text := payload->'data'->'message'->'imageMessage'->>'caption';
    IF v_message_text IS NULL THEN v_message_text := '📷 Imagem recebida'; END IF;
  ELSIF payload->'data'->'message'->'videoMessage' IS NOT NULL THEN
    v_message_tipo := 'video';
    v_message_text := payload->'data'->'message'->'videoMessage'->>'caption';
    IF v_message_text IS NULL THEN v_message_text := '📹 Vídeo recebido'; END IF;
  ELSIF payload->'data'->'message'->'audioMessage' IS NOT NULL THEN
    v_message_tipo := 'audio';
    v_message_text := '🎵 Áudio recebido';
  ELSIF payload->'data'->'message'->'documentMessage' IS NOT NULL THEN
    v_message_tipo := 'documento';
    v_message_text := '📄 ' || COALESCE(payload->'data'->'message'->'documentMessage'->>'fileName', 'Documento recebido');
  ELSIF payload->'data'->'message'->'stickerMessage' IS NOT NULL THEN
    v_message_tipo := 'sticker';
    v_message_text := '👾 Sticker recebido';
  ELSE
    -- Outro formato não suportado ainda
    RETURN;
  END IF;

  v_push_name := payload->'data'->>'pushName';
  v_timestamp := to_timestamp((payload->'data'->>'messageTimestamp')::numeric);
  v_media_url := COALESCE(payload->'data'->'message'->>'base64', payload->'data'->>'base64');
  
  -- Verificar direção
  v_direcao_msg := 'recebida';
  IF (payload->'data'->'key'->>'fromMe')::boolean = true THEN
    v_direcao_msg := 'enviada';
  END IF;

  -- Localizar a instância e o user_id
  SELECT id, user_id INTO v_instance_id, v_user_id 
  FROM whatsapp_instances 
  WHERE instance_name = v_instance_name;

  IF v_instance_id IS NULL THEN RETURN; END IF;

  -- Localizar ou criar a conversa
  SELECT id INTO v_conversation_id 
  FROM whatsapp_conversations 
  WHERE instance_id = v_instance_id AND telefone = v_remote_jid;

  IF v_conversation_id IS NULL THEN
    INSERT INTO whatsapp_conversations (
      user_id, instance_id, telefone, nome_contato, nao_lidas, 
      status, ultima_mensagem, ultima_mensagem_at, direcao_ultima
    )
    VALUES (
      v_user_id, v_instance_id, v_remote_jid, v_push_name, 
      CASE WHEN v_direcao_msg = 'recebida' THEN 1 ELSE 0 END, 
      'aberta', v_message_text, v_timestamp, v_direcao_msg
    )
    RETURNING id INTO v_conversation_id;
  ELSE
    UPDATE whatsapp_conversations 
    SET nao_lidas = CASE WHEN v_direcao_msg = 'recebida' THEN nao_lidas + 1 ELSE nao_lidas END, 
        ultima_mensagem_at = v_timestamp, 
        ultima_mensagem = v_message_text,
        direcao_ultima = v_direcao_msg,
        nome_contato = COALESCE(nome_contato, v_push_name),
        updated_at = NOW()
    WHERE id = v_conversation_id;
  END IF;

  -- Inserir a mensagem
  INSERT INTO whatsapp_messages (
    conversation_id, direcao, tipo, conteudo, status, timestamp_whatsapp, media_url
  )
  VALUES (
    v_conversation_id, v_direcao_msg, v_message_tipo, v_message_text, 
    CASE WHEN v_direcao_msg = 'enviada' THEN 'enviado' ELSE 'lido' END, 
    v_timestamp, v_media_url
  );

END;
$$;
