import fs from 'fs';

const sql = `
CREATE OR REPLACE FUNCTION upsert_whatsapp_conversation(
  p_user_id UUID,
  p_lead_id UUID,
  p_instance_id UUID,
  p_telefone TEXT,
  p_nome_contato TEXT,
  p_ultima_mensagem TEXT,
  p_direcao_ultima TEXT,
  p_status TEXT
) RETURNS UUID AS $$
DECLARE
  v_conv_id UUID;
BEGIN
  INSERT INTO whatsapp_conversations (
    user_id, lead_id, instance_id, telefone, nome_contato, 
    ultima_mensagem, ultima_mensagem_at, direcao_ultima, nao_lidas, status
  ) VALUES (
    p_user_id, p_lead_id, p_instance_id, p_telefone, p_nome_contato, 
    p_ultima_mensagem, NOW(), p_direcao_ultima, 1, p_status
  )
  ON CONFLICT (telefone, instance_id) 
  DO UPDATE SET 
    nome_contato = COALESCE(p_nome_contato, whatsapp_conversations.nome_contato),
    ultima_mensagem = p_ultima_mensagem,
    ultima_mensagem_at = NOW(),
    direcao_ultima = p_direcao_ultima,
    nao_lidas = CASE 
      WHEN p_direcao_ultima = 'recebida' THEN whatsapp_conversations.nao_lidas + 1 
      ELSE whatsapp_conversations.nao_lidas 
    END,
    status = p_status,
    updated_at = NOW()
  RETURNING id INTO v_conv_id;
  
  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function run() {
  console.log("Creating upsert_whatsapp_conversation function in Supabase...");
  try {
    const res = await fetch("https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/run-sql", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: sql
    });
    
    const text = await res.text();
    console.log("Response:", res.status, text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

run();
