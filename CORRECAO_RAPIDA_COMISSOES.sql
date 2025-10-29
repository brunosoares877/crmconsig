-- ====================================================================
-- CORREÇÃO RÁPIDA: Lead não aparece no relatório de comissões
-- ====================================================================

-- 🔧 PROBLEMA IDENTIFICADO:
-- O sistema busca leads com status "sold" que não existe!
-- Os status corretos são: novo, contatado, qualificado, negociando, convertido, perdido

-- ⚡ SOLUÇÃO RÁPIDA:
-- 1. Mudar status do lead para "convertido"
-- 2. Gerar comissão manualmente

-- ====================================================================
-- 1. VERIFICAR SEU LEAD ATUAL
-- ====================================================================

SELECT 
  '📋 SEUS LEADS' as categoria,
  id,
  name as cliente,
  product as produto,
  amount as valor,
  status,
  employee as funcionario,
  date as data_lead,
  created_at
FROM leads 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- ====================================================================
-- 2. IDENTIFICAR O LEAD QUE NÃO APARECE
-- ====================================================================

-- Execute este comando substituindo 'NOME_DO_SEU_CLIENTE' pelo nome real:
SELECT 
  '🔍 LEAD ESPECÍFICO' as categoria,
  id,
  name,
  status,
  product,
  amount,
  CASE 
    WHEN status = 'convertido' THEN '✅ Status correto para gerar comissão'
    ELSE '❌ Precisa mudar status para "convertido"'
  END as diagnostico
FROM leads 
WHERE user_id = auth.uid()
  AND name ILIKE '%SEU_CLIENTE_AQUI%'  -- Substitua por parte do nome do cliente
ORDER BY created_at DESC;

-- ====================================================================
-- 3. CORREÇÃO: MUDAR STATUS PARA "convertido"
-- ====================================================================

-- ⚠️ SUBSTITUA 'ID_DO_LEAD_AQUI' pelo ID real do seu lead
UPDATE leads 
SET status = 'convertido'
WHERE user_id = auth.uid()
  AND id = 'ID_DO_LEAD_AQUI';  -- Cole aqui o ID do seu lead

-- Verificar se funcionou:
SELECT 
  '✅ VERIFICAÇÃO' as resultado,
  name,
  status,
  'Status atualizado com sucesso!' as mensagem
FROM leads 
WHERE user_id = auth.uid()
  AND id = 'ID_DO_LEAD_AQUI';  -- Use o mesmo ID

-- ====================================================================
-- 4. VERIFICAR SE NÃO TEM COMISSÃO DUPLICADA
-- ====================================================================

SELECT 
  '🔍 COMISSÕES EXISTENTES' as categoria,
  c.id,
  l.name as cliente,
  c.product,
  c.commission_value,
  c.status as status_comissao
FROM commissions c
JOIN leads l ON c.lead_id = l.id
WHERE c.user_id = auth.uid()
  AND l.name ILIKE '%SEU_CLIENTE_AQUI%'  -- Substitua pelo nome do cliente
ORDER BY c.created_at DESC;

-- ====================================================================
-- 5. FORÇAR CRIAÇÃO DE COMISSÃO (se necessário)
-- ====================================================================

-- Se mesmo após mudar o status o lead não gerar comissão automaticamente,
-- você pode criar manualmente:

-- ⚠️ SUBSTITUA os valores pelos dados reais do seu lead:
INSERT INTO commissions (
  user_id,
  lead_id,
  amount,
  commission_value,
  percentage,
  product,
  status,
  payment_period,
  employee
)
SELECT 
  auth.uid(),
  'ID_DO_LEAD_AQUI',                    -- ID do lead
  5000.00,                              -- Valor da venda (R$ 5.000,00)
  125.00,                               -- Valor da comissão (2.5% de 5000 = 125)
  2.5,                                  -- Percentual de comissão
  'CREDITO INSS',                       -- Produto
  'in_progress',                        -- Status da comissão
  'monthly',                            -- Período de pagamento
  'all'                                 -- Funcionário
WHERE NOT EXISTS (
  SELECT 1 FROM commissions 
  WHERE lead_id = 'ID_DO_LEAD_AQUI' AND user_id = auth.uid()
);

-- ====================================================================
-- 6. VERIFICAÇÃO FINAL
-- ====================================================================

SELECT 
  '🎯 RESULTADO FINAL' as categoria,
  l.name as cliente,
  l.status as status_lead,
  c.commission_value as valor_comissao,
  c.status as status_comissao,
  '✅ Lead deve aparecer no relatório agora!' as resultado
FROM leads l
LEFT JOIN commissions c ON l.id = c.lead_id AND c.user_id = auth.uid()
WHERE l.user_id = auth.uid()
  AND l.status = 'convertido'
  AND l.name ILIKE '%SEU_CLIENTE_AQUI%'  -- Substitua pelo nome
ORDER BY l.created_at DESC;

-- ====================================================================
-- INSTRUÇÕES DE USO:
-- ====================================================================

/*

🎯 COMO USAR ESTE SCRIPT:

1. Execute a query "SEUS LEADS" para ver todos os leads
2. Identifique o ID do lead que não aparece no relatório
3. Substitua 'ID_DO_LEAD_AQUI' pelo ID real em todos os comandos
4. Substitua 'SEU_CLIENTE_AQUI' pelo nome do cliente
5. Execute as correções uma por uma
6. Teste o relatório de comissões novamente

📋 PASSOS APÓS EXECUTAR:

1. Vá para Comissões → Gerar Comissões dos Leads
2. Gere o relatório de pagamento
3. Exporte para PDF
4. Verifique se o lead aparece agora

✅ RESULTADO ESPERADO:
- Lead com status "convertido"
- Comissão gerada na tabela commissions
- Aparece no relatório PDF
- Pode ser filtrado por funcionário

*/ 