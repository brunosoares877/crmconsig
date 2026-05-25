# 🚀 GUIA COMPLETO - DEPLOY NO LOVABLE

## ✅ CONFIGURAÇÕES NECESSÁRIAS NO LOVABLE

### 1. **VARIÁVEIS DE AMBIENTE**
No Lovable, configure estas variáveis:

```
VITE_SUPABASE_URL=https://wjljrytblpsnzjwvugqg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqbGpyeXRibHBzbnpqd3Z1Z3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MzE1NjcsImV4cCI6MjA2MTEwNzU2N30.ChxEZH6UakGSRxQlfoQvhNxeb7s56xCIzXZwe9GnZrY
```

### 2. **CONFIGURAÇÕES DE BUILD**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "nodeVersion": "18"
}
```

### 3. **ARQUIVOS ESSENCIAIS PARA VERIFICAR**

#### ✅ package.json - Scripts necessários:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

#### ✅ vite.config.ts - Configuração otimizada:
```typescript
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'lucide-react']
        }
      }
    }
  }
}));
```

## 🔧 PROBLEMAS COMUNS E SOLUÇÕES

### ❌ PROBLEMA: "Supabase não conecta"
**Solução**: Verificar se as variáveis de ambiente estão corretas no Lovable

### ❌ PROBLEMA: "Componentes não carregam"
**Solução**: Verificar se todas as dependências estão no package.json

### ❌ PROBLEMA: "Build falha"
**Solução**: Verificar se não há erros TypeScript

### ❌ PROBLEMA: "Rotas não funcionam"
**Solução**: Adicionar configuração de SPA no Lovable

## 📋 PASSO A PASSO NO LOVABLE

### 1. **ACESSE SEU PROJETO NO LOVABLE**
- Vá para: https://lovable.dev
- Entre no seu projeto CRM

### 2. **CONFIGURE AS VARIÁVEIS DE AMBIENTE**
- Settings → Environment Variables
- Adicione as variáveis do Supabase acima

### 3. **CONFIGURE O BUILD**
- Settings → Build & Deploy
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: `18`

### 4. **CONFIGURE SPA (SINGLE PAGE APP)**
- Settings → Redirects
- Adicionar regra: `/*` → `/index.html` (200)

### 5. **FORCE REBUILD**
- Deploys → Trigger Deploy
- Clear cache and deploy

## 🎯 VERIFICAÇÃO FINAL

Após o deploy, teste:
- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Leads aparecem
- ✅ Lembretes funcionam
- ✅ Formulários salvam

## 🚨 SE AINDA NÃO FUNCIONAR

1. **Verifique os logs do build** no Lovable
2. **Teste localmente** com `npm run build && npm run preview`
3. **Verifique o console do browser** em produção
4. **Confirme se a migração do Supabase** foi aplicada

## 📞 SUPORTE

Se persistir o problema:
1. Copie os logs de erro do Lovable
2. Verifique se o Supabase está online
3. Teste as URLs do Supabase no browser 