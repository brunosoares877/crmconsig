-- ====================================================================
-- TESTE: Sistema de Produtos Automáticos nas Configurações de Comissão
-- ====================================================================
-- Execute este SQL no Supabase para testar o carregamento automático

-- Primeiro, aplicar a migração se ainda não foi aplicada
-- ALTER TABLE leads ADD COLUMN commission_config JSONB;
-- CREATE INDEX idx_leads_commission_config ON leads USING GIN (commission_config);

-- ====================================================================
-- 1. CRIAR CONFIGURAÇÕES DE COMISSÃO PARA TESTE
-- ====================================================================

-- Limpar configurações existentes (opcional)
DELETE FROM commission_rates WHERE user_id = auth.uid();
DELETE FROM commission_tiers WHERE user_id = auth.uid();

-- Configurações Fixas
INSERT INTO commission_rates (user_id, product, name, commission_type, percentage, active) VALUES
  (auth.uid(), 'CREDITO FGTS', 'Taxa Padrão FGTS', 'percentage', 15.0, true),
  (auth.uid(), 'CREDITO CLT', 'Taxa Padrão CLT', 'percentage', 2.0, true),
  (auth.uid(), 'CREDITO INSS', 'Taxa Padrão INSS', 'percentage', 3.0, true),
  (auth.uid(), 'CREDITO PIX/CARTAO', 'Taxa Fixa PIX', 'fixed', 50.0, true),
  (auth.uid(), 'PORTABILIDADE INSS', 'Taxa Portabilidade', 'percentage', 1.5, true);

-- Configurações Variáveis (por faixa de valor)
INSERT INTO commission_tiers (user_id, product, name, tier_type, min_amount, max_amount, commission_type, percentage, active) VALUES
  (auth.uid(), 'CREDITO FGTS', 'Até R$ 500', 'value', 0, 500, 'percentage', 18.0, true),
  (auth.uid(), 'CREDITO FGTS', 'R$ 501 - R$ 1.000', 'value', 501, 1000, 'percentage', 15.0, true),
  (auth.uid(), 'CREDITO FGTS', 'R$ 1.001 - R$ 2.500', 'value', 1001, 2500, 'percentage', 12.0, true),
  (auth.uid(), 'CREDITO FGTS', 'Acima de R$ 2.500', 'value', 2501, NULL, 'percentage', 10.0, true);

-- Configurações Variáveis (por prazo)
INSERT INTO commission_tiers (user_id, product, name, tier_type, min_period, max_period, commission_type, percentage, active) VALUES
  (auth.uid(), 'CREDITO CLT', '8x a 12x', 'period', 8, 12, 'percentage', 1.0, true),
  (auth.uid(), 'CREDITO CLT', '13x a 24x', 'period', 13, 24, 'percentage', 1.5, true),
  (auth.uid(), 'CREDITO CLT', '25x a 36x', 'period', 25, 36, 'percentage', 2.0, true),
  (auth.uid(), 'CREDITO CLT', 'Acima de 36x', 'period', 37, NULL, 'percentage', 2.5, true);

-- ====================================================================
-- 2. VERIFICAR PRODUTOS CRIADOS
-- ====================================================================

-- Produtos das comissões fixas
SELECT 'FIXAS' as tipo, product, name, 
       CASE WHEN commission_type = 'percentage' THEN CONCAT(percentage::text, '%')
            ELSE CONCAT('R$ ', fixed_value::text) END as valor
FROM commission_rates 
WHERE user_id = auth.uid() AND active = true
ORDER BY product;

-- Produtos das comissões variáveis
SELECT 'VARIÁVEIS' as tipo, product, name,
       CASE WHEN tier_type = 'value' THEN CONCAT('R$ ', min_amount::text, ' - ', COALESCE(max_amount::text, 'sem limite'))
            WHEN tier_type = 'period' THEN CONCAT(min_period::text, 'x - ', COALESCE(max_period::text, 'sem limite'))
            ELSE 'N/A' END as faixa,
       CASE WHEN commission_type = 'percentage' THEN CONCAT(percentage::text, '%')
            ELSE CONCAT('R$ ', fixed_value::text) END as valor
FROM commission_tiers 
WHERE user_id = auth.uid() AND active = true
ORDER BY product, min_amount, min_period;

-- Lista única de produtos (que deve aparecer no formulário)
SELECT DISTINCT product as produtos_disponiveis
FROM (
  SELECT product FROM commission_rates WHERE user_id = auth.uid() AND active = true
  UNION
  SELECT product FROM commission_tiers WHERE user_id = auth.uid() AND active = true
) as all_products
ORDER BY product;

-- ====================================================================
-- 3. INSTRUÇÕES DE TESTE
-- ====================================================================

/*

🎯 COMO TESTAR:

1. Execute este SQL no Supabase Dashboard
2. Vá para: http://localhost:8080/leads/new
3. Observe o campo "Produto"
4. Deve carregar automaticamente:
   - CREDITO FGTS
   - CREDITO CLT  
   - CREDITO INSS
   - CREDITO PIX/CARTAO
   - PORTABILIDADE INSS

5. Selecione um produto (ex: CREDITO FGTS)
6. Clique em "⚡ Gerar Tabelas de Comissão"
7. Deve mostrar:
   - Taxa Padrão FGTS (15%)
   - Até R$ 500 (18%)
   - R$ 501 - R$ 1.000 (15%)
   - R$ 1.001 - R$ 2.500 (12%)
   - Acima de R$ 2.500 (10%)

✅ RESULTADO ESPERADO:
- Produtos carregam automaticamente das configurações
- Não há produtos fixos hardcoded
- Aparece aviso se não há produtos configurados
- Botão de configuração funciona corretamente

*/ 