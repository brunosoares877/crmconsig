
-- Criar tabela para leads premium
CREATE TABLE public.leads_premium (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  mensagem TEXT,
  origem TEXT NOT NULL,
  modalidade TEXT NOT NULL CHECK (modalidade IN ('Aposentado', 'Bolsa Família', 'FGTS')),
  status TEXT NOT NULL DEFAULT 'Novo' CHECK (status IN ('Novo', 'Em atendimento', 'Fechado', 'Perdido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para mensagens do chat interno
CREATE TABLE public.mensagens_premium (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads_premium(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  conteudo TEXT NOT NULL,
  remetente TEXT NOT NULL CHECK (remetente IN ('lead', 'atendente')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.leads_premium ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_premium ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leads_premium
CREATE POLICY "Users can view their own premium leads" 
  ON public.leads_premium 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own premium leads" 
  ON public.leads_premium 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own premium leads" 
  ON public.leads_premium 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own premium leads" 
  ON public.leads_premium 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para mensagens_premium
CREATE POLICY "Users can view messages from their premium leads" 
  ON public.mensagens_premium 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages for their premium leads" 
  ON public.mensagens_premium 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update messages from their premium leads" 
  ON public.mensagens_premium 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete messages from their premium leads" 
  ON public.mensagens_premium 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Inserir dados mockados para teste (você precisará substituir user_id pelo seu ID real)
-- INSERT INTO public.leads_premium (user_id, nome, telefone, mensagem, origem, modalidade, status) VALUES
-- ('YOUR_USER_ID_HERE', 'João Silva', '11990000001', 'Tenho interesse em saber mais sobre aposentadoria', 'Facebook Ads', 'Aposentado', 'Novo'),
-- ('YOUR_USER_ID_HERE', 'Maria Santos', '11990000002', 'Preciso de ajuda com o Bolsa Família', 'Google Ads', 'Bolsa Família', 'Em atendimento'),
-- ('YOUR_USER_ID_HERE', 'Carlos Oliveira', '11990000003', 'Quero sacar meu FGTS', 'Facebook Ads', 'FGTS', 'Novo');
