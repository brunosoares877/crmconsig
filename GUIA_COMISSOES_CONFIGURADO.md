# 💰 Sistema de Comissões - Guia de Uso

## 🎯 **Configurações Atuais**

### **Taxa Fixa (commission_rates):**
- **CREDITO CLT:**
  - 8x a 12x: **1%**
  - Até 24x: **1.5%**
  - 36x: **2%**

- **CREDITO INSS:**
  - Novo BPC/LOAS: **2.5%**
  - Novo Normal: **3%**

- **CREDITO PIX/CARTAO:** **1.5%**
- **PORTABILIDADE INSS:** **1.5%**

### **Taxa Variável por Faixa (commission_tiers):**
- **CREDITO FGTS:**
  - Até R$ 250,00: **15%**
  - R$ 250,01 até R$ 500,00: **12%**
  - R$ 500,01 até R$ 1.000,00: **10%**
  - Acima de R$ 1.000,01: **8%**

## 📝 **Como Usar o Sistema**

### **1. Remover Comissões de Teste**
1. Acesse: http://localhost:8081/commission
2. Encontre as comissões com "Sem lead"
3. Clique no botão 🗑️ de cada uma
4. Confirme a remoção

### **2. Gerar Comissões Automáticas**
1. Vá para **Comissões** → http://localhost:8081/commission
2. Clique em **"Gerar Comissões dos Leads"**
3. Sistema buscará leads com status "**vendido**" ou "**convertido**"
4. Calculará comissão baseada nas configurações
5. Criará comissões com status "**Em Andamento**"

### **3. Gerenciar Comissões**
- **Filtrar** por funcionário, status, produto, data
- **Visualizar** totais por status
- **Remover** comissões incorretas
- **Acompanhar** valores de comissão

### **4. Ajustar Configurações**
- Clique em **"Configurar Taxas"** na página de comissões
- Acesse: http://localhost:8081/commission/settings
- **Aba "Taxas Fixas":** produtos com % fixo
- **Aba "Taxas Variáveis":** produtos com faixas de valor
- **Editar/Deletar** taxas existentes
- **Ativar/Desativar** taxas

## 🔢 **Exemplos de Cálculo**

### **CREDITO FGTS (Variável):**
- Lead de R$ 200,00 → **15%** = R$ 30,00
- Lead de R$ 400,00 → **12%** = R$ 48,00
- Lead de R$ 800,00 → **10%** = R$ 80,00
- Lead de R$ 2.000,00 → **8%** = R$ 160,00

### **CREDITO CLT (Fixo):**
- Lead 12x de R$ 5.000,00 → **1%** = R$ 50,00
- Lead 24x de R$ 5.000,00 → **1.5%** = R$ 75,00
- Lead 36x de R$ 5.000,00 → **2%** = R$ 100,00

### **CREDITO INSS (Fixo):**
- Lead BPC/LOAS de R$ 3.000,00 → **2.5%** = R$ 75,00
- Lead Normal de R$ 3.000,00 → **3%** = R$ 90,00

## 🚀 **Próximos Passos**

1. **✅ Remover** comissões de teste
2. **⚙️ Revisar** configurações se necessário
3. **🎯 Gerar** comissões dos leads vendidos
4. **📊 Acompanhar** performance do time
5. **💰 Gerenciar** pagamentos das comissões

---

## 🎯 **Sistema Pronto para Uso!**

✅ **Taxas configuradas**  
✅ **Interface funcional**  
✅ **Cálculos automáticos**  
✅ **Relatórios disponíveis**  

**O sistema está 100% operacional!** 🚀 