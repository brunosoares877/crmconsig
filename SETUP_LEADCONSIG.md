# 🚀 CONFIGURAÇÃO ESPECÍFICA - leadconsig.com.br

## 📋 **PLANO COMPLETO DE DEPLOY E ESCALABILIDADE**

### **🎯 ESTRATÉGIA:**
1. **FASE 1:** Deploy gratuito Vercel (até 10k usuários/mês)
2. **FASE 2:** Escalar para Vercel Pro quando necessário
3. **FASE 3:** Migrar para VPS/dedicado se ultrapassar

---

## 🚀 **FASE 1: DEPLOY GRATUITO VERCEL**

### **1.1 Deploy Imediato**
```bash
# Execute no PowerShell:
npm install -g vercel
vercel login
npm run deploy
```

### **1.2 Configurar Variáveis de Ambiente no Vercel**
1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto
3. **Settings → Environment Variables**
4. Adicione:
```
VITE_SUPABASE_URL = https://wjljrytblpsnzjwvugqg.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY
```

---

## 🌐 **CONFIGURAÇÃO DNS NA HOSTINGER**

### **2.1 Acesse o Painel da Hostinger**
1. Login: https://hpanel.hostinger.com.br
2. **Domínios → leadconsig.com.br → Gerenciar**
3. **DNS / Nameservers → Zona DNS**

### **2.2 Configure os Registros DNS**
**REMOVA** todos os registros A e CNAME existentes para @ e www, depois **ADICIONE**:

```
Tipo: A
Nome: @
Conteúdo: 76.76.19.61
TTL: 14400

Tipo: CNAME
Nome: www
Conteúdo: cname.vercel-dns.com
TTL: 14400
```

### **2.3 Adicione o Domínio no Vercel**
1. **Vercel Dashboard → Seu Projeto → Settings → Domains**
2. **Add Domain:** `leadconsig.com.br`
3. **Add Domain:** `www.leadconsig.com.br`

---

## ⏱️ **TEMPO DE PROPAGAÇÃO**
- **DNS pode levar até 24-48h** para propagar
- **Teste em:** https://dnschecker.org/
- **Enquanto isso, use:** `seu-projeto.vercel.app`

---

## 📊 **LIMITES VERCEL GRATUITO**
- ✅ **100GB bandwidth/mês**
- ✅ **Domínios ilimitados**
- ✅ **SSL automático**
- ✅ **Deploy automático**
- ✅ **Edge Functions**
- ✅ **Analytics básico**

**🚨 Quando ultrapassar → Upgrade para Vercel Pro ($20/mês)**

---

## 🔄 **PLANO DE ESCALABILIDADE**

### **📈 CRESCIMENTO ESPERADO:**

#### **0-1.000 usuários:** Vercel Free ✅
- Custo: $0/mês
- Performance: Excelente
- Manutenção: Zero

#### **1.000-10.000 usuários:** Vercel Pro 💰
- Custo: $20/mês
- Bandwidth: 1TB
- Analytics avançado
- Suporte prioritário

#### **10.000+ usuários:** VPS/Dedicado 🚀
**Opções recomendadas:**
- **DigitalOcean:** $20-100/mês
- **AWS Amplify:** Pay-as-you-go
- **Hostinger VPS:** R$ 50-200/mês
- **Servidor próprio:** R$ 200-500/mês

---

## 🛠️ **MONITORAMENTO E MÉTRICAS**

### **Analytics Gratuitas:**
- **Vercel Analytics** (incluído)
- **Google Analytics** (configure no HTML)
- **Supabase Dashboard** (usuários, queries)

### **Monitoramento de Performance:**
```bash
# Adicione ao projeto depois:
npm install @vercel/analytics
```

---

## 🔧 **COMANDOS ESPECÍFICOS LEADCONSIG**

### **Deploy Rápido:**
```bash
# Windows PowerShell
PowerShell -ExecutionPolicy Bypass -File scripts/deploy.ps1

# Verificar DNS
nslookup leadconsig.com.br
```

### **URLs de Teste:**
- **Local:** http://localhost:8080
- **Staging:** https://seu-projeto.vercel.app  
- **Produção:** https://leadconsig.com.br

---

## 🚨 **CHECKLIST PÓS-DEPLOY**

- [ ] Deploy no Vercel funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] DNS Hostinger configurado
- [ ] leadconsig.com.br carregando
- [ ] www.leadconsig.com.br redirecionando
- [ ] HTTPS ativo
- [ ] Login funcionando
- [ ] Dashboard carregando leads
- [ ] Supabase conectado

---

## 📞 **PRÓXIMOS PASSOS IMEDIATOS**

1. **Execute agora:**
```bash
npm run deploy
```

2. **Aguarde o deploy e pegue a URL do Vercel**

3. **Configure DNS na Hostinger** (instruções acima)

4. **Teste:** `https://seu-projeto.vercel.app`

5. **Aguarde propagação DNS** (24-48h para leadconsig.com.br)

---

## 💡 **DICAS DE ECONOMIA**

### **Mantenha Gratuito Máximo Tempo:**
- **Optimize imagens** → Menor bandwidth
- **Use cache** → Menos requests
- **Monitor analytics** → Controle uso

### **Quando Escalar:**
- **+1000 usuários/mês** → Vercel Pro
- **+10000 usuários/mês** → VPS dedicado
- **+100000 usuários/mês** → Arquitetura distribuída

---

## 🎯 **EXECUTE AGORA**

```bash
# 1. Deploy imediato
npm run deploy

# 2. Pegar URL do Vercel
# 3. Configurar DNS Hostinger  
# 4. Aguardar propagação
# 5. Testar leadconsig.com.br
```

**🚀 Vamos colocar o leadconsig.com.br no ar!** 