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
      let ratesQuery = supabase
        .from('commission_rates')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      let tiersQuery = supabase
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

    // Verificar se a opção é válida para os parâmetros fornecidos
    if (option.type === 'value_tier') {
      if (option.min_amount && amount < option.min_amount) return null;
      if (option.max_amount && amount > option.max_amount) return null;
    }

    if (option.type === 'period_tier' && paymentPeriod) {
      if (option.min_period && paymentPeriod < option.min_period) return null;
      if (option.max_period && paymentPeriod > option.max_period) return null;
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
    // Prioridade: período > valor > taxa fixa
    
    // 1. Tentar encontrar por período se fornecido
    if (paymentPeriod) {
      const periodOptions = availableOptions.filter(opt => opt.type === 'period_tier');
      for (const option of periodOptions) {
        if (option.min_period && paymentPeriod >= option.min_period &&
            (!option.max_period || paymentPeriod <= option.max_period)) {
          return option;
        }
      }
    }

    // 2. Tentar encontrar por faixa de valor
    if (amount > 0) {
      const valueOptions = availableOptions.filter(opt => opt.type === 'value_tier');
      for (const option of valueOptions) {
        if (option.min_amount && amount >= option.min_amount &&
            (!option.max_amount || amount <= option.max_amount)) {
          return option;
        }
      }
    }

    // 3. Taxa fixa como fallback
    const fixedRates = availableOptions.filter(opt => opt.type === 'fixed_rate');
    return fixedRates[0] || null;
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