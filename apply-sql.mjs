import fs from 'fs';

const sql = `
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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message_queue' AND column_name='funnel_step_id') THEN
        ALTER TABLE message_queue ADD COLUMN funnel_step_id UUID REFERENCES whatsapp_funnel_steps(id) ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE whatsapp_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_funnel_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own funnels" ON whatsapp_funnels;
CREATE POLICY "Users can manage their own funnels"
  ON whatsapp_funnels FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own funnel steps" ON whatsapp_funnel_steps;
CREATE POLICY "Users can manage their own funnel steps"
  ON whatsapp_funnel_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM whatsapp_funnels WHERE whatsapp_funnels.id = whatsapp_funnel_steps.funnel_id AND whatsapp_funnels.user_id = auth.uid()));

-- Tabela para customização de colunas kanban
CREATE TABLE IF NOT EXISTS whatsapp_funnel_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stage_id TEXT NOT NULL,
  label TEXT NOT NULL,
  bg TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stage_id)
);

ALTER TABLE whatsapp_funnel_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own funnel stages" ON whatsapp_funnel_stages;
CREATE POLICY "Users can manage their own funnel stages"
  ON whatsapp_funnel_stages FOR ALL
  USING (auth.uid() = user_id);
`;

async function run() {
  console.log("Sending SQL to Supabase Edge Function...");
  const res = await fetch("https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/run-sql", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: sql
  });
  
  const text = await res.text();
  console.log("Response:", res.status, text);
}

run();
