-- Tabela para armazenar compras de cursos
CREATE TABLE IF NOT EXISTS course_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id, status)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_course_purchases_user_id ON course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course_id ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(status);

-- RLS (Row Level Security)
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas suas próprias compras
CREATE POLICY "Users can view their own purchases"
  ON course_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem criar suas próprias compras
CREATE POLICY "Users can create their own purchases"
  ON course_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: apenas o sistema pode atualizar compras (para confirmação de pagamento)
-- Esta política permite que o próprio usuário atualize caso seja necessário
CREATE POLICY "Users can update their own pending purchases"
  ON course_purchases FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_course_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_course_purchases_updated_at
  BEFORE UPDATE ON course_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_course_purchases_updated_at();

-- Comentários para documentação
COMMENT ON TABLE course_purchases IS 'Armazena as compras de cursos dos usuários';
COMMENT ON COLUMN course_purchases.course_id IS 'ID do curso (ex: maquina-de-leads)';
COMMENT ON COLUMN course_purchases.status IS 'Status da compra: pending, paid, cancelled, refunded';

