# Configuração do Login com Google (OAuth)

## 📋 Status Atual

O código do login com Google está implementado com tratamento robusto de erros. Para ativar esta funcionalidade, siga os passos abaixo.

---

## 🔧 Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Nome sugerido: **LeadConsig CRM**

---

## 🔑 Passo 2: Configurar OAuth Consent Screen

1. No menu lateral, vá em: **APIs & Services** > **OAuth consent screen**
2. Selecione **External** (para permitir qualquer conta Google)
3. Preencha as informações:
   - **App name**: LeadConsig CRM
   - **User support email**: seu-email@dominio.com
   - **Developer contact**: seu-email@dominio.com
4. Clique em **Save and Continue**
5. Em **Scopes**, adicione:
   - `userinfo.email`
   - `userinfo.profile`
6. Clique em **Save and Continue**
7. Em **Test users** (opcional para desenvolvimento):
   - Adicione emails de teste
8. Clique em **Save and Continue**

---

## 🎫 Passo 3: Criar Credenciais OAuth

1. Vá em: **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Selecione **Application type**: **Web application**
4. Configure:
   - **Name**: LeadConsig Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     https://seu-dominio.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://wjljrytblpsnzjwvugqg.supabase.co/auth/v1/callback
     ```
5. Clique em **Create**
6. **IMPORTANTE**: Copie e guarde:
   - ✅ **Client ID**
   - ✅ **Client Secret**

---

## 🗄️ Passo 4: Configurar no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: **wjljrytblpsnzjwvugqg**
3. Vá em: **Authentication** > **Providers**
4. Encontre **Google** e clique em **Enable**
5. Cole as credenciais:
   - **Client ID**: [Cole aqui]
   - **Client Secret**: [Cole aqui]
6. Em **Redirect URL**, confirme que está:
   ```
   https://wjljrytblpsnzjwvugqg.supabase.co/auth/v1/callback
   ```
7. Clique em **Save**

---

## ✅ Passo 5: Testar Localmente

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:5173/login

3. Clique em **Continuar com Google**

4. **Resultados esperados:**
   - ✅ Abre popup/redirect para login do Google
   - ✅ Após login, redireciona para `/dashboard`
   - ✅ Usuário criado automaticamente no Supabase

---

## 🚨 Troubleshooting - Erros Comuns

### Erro: "Login com Google não está ativado"

**Causa**: Provider não habilitado no Supabase

**Solução**:
1. Vá em Supabase > Authentication > Providers
2. Ative o Google Provider
3. Salve as configurações

---

### Erro: "Configuração do Google OAuth incompleta"

**Causa**: Client ID ou Client Secret inválidos/vazios

**Solução**:
1. Verifique se copiou corretamente do Google Cloud Console
2. Certifique-se de que não há espaços extras
3. Recrie as credenciais se necessário

---

### Erro: "URL de redirecionamento não autorizada"

**Causa**: A URL atual não está nas URLs autorizadas do Google

**Solução**:
1. Vá no Google Cloud Console
2. Edite as credenciais OAuth
3. Adicione a URL em **Authorized redirect URIs**:
   ```
   https://wjljrytblpsnzjwvugqg.supabase.co/auth/v1/callback
   ```
4. Para desenvolvimento local, adicione também:
   ```
   http://localhost:5173
   ```

---

### Erro: "Login cancelado"

**Causa**: Usuário fechou a janela de login

**Solução**: Normal, usuário cancelou o processo. Tente novamente.

---

### Erro: "Erro de conexão"

**Causa**: Problema de rede ou firewall

**Solução**:
1. Verifique sua conexão com internet
2. Desative VPN/Proxy temporariamente
3. Verifique se o firewall não está bloqueando

---

## 📊 Logs de Debug

O sistema agora registra logs detalhados no console do navegador:

```
[Google OAuth] Iniciando processo de login...
[Google OAuth] Redirecionando para autenticação...
```

Em caso de erro:
```
[Google OAuth] Erro retornado: { message, status, name }
```

**Para ver os logs:**
1. Abra o DevTools (F12)
2. Vá na aba **Console**
3. Tente fazer login com Google
4. Veja os logs com prefixo `[Google OAuth]`

---

## 🔒 Segurança

### Boas Práticas

1. ✅ **Nunca compartilhe** o Client Secret publicamente
2. ✅ **Use HTTPS** em produção
3. ✅ **Limite as URLs** autorizadas apenas às necessárias
4. ✅ **Revise periodicamente** os acessos no Google Cloud Console

### Configurações Recomendadas

- **OAuth Consent Screen**: Modo External (para qualquer usuário)
- **Scopes**: Apenas email e profile (mínimo necessário)
- **Redirect URIs**: Apenas domínios confiáveis

---

## 📝 Checklist de Configuração

- [ ] Projeto criado no Google Cloud Console
- [ ] OAuth Consent Screen configurado
- [ ] Credenciais OAuth criadas
- [ ] Client ID e Client Secret copiados
- [ ] Provider Google ativado no Supabase
- [ ] Credenciais coladas no Supabase
- [ ] Redirect URI configurada no Google
- [ ] Testado localmente
- [ ] Testado em produção

---

## 🎯 Próximos Passos (Produção)

Quando for para produção:

1. **Atualizar URLs autorizadas** no Google Cloud Console:
   ```
   https://seu-dominio-producao.com
   ```

2. **Adicionar redirect URI de produção**:
   ```
   https://wjljrytblpsnzjwvugqg.supabase.co/auth/v1/callback
   ```

3. **Publicar o OAuth Consent Screen**:
   - Vá em OAuth consent screen
   - Clique em "Publish App"
   - Aguarde aprovação do Google (pode levar alguns dias)

4. **Testar em produção**:
   - Faça login com diferentes contas Google
   - Verifique se os dados são salvos corretamente

---

## 📞 Suporte

Se continuar com problemas:

1. Verifique os logs no console do navegador
2. Verifique os logs no Supabase Dashboard > Logs
3. Consulte a documentação oficial:
   - [Supabase Auth - Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

---

## ✨ Melhorias Implementadas

### Tratamento de Erros

- ✅ Detecção de provider não habilitado
- ✅ Detecção de credenciais inválidas
- ✅ Detecção de URL não autorizada
- ✅ Detecção de popup fechado pelo usuário
- ✅ Detecção de erros de rede
- ✅ Mensagens claras e acionáveis
- ✅ Logs detalhados para debug

### UX Melhorada

- ✅ Toast com título e descrição
- ✅ Duração apropriada para cada tipo de erro
- ✅ Feedback visual de loading
- ✅ Mensagem de sucesso ao redirecionar

### Configuração OAuth

- ✅ `access_type: 'offline'` - Para refresh tokens
- ✅ `prompt: 'consent'` - Sempre pedir consentimento
- ✅ Redirect para dashboard após login
