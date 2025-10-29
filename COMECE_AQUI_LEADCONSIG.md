# 🚀 COMEÇAR AGORA - leadconsig.com.br

## ⚡ **DEPLOY EM 5 MINUTOS**

### **1️⃣ CRIE CONTA VERCEL (1 minuto)**
- Acesse: https://vercel.com
- **Sign Up** → Use GitHub ou email
- Confirme email se necessário

### **2️⃣ DEPLOY AUTOMÁTICO (2 minutos)**
```bash
# Execute este arquivo:
deploy-leadconsig.bat

# OU execute manualmente:
npm run deploy
```

### **3️⃣ CONFIGURE DNS HOSTINGER (2 minutos)**

**Acesse:** https://hpanel.hostinger.com.br
**Vá em:** Domínios → leadconsig.com.br → DNS

**REMOVA registros A e CNAME existentes**
**ADICIONE apenas estes:**

```
Tipo: A
Nome: @  
Valor: 76.76.19.61

Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com
```

### **4️⃣ CONFIGURE DOMÍNIO VERCEL**
- Acesse: https://vercel.com/dashboard
- Clique no projeto CRM
- **Settings → Domains**
- **Add:** `leadconsig.com.br`
- **Add:** `www.leadconsig.com.br`

---

## 🎯 **RESULTADO FINAL**

Após 24-48h de propagação DNS:
- **https://leadconsig.com.br** → Seu CRM
- **https://www.leadconsig.com.br** → Redirec. automático
- **SSL automático** → HTTPS ativo
- **Deploy automático** → Push git = atualização

---

## 💰 **CUSTOS**

### **VERCEL (Hospedagem):**
- ✅ **Gratuito:** 0-1000 usuários/mês
- 💰 **$20/mês:** +1000 usuários/mês

### **HOSTINGER (Domínio):**
- 💰 **~R$ 40/ano:** leadconsig.com.br

### **SUPABASE (Banco):**
- ✅ **Gratuito:** até 500MB + 50k requests/mês
- 💰 **$25/mês:** quando ultrapassar

**💡 Total inicial: R$ 40/ano (só o domínio!)**

---

## 🚨 **SE DER ERRO**

### **Erro no build:**
```bash
npm install
npm run build
```

### **Erro no login Vercel:**
- Crie conta em: https://vercel.com
- Tente novamente: `vercel login`

### **DNS não propaga:**
- Aguarde 24-48h
- Teste: https://dnschecker.org/

---

## 📱 **TESTE IMEDIATO**

Enquanto DNS não propaga, teste com URL temporária do Vercel:
- `https://seu-projeto-hash.vercel.app`

---

## 🎉 **APÓS CONFIGURAR**

Seu CRM terá:
- ✅ **Dashboard com métricas**
- ✅ **Gestão completa de leads**
- ✅ **Sistema de agendamento**
- ✅ **Relatórios de comissão**
- ✅ **Integração WhatsApp**
- ✅ **Responsivo mobile**
- ✅ **PWA (app nativo)**

**🚀 Execute: `deploy-leadconsig.bat` e comece agora!** 