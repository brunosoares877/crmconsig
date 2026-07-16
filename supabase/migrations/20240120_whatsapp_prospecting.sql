-- ============================================================
-- MIGRAÇÃO: Módulo WhatsApp Prospecção (VERSÃO FINAL CORRIGIDA)
-- ============================================================
-- INSTRUÇÕES: Cole este SQL inteiro no Supabase SQL Editor e clique Run.
-- Usa DROP IF EXISTS em tudo para ser idempotente (pode rodar várias vezes).
-- ============================================================

-- ─── LIMPEZA SEGURA (drop na ordem inversa de dependência) ────────────────────
DROP TRIGGER IF EXISTS trg_whatsapp_conversations_updated ON whatsapp_conversations;
DROP TRIGGER IF EXISTS trg_message_campaigns_updated ON message_campaigns;
DROP TRIGGER IF EXISTS trg_prospecting_leads_updated ON prospecting_leads;
DROP TRIGGER IF EXISTS trg_whatsapp_instances_updated ON whatsapp_instances;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS can_send_message(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_messages_sent(UUID) CASCADE;
DROP FUNCTION IF EXISTS reset_daily_message_count() CASCADE;
DROP FUNCTION IF EXISTS get_daily_limit(TIMESTAMPTZ) CASCADE;

DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_conversations CASCADE;
DROP TABLE IF EXISTS message_queue CASCADE;
DROP TABLE IF EXISTS message_campaigns CASCADE;
DROP TABLE IF EXISTS prospecting_leads CASCADE;
DROP TABLE IF EXISTS whatsapp_instances CASCADE;

-- ─── 1. INSTÂNCIAS WHATSAPP ───────────────────────────────────────────────────
CREATE TABLE whatsapp_instances (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instance_name       TEXT        NOT NULL,
  evolution_api_url   TEXT        NOT NULL DEFAULT 'http://localhost:8080',
  api_key             TEXT        NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'disconnected'
                                  CHECK (status IN ('connected','disconnected','qr_code','connecting')),
  phone_number        TEXT,
  chip_connected_at   TIMESTAMPTZ,
  messages_sent_today INTEGER     DEFAULT 0,
  last_reset_date     DATE        DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. LEADS DE PROSPECÇÃO ───────────────────────────────────────────────────
CREATE TABLE prospecting_leads (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome                  TEXT        NOT NULL,
  cpf                   TEXT,
  beneficio             TEXT,
  municipio             TEXT,
  telefone1             TEXT,
  telefone2             TEXT,
  telefone3             TEXT,
  tel_valido            TEXT,
  whatsapp_validado_at  TIMESTAMPTZ,
  kanban_status         TEXT        NOT NULL DEFAULT 'para_validar'
                                    CHECK (kanban_status IN (
                                      'para_validar','sem_whatsapp','fila_disparo',
                                      'mensagem_enviada','atendimento_manual'
                                    )),
  kanban_updated_at     TIMESTAMPTZ DEFAULT NOW(),
  mensagens_enviadas    INTEGER     DEFAULT 0,
  ultima_mensagem_at    TIMESTAMPTZ,
  proxima_mensagem_at   TIMESTAMPTZ,
  importado_em          TIMESTAMPTZ DEFAULT NOW(),
  observacoes           TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prospecting_leads_user_id ON prospecting_leads(user_id);
CREATE INDEX idx_prospecting_leads_status  ON prospecting_leads(kanban_status);
CREATE INDEX idx_prospecting_leads_cpf     ON prospecting_leads(cpf);

-- ─── 3. CAMPANHAS DE MENSAGEM ─────────────────────────────────────────────────
CREATE TABLE message_campaigns (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instance_id           UUID        REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  nome                  TEXT        NOT NULL,
  descricao             TEXT,
  template_msg1         TEXT        NOT NULL,
  template_msg2         TEXT,
  delay_min_segundos    INTEGER     DEFAULT 180,
  delay_max_segundos    INTEGER     DEFAULT 360,
  status                TEXT        NOT NULL DEFAULT 'rascunho'
                                    CHECK (status IN ('rascunho','ativa','pausada','finalizada')),
  hora_inicio           TIME        DEFAULT '08:00',
  hora_fim              TIME        DEFAULT '18:00',
  dias_semana           INTEGER[]   DEFAULT '{1,2,3,4,5}',
  total_enviado         INTEGER     DEFAULT 0,
  total_respondido      INTEGER     DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. FILA DE DISPARO ───────────────────────────────────────────────────────
CREATE TABLE message_queue (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id               UUID        REFERENCES prospecting_leads(id) ON DELETE CASCADE NOT NULL,
  campaign_id           UUID        REFERENCES message_campaigns(id) ON DELETE CASCADE NOT NULL,
  instance_id           UUID        REFERENCES whatsapp_instances(id) ON DELETE SET NULL,
  numero_sequencia      INTEGER     DEFAULT 1,
  telefone              TEXT        NOT NULL,
  mensagem_gerada       TEXT,
  agendado_para         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status                TEXT        NOT NULL DEFAULT 'pendente'
                                    CHECK (status IN ('pendente','enviando','enviado','falhou','cancelado')),
  enviado_em            TIMESTAMPTZ,
  evolution_message_id  TEXT,
  erro                  TEXT,
  tentativas            INTEGER     DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_message_queue_status    ON message_queue(status);
CREATE INDEX idx_message_queue_scheduled ON message_queue(agendado_para) WHERE status = 'pendente';

-- ─── 5. CONVERSAS WHATSAPP ────────────────────────────────────────────────────
CREATE TABLE whatsapp_conversations (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id               UUID        REFERENCES prospecting_leads(id) ON DELETE SET NULL,
  instance_id           UUID        REFERENCES whatsapp_instances(id) ON DELETE CASCADE,
  telefone              TEXT        NOT NULL,
  nome_contato          TEXT,
  ultima_mensagem       TEXT,
  ultima_mensagem_at    TIMESTAMPTZ,
  direcao_ultima        TEXT        CHECK (direcao_ultima IN ('enviada','recebida')),
  nao_lidas             INTEGER     DEFAULT 0,
  status                TEXT        NOT NULL DEFAULT 'aberta'
                                    CHECK (status IN ('aberta','em_atendimento','encerrada')),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. MENSAGENS INDIVIDUAIS ─────────────────────────────────────────────────
CREATE TABLE whatsapp_messages (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id       UUID        REFERENCES whatsapp_conversations(id) ON DELETE CASCADE NOT NULL,
  evolution_message_id  TEXT,
  direcao               TEXT        NOT NULL CHECK (direcao IN ('enviada','recebida')),
  tipo                  TEXT        NOT NULL DEFAULT 'texto'
                                    CHECK (tipo IN ('texto','imagem','audio','documento','sticker')),
  conteudo              TEXT,
  media_url             TEXT,
  status                TEXT        DEFAULT 'enviado'
                                    CHECK (status IN ('enviando','enviado','entregue','lido','falhou')),
  timestamp_whatsapp    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wpp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX idx_wpp_conversations_user    ON whatsapp_conversations(user_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE whatsapp_instances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospecting_leads       ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_campaigns       ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue           ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages       ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus próprios dados
CREATE POLICY "whatsapp_instances_user"     ON whatsapp_instances     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "prospecting_leads_user"      ON prospecting_leads      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "message_campaigns_user"      ON message_campaigns      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "message_queue_user"          ON message_queue          FOR ALL
  USING (lead_id IN (SELECT id FROM prospecting_leads WHERE user_id = auth.uid()));
CREATE POLICY "whatsapp_conversations_user" ON whatsapp_conversations  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "whatsapp_messages_user"      ON whatsapp_messages       FOR ALL
  USING (conversation_id IN (SELECT id FROM whatsapp_conversations WHERE user_id = auth.uid()));

-- Edge Functions (service_role) têm acesso total
CREATE POLICY "service_role_instances"      ON whatsapp_instances     FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_leads"          ON prospecting_leads      FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_campaigns"      ON message_campaigns      FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_queue"          ON message_queue          FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_conversations"  ON whatsapp_conversations  FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_messages"       ON whatsapp_messages       FOR ALL TO service_role USING (true);

-- ─── FUNÇÕES ──────────────────────────────────────────────────────────────────

-- Limite diário baseado na idade do chip
-- 0-14 dias → 20/dia | 15-29 dias → 65/dia | 30+ dias → 125/dia
CREATE OR REPLACE FUNCTION get_daily_limit(p_chip_connected_at TIMESTAMPTZ)
RETURNS INTEGER LANGUAGE plpgsql STABLE AS $$
DECLARE v_days INTEGER;
BEGIN
  IF p_chip_connected_at IS NULL THEN RETURN 0; END IF;
  v_days := EXTRACT(DAY FROM NOW() - p_chip_connected_at)::INTEGER;
  IF    v_days < 15 THEN RETURN 20;
  ELSIF v_days < 30 THEN RETURN 65;
  ELSE               RETURN 125;
  END IF;
END;
$$;

-- Zera contador diário (chamado automaticamente antes de cada envio)
CREATE OR REPLACE FUNCTION reset_daily_message_count()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE whatsapp_instances
  SET    messages_sent_today = 0,
         last_reset_date     = CURRENT_DATE
  WHERE  last_reset_date < CURRENT_DATE;
END;
$$;

-- Incrementa contador ao enviar
CREATE OR REPLACE FUNCTION increment_messages_sent(p_instance_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM reset_daily_message_count();
  UPDATE whatsapp_instances
  SET    messages_sent_today = messages_sent_today + 1,
         updated_at          = NOW()
  WHERE  id = p_instance_id;
END;
$$;

-- Verifica se o chip ainda pode enviar hoje
CREATE OR REPLACE FUNCTION can_send_message(p_instance_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  v_instance  whatsapp_instances;
  v_limit     INTEGER;
BEGIN
  PERFORM reset_daily_message_count();
  SELECT * INTO v_instance FROM whatsapp_instances WHERE id = p_instance_id;
  IF NOT FOUND                                              THEN RETURN FALSE; END IF;
  IF v_instance.status != 'connected'                       THEN RETURN FALSE; END IF;
  v_limit := get_daily_limit(v_instance.chip_connected_at);
  IF v_instance.messages_sent_today >= v_limit              THEN RETURN FALSE; END IF;
  RETURN TRUE;
END;
$$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_whatsapp_instances_updated
  BEFORE UPDATE ON whatsapp_instances
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_prospecting_leads_updated
  BEFORE UPDATE ON prospecting_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_message_campaigns_updated
  BEFORE UPDATE ON message_campaigns
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_whatsapp_conversations_updated
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
