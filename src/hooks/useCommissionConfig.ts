import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CommissionRate, CommissionTier } from '@/types/models';
import { mapProductToCommissionConfig } from '@/utils/productMapping';

export interface CommissionConfigOption {
  id: string;
  name: string;
  type: 'fixed_rate' | 'value_tier' | 'period_tier';
  commission_type: 'percentage' | 'fixed';
  value: number; // percentual ou valor fixo
  product: string; // Nome do produto
  min_amount?: number;
  max_amount?: number;
  min_period?: number;
  max_period?: number;
}

export interface CommissionCalculationResult {
  option: CommissionConfigOption;
  calculatedValue: number;
  percentage: number;
}

export const useCommissionConfig = (productName?: string) => {
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [selectedOption, setSelectedOption] = useState<CommissionConfigOption | null>(null);

  // Carregar configurações uma única vez
  useEffect(() => {
    loadCommissionConfig();
  }, []);

  const loadCommissionConfig = async () => {
    try {
      setLoading(true);

      // Sempre carregar todas as configurações - o filtro será feito no componente
      const ratesQuery = supabase
        .from('commission_rates')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      const tiersQuery = supabase
        .from('commission_tiers')
        .select('*')
        .eq('active', true)
        .order('min_amount', { ascending: true })
        .order('min_period', { ascending: true });

      const { data: ratesData, error: ratesError } = await ratesQuery;
      const { data: tiersData, error: tiersError } = await tiersQuery;

      if (ratesError) throw ratesError;
      if (tiersError) throw tiersError;

      setRates((ratesData || []) as CommissionRate[]);
      setTiers((tiersData || []) as CommissionTier[]);

    } catch (error) {
      console.error('Erro ao carregar configurações de comissão:', error);
      setRates([]);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  // Converter configurações para opções selecionáveis
  const availableOptions = useMemo(() => {
    const options: CommissionConfigOption[] = [];

    // Adicionar taxas fixas
    rates.forEach(rate => {
      options.push({
        id: `rate_${rate.id}`,
        name: rate.name || `Taxa ${rate.commission_type === 'fixed' ? 'Fixa' : 'Percentual'}`,
        type: 'fixed_rate',
        commission_type: rate.commission_type,
        value: rate.commission_type === 'fixed' ? (rate.fixed_value || 0) : rate.percentage,
        product: rate.product
      });
    });

    // Adicionar faixas de valor
    tiers.filter(tier => !tier.tier_type || tier.tier_type === 'value').forEach(tier => {
      options.push({
        id: `tier_${tier.id}`,
        name: tier.name || `Faixa de Valor`,
        type: 'value_tier',
        commission_type: tier.commission_type,
        value: tier.commission_type === 'fixed' ? (tier.fixed_value || 0) : tier.percentage,
        product: tier.product,
        min_amount: tier.min_amount,
        max_amount: tier.max_amount
      });
    });

    // Adicionar faixas de período
    tiers.filter(tier => tier.tier_type === 'period').forEach(tier => {
      options.push({
        id: `tier_${tier.id}`,
        name: tier.name || `Faixa de Período`,
        type: 'period_tier',
        commission_type: tier.commission_type,
        value: tier.commission_type === 'fixed' ? (tier.fixed_value || 0) : tier.percentage,
        product: tier.product,
        min_period: tier.min_period,
        max_period: tier.max_period
      });
    });

    return options;
  }, [rates, tiers]);

  // Calcular comissão baseada na opção selecionada
  const calculateCommission = (
    option: CommissionConfigOption,
    amount: number,
    paymentPeriod?: number
  ): CommissionCalculationResult | null => {
    if (!option || amount <= 0) return null;

    // Para taxas fixas (fixed_rate), não aplicar validação de faixa
    if (option.type === 'fixed_rate') {
      let calculatedValue: number;
      let percentage: number;

      if (option.commission_type === 'fixed') {
        calculatedValue = option.value;
        percentage = amount > 0 ? (calculatedValue / amount) * 100 : 0;
      } else {
        percentage = option.value;
        calculatedValue = (amount * percentage) / 100;
      }

      return {
        option,
        calculatedValue,
        percentage
      };
    }

    // Para faixas de valor (value_tier), verificar apenas se há faixas definidas
    if (option.type === 'value_tier') {
      // Se não há min nem max definidos, aceitar qualquer valor
      const hasMinAmount = option.min_amount !== null && option.min_amount !== undefined;
      const hasMaxAmount = option.max_amount !== null && option.max_amount !== undefined;
      
      if (hasMinAmount && amount < option.min_amount!) return null;
      if (hasMaxAmount && amount > option.max_amount!) return null;
    }

    // Para faixas de período (period_tier), verificar apenas se período foi fornecido
    if (option.type === 'period_tier') {
      // Se não há período informado mas a validação exige, retornar null
      if (!paymentPeriod) {
        // Mas se não há restrições de período definidas, aceitar
        const hasMinPeriod = option.min_period !== null && option.min_period !== undefined;
        const hasMaxPeriod = option.max_period !== null && option.max_period !== undefined;
        
        if (hasMinPeriod || hasMaxPeriod) return null;
      } else {
        // Se há período, validar as faixas
        const hasMinPeriod = option.min_period !== null && option.min_period !== undefined;
        const hasMaxPeriod = option.max_period !== null && option.max_period !== undefined;
        
        if (hasMinPeriod && paymentPeriod < option.min_period!) return null;
        if (hasMaxPeriod && paymentPeriod > option.max_period!) return null;
      }
    }

    // Calcular valor da comissão
    let calculatedValue: number;
    let percentage: number;

    if (option.commission_type === 'fixed') {
      calculatedValue = option.value;
      percentage = amount > 0 ? (calculatedValue / amount) * 100 : 0;
    } else {
      percentage = option.value;
      calculatedValue = (amount * percentage) / 100;
    }

    return {
      option,
      calculatedValue,
      percentage
    };
  };

  // Encontrar automaticamente a melhor opção baseada no valor e período
  const findBestOption = (amount: number, paymentPeriod?: number): CommissionConfigOption | null => {
    if (amount <= 0) return null;

    // Filtrar opções pelo produto se especificado
    const filteredOptions = productName 
      ? availableOptions.filter(opt => opt.product === productName)
      : availableOptions;

    if (filteredOptions.length === 0) return null;

    // Lista de opções válidas baseadas na validação
    const validOptions: CommissionConfigOption[] = [];

    for (const option of filteredOptions) {
      // Testar se a opção é válida fazendo um cálculo de teste
      const testResult = calculateCommission(option, amount, paymentPeriod);
      if (testResult) {
        validOptions.push(option);
      }
    }

    if (validOptions.length === 0) {
      // Se não há opções válidas, retornar a primeira taxa fixa disponível
      const fixedRates = filteredOptions.filter(opt => opt.type === 'fixed_rate');
      return fixedRates[0] || filteredOptions[0] || null;
    }

    // Prioridade de seleção:
    // 1. Faixas de período (se período foi fornecido)
    // 2. Faixas de valor (mais específicas)
    // 3. Taxas fixas (mais genéricas)

    // 1. Tentar encontrar por período se fornecido
    if (paymentPeriod) {
      const periodOptions = validOptions.filter(opt => opt.type === 'period_tier');
      if (periodOptions.length > 0) {
        // Retornar a que tem a faixa mais específica (menor range)
        return periodOptions.sort((a, b) => {
          const rangeA = (a.max_period || Infinity) - (a.min_period || 0);
          const rangeB = (b.max_period || Infinity) - (b.min_period || 0);
          return rangeA - rangeB;
        })[0];
      }
    }

    // 2. Tentar encontrar por faixa de valor
    const valueOptions = validOptions.filter(opt => opt.type === 'value_tier');
    if (valueOptions.length > 0) {
      // Retornar a que tem a faixa mais específica (menor range)
      return valueOptions.sort((a, b) => {
        const rangeA = (a.max_amount || Infinity) - (a.min_amount || 0);
        const rangeB = (b.max_amount || Infinity) - (b.min_amount || 0);
        return rangeA - rangeB;
      })[0];
    }

    // 3. Taxa fixa como fallback
    const fixedRates = validOptions.filter(opt => opt.type === 'fixed_rate');
    return fixedRates[0] || validOptions[0];
  };

  return {
    loading,
    availableOptions,
    selectedOption,
    setSelectedOption,
    calculateCommission,
    findBestOption,
    hasOptions: availableOptions.length > 0
  };
}; 