# 🎓 SETUP COMPLETO - MÁQUINA DE LEADS

## 📋 PASSO 1: SQL - Execute no SQL Editor do Supabase

Copie e cole TODO este SQL no SQL Editor e execute:

```sql
-- ============================================
-- TABELA DE COMPRAS DE CURSOS
-- ============================================
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_course_purchases_user_id ON course_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_course_id ON course_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_course_purchases_status ON course_purchases(status);

-- Row Level Security
ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own purchases"
  ON course_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON course_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending purchases"
  ON course_purchases FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_course_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_course_purchases_updated_at ON course_purchases;
CREATE TRIGGER update_course_purchases_updated_at
  BEFORE UPDATE ON course_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_course_purchases_updated_at();
```

---

## 📦 PASSO 2: CRIAR BUCKET DE STORAGE

### 2.1 - Criar o Bucket

1. No Supabase Dashboard, vá em **Storage** (menu lateral)
2. Clique em **New bucket** ou **Create a new bucket**
3. Preencha:
   - **Name**: `courses`
   - **Public bucket**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
   - Deixe os outros campos no padrão
4. Clique em **Create bucket**

### 2.2 - Criar Pasta e Upload do PDF

1. Dentro do bucket `courses`, clique em **Create folder**
2. Nome da pasta: `maquina-de-leads`
3. Entre na pasta `maquina-de-leads`
4. Clique em **Upload file**
5. Selecione seu arquivo PDF do curso
6. **IMPORTANTE**: O arquivo DEVE se chamar `curso.pdf`
7. Aguarde o upload completar

### 2.3 - Permissões do Storage (SQL)

Execute este SQL também no SQL Editor:

```sql
-- Permitir leitura pública do bucket courses
CREATE POLICY "Public can read courses"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

-- Permitir upload autenticado (opcional)
CREATE POLICY "Authenticated users can upload courses"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'courses' 
    AND auth.role() = 'authenticated'
  );
```

---

## ✅ VERIFICAÇÃO FINAL

Após configurar tudo:

1. ✅ Tabela `course_purchases` criada (veja em Table Editor)
2. ✅ Bucket `courses` criado e marcado como público
3. ✅ Pasta `maquina-de-leads` criada
4. ✅ Arquivo `curso.pdf` enviado
5. ✅ Permissões SQL de storage executadas

### Teste a URL do PDF:

1. No Storage, clique com botão direito no arquivo `curso.pdf`
2. Selecione **Copy URL**
3. Cole no navegador e veja se abre o PDF

A URL deve ser algo como:
```
https://[seu-projeto-id].supabase.co/storage/v1/object/public/courses/maquina-de-leads/curso.pdf
```

---

## 🎯 Pronto!

Agora a página "Máquina de Leads" está funcionando:
- ✅ Usuários podem comprar por R$ 97,00
- ✅ Após compra, têm acesso ao PDF
- ✅ PDF é baixado do Supabase Storage

