-- ============================================
-- SQL PARA CRIAR TABELA DE PORTABILIDADES
-- ============================================
-- Copie e cole este SQL completo no SQL Editor do Supabase
-- ============================================

-- Criar tabela de portabilidades separada dos lembretes
CREATE TABLE IF NOT EXISTS portabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  notes TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  bank TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado', 'redigitado')),
  employee UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS portabilities_user_id_idx ON portabilities(user_id);
CREATE INDEX IF NOT EXISTS portabilities_lead_id_idx ON portabilities(lead_id);
CREATE INDEX IF NOT EXISTS portabilities_due_date_idx ON portabilities(due_date);
CREATE INDEX IF NOT EXISTS portabilities_status_idx ON portabilities(status);
CREATE INDEX IF NOT EXISTS portabilities_is_completed_idx ON portabilities(is_completed);
CREATE INDEX IF NOT EXISTS portabilities_employee_idx ON portabilities(employee);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_portabilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_portabilities_updated_at_trigger ON portabilities;
CREATE TRIGGER update_portabilities_updated_at_trigger
  BEFORE UPDATE ON portabilities
  FOR EACH ROW
  EXECUTE FUNCTION update_portabilities_updated_at();

-- Habilitar Row Level Security
ALTER TABLE portabilities ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own portabilities" ON portabilities;
DROP POLICY IF EXISTS "Users can create their own portabilities" ON portabilities;
DROP POLICY IF EXISTS "Users can update their own portabilities" ON portabilities;
DROP POLICY IF EXISTS "Users can delete their own portabilities" ON portabilities;

-- Política: usuários só podem ver suas próprias portabilidades
CREATE POLICY "Users can view their own portabilities"
  ON portabilities FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários só podem criar suas próprias portabilidades
CREATE POLICY "Users can create their own portabilities"
  ON portabilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar suas próprias portabilidades
CREATE POLICY "Users can update their own portabilities"
  ON portabilities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem excluir suas próprias portabilidades
CREATE POLICY "Users can delete their own portabilities"
  ON portabilities FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FIM DO SQL
-- ============================================
-- Após executar, as portabilidades estarão separadas dos lembretes!
-- ============================================

