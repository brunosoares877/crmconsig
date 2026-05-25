# 📅 Sistema de Comissões por Prazo de Pagamento

## Visão Geral

O sistema agora suporta **comissões variáveis baseadas no prazo de pagamento** (número de parcelas), além das comissões por valor. Isso permite configurar diferentes taxas de comissão baseadas em quantas parcelas o cliente vai pagar.

## 🚀 Como Usar

### 1. Aplicar Migração

Execute o código SQL no Supabase (arquivo `migracoes-comissoes-prazo.sql`) ou use o script:

```powershell
.\apply-period-migration.ps1
```

### 2. Configurar Comissões por Prazo

1. Acesse **Comissões** no menu lateral
2. Clique em **Configurar Comissões**
3. Na aba **"Comissões Variáveis (Por Faixa de Valor ou Prazo)"**
4. Clique em **"Adicionar Taxa Variável"**
5. Selecione **"📅 Por Prazo de Pagamento"**

### 3. Exemplos de Configuração

#### Exemplo 1: CRÉDITO CLT por Prazo
- **Produto**: CRÉDITO CLT
- **Nome**: 8x a 12x
- **Período Mínimo**: 8 (parcelas)
- **Período Máximo**: 12 (parcelas)
- **Comissão**: 1.0%

#### Exemplo 2: CRÉDITO CLT para prazos maiores
- **Produto**: CRÉDITO CLT
- **Nome**: 13x a 24x
- **Período Mínimo**: 13 (parcelas)
- **Período Máximo**: 24 (parcelas)
- **Comissão**: 1.5%

#### Exemplo 3: CRÉDITO CLT para prazos longos
- **Produto**: CRÉDITO CLT
- **Nome**: 25x a 36x
- **Período Mínimo**: 25 (parcelas)
- **Período Máximo**: 36 (parcelas)
- **Comissão**: 2.0%

## 🔧 Tipos de Faixa

### 💰 Por Valor da Venda
- Comissão baseada no valor do empréstimo
- Exemplo: R$ 1.000 a R$ 5.000 = 2.5%

### 📅 Por Prazo de Pagamento
- Comissão baseada no número de parcelas
- Exemplo: 8x a 12x = 1.5%, 13x a 24x = 2.0%

## 📊 Interface Atualizada

### Tabela de Configurações
A tabela agora mostra:
- **Faixa**: Ícone indicando se é por Valor (💰) ou Prazo (📅)
- **Mínimo**: Valor mínimo ou número mínimo de parcelas
- **Máximo**: Valor máximo ou número máximo de parcelas

### Formulário
- RadioGroup para escolher entre "Por Valor" ou "Por Prazo"
- Campos condicionais baseados na escolha
- Validação específica para cada tipo

## ⚠️ Observações Importantes

### Status Atual
- ✅ **Interface funcionando**: Você pode criar e configurar comissões por prazo
- ✅ **Banco de dados**: Campos adicionados e funcionando
- ✅ **Formulário de leads**: Campo "Prazo de Pagamento" adicionado (6x a 96x)
- ✅ **Cálculo automático**: Implementado e funcionando

### ✨ Sistema Completo!
1. ✅ Campo `payment_period` adicionado na tabela `leads` ✓
2. ✅ Formulário de leads atualizado com seleção de prazo ✓
3. ✅ Lógica de cálculo por prazo implementada na função `calculateCommissionValue` ✓

## 📝 Exemplo de Uso Prático

```typescript
// Exemplo de configuração no banco
{
  product: "CREDITO CLT",
  name: "8x a 12x",
  tier_type: "period",
  min_period: 8,
  max_period: 12,
  commission_type: "percentage",
  percentage: 1.5,
  active: true
}
```

## 🎯 Benefícios

1. **Flexibilidade**: Configure comissões por valor OU por prazo
2. **Precisão**: Diferentes comissões para diferentes prazos de pagamento
3. **Controle**: Ative/desative configurações específicas
4. **Escalabilidade**: Sistema extensível para outros tipos de faixa

## 🔄 Migração de Dados Existentes

- Configurações existentes continuam funcionando
- Campo `tier_type` padrão = 'value' (por valor)
- Não há perda de dados ou configurações

## 🧪 Como Testar o Sistema Completo

### 1. Aplicar Migrações
```sql
-- Cole este código no SQL Editor do Supabase:
-- (veja arquivo: migracoes-comissoes-prazo.sql)
```

### 2. Configurar Comissões por Prazo
1. Acesse **Comissões** → **Configurar Comissões**
2. Aba **"Comissões Variáveis (Por Faixa de Valor ou Prazo)"**
3. **Adicionar Taxa Variável** → **"📅 Por Prazo de Pagamento"**
4. Configure: CRÉDITO CLT, 8x a 12x, 1.5%

### 3. Cadastrar Lead com Prazo
1. Acesse **Leads** → **Novo Lead**
2. Preencha dados básicos
3. **Produto**: CRÉDITO CLT
4. **Valor**: R$ 10.000,00
5. **Prazo de Pagamento**: 10x (10 parcelas)
6. Salvar

### 4. Gerar Comissão
1. Acesse **Comissões**
2. **Gerar Comissões dos Leads**
3. Verificar se a comissão foi calculada com base no prazo (1.5% de R$ 10.000 = R$ 150)

---

**✨ Sistema completo de comissões por prazo de pagamento implementado com sucesso!** 