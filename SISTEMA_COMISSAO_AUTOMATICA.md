# 🚀 Sistema de Configuração Automática de Comissão - VERSÃO 2.0

## 📋 Visão Geral

O sistema agora permite que os clientes:
- **Deixem apenas o produto** (usando configuração padrão)
- **Selecionem tabelas específicas** de comissão (fixa ou variável)
- **Gerem automaticamente** as opções baseadas no produto selecionado
- **✨ NOVO: Produtos carregados automaticamente** das configurações de comissão

## 🎯 Como Funciona

### 1. **Produtos Dinâmicos** ⭐ NOVO
- Campo "Produto" carrega automaticamente dos cadastros de comissão
- Elimina lista fixa de produtos no código
- Sincronização automática com configurações ativas
- Aviso quando não há produtos configurados

### 2. **Botão "Gerar Tabelas de Comissão"**
- Aparece quando um produto é selecionado no formulário
- Busca automaticamente as configurações para aquele produto
- Mostra opções disponíveis para seleção

### 3. **Opções de Configuração**
- **Apenas Produto**: Usa configuração padrão do sistema
- **Comissões Fixas**: Taxa fixa (% ou valor) para o produto
- **Comissões Variáveis**: Faixas por valor ou prazo de pagamento

### 4. **Mapeamento Automático**
Os produtos do formulário são mapeados automaticamente:
- `SAQUE ANIVERSARIO` → `CREDITO FGTS`
- `EMPRESTIMO CONSIGNADO` → `CREDITO CLT`
- `CARTAO CONSIGNADO` → `CREDITO PIX/CARTAO`
- `PORTABILIDADE` → `PORTABILIDADE INSS`

## 🔧 Configuração Inicial

### 1. **Aplicar Migração**
```powershell
# Execute o script para aplicar a migração
.\apply-commission-config-migration.ps1
```

```sql
-- Ou execute diretamente no Supabase:
ALTER TABLE leads ADD COLUMN commission_config JSONB;
CREATE INDEX idx_leads_commission_config ON leads USING GIN (commission_config);
```

### 2. **Configurar Comissões e Produtos**
1. Acesse **Comissões** → **Configurar Comissões**
2. Configure as **Comissões Fixas** por produto
3. Configure as **Comissões Variáveis** por faixa de valor/prazo
4. **Os produtos configurados aparecerão automaticamente no formulário**

### 3. **Testar o Sistema**
1. Vá para **Leads** → **Novo Lead**
2. Observe o campo "Produto" carregando automaticamente
3. Selecione um produto
4. Clique em **"Gerar Tabelas de Comissão"**
5. Escolha uma configuração
6. Salve o lead

## 🎨 Interface do Usuário

### **Formulário de Lead - Produtos Dinâmicos**
```
┌─────────────────────────────────────────┐
│ Produto: [Carregando produtos... ▼]    │
│          ↓ (carrega automaticamente)   │
│ Produto: [CREDITO FGTS ▼]              │
│          ├─ CREDITO FGTS                │
│          ├─ CREDITO CLT                 │
│          ├─ CREDITO INSS                │
│          ├─ CREDITO PIX/CARTAO          │
│          └─ PORTABILIDADE INSS          │
│                                         │
│ Valor: R$ 1.500,00                     │
│ Prazo: 24x parcelas                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💰 Configuração de Comissão            │
│                                         │
│ [⚡ Gerar Tabelas de Comissão]         │
│                                         │
│ CREDITO FGTS                           │
└─────────────────────────────────────────┘
```

### **Opções Geradas**
```
┌─────────────────────────────────────────┐
│ Configuração de Comissão                │
│                                         │
│ [Apenas Produto ▼]                     │
│                                         │
│ ├─ Apenas Produto (padrão)             │
│ ├─ 💰 Comissões Fixas                  │
│ │  ├─ Taxa Padrão FGTS - 15%           │
│ │  └─ Taxa Especial - R$ 100           │
│ └─ 📊 Comissões Variáveis              │
│    ├─ Até R$ 500 - 18%                 │
│    ├─ R$ 501 - R$ 1.500 - 15%          │
│    └─ Acima R$ 1.500 - 12%             │
└─────────────────────────────────────────┘
```

## 🔍 Exemplos de Uso

### **Exemplo 1: Apenas Produto**
```json
{
  "product": "CREDITO FGTS",
  "amount": "1.500,00",
  "commission_config": null
}
```
**Resultado**: Usa configuração padrão do sistema (15% para FGTS)

### **Exemplo 2: Comissão Fixa**
```json
{
  "product": "CREDITO FGTS",
  "amount": "1.500,00",
  "commission_config": {
    "id": "rate_123",
    "type": "fixed",
    "name": "Taxa Padrão FGTS",
    "commission_type": "percentage",
    "percentage": 15
  }
}
```
**Resultado**: Usa 15% fixo = R$ 225,00

### **Exemplo 3: Comissão Variável**
```json
{
  "product": "CREDITO FGTS",
  "amount": "1.500,00",
  "commission_config": {
    "id": "tier_456",
    "type": "variable",
    "name": "R$ 501 - R$ 1.500",
    "tier_type": "value",
    "min_amount": 501,
    "max_amount": 1500,
    "commission_type": "percentage",
    "percentage": 12
  }
}
```
**Resultado**: Usa 12% da faixa = R$ 180,00

## 🧮 Cálculo Automático

### **Ordem de Prioridade**
1. **Configuração Selecionada** (se houver)
2. **Configuração Padrão** do produto mapeado
3. **Taxa Padrão** do sistema (5%)

### **Comissões Padrão por Produto**
- `CREDITO FGTS`: 15%
- `CREDITO CLT`: 2%
- `CREDITO INSS`: 3%
- `CREDITO PIX/CARTAO`: 1.5%
- `PORTABILIDADE INSS`: 1.5%

## 📊 Relatórios

### **Informações Salvas**
- Configuração selecionada
- Produto original vs. produto mapeado
- Valores calculados
- Percentual aplicado

### **Consultas SQL**
```sql
-- Leads com configurações específicas
SELECT 
  name,
  product,
  amount,
  commission_config->>'name' as config_name,
  commission_config->>'type' as config_type
FROM leads 
WHERE commission_config IS NOT NULL;

-- Resumo por tipo de configuração
SELECT 
  commission_config->>'type' as tipo,
  COUNT(*) as quantidade
FROM leads 
WHERE commission_config IS NOT NULL
GROUP BY commission_config->>'type';

-- Produtos mais utilizados
SELECT 
  product,
  COUNT(*) as quantidade_leads
FROM leads 
WHERE product IS NOT NULL
GROUP BY product
ORDER BY quantidade_leads DESC;
```

## ✨ Novidades da Versão 2.0

### **🔄 Produtos Automáticos**
- **Antes**: Lista fixa de 13 produtos hardcoded
- **Agora**: Lista dinâmica baseada nas configurações ativas
- **Vantagem**: Sempre sincronizado, sem produtos órfãos

### **⚡ Performance Melhorada**
- Consultas otimizadas para buscar apenas produtos ativos
- Cache no estado do componente
- Carregamento assíncrono sem travar interface

### **🎯 UX Aprimorada**
- Loading state durante carregamento
- Avisos quando não há produtos configurados
- Orientação clara para configurar produtos

### **🛠️ Manutenibilidade**
- Código mais limpo e modular
- Fácil extensão para novos tipos de produto
- Documentação completa e atualizada

## 🚀 Próximos Passos

### **Funcionalidades Futuras**
1. **Cache Inteligente** - localStorage com invalidação
2. **Produtos Favoritos** - Por usuário/funcionário
3. **Busca de Produtos** - Filtro no dropdown
4. **Sincronização Real-time** - WebSocket updates

### **Melhorias de UX**
1. **Preview de Cálculo** - Mostrar valor em tempo real
2. **Sugestões Baseadas em IA** - Configurações recomendadas
3. **Templates Rápidos** - Configurações pré-definidas
4. **Workflow Guiado** - Assistant de configuração

## 📞 Suporte

### **Como Testar**
1. Execute: `TESTE_PRODUTOS_AUTOMATICOS.sql` no Supabase
2. Acesse: http://localhost:8080/leads/new
3. Observe produtos carregando automaticamente
4. Teste botão "Gerar Tabelas"
5. Selecione configurações e salve

### **Resolução de Problemas**
- **Campo vazio**: Execute SQL de teste para criar produtos
- **Carregamento infinito**: Verifique conexão com Supabase
- **Erro ao gerar tabelas**: Verifique se há configurações ativas
- **Produtos não aparecem**: Verifique se `active = true` nas configurações

## ✅ Checklist de Implementação

- [x] **V1.0** - Componente `CommissionConfigSelector` criado
- [x] **V1.0** - Integração no `LeadForm` implementada
- [x] **V1.0** - Migração para `commission_config` criada
- [x] **V1.0** - Mapeamento de produtos configurado
- [x] **V2.0** - **Carregamento automático de produtos** ⭐ NOVO
- [x] **V2.0** - **Interface dinâmica e responsiva** ⭐ NOVO
- [x] **V2.0** - **Estados de loading e error** ⭐ NOVO
- [x] **V2.0** - **Documentação completa atualizada** ⭐ NOVO
- [ ] Migração aplicada no banco
- [ ] Teste SQL executado
- [ ] Sistema validado pelo usuário

---

**🎯 Status**: Sistema V2.0 implementado e pronto para uso!
**📅 Data**: 31/01/2025
**🔧 Versão**: 2.0.0 - Produtos Automáticos
**⭐ Novidade**: Campo "Produto" agora é 100% dinâmico e sincronizado! 