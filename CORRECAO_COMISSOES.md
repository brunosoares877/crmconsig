# 🔧 Correção de Erro nas Comissões

## ❌ Problema Identificado

**Erro:** `new row for relation "commissions" violates check constraint "commissions_status_check"`

### Causa do Problema
A tabela `commissions` no banco de dados tinha uma constraint que só aceitava valores em português:
- `'aprovado'`
- `'cancelado'` 
- `'em_andamento'`

Mas o código está enviando valores em inglês:
- `'pending'`
- `'in_progress'`
- `'completed'`
- `'approved'`
- `'paid'`
- `'cancelled'`

## ✅ Soluções Disponíveis

### **Opção 1: Script Automático (Recomendado)**
Execute o script PowerShell criado:
```powershell
.\fix-commission-constraint.ps1
```

### **Opção 2: Via Supabase Dashboard**
1. Acesse: https://supabase.com/dashboard
2. Vá para **SQL Editor**
3. Execute o SQL:

```sql
-- Atualizar registros existentes
UPDATE commissions 
SET status = CASE 
    WHEN status = 'aprovado' THEN 'approved'
    WHEN status = 'cancelado' THEN 'cancelled'
    WHEN status = 'em_andamento' THEN 'in_progress'
    ELSE status
END
WHERE status IN ('aprovado', 'cancelado', 'em_andamento');

-- Corrigir constraint
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_status_check;
ALTER TABLE commissions 
ADD CONSTRAINT commissions_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'paid', 'cancelled'));
```

### **Opção 3: Via CLI do Supabase**
```bash
cd supabase
npx supabase db push
```

## 📊 Valores de Status Aceitos Após Correção

- `'pending'` - Pendente
- `'in_progress'` - Em andamento  
- `'completed'` - Concluído
- `'approved'` - Aprovado
- `'paid'` - Pago
- `'cancelled'` - Cancelado

## 🔍 Arquivos Modificados

1. **Migração criada:** `supabase/migrations/20250122000000-fix-commission-status-constraint.sql`
2. **Script de correção:** `fix-commission-constraint.ps1`

---

**Após executar uma das opções acima, você poderá gerar comissões sem erro!** ✅ 