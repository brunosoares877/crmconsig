# 🚀 Configurar Supabase para Domínio Personalizado

## ⚠️ **IMPORTANTE: Configuração Obrigatória no Supabase Dashboard**

Para que os links de recuperação de senha funcionem com seu domínio `leadconsig.com.br`, você **DEVE** configurar as URLs no Supabase Dashboard.

## 📋 **Passo a Passo:**

### 1. **Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard
```

### 2. **Vá para Configurações de Auth**
1. Selecione seu projeto LeadConsig
2. Clique em **"Authentication"** no menu lateral
3. Clique em **"URL Configuration"**

### 3. **Configure as URLs**

#### **Site URL** (obrigatório):
```
https://leadconsig.com.br
```

#### **Redirect URLs** (adicionar todas):
```
https://leadconsig.com.br/**
https://leadconsig.com.br/reset-password
http://localhost:8080/**
http://localhost:8081/**
http://localhost:8082/**
https://crmconsig.lovable.app/**
```

### 4. **Adicionar URLs de Desenvolvimento** (opcional):
Para funcionar em desenvolvimento, adicione também:
```
http://localhost:3000/**
http://localhost:5173/**
http://localhost:8080/reset-password
```

## 🎯 **Como Configurar:**

### **Site URL:**
- Campo: `Site URL`
- Valor: `https://leadconsig.com.br`
- Descrição: URL principal da aplicação

### **Redirect URLs:**
- Campo: `Redirect URLs` (lista)
- Clique em **"Add URL"** para cada uma:
  1. `https://leadconsig.com.br/**`
  2. `https://leadconsig.com.br/reset-password`
  3. `http://localhost:8080/**`
  4. `http://localhost:8081/**`
  5. `http://localhost:8082/**`

## ⚙️ **Exemplo de Configuração Final:**

```
✅ Site URL
https://leadconsig.com.br

✅ Redirect URLs
- https://leadconsig.com.br/**
- https://leadconsig.com.br/reset-password
- http://localhost:8080/**
- http://localhost:8081/**
- http://localhost:8082/**
- https://crmconsig.lovable.app/**
```

## 🔄 **Após Configurar:**

1. **Salve as configurações** no Supabase
2. **Aguarde 1-2 minutos** para propagação
3. **Teste o "Esqueci minha senha"** novamente

## 🧪 **Como Testar:**

1. Vá para: `http://localhost:8080/login`
2. Clique em **"Esqueci minha senha"**
3. Clique em **"Ver Config Domínio"** - deve mostrar:
   ```
   Configurado: https://leadconsig.com.br ✅
   ```
4. Digite seu email e envie
5. Verifique o email recebido - deve apontar para `leadconsig.com.br`

## 🚨 **Troubleshooting:**

### Se ainda não funcionar:

1. **Verifique o console do navegador** para erros
2. **Teste com outro email** 
3. **Aguarde 5 minutos** (cache do Supabase)
4. **Confirme que salvou** as configurações no dashboard

### Erro "Invalid redirect URL":
- Certifique-se que adicionou `https://leadconsig.com.br/**` nas Redirect URLs
- Aguarde a propagação (1-2 minutos)

## 📞 **Suporte:**

Se continuar com problemas:
1. **Screenshot** das configurações do Supabase Dashboard
2. **Console logs** do navegador
3. **Email de teste** que você usou

---

**🎯 RESULTADO ESPERADO:** Links de recuperação redirecionarão para `https://leadconsig.com.br/reset-password` 

📍 Projeto LeadConsig → Authentication → Email Templates  
📧 Reset Password → Copiar template português
💾 Salvar configurações 

🌐 http://localhost:8080/login
🔑 Esqueci minha senha
📧 Enviar email de teste
✅ Verificar email em português 