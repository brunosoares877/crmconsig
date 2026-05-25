-- Adicionar campo admin_password_hash na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_password_hash TEXT;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS profiles_admin_password_hash_idx ON profiles(admin_password_hash) WHERE admin_password_hash IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN profiles.admin_password_hash IS 'Hash SHA-256 da senha administrativa para confirmar exclusões';

-- Criar tabela para tokens de redefinição de senha administrativa
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS admin_password_resets_user_id_idx ON admin_password_resets(user_id);
CREATE INDEX IF NOT EXISTS admin_password_resets_token_idx ON admin_password_resets(token);
CREATE INDEX IF NOT EXISTS admin_password_resets_expires_at_idx ON admin_password_resets(expires_at);

-- Habilitar Row Level Security
ALTER TABLE admin_password_resets ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver seus próprios tokens
CREATE POLICY "Users can view their own reset tokens"
  ON admin_password_resets FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários só podem criar seus próprios tokens
CREATE POLICY "Users can create their own reset tokens"
  ON admin_password_resets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar seus próprios tokens
CREATE POLICY "Users can update their own reset tokens"
  ON admin_password_resets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

