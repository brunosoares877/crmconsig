# 🔧 Configurar Variáveis de Ambiente no Vercel

## ⚠️ PROBLEMA: Site em Branco na Produção

Se o site está funcionando localmente mas aparece em branco na produção, **provavelmente as variáveis de ambiente não estão configuradas no Vercel**.

## 📋 PASSO A PASSO - Configurar Variáveis no Vercel

### 1. Acesse o Dashboard do Vercel
- Vá para: https://vercel.com/dashboard
- Faça login na sua conta

### 2. Selecione o Projeto
- Clique no projeto `crmconsig` ou `leadconsig`

### 3. Acesse as Configurações
- Clique em **Settings** (Configurações)
- No menu lateral, clique em **Environment Variables** (Variáveis de Ambiente)

### 4. Adicione as Variáveis

Adicione as seguintes variáveis de ambiente:

#### Variável 1:
```
Nome: VITE_SUPABASE_URL
Valor: https://wjljrytblpsnzjwvugqg.supabase.co
Ambientes: Production, Preview, Development (marque todos)
```

#### Variável 2:
```
Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY
Ambientes: Production, Preview, Development (marque todos)
```

### 5. Salve e Faça Deploy
- Clique em **Save** para cada variável
- Após adicionar todas as variáveis, vá para **Deployments**
- Clique nos três pontinhos do último deploy → **Redeploy**

OU

- Faça um novo commit e push (o Vercel fará deploy automático)

## 🔍 Verificar se Funcionou

1. Após o redeploy, acesse seu site
2. Abra o **Console do Navegador** (F12)
3. Verifique os logs:
   - Deve aparecer: `Iniciando aplicação...`
   - Deve mostrar: `✓ Configurada` para ambas as variáveis

Se ainda aparecer `✗ Não configurada`, as variáveis não foram configuradas corretamente.

## ⚡ Comando Rápido para Deploy

Depois de configurar as variáveis, você pode fazer deploy manual:

```bash
npm run deploy
```

Ou use o script PowerShell:

```powershell
PowerShell -ExecutionPolicy Bypass -File scripts/deploy.ps1
```

## 📝 Notas Importantes

- **Variáveis que começam com `VITE_`** são expostas ao cliente
- **NÃO** adicione valores sensíveis (chaves secretas) em variáveis `VITE_`
- As variáveis são incluídas no build no momento da compilação
- Após adicionar/modificar variáveis, **sempre faça um novo deploy**

## 🆘 Problemas Comuns

### Site continua em branco após configurar variáveis?
1. Verifique se as variáveis foram salvas (veja na lista)
2. Faça um **Redeploy** (não basta salvar, precisa fazer novo build)
3. Aguarde alguns minutos para o deploy completar
4. Limpe o cache do navegador (Ctrl+Shift+R ou Ctrl+F5)

### Variáveis não aparecem no build?
- Certifique-se de que os nomes estão **exatamente** como:
  - `VITE_SUPABASE_URL` (com VITE_ no início)
  - `VITE_SUPABASE_ANON_KEY` (com VITE_ no início)

### Como verificar se as variáveis estão no build?
1. Faça deploy
2. Abra o console do navegador no site em produção
3. Digite: `console.log(import.meta.env)`
4. Deve mostrar as variáveis configuradas

## ✅ Checklist

- [ ] Variável `VITE_SUPABASE_URL` adicionada
- [ ] Variável `VITE_SUPABASE_ANON_KEY` adicionada
- [ ] Ambientes marcados (Production, Preview, Development)
- [ ] Variáveis salvas
- [ ] Novo deploy realizado
- [ ] Site funcionando corretamente

---

**Última atualização:** Após corrigir erro de tela branca no AuthContext

