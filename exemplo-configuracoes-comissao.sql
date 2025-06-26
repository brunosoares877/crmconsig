-- ================================================================
-- EXEMPLOS DE CONFIGURAÇÕES DE COMISSÃO INTEGRADAS
-- ================================================================
-- Execute este SQL no Supabase para testar o sistema integrado

-- Limpar configurações existentes (opcional)
DELETE FROM commission_rates WHERE user_id = auth.uid();
DELETE FROM commission_tiers WHERE user_id = auth.uid();

-- ================================================================
-- 1. CRÉDITO FGTS - FAIXAS POR VALOR
-- ================================================================

-- Faixa 1: Até R$ 500 = 15%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_amount, max_amount,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO FGTS', 'Faixa Básica (até R$ 500)', 'value',
    0, 500,
    'percentage', 15.0, true
);

-- Faixa 2: R$ 501 a R$ 1.000 = 12%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_amount, max_amount,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO FGTS', 'Faixa Intermediária (R$ 501 - R$ 1.000)', 'value',
    501, 1000,
    'percentage', 12.0, true
);

-- Faixa 3: R$ 1.001 a R$ 2.500 = 10%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_amount, max_amount,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO FGTS', 'Faixa Premium (R$ 1.001 - R$ 2.500)', 'value',
    1001, 2500,
    'percentage', 10.0, true
);

-- Faixa 4: Acima de R$ 2.500 = 8%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_amount, max_amount,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO FGTS', 'Faixa VIP (acima de R$ 2.500)', 'value',
    2501, NULL,
    'percentage', 8.0, true
);

-- ================================================================
-- 2. CRÉDITO CLT - FAIXAS POR PRAZO DE PAGAMENTO
-- ================================================================

-- Prazo 1: 6x a 12x = 1.5%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_period, max_period,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO CLT', 'Prazo Curto (6x a 12x)', 'period',
    6, 12,
    'percentage', 1.5, true
);

-- Prazo 2: 13x a 24x = 2.0%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_period, max_period,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO CLT', 'Prazo Médio (13x a 24x)', 'period',
    13, 24,
    'percentage', 2.0, true
);

-- Prazo 3: 25x a 36x = 2.5%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_period, max_period,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO CLT', 'Prazo Longo (25x a 36x)', 'period',
    25, 36,
    'percentage', 2.5, true
);

-- Prazo 4: 37x a 60x = 3.0%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_period, max_period,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO CLT', 'Prazo Estendido (37x a 60x)', 'period',
    37, 60,
    'percentage', 3.0, true
);

-- ================================================================
-- 3. CRÉDITO INSS - TAXAS FIXAS
-- ================================================================

-- Taxa fixa percentual: 3%
INSERT INTO commission_rates (
    user_id, product, name,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'CREDITO INSS', 'Taxa Padrão INSS', 
    'percentage', 3.0, true
);

-- ================================================================
-- 4. CRÉDITO PIX/CARTAO - TAXA FIXA COM VALOR FIXO
-- ================================================================

-- Valor fixo: R$ 50 por operação
INSERT INTO commission_rates (
    user_id, product, name,
    commission_type, fixed_value, active
) VALUES (
    auth.uid(), 'CREDITO PIX/CARTAO', 'Valor Fixo PIX/Cartão',
    'fixed', 50.00, true
);

-- ================================================================
-- 5. PORTABILIDADE - FAIXAS MISTAS (VALOR + PERÍODO)
-- ================================================================

-- Portabilidade pequena: até R$ 5.000 = R$ 100 fixo
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_amount, max_amount,
    commission_type, fixed_value, active
) VALUES (
    auth.uid(), 'PORTABILIDADE INSS', 'Portabilidade Pequena (até R$ 5.000)', 'value',
    0, 5000,
    'fixed', 100.00, true
);

-- Portabilidade grande: acima de R$ 5.000 = 2%
INSERT INTO commission_tiers (
    user_id, product, name, tier_type,
    min_amount, max_amount,
    commission_type, percentage, active
) VALUES (
    auth.uid(), 'PORTABILIDADE INSS', 'Portabilidade Grande (acima de R$ 5.000)', 'value',
    5001, NULL,
    'percentage', 2.0, true
);

-- ================================================================
-- VERIFICAÇÃO DOS DADOS
-- ================================================================

-- Verificar taxas fixas criadas
SELECT 
    product,
    name,
    commission_type,
    CASE 
        WHEN commission_type = 'percentage' THEN CONCAT(percentage::text, '%')
        ELSE CONCAT('R$ ', fixed_value::text)
    END as valor,
    active
FROM commission_rates 
WHERE user_id = auth.uid()
ORDER BY product, name;

-- Verificar taxas variáveis criadas
SELECT 
    product,
    name,
    tier_type,
    CASE 
        WHEN tier_type = 'value' THEN CONCAT('R$ ', COALESCE(min_amount::text, '0'), ' - ', COALESCE(max_amount::text, 'sem limite'))
        WHEN tier_type = 'period' THEN CONCAT(COALESCE(min_period::text, '0'), 'x - ', COALESCE(max_period::text, 'sem limite'))
        ELSE 'N/A'
    END as faixa,
    CASE 
        WHEN commission_type = 'percentage' THEN CONCAT(percentage::text, '%')
        ELSE CONCAT('R$ ', fixed_value::text)
    END as valor,
    active
FROM commission_tiers 
WHERE user_id = auth.uid()
ORDER BY product, tier_type, min_amount, min_period;

-- ================================================================
-- INSTRUÇÕES DE USO
-- ================================================================

/*

🎯 COMO TESTAR O SISTEMA:

1. Execute este SQL no SQL Editor do Supabase
2. Vá para a página de Leads
3. Crie um novo lead ou edite um existente
4. Selecione os produtos:
   - SAQUE ANIVERSARIO (mapeia para CREDITO FGTS)
   - EMPRESTIMO CONSIGNADO (mapeia para CREDITO CLT)
   - novo (mapeia para CREDITO INSS)
   - CARTAO CONSIGNADO (mapeia para CREDITO PIX/CARTAO)
   - portabilidade (mapeia para PORTABILIDADE INSS)

5. Insira diferentes valores e prazos para ver as opções

EXEMPLOS DE TESTE:

📋 FGTS com R$ 800:
- Deve mostrar "Faixa Intermediária" = 12%
- Comissão calculada: R$ 96,00

📋 CLT com 18 parcelas:
- Deve mostrar "Prazo Médio (13x a 24x)" = 2%
- Para R$ 5.000 = Comissão: R$ 100,00

📋 PIX/Cartão qualquer valor:
- Deve mostrar "Valor Fixo" = R$ 50,00
- Comissão sempre R$ 50,00

📋 INSS qualquer valor:
- Deve mostrar "Taxa Padrão" = 3%
- Para R$ 2.000 = Comissão: R$ 60,00

*/ 