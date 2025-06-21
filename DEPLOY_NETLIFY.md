# 🟣 DEPLOY LEADCONSIG.COM.BR NO NETLIFY

## ⚡ **MÉTODO 1: DRAG & DROP (MAIS RÁPIDO)**

### **1️⃣ Deploy instantâneo:**
1. **Acesse:** https://app.netlify.com/drop
2. **Arraste** a pasta `dist` inteira para a área
3. **Aguarde upload** (30 segundos)
4. **Pegue URL temporária:** `https://nome-aleatorio.netlify.app`

---

## 🔗 **MÉTODO 2: VIA GITHUB (AUTOMÁTICO)**

### **1️⃣ Acesse Netlify:**
- **URL:** https://app.netlify.com
- **Cadastre-se** com GitHub (gratuito)

### **2️⃣ Novo site:**
- **Add new site** → **Import from Git**
- **Deploy with GitHub**
- **Escolha:** `brunosoares877/crmconsig`

### **3️⃣ Configurações build:**
```
Build command: npm run build
Publish directory: dist
Branch: main
```

### **4️⃣ Deploy automático:**
- **Deploy site** 
- **Aguarda 2-3 minutos**
- **URL temporária:** `https://nome-aleatorio.netlify.app`

---

## 🌐 **CONFIGURAR DOMÍNIO leadconsig.com.br**

### **1️⃣ No Netlify:**
- **Site overview** → **Domain settings**
- **Add custom domain** → `leadconsig.com.br`
- **Add domain** → `www.leadconsig.com.br`

### **2️⃣ DNS Hostinger:**
**Acesse:** https://hpanel.hostinger.com.br

```
Tipo: CNAME
Nome: @
Valor: nome-do-seu-site.netlify.app

Tipo: CNAME  
Nome: www
Valor: nome-do-seu-site.netlify.app
```

---

## 💰 **NETLIFY GRATUITO**
- ✅ **100GB bandwidth/mês**
- ✅ **Domínios ilimitados**
- ✅ **SSL automático**
- ✅ **Deploy automático via Git**
- ✅ **Sem problemas de cache**

---

## 🎯 **VANTAGENS NETLIFY vs VERCEL**
- ✅ **Deploy mais rápido**
- ✅ **Sem problemas de dependências**
- ✅ **Interface mais simples**
- ✅ **Menos cache issues**
- ✅ **Configuração mais direta**

---

## 📱 **TESTE IMEDIATO**

1. **Execute** método 1 ou 2
2. **Acesse** URL temporária 
3. **Deve carregar:** CRM funcionando
4. **Login deve funcionar:** Supabase já configurado
5. **Configure** domínio leadconsig.com.br

---

**🚀 Escolha o método e vamos colocar o leadconsig.com.br no ar!** 