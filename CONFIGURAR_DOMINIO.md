# 🌐 CONFIGURAÇÃO DE DOMÍNIO PERSONALIZADO - CRM CONSIG

## 📋 PASSO A PASSO COMPLETO

### 🚀 **OPÇÃO 1: VERCEL (RECOMENDADO - GRATUITO)**

#### **1.1 Deploy no Vercel**
```bash
# 1. Instale o Vercel CLI
npm install -g vercel

# 2. Faça login no Vercel
vercel login

# 3. Deploy o projeto
vercel

# 4. Configure as variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

#### **1.2 Configurar Domínio no Vercel**
1. **Acesse o Dashboard do Vercel**: https://vercel.com/dashboard
2. **Clique no seu projeto CRM**
3. **Vá em Settings → Domains**
4. **Adicione seu domínio**: `seudominio.com.br`
5. **Configure os DNS** (veja seção DNS abaixo)

#### **1.3 Variáveis de Ambiente no Vercel**
```
VITE_SUPABASE_URL=https://wjljrytblpsnzjwvugqg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY
```

---

### 🟣 **OPÇÃO 2: NETLIFY**

#### **2.1 Deploy no Netlify**
1. **Conecte seu repositório GitHub** no Netlify
2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. **Adicione variáveis de ambiente** no Netlify

#### **2.2 Configurar Domínio no Netlify**
1. **Site Settings → Domain Management**
2. **Add Custom Domain**
3. **Configure DNS** (veja seção DNS abaixo)

---

### 💜 **OPÇÃO 3: LOVABLE (ATUAL)**

#### **3.1 Configurar Domínio no Lovable**
1. **Acesse seu projeto no Lovable**
2. **Settings → Custom Domain**
3. **Adicione seu domínio**
4. **Configure DNS** conforme instruções do Lovable

---

## 🔧 **CONFIGURAÇÃO DNS (TODAS AS OPÇÕES)**

### **No seu provedor de domínio** (GoDaddy, Registro.br, etc.)

#### **Para VERCEL:**
```
Tipo: CNAME
Nome: www
Valor: cname.vercel-dns.com

Tipo: A
Nome: @
Valor: 76.76.19.61
```

#### **Para NETLIFY:**
```
Tipo: CNAME
Nome: www
Valor: [seu-site].netlify.app

Tipo: A
Nome: @
Valor: 75.2.60.5
```

#### **Para LOVABLE:**
```
Siga as instruções específicas do Lovable
(geralmente fornecidas no painel)
```

---

## 🛠️ **COMANDOS ÚTEIS**

### **Build Local para Teste**
```bash
# Teste o build antes do deploy
npm run build
npm run preview
```

### **Deploy Manual Vercel**
```bash
# Deploy direto do seu projeto
vercel --prod
```

### **Verificar DNS**
```bash
# Verificar se DNS está propagado
nslookup seudominio.com.br
```

---

## ✅ **CHECKLIST PÓS-CONFIGURAÇÃO**

- [ ] Domínio aponta para a hospedagem
- [ ] HTTPS está ativo
- [ ] Todas as páginas carregam
- [ ] Login funciona
- [ ] Dashboard aparece
- [ ] Leads são salvos
- [ ] Supabase conecta

---

## 🚨 **PROBLEMAS COMUNS**

### **"Site não carrega"**
- Verifique se DNS propagou (pode levar até 48h)
- Teste com www.seudominio.com.br

### **"Supabase não conecta"**
- Verifique variáveis de ambiente
- Confirme URLs do Supabase

### **"Páginas 404"**
- Configure SPA redirect (/* → /index.html)

---

## 📞 **PRÓXIMOS PASSOS**

**Me informe:**
1. **Qual domínio você comprou?**
2. **Onde você registrou o domínio?**
3. **Qual opção de hospedagem prefere?**

Vou te dar instruções específicas para sua situação! 