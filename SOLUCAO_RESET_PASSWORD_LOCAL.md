# 🔧 Solução: Reset Password não funciona em ambiente local

## Problema
Quando você clica no link de redefinição de senha no email, recebe "página inválida" porque o Supabase bloqueia URLs não configuradas nas Redirect URLs.

## ✅ Solução Rápida

### Opção 1: Adicionar URL no Supabase (Recomendado)

1. **Acesse o Dashboard do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta

2. **Navegue até Authentication → URL Configuration:**
   - No menu lateral, clique em **Authentication**
   - Depois clique em **URL Configuration**

3. **Adicione as URLs permitidas:**
   
   Na seção **Redirect URLs**, adicione todas estas URLs (uma por linha):
   ```
   http://localhost:5173/*
   http://localhost:8080/*
   http://localhost:8081/*
   http://localhost:8082/*
   http://localhost:3000/*
   http://127.0.0.1:5173/*
   http://127.0.0.1:8080/*
   http://127.0.0.1:8081/*
   http://127.0.0.1:8082/*
   http://127.0.0.1:3000/*
   ```

4. **Também adicione em "Site URL":**
   ```
   http://localhost:8082
   ```

5. **Salve as alterações**

6. **Solicite um novo email de recuperação** (o link anterior pode estar com URL antiga)

### Opção 2: Usar URL Manual (Temporário)

Se não puder configurar o Supabase agora, você pode:

1. **Copie o link completo do email** (passe o mouse sobre o botão e clique com botão direito → "Copiar endereço do link")

2. **Modifique a URL manualmente no navegador:**
   - O link provavelmente tem algo como: `https://wjljrytblpsnzjwvugqg.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=...`
   - Localize o parâmetro `redirect_to` na URL
   - Substitua a URL de redirect para: `http://localhost:8082/reset-password`
   - Cole no navegador

   **Exemplo:**
   ```
   Link original:
   ...redirect_to=http://localhost:8080/reset-password...
   
   Modificado:
   ...redirect_to=http://localhost:8082/reset-password...
   ```

## 🔍 Verificar Configuração Atual

No console do navegador (F12), você pode ver qual URL está sendo gerada:
- Abra o console (F12)
- Procure por mensagens de debug com "URL Reset Password"
- Ou clique no botão "Ver Config Domínio" na tela de recuperação

## 📝 Nota Importante

- O link de recuperação expira após alguns minutos
- Se o link não funcionar, solicite um novo
- Após configurar o Supabase, os próximos emails funcionarão automaticamente

## 🚀 Após Configurar

Depois de adicionar as URLs no Supabase:
1. Solicite um novo email de recuperação
2. O link deve funcionar automaticamente
3. A página `/reset-password` deve abrir corretamente

