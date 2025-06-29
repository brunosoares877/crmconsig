# Correção: Produto "Piscando" no Select

## Problema
Quando o usuário clicava no campo produto para selecionar uma opção, o campo ficava "piscando" e não mantinha a seleção, voltando sempre para "Nenhum produto".

## Causa Raiz
O problema estava sendo causado por **conflitos de estado** entre dois pontos do código:

1. **Select principal do produto** - Controlava o valor diretamente através do `watch("product")`
2. **CommissionConfigSelector** - Tinha um callback `onOptionSelected` que também tentava alterar o valor do produto

### Problemas específicos identificados:

1. **Lógica de valor ambígua**: `value={watch("product") || "none"}` podia causar inconsistências
2. **Conflito de callbacks**: Dois lugares diferentes tentando alterar o mesmo campo
3. **Falta de logs**: Não havia como rastrear quando e por que o valor estava mudando

## Solução Implementada

### 1. Melhorou a lógica do valor no Select
```typescript
// ANTES (problemático)
value={watch("product") || "none"}

// DEPOIS (claro e específico)
value={watch("product") === "" || !watch("product") ? "none" : watch("product")}
```

### 2. Adicionou logs para debug
```typescript
onValueChange={(value) => {
  console.log("Product selection changed:", value);
  const newValue = value === "none" ? "" : value;
  setValue("product", newValue);
  console.log("Product value set to:", newValue);
}}
```

### 3. Removeu conflito no CommissionConfigSelector
```typescript
// ANTES (conflitante)
onOptionSelected={(option) => {
  if (option?.product) {
    setValue("product", option.product);  // ❌ Conflito!
  }
}}

// DEPOIS (não interfere)
onOptionSelected={(option) => {
  console.log("Commission option selected:", option);
  // Não alterar o produto aqui para evitar conflitos
}}
```

## Arquivos Modificados
- `src/components/LeadForm.tsx`

## Resultado
- ✅ Select do produto funciona corretamente
- ✅ Seleção é mantida sem "piscar"
- ✅ Não há mais conflitos entre os componentes
- ✅ Logs adicionados para facilitar debug futuro

## Comportamento Esperado
1. Usuário clica no campo produto
2. Lista de produtos é exibida
3. Usuário seleciona um produto
4. Valor é mantido corretamente
5. Seção de comissão (se ativa) mostra apenas configurações do produto selecionado 