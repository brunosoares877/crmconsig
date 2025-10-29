# 🚀 CRM CONSIG - Sistema Completo de Gestão de Leads

**🎉 SITE OFICIAL: https://leadconsig.com.br**

## 🌐 **CONFIGURAÇÃO DE DOMÍNIO PERSONALIZADO**

### **⚡ INÍCIO RÁPIDO - VERCEL (RECOMENDADO)**

1. **Instale o Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy automático:**
```bash
# Windows
PowerShell -ExecutionPolicy Bypass -File scripts/deploy.ps1

# Linux/Mac
chmod +x scripts/deploy.sh && ./scripts/deploy.sh

# Ou use o comando NPM
npm run deploy
```

3. **Configure seu domínio:**
   - Acesse: https://vercel.com/dashboard
   - Clique no seu projeto → Settings → Domains
   - Adicione seu domínio personalizado
   - Configure DNS conforme instruções

### **📋 CONFIGURAÇÃO DNS RÁPIDA**

No seu provedor de domínio (GoDaddy, Registro.br, etc.):

```
Tipo: A
Nome: @
Valor: 76.76.19.61

Tipo: CNAME  
Nome: www
Valor: cname.vercel-dns.com
```

---

## 🛠️ **INSTALAÇÃO LOCAL**

```bash
# Clone o projeto
git clone [seu-repositorio]
cd crmconsig

# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 **CONFIGURAÇÃO**

### **Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://wjljrytblpsnzjwvugqg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY
```

## 📚 **FUNCIONALIDADES**

- ✅ **Dashboard Completo** - Métricas em tempo real
- ✅ **Gestão de Leads** - CRUD completo com filtros
- ✅ **Sistema de Agendamento** - Calendário integrado
- ✅ **Lembretes Automáticos** - Notificações inteligentes
- ✅ **Relatórios de Comissão** - Cálculos automáticos
- ✅ **Gestão de Funcionários** - Controle de equipe
- ✅ **Integração WhatsApp** - Comunicação direta
- ✅ **Sistema de Portabilidade** - Gestão de contratos
- ✅ **Upload de Documentos** - Armazenamento seguro
- ✅ **Multi-tenant** - Suporte a múltiplas empresas
- ✅ **PWA** - Funciona como app nativo
- ✅ **Responsivo** - Mobile-first design

## 🚀 **COMANDOS DISPONÍVEIS**

```bash
# Desenvolvimento
npm run dev              # Servidor local
npm run build           # Build para produção
npm run build:prod      # Build otimizado
npm run preview         # Preview do build
npm run lint           # Verificar código

# Deploy
npm run deploy         # Deploy produção Vercel
npm run deploy:preview # Deploy preview Vercel
```

## 📁 **ESTRUTURA DO PROJETO**

```
src/
├── components/         # Componentes reutilizáveis
│   ├── ui/            # Componentes UI base
│   ├── dashboard/     # Componentes do dashboard
│   ├── leads/         # Componentes de leads
│   └── settings/      # Componentes de configurações
├── pages/             # Páginas da aplicação
├── contexts/          # Contextos React
├── hooks/             # Hooks customizados
├── utils/             # Funções utilitárias
├── types/             # Definições TypeScript
└── integrations/      # Integrações externas
    └── supabase/      # Cliente Supabase
```

## 🔒 **SEGURANÇA**

- ✅ Autenticação JWT via Supabase
- ✅ Row Level Security (RLS) no banco
- ✅ Validação de dados com Zod
- ✅ Sanitização de inputs
- ✅ HTTPS obrigatório em produção

## 📱 **TECNOLOGIAS**

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + Shadcn/ui + Radix UI
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel (recomendado)
- **Monitoramento:** Sentry (opcional)

## 🆘 **SUPORTE**

### **Problemas Comuns:**

1. **Site não carrega após deploy:**
   - Aguarde propagação DNS (até 48h)
   - Teste www.seudominio.com.br

2. **Erro de Supabase:**
   - Verifique variáveis de ambiente
   - Confirme se Supabase está online

3. **Páginas 404:**
   - Configure SPA redirect (/* → /index.html)

### **Logs Úteis:**
```bash
# Verificar DNS
nslookup seudominio.com.br

# Testar build local
npm run build && npm run preview
```

## 📞 **CONTATO**

Para configuração específica do seu domínio, me informe:
1. **Qual domínio você comprou?**
2. **Onde registrou o domínio?**
3. **Prefere Vercel, Netlify ou outro?**

## 📄 **ARQUIVOS DE CONFIGURAÇÃO**

- `CONFIGURAR_DOMINIO.md` - Guia completo de domínio
- `vercel.json` - Configuração Vercel
- `scripts/deploy.ps1` - Script Windows
- `scripts/deploy.sh` - Script Linux/Mac

---

**🎉 Seu CRM está pronto para produção!**

## ✅ Hospedado no Vercel
- Deploy automático configurado ✅
- Domínio customizado ativo: https://leadconsig.com.br ✅
- SSL automático ✅
- Última atualização: Deploy automático funcionando!

## Recursos
- Gestão de leads
- Sistema de comissões
- Dashboard analítico
- Relatórios
