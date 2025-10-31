# 🚀 Como Usar o Servidor de Desenvolvimento

## ✅ Servidor Iniciado Corretamente!

O servidor está rodando na **porta 8080**. Acesse: http://localhost:8080

---

## 🔧 **Problema: Servidor para ao atualizar a página**

### **Solução:**
O servidor deve rodar em uma **janela separada do PowerShell** e **não deve ser fechada**.

### **Como Iniciar Corretamente:**

#### **Opção 1: Script Automático (Recomendado)**
```powershell
cd C:\Users\Bruno\crmconsig
.\scripts\cleanup-and-start.ps1
```

#### **Opção 2: Manual**
```powershell
cd C:\Users\Bruno\crmconsig
npm run dev
```

**IMPORTANTE:**
- ✅ Deixe a janela do PowerShell **aberta** enquanto desenvolve
- ✅ **Não feche** a janela onde o servidor está rodando
- ✅ Atualizar a página no navegador **NÃO deve** parar o servidor
- ⚠️ Fechar a janela do PowerShell **VAI** parar o servidor

---

## 🛑 **Se o Servidor Parar:**

1. **Verifique se a janela do PowerShell está aberta**
   - Se não estiver, o servidor parou

2. **Limpe processos antigos e reinicie:**
   ```powershell
   cd C:\Users\Bruno\crmconsig
   .\scripts\cleanup-and-start.ps1
   ```

3. **Ou manualmente:**
   ```powershell
   # Parar todos os processos Node
   Get-Process -Name node | Stop-Process -Force
   
   # Iniciar servidor novamente
   cd C:\Users\Bruno\crmconsig
   npm run dev
   ```

---

## 📝 **Comandos Úteis**

### **Verificar se o servidor está rodando:**
```powershell
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
```

### **Ver todos os processos Node:**
```powershell
Get-Process -Name node
```

### **Parar o servidor:**
- Feche a janela PowerShell onde o servidor está rodando
- Ou: `Get-Process -Name node | Stop-Process -Force`

---

## 🔄 **Atualizações Automáticas (HMR)**

O Vite usa **Hot Module Replacement (HMR)**, o que significa que:
- ✅ Mudanças no código são refletidas **automaticamente** no navegador
- ✅ Você **não precisa** recarregar a página manualmente
- ✅ O servidor **continua rodando** durante as atualizações

---

## ⚠️ **Importante**

Se você está **atualizando a página no navegador** e o servidor para, isso indica:
1. A janela do PowerShell foi fechada acidentalmente
2. Há um erro fatal no código que crasha o servidor
3. Múltiplos processos estão em conflito

**Solução:** Use o script `cleanup-and-start.ps1` para limpar tudo e reiniciar.

---

## 📞 **Suporte**

Se o problema persistir:
1. Verifique os logs na janela do PowerShell
2. Certifique-se de que a porta 8080 não está bloqueada pelo firewall
3. Tente uma porta diferente alterando `vite.config.ts`

---

**Última atualização:** Configuração otimizada para evitar que o servidor pare ao atualizar a página.

