-- ====================================================================
-- DIAGNÓSTICO: Por que o lead não aparece no relatório de comissões?
-- ====================================================================

-- 1. VERIFICAR TODOS OS LEADS CADASTRADOS
SELECT 
  id,
  name,
  product,
  amount,
  status,
  employee,
  date,
  created_at,
  user_id
FROM leads 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 2. VERIFICAR LEADS COM STATUS VÁLIDO PARA COMISSÃO
SELECT 
  '🔍 LEADS VÁLIDOS PARA COMISSÃO' as tipo,
  id,
  name,
  product,
  amount,
  status,
  employee,
  date,
  created_at
FROM leads 
WHERE user_id = auth.uid()
  AND status IN ('convertido') -- ⚠️ PROBLEMA: sistema procura 'sold' que não existe!
ORDER BY created_at DESC;

-- 3. VERIFICAR SE JÁ EXISTEM COMISSÕES PARA OS LEADS
SELECT 
  '📊 COMISSÕES EXISTENTES' as tipo,
  c.id as commission_id,
  c.lead_id,
  c.amount,
  c.commission_value,
  c.percentage,
  c.product,
  c.status as commission_status,
  c.employee,
  l.name as lead_name,
  l.status as lead_status
FROM commissions c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE c.user_id = auth.uid()
ORDER BY c.created_at DESC;

-- 4. IDENTIFICAR LEADS SEM COMISSÃO
SELECT 
  '❌ LEADS SEM COMISSÃO' as tipo,
  l.id,
  l.name,
  l.product,
  l.amount,
  l.status,
  l.employee,
  l.date,
  CASE 
    WHEN l.status != 'convertido' THEN '⚠️ Status não é "convertido"'
    WHEN c.lead_id IS NOT NULL THEN '✅ Já tem comissão'
    ELSE '❌ Sem comissão (deve ser criada)'
  END as motivo
FROM leads l
LEFT JOIN commissions c ON l.id = c.lead_id AND c.user_id = auth.uid()
WHERE l.user_id = auth.uid()
ORDER BY l.created_at DESC;

-- 5. RESUMO GERAL
SELECT 
  'RESUMO GERAL' as categoria,
  COUNT(CASE WHEN status = 'novo' THEN 1 END) as leads_novos,
  COUNT(CASE WHEN status = 'contatado' THEN 1 END) as leads_contatados,
  COUNT(CASE WHEN status = 'qualificado' THEN 1 END) as leads_qualificados,
  COUNT(CASE WHEN status = 'negociando' THEN 1 END) as leads_negociando,
  COUNT(CASE WHEN status = 'convertido' THEN 1 END) as leads_convertidos,
  COUNT(CASE WHEN status = 'perdido' THEN 1 END) as leads_perdidos,
  COUNT(*) as total_leads
FROM leads 
WHERE user_id = auth.uid();

-- 6. VERIFICAR PRODUTOS E CONFIGURAÇÕES
SELECT 
  'PRODUTOS NOS LEADS' as categoria,
  product,
  COUNT(*) as quantidade,
  COUNT(CASE WHEN status = 'convertido' THEN 1 END) as convertidos
FROM leads 
WHERE user_id = auth.uid()
  AND product IS NOT NULL
GROUP BY product
ORDER BY quantidade DESC;

-- ====================================================================
-- SOLUÇÕES POSSÍVEIS:
-- ====================================================================

/*

💡 POSSÍVEIS PROBLEMAS E SOLUÇÕES:

1. ❌ LEAD COM STATUS ERRADO
   Problema: Lead não está com status "convertido"
   Solução: UPDATE leads SET status = 'convertido' WHERE id = 'ID_DO_LEAD';

2. ❌ SISTEMA PROCURA STATUS INEXISTENTE
   Problema: Código procura "sold" que não existe
   Solução: Corrigir código para procurar apenas "convertido"

3. ❌ COMISSÃO JÁ EXISTE
   Problema: Lead já tem comissão gerada
   Solução: Verificar na tabela commissions

4. ❌ PRODUTO SEM CONFIGURAÇÃO
   Problema: Produto do lead não tem configuração de comissão
   Solução: Configurar comissão para o produto

5. ❌ PERÍODO DO RELATÓRIO
   Problema: Data do lead fora do período do relatório
   Solução: Verificar datas no relatório

🔧 COMANDOS PARA CORRIGIR:

-- Mudar status do lead para convertido
UPDATE leads 
SET status = 'convertido' 
WHERE id = 'SEU_LEAD_ID_AQUI' AND user_id = auth.uid();

-- Verificar se funcionou
SELECT name, status FROM leads WHERE id = 'SEU_LEAD_ID_AQUI';

-- Gerar comissão manualmente (se necessário)
-- Use o botão "Gerar Comissões dos Leads" na interface

*/

-- ====================================================================
-- COMANDO FINAL PARA VERIFICAR TUDO:
-- ====================================================================

SELECT 
  '🎯 DIAGNÓSTICO FINAL' as resultado,
  l.name as cliente,
  l.product as produto,
  l.amount as valor,
  l.status as status_lead,
  l.employee as funcionario,
  l.date as data_lead,
  CASE 
    WHEN l.status = 'convertido' AND c.id IS NULL THEN '✅ PRONTO PARA GERAR COMISSÃO'
    WHEN l.status = 'convertido' AND c.id IS NOT NULL THEN '⚠️ JÁ TEM COMISSÃO'
    WHEN l.status != 'convertido' THEN '❌ PRECISA MUDAR STATUS PARA "convertido"'
    ELSE '❓ VERIFICAR MANUALMENTE'
  END as acao_necessaria,
  c.commission_value as valor_comissao_atual
FROM leads l
LEFT JOIN commissions c ON l.id = c.lead_id AND c.user_id = auth.uid()
WHERE l.user_id = auth.uid()
ORDER BY l.created_at DESC; 