# 📧 Implementar Envio de Email para Redefinição de Senha Administrativa

## 📋 Visão Geral

Atualmente, o sistema gera o token de redefinição e copia o link para a área de transferência. Para produção, é necessário implementar o envio real de email.

## 🚀 Opções de Implementação

### Opção 1: Supabase Edge Function (Recomendado)

1. **Criar Edge Function no Supabase:**
   ```bash
   supabase functions new send-admin-password-reset
   ```

2. **Código da função** (`supabase/functions/send-admin-password-reset/index.ts`):
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   serve(async (req) => {
     const { email, resetLink } = await req.json()
     
     // Usar serviço de email (Resend, SendGrid, etc.)
     // Exemplo com Resend:
     const response = await fetch('https://api.resend.com/emails', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         from: 'noreply@seudominio.com.br',
         to: email,
         subject: 'Redefinição de Senha Administrativa',
         html: `
           <h2>Redefinição de Senha Administrativa</h2>
           <p>Clique no link abaixo para redefinir sua senha administrativa:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>Este link expira em 1 hora.</p>
         `
       })
     })
     
     return new Response(JSON.stringify({ success: true }), {
       headers: { 'Content-Type': 'application/json' }
     })
   })
   ```

3. **Atualizar AdminPasswordSection.tsx:**
   ```typescript
   const response = await supabase.functions.invoke('send-admin-password-reset', {
     body: { 
       email: userData.user.email,
       resetLink 
     }
   })
   ```

### Opção 2: API Route (Next.js/Vercel)

Se estiver usando Next.js ou Vercel, criar uma API route:

```typescript
// pages/api/send-admin-password-reset.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  const { email, resetLink } = req.body
  
  await resend.emails.send({
    from: 'noreply@seudominio.com.br',
    to: email,
    subject: 'Redefinição de Senha Administrativa',
    html: `...`
  })
  
  res.json({ success: true })
}
```

### Opção 3: Supabase Database Webhooks

Configurar webhook no Supabase que detecta inserção em `admin_password_resets` e envia email.

## 📝 Configuração Necessária

1. **Variáveis de Ambiente:**
   - `RESEND_API_KEY` (se usar Resend)
   - Ou credenciais do serviço de email escolhido

2. **Domínio Verificado:**
   - Verificar domínio no serviço de email
   - Configurar SPF/DKIM/DMARC

## ✅ Status Atual

- ✅ Token de redefinição gerado
- ✅ Link criado e copiado para área de transferência
- ⏳ Envio de email por implementar (mostra link no toast)

## 🔗 Serviços de Email Recomendados

- **Resend** (recomendado): https://resend.com
- **SendGrid**: https://sendgrid.com
- **Mailgun**: https://mailgun.com
- **AWS SES**: https://aws.amazon.com/ses/

---

**Nota:** O sistema está funcional, mas o envio de email precisa ser implementado conforme uma das opções acima.

