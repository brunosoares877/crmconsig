-- Tabela para armazenar assinaturas de forma segura
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'semiannual', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politica: usuarios podem ver apenas suas proprias assinaturas
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Politica: apenas o sistema pode criar assinaturas (via service role)
CREATE POLICY "Service role can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (false);

-- Politica: apenas o sistema pode atualizar assinaturas
CREATE POLICY "Service role can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (false);

-- Funcao para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Funcao para verificar e atualizar status de assinaturas expiradas
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active' 
    AND end_date < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentacao
COMMENT ON TABLE subscriptions IS 'Armazena as assinaturas dos usuarios com validacao segura no backend';
COMMENT ON COLUMN subscriptions.plan_type IS 'Tipo do plano: monthly, semiannual, annual';
COMMENT ON COLUMN subscriptions.status IS 'Status da assinatura: active, cancelled, expired, pending';
COMMENT ON COLUMN subscriptions.payment_method IS 'Gateway de pagamento usado (stripe, paypal, mercadopago, etc)';
COMMENT ON COLUMN subscriptions.payment_reference IS 'ID da transacao no gateway de pagamento';
