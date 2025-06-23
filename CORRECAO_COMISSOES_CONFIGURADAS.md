# 🔧 Correção das Comissões - Usando Configurações ao Invés de 5% Padrão

## ❌ **Problema Identificado**

**Usuário relatou:** Novas comissões sendo geradas com **5% padrão** ao invés das **configurações personalizadas** (por valor e prazo).

## 🎯 **Causa Raiz**

Na função `generateCommissionsForLeads`, o código estava:
- ✅ **Calculando corretamente** o valor da comissão com as configurações
- ❌ **Salvando percentual fixo** de 5% ao invés do percentual calculado

### **Código Problemático:**
```typescript
// ❌ ANTES: Percentual fixo
let percentage = 5; // Default 5%
const calculatedValue = await calculateCommissionValue(...);

commissionsToCreate.push({
  commission_value: calculatedValue,    // ✅ Valor correto
  percentage: percentage,               // ❌ Sempre 5%
});
```

## ✅ **Solução Implementada**

### **1. Cálculo Correto do Percentual**
```typescript
// ✅ DEPOIS: Percentual calculado corretamente
const calculatedValue = await calculateCommissionValue(lead.product, leadAmount, paymentPeriod);
const calculatedPercentage = leadAmount > 0 ? (calculatedValue / leadAmount) * 100 : 0;

commissionsToCreate.push({
  commission_value: calculatedValue,      // ✅ Valor correto
  percentage: calculatedPercentage,       // ✅ Percentual correto
});
```

### **2. Debug Detalhado Adicionado**
```typescript
console.log(`🔍 Gerando comissão para: ${lead.name}`);
console.log(`   Produto: ${lead.product}`);
console.log(`   Valor: R$ ${leadAmount}`);
console.log(`   Prazo: ${paymentPeriod || 'Não informado'}`);
console.log(`   Comissão calculada: R$ ${calculatedValue.toFixed(2)} (${calculatedPercentage.toFixed(2)}%)`);
```

## 🚀 **Como Testar**

### **1. Limpar Comissões Antigas (Opcional)**
Se quiser recalcular as comissões existentes:
1. **Vá na página Comissões**
2. **Delete as comissões** com 5% (botão 🗑️)
3. **Gere novamente** com o botão "Gerar Comissões dos Leads"

### **2. Gerar Novas Comissões**
1. **Vá em Comissões**
2. **Clique "Gerar Comissões dos Leads"**
3. **Abra F12 → Console** para ver o debug
4. **Veja os logs detalhados:**

```
🔍 Gerando comissão para: cliente 01
   Produto: SAQUE ANIVERSARIO
   Valor: R$ 1000
   Prazo: 12
   Comissão calculada: R$ 150.00 (15.00%)
```

### **3. Verificar na Tabela**
- **Coluna "% Comissão"**: Deve mostrar percentual correto (não 5%)
- **Coluna "Valor Comissão"**: Deve mostrar valor baseado nas configurações

## 📊 **Exemplos de Resultados Esperados**

### **CREDITO FGTS (por faixa de valor):**
- **Até R$ 250**: 15%
- **R$ 250-500**: 12%  
- **R$ 500-1000**: 10%
- **Acima R$ 1000**: 8%

### **CREDITO CLT (por prazo):**
- **8x-12x**: 1%
- **13x-24x**: 1.5%
- **25x-36x**: 2%

### **CREDITO INSS:**
- **BPC/LOAS**: 2.5%
- **Normal**: 3%

## 🔍 **Debug no Console**

Ao gerar comissões, você verá:
```
📊 Total de comissões a criar: 3
   1. SAQUE ANIVERSARIO - R$ 150.00 (15.00%)
   2. EMPRESTIMO CONSIGNADO - R$ 50.00 (1.00%)  
   3. CREDITO INSS - R$ 90.00 (3.00%)
```

## ⚠️ **Importante**

### **Comissões Existentes**
- **Já criadas** mantêm o valor antigo (5%)
- **Novas comissões** usarão o cálculo correto
- **Para atualizar antigas**: Delete e gere novamente

### **Mapeamento de Produtos**
O sistema mapeia automaticamente:
- **SAQUE ANIVERSARIO** → **CREDITO FGTS**
- **EMPRESTIMO CONSIGNADO** → **CREDITO CLT**

## 🎯 **Status**

- ✅ **Problema identificado**
- ✅ **Função corrigida**
- ✅ **Debug implementado**
- ✅ **Percentual calculado corretamente**
- ✅ **Configurações aplicadas**

## 🚀 **Próximos Passos**

1. **Teste agora** gerando novas comissões
2. **Confira no console** se os percentuais estão corretos
3. **Verifique na tabela** se aparecem os valores configurados
4. **Delete comissões antigas** se necessário

**Agora as comissões usarão suas configurações personalizadas! 🎉** 