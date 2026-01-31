# Como Ativar Assinatura Manualmente

Este guia explica como ativar assinaturas manualmente no Supabase enquanto o gateway de pagamento não está implementado.

## 📋 Pré-requisitos

- Acesso ao [Supabase Dashboard](https://supabase.com/dashboard)
- Permissões de admin no projeto
- UUID do usuário que receberá a assinatura

---

## 🔍 Como Encontrar o UUID do Usuário

### Opção 1: Via Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** > **Users**
3. Encontre o usuário pelo email
4. Copie o **User UID** (UUID)

### Opção 2: Via SQL

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'usuario@exemplo.com';
```

---

## ✅ Ativar Assinatura

### Via Interface (Table Editor)

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** > **subscriptions**
3. Clique em **Insert** > **Insert row**
4. Preencha os campos:
   - **user_id**: Cole o UUID do usuário
   - **plan_type**: Escolha `monthly`, `semiannual` ou `annual`
   - **status**: Selecione `active`
   - **start_date**: Data atual (ou deixe em branco para NOW())
   - **end_date**: Data de expiração (calcule baseado no plano)
   - **amount**: Valor pago (opcional)
   - **payment_method**: `manual` (opcional)
   - **payment_reference**: Referência do pagamento (opcional)
5. Clique em **Save**

### Via SQL (Recomendado)

#### Assinatura Mensal (30 dias)

```sql
INSERT INTO subscriptions (
  user_id, 
  plan_type, 
  status, 
  start_date, 
  end_date, 
  amount,
  payment_method
)
VALUES (
  '[COLE_O_UUID_AQUI]',
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  97.00,
  'manual'
);
```

#### Assinatura Semestral (6 meses)

```sql
INSERT INTO subscriptions (
  user_id, 
  plan_type, 
  status, 
  start_date, 
  end_date, 
  amount,
  payment_method
)
VALUES (
  '[COLE_O_UUID_AQUI]',
  'semiannual',
  'active',
  NOW(),
  NOW() + INTERVAL '6 months',
  497.00,
  'manual'
);
```

#### Assinatura Anual (1 ano)

```sql
INSERT INTO subscriptions (
  user_id, 
  plan_type, 
  status, 
  start_date, 
  end_date, 
  amount,
  payment_method
)
VALUES (
  '[COLE_O_UUID_AQUI]',
  'annual',
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',
  997.00,
  'manual'
);
```

---

## 🔄 Verificar Assinaturas Ativas

```sql
SELECT 
  s.id,
  s.user_id,
  u.email,
  s.plan_type,
  s.status,
  s.start_date,
  s.end_date,
  s.amount,
  s.payment_method
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;
```

---

## ⏰ Estender Assinatura Existente

```sql
UPDATE subscriptions
SET 
  end_date = end_date + INTERVAL '1 month',  -- Ajuste conforme necessário
  updated_at = NOW()
WHERE user_id = '[UUID_DO_USUARIO]'
  AND status = 'active';
```

---

## ❌ Cancelar Assinatura

```sql
UPDATE subscriptions
SET 
  status = 'cancelled',
  updated_at = NOW()
WHERE user_id = '[UUID_DO_USUARIO]'
  AND status = 'active';
```

---

## 🔍 Verificar Assinaturas Expiradas

```sql
SELECT 
  s.id,
  u.email,
  s.plan_type,
  s.end_date,
  s.status
FROM subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.end_date < NOW()
  AND s.status = 'active';
```

Para marcar como expiradas automaticamente:

```sql
SELECT check_expired_subscriptions();
```

---

## 📊 Relatório de Assinaturas

```sql
SELECT 
  s.plan_type,
  s.status,
  COUNT(*) as total,
  SUM(s.amount) as revenue
FROM subscriptions s
GROUP BY s.plan_type, s.status
ORDER BY s.plan_type, s.status;
```

---

## ⚠️ Notas Importantes

1. **Segurança**: Apenas admins devem ter acesso ao Supabase Dashboard
2. **Validação**: O sistema verifica assinaturas a cada 5 minutos automaticamente
3. **Cache**: Usuários podem precisar fazer logout/login para ver mudanças imediatas
4. **Trial**: Quando uma assinatura paga é ativada, o trial é automaticamente desativado
5. **Única Assinatura Ativa**: Um usuário só pode ter uma assinatura ativa por vez

---

## 🚀 Quando Implementar Gateway de Pagamento

Quando você implementar o gateway de pagamento (Stripe, MercadoPago, etc):

1. O webhook do gateway chamará uma Edge Function
2. A Edge Function criará a assinatura automaticamente usando service role
3. Este processo manual não será mais necessário
4. A estrutura do banco já está pronta para receber os dados

**Campos preparados para gateway:**
- `payment_method`: Nome do gateway (stripe, mercadopago, etc)
- `payment_reference`: ID da transação/assinatura no gateway
- `amount`: Valor pago

---

## 📞 Suporte

Em caso de dúvidas sobre este processo, consulte:
- Documentação do Supabase: https://supabase.com/docs
- Arquivo: `src/services/subscriptionService.ts`
- Migration: `supabase/migrations/20250131120000-create-subscriptions-table.sql`
