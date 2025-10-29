# 📧 Configurar Emails em Português - Supabase

## 🎯 **Template Personalizado de Recuperação de Senha**

Para que os emails de recuperação sejam enviados em português, você precisa configurar templates personalizados no Supabase Dashboard.

## 📋 **Passo a Passo:**

### 1. **Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard
```

### 2. **Configurar Templates de Email**
1. Selecione seu projeto **LeadConsig**
2. Vá em **Authentication** → **Email Templates**
3. Selecione **"Reset Password"**

### 3. **Template em Português - Reset Password**

#### **Subject (Assunto):**
```
Redefinir senha - {{ .SiteName }}
```

#### **Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Redefinir sua senha</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Redefinir Senha</h1>
            <p>LeadConsig - CRM para Crédito Consignado</p>
        </div>
        
        <div class="content">
            <h2>Olá!</h2>
            
            <p>Você solicitou a redefinição da sua senha para acessar o <strong>LeadConsig</strong>.</p>
            
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Redefinir Minha Senha
                </a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este link expira em <strong>1 hora</strong></li>
                    <li>Só funciona uma única vez</li>
                    <li>Se não solicitou, ignore este email</li>
                </ul>
            </div>
            
            <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; color: #3b82f6; font-size: 14px;">
                {{ .ConfirmationURL }}
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            
            <p><strong>Não solicitou esta alteração?</strong></p>
            <p>Se você não pediu para redefinir sua senha, pode ignorar este email com segurança. Sua senha atual continuará funcionando normalmente.</p>
        </div>
        
        <div class="footer">
            <p>Este email foi enviado automaticamente pelo <strong>LeadConsig</strong></p>
            <p>💬 Precisa de ajuda? Entre em contato com nosso suporte</p>
            <p style="margin-top: 15px; font-size: 12px;">
                LeadConsig © 2025 - Sistema de CRM para Crédito Consignado
            </p>
        </div>
    </div>
</body>
</html>
```

### 4. **Template de Confirmação de Conta (Bonus)**

Se quiser também configurar o email de confirmação de conta:

#### **Subject:**
```
Confirme sua conta - {{ .SiteName }}
```

#### **Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Confirmar sua conta</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Bem-vindo ao LeadConsig!</h1>
            <p>Falta só um passo para começar</p>
        </div>
        
        <div class="content">
            <h2>Confirme sua conta</h2>
            
            <p>Obrigado por se registrar no <strong>LeadConsig</strong>! Para completar seu cadastro e começar a usar nossa plataforma, confirme sua conta clicando no botão abaixo:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    Confirmar Minha Conta
                </a>
            </div>
            
            <p>Após confirmar, você terá acesso a:</p>
            <ul>
                <li>✅ Dashboard completo com métricas</li>
                <li>✅ Gestão de leads e agendamentos</li>
                <li>✅ Relatórios de comissão automáticos</li>
                <li>✅ Integração com WhatsApp</li>
                <li>✅ 7 dias de teste grátis</li>
            </ul>
            
            <p>Se o botão não funcionar, copie e cole este link:</p>
            <p style="word-break: break-all; color: #10b981; font-size: 14px;">
                {{ .ConfirmationURL }}
            </p>
        </div>
        
        <div class="footer">
            <p>Este email foi enviado automaticamente pelo <strong>LeadConsig</strong></p>
            <p>💬 Precisa de ajuda? Entre em contato com nosso suporte</p>
        </div>
    </div>
</body>
</html>
```

## 🔄 **Como Aplicar:**

### 1. **No Supabase Dashboard:**
1. Authentication → Email Templates
2. Selecione **"Reset Password"**
3. Cole o **Subject** e **Body** em português
4. Clique **"Save"**
5. Repita para **"Confirm Signup"** se desejar

### 2. **Testar:**
1. Vá para `localhost:8080/login`
2. Clique "Esqueci minha senha"
3. Digite um email válido
4. Verifique o email recebido (agora em português!)

## 🎨 **Personalização Adicional:**

### **Variáveis Disponíveis:**
- `{{ .SiteName }}` - Nome do site
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário
- `{{ .Data.name }}` - Nome do usuário (se disponível)

### **Customizar Cores:**
- **Azul Principal:** `#3b82f6`
- **Verde Sucesso:** `#10b981`
- **Vermelho Erro:** `#ef4444`
- **Cinza Texto:** `#64748b`

## 📧 **Resultado Final:**

Seus usuários receberão emails lindos e profissionais em português, com:
- ✅ Design moderno e responsivo
- ✅ Textos claros em português brasileiro
- ✅ Instruções detalhadas de segurança
- ✅ Branding do LeadConsig
- ✅ Links funcionais para seu domínio

---

**🎯 Depois de configurar, todos os emails serão enviados em português!** 