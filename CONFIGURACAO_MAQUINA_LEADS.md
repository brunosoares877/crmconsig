# 🎓 Configuração - Máquina de Leads

## 📋 Passos para Configuração

### 1. Criar Tabela no Supabase

Execute o script SQL `create-course-purchases-table.sql` no Supabase SQL Editor:

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `create-course-purchases-table.sql`
4. Execute o script

### 2. Criar Bucket de Storage para o Curso

1. No Supabase, vá em **Storage**
2. Clique em **Create a new bucket**
3. Nome do bucket: `courses`
4. Marque como **Public bucket** (para permitir download do PDF)
5. Salve

### 3. Upload do PDF do Curso

1. Ainda em **Storage**, clique no bucket `courses`
2. Crie uma pasta chamada `maquina-de-leads`
3. Faça upload do arquivo PDF do curso com o nome `curso.pdf`
4. O caminho completo será: `maquina-de-leads/curso.pdf`

### 4. Configuração de Permissões do Storage

No Supabase SQL Editor, execute:

```sql
-- Permitir leitura pública do bucket courses
CREATE POLICY "Public can read courses"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

-- Permitir que usuários autenticados possam fazer upload (opcional, para futuras atualizações)
CREATE POLICY "Authenticated users can upload courses"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'courses' 
    AND auth.role() = 'authenticated'
  );
```

## 💳 Integração com Gateway de Pagamento

Atualmente o sistema está configurado para simular um pagamento manual. Para produção, você precisará integrar com um gateway de pagamento:

### Opções Recomendadas:
- **Stripe** (internacional)
- **PagSeguro** (Brasil)
- **Mercado Pago** (Brasil)
- **Asaas** (Brasil)

### Como Integrar:
1. No arquivo `src/pages/MaquinaDeLeads.tsx`, na função `handlePurchase()`
2. Substitua a simulação de pagamento por uma chamada real ao gateway
3. Configure webhook para receber confirmação de pagamento
4. Atualize o status da compra quando o pagamento for confirmado

## 📊 Estrutura de Dados

### Tabela: course_purchases
- `id`: UUID (chave primária)
- `user_id`: UUID (referência ao usuário)
- `course_id`: TEXT (ex: 'maquina-de-leads')
- `amount`: DECIMAL (valor da compra)
- `status`: TEXT ('pending', 'paid', 'cancelled', 'refunded')
- `payment_method`: TEXT
- `paid_at`: TIMESTAMPTZ
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## 🔒 Segurança

- ✅ Row Level Security (RLS) ativado
- ✅ Usuários só podem ver suas próprias compras
- ✅ Apenas compras com status 'paid' liberam acesso
- ✅ Storage público apenas para leitura

## 📝 Próximos Passos

1. ✅ Criar tabela de compras
2. ✅ Criar bucket de storage
3. ⏳ Fazer upload do PDF do curso
4. ⏳ Integrar gateway de pagamento (opcional)
5. ⏳ Testar fluxo completo de compra

