# 🔧 Solução para Filtro de Funcionário - JANE

## ❌ **Problema Identificado**

- **"Todos os funcionários"**: Funciona ✅
- **Filtro "JANE"**: Não funciona ❌

**Causa**: Nome do funcionário não confere exatamente com o que está no banco.

## 🎯 **Solução Imediata**

### **Teste 1: Debug no Console**
1. **Pressione F12** → Aba **Console**
2. **Vá em Comissões** → **"Relatório de Pagamento"**
3. **Selecione "Todos os funcionários"** primeiro
4. **Clique "Gerar Relatório"**
5. **Veja no console** os funcionários únicos:

```
👥 Funcionários únicos em commissions.employee: ["Jane Silva", "João Santos"]
👥 Funcionários únicos em lead.employee: ["JANE", "JOAO"]
```

### **Teste 2: Use o Nome Exato**
- **Se aparecer "Jane Silva"**: Use "Jane Silva" (não "JANE")
- **Se aparecer "JANE"**: Use "JANE" (maiúsculo)
- **Se aparecer "Jane"**: Use "Jane" (primeira maiúscula)

## 🔍 **Verificação Rápida**

### **Método 1: Console do Navegador**
Cole este código no console (F12):
```javascript
// Ver todas as comissões e seus funcionários
console.log("🔍 COMISSÕES E FUNCIONÁRIOS:");
supabase.from('commissions').select('*, lead:lead_id(*)').then(({data}) => {
  data?.forEach((c, i) => {
    console.log(`${i+1}. Lead: ${c.lead?.name}`);
    console.log(`   commission.employee: "${c.employee}"`);
    console.log(`   lead.employee: "${c.lead?.employee}"`);
  });
});
```

### **Método 2: Na Interface**
1. **Vá em Comissões** (página principal)
2. **Veja a coluna "Funcionário"** na tabela
3. **Copie o nome exato** que aparece
4. **Use esse nome** no relatório

## ✅ **Possíveis Nomes Corretos**

Baseado no que você mostrou, pode ser:
- ✅ **"JANE"** (maiúsculo)
- ✅ **"Jane"** (primeira maiúscula)
- ✅ **"Jane Silva"** (nome completo)
- ✅ **"JANE SILVA"** (nome completo maiúsculo)

## 🚀 **Teste Imediato**

### **Opção 1: Teste Múltiplos Nomes**
Teste um por um no relatório:
1. "JANE"
2. "Jane" 
3. "jane"
4. "JANE SILVA"

### **Opção 2: Gerar Comissões Novamente**
Se o problema persistir:
1. **Vá em Comissões**
2. **Clique "Gerar Comissões dos Leads"**
3. **Aguarde a geração**
4. **Teste o relatório novamente**

## 💡 **Solução Definitiva**

### **Se Você Descobrir o Nome Correto**
Exemplo: Console mostra **"Jane Silva"**
1. **Use exatamente "Jane Silva"** no filtro
2. **Não use "JANE"** ou "jane"
3. **Copie e cole** para evitar erros

### **Se Ainda Não Funcionar**
1. **Verifique se as comissões existem** para JANE
2. **Confirme as datas** dos leads
3. **Use "Todos os funcionários"** e procure JANE na lista

## 🎯 **Teste Rápido Agora**

1. **F12 → Console**
2. **Relatório → "Todos os funcionários"**
3. **Veja os nomes únicos** nos logs
4. **Use o nome EXATO** do log
5. **Teste novamente**

**Com essa verificação, você vai descobrir o nome correto do funcionário! 🔍** 