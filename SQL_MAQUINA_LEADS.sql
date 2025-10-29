-- ============================================
-- SQL PARA CONFIGURAR MÁQUINA DE LEADS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. CRIAR TABELA DE COMPRAS DE CURSOS
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

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_course_purchases_user_id ON course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course_id ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(status);

-- 3. ATIVAR ROW LEVEL SECURITY (RLS)
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICA: Usuários podem ver apenas suas próprias compras
CREATE POLICY "Users can view their own purchases"
  ON course_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- 5. POLÍTICA: Usuários podem criar suas próprias compras
CREATE POLICY "Users can create their own purchases"
  ON course_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. POLÍTICA: Usuários podem atualizar apenas compras pendentes próprias
CREATE POLICY "Users can update their own pending purchases"
  ON course_purchases FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- 7. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_course_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER PARA ATUALIZAR updated_at
DROP TRIGGER IF EXISTS update_course_purchases_updated_at ON course_purchases;
CREATE TRIGGER update_course_purchases_updated_at
  BEFORE UPDATE ON course_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_course_purchases_updated_at();

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE course_purchases IS 'Armazena as compras de cursos dos usuários';
COMMENT ON COLUMN course_purchases.course_id IS 'ID do curso (ex: maquina-de-leads)';
COMMENT ON COLUMN course_purchases.status IS 'Status da compra: pending, paid, cancelled, refunded';

