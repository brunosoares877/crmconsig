# 🌐 Configurar Domínio Personalizado - Guia Rápido

## 🎯 Problema Identificado
O link de recuperação de senha está redirecionando para `crmconsig.lovable.app` em vez do seu domínio personalizado.

## ✅ Solução Implementada

### **PASSO 1: Editar Configuração de Domínio**

1. **Abra o arquivo:** `src/utils/domainConfig.ts`

2. **Localize esta linha:**
```typescript
production: "https://seudominio.com", // ← ALTERE AQUI para seu domínio
```

3. **Substitua pela URL do seu domínio:**
```typescript
production: "https://SEUDOMINIO.com", // ← Coloque seu domínio real aqui
```

**Exemplos:**
```typescript
// Se seu domínio é meucrm.com:
production: "https://meucrm.com",

// Se seu domínio é app.minhaempresa.com:
production: "https://app.minhaempresa.com",

// Se seu domínio é leadconsig.vendas.com.br:
production: "https://leadconsig.vendas.com.br",
```

### **PASSO 2: Salvar e Reiniciar**

1. **Salve o arquivo** `domainConfig.ts`
2. **Pare o servidor** (Ctrl+C no terminal)
3. **Reinicie** com `npm run dev`

### **PASSO 3: Testar**

1. **Acesse:** http://localhost:8081/login
2. **Clique em:** "Esqueci minha senha"
3. **Clique em:** "Ver Config Domínio" (botão de debug)
4. **Verifique** se mostra seu domínio configurado
5. **Digite um email** e envie
6. **Verifique o console** - deve mostrar: `🔗 Enviando email com redirect para: https://SEUDOMINIO.com/reset-password`

---

## 🔧 Configuração Completa (Arquivo inteiro)

**Substitua o conteúdo completo de `src/utils/domainConfig.ts` por:**

```typescript
// Configuração de domínio para links de email
export interface DomainConfig {
  production: string;
  development: string;
}

// Configure aqui seu domínio personalizado
const DOMAIN_CONFIG: DomainConfig = {
  // Coloque aqui seu domínio de produção personalizado
  production: "https://SEUDOMINIO.com", // ← ALTERE PARA SEU DOMÍNIO
  
  // Desenvolvimento local
  development: "http://localhost:8080"
};

// Resto do código permanece igual...
// (copie o resto do arquivo que já existe)
```

---

## 🚀 Para Deploy em Produção

Quando for fazer deploy para produção, você também precisa:

### **1. Configurar no Supabase Dashboard:**
```bash
1. Acessar: https://supabase.com/dashboard
2. Ir em: Authentication → Settings
3. Site URL: https://SEUDOMINIO.com
4. Redirect URLs: https://SEUDOMINIO.com/reset-password
```

### **2. Fazer Deploy:**
```bash
1. Fazer build: npm run build
2. Deploy para seu servidor/CDN
3. Apontar domínio para o deploy
4. Testar links de email em produção
```

---

## 🧪 Como Testar se Está Funcionando

### **Em Desenvolvimento:**
1. **Console do navegador** deve mostrar:
   ```
   🔗 Enviando email com redirect para: https://SEUDOMINIO.com/reset-password
   ```

2. **Botão de debug** deve mostrar:
   ```
   URL Base: http://localhost:8081
   Reset URL: https://SEUDOMINIO.com/reset-password
   Domínio Personalizado: ❌ Não (normal em dev)
   Configurado: https://SEUDOMINIO.com
   ```

### **Em Produção:**
1. **Email recebido** deve ter link para:
   ```
   https://SEUDOMINIO.com/reset-password?access_token=...
   ```

2. **Clicar no link** deve abrir seu domínio

---

## ❓ Exemplos de Domínios

### **✅ Corretos:**
```
https://meucrm.com
https://app.vendas.com.br
https://leadconsig.minhaempresa.com
https://crm.consultoria.net
```

### **❌ Incorretos:**
```
meucrm.com                    (sem https://)
http://meucrm.com            (sem SSL)
https://localhost:8080        (localhost)
https://app.lovable.dev      (domínio temporário)
```

---

## 🔍 Debug e Troubleshooting

### **1. Verificar Configuração:**
- Abra o console do navegador
- Deve aparecer: `🌐 Configuração de Domínio`
- Verifique se seu domínio está listado

### **2. Se o Link Ainda Aponta para Lovable:**
- Verificar se salvou o arquivo `domainConfig.ts`
- Reiniciar o servidor (`npm run dev`)
- Limpar cache do navegador (Ctrl+F5)

### **3. Se Email Não Chega:**
- Verificar pasta de spam
- Verificar se email está cadastrado
- Aguardar alguns minutos (rate limiting)

---

## 🎉 Resumo

**O que foi criado:**
1. ✅ Sistema de configuração de domínio
2. ✅ Detecção automática de ambiente (dev/prod)
3. ✅ Debug visual para verificar configuração
4. ✅ URLs corretas baseadas no ambiente

**Próximos passos:**
1. 🔧 **Configurar seu domínio** no arquivo `domainConfig.ts`
2. 🧪 **Testar** em desenvolvimento
3. 🚀 **Deploy** em produção com domínio correto
4. ✅ **Verificar** se emails funcionam com seu domínio

**Resultado:** Links de recuperação de senha irão para SEU domínio em vez de `lovable.app`! 🎯 