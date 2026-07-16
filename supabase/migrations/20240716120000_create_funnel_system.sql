-- Criação das tabelas do Sistema de Funis

CREATE TABLE IF NOT EXISTS whatsapp_funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_funnel_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES whatsapp_funnels(id) ON DELETE CASCADE NOT NULL,
  ordem_etapa INTEGER NOT NULL,
  delay_minutos INTEGER DEFAULT 0,
  mensagem_template TEXT NOT NULL,
  tipo_midia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona a coluna funnel_step_id à tabela message_queue para rastrear mensagens de funil
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message_queue' AND column_name='funnel_step_id') THEN
        ALTER TABLE message_queue ADD COLUMN funnel_step_id UUID REFERENCES whatsapp_funnel_steps(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Atualizar Row Level Security (RLS) para as novas tabelas
ALTER TABLE whatsapp_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_funnel_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own funnels"
  ON whatsapp_funnels FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own funnel steps"
  ON whatsapp_funnel_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM whatsapp_funnels WHERE whatsapp_funnels.id = whatsapp_funnel_steps.funnel_id AND whatsapp_funnels.user_id = auth.uid()));
