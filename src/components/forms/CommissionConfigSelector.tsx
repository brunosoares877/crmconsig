import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calculator, Info, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { useCommissionConfig, CommissionConfigOption, CommissionCalculationResult } from '@/hooks/useCommissionConfig';

interface CommissionConfigSelectorProps {
  productName?: string;
  amount?: string; // Formato brasileiro: "1.500,00"
  paymentPeriod?: string; // String do número de parcelas
  onCommissionCalculated?: (result: CommissionCalculationResult | null) => void;
  onOptionSelected?: (option: CommissionConfigOption | null) => void;
  autoCalculate?: boolean;
  showCard?: boolean;
}

const CommissionConfigSelector: React.FC<CommissionConfigSelectorProps> = ({
  productName,
  amount,
  paymentPeriod,
  onCommissionCalculated,
  onOptionSelected,
  autoCalculate = true,
  showCard = true
}) => {
  const { 
    loading, 
    availableOptions, 
    selectedOption, 
    setSelectedOption, 
    calculateCommission, 
    findBestOption,
    hasOptions 
  } = useCommissionConfig(productName);

  const [calculationResult, setCalculationResult] = useState<CommissionCalculationResult | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Converter valores de string para number
  const numericAmount = React.useMemo(() => {
    if (!amount) return 0;
    const cleaned = amount.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }, [amount]);

  const numericPeriod = React.useMemo(() => {
    if (!paymentPeriod) return undefined;
    return parseInt(paymentPeriod) || undefined;
  }, [paymentPeriod]);

  // Auto-seleção e cálculo automático
  useEffect(() => {
    if (autoCalculate && hasOptions && numericAmount > 0) {
      const bestOption = findBestOption(numericAmount, numericPeriod);
      if (bestOption && bestOption.id !== selectedOption?.id) {
        setSelectedOption(bestOption);
      }
    }
  }, [productName, numericAmount, numericPeriod, hasOptions, autoCalculate, findBestOption, selectedOption?.id, setSelectedOption]);

  // Calcular comissão quando opção ou valores mudam
  useEffect(() => {
    if (selectedOption && numericAmount > 0) {
      const result = calculateCommission(selectedOption, numericAmount, numericPeriod);
      setCalculationResult(result);
      onCommissionCalculated?.(result);
    } else {
      setCalculationResult(null);
      onCommissionCalculated?.(null);
    }
  }, [selectedOption, numericAmount, numericPeriod, calculateCommission, onCommissionCalculated]);

  // Notificar seleção de opção
  useEffect(() => {
    onOptionSelected?.(selectedOption);
  }, [selectedOption, onOptionSelected]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getOptionBadge = (option: CommissionConfigOption) => {
    if (option.commission_type === 'fixed') {
      return <Badge variant="secondary" className="bg-green-100 text-green-700">🎯 {formatCurrency(option.value)}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">📊 {option.value}%</Badge>;
    }
  };

  const getOptionDescription = (option: CommissionConfigOption) => {
    const parts = [];
    
    if (option.type === 'value_tier') {
      if (option.min_amount !== undefined) {
        const minFormatted = formatCurrency(option.min_amount);
        const maxFormatted = option.max_amount ? formatCurrency(option.max_amount) : 'sem limite';
        parts.push(`💰 ${minFormatted} - ${maxFormatted}`);
      }
    }
    
    if (option.type === 'period_tier') {
      if (option.min_period !== undefined) {
        const maxPeriod = option.max_period ? `${option.max_period}x` : 'sem limite';
        parts.push(`📅 ${option.min_period}x - ${maxPeriod}`);
      }
    }
    
    return parts.join(' • ');
  };

  // Agrupar opções por produto
  const groupedByProduct = React.useMemo(() => {
    const groups: { [key: string]: CommissionConfigOption[] } = {};

    availableOptions.forEach(option => {
      if (!groups[option.product]) {
        groups[option.product] = [];
      }
      groups[option.product].push(option);
    });

    return groups;
  }, [availableOptions]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleOptionSelect = (option: CommissionConfigOption) => {
    setSelectedOption(option);
  };

  // Agora pode funcionar sem produto específico
  // if (!productName) {
  //   return null;
  // }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

      if (!hasOptions) {
      return (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {productName ? (
              <>Nenhuma configuração de comissão encontrada para <strong>{productName}</strong>.</>
            ) : (
              <>Nenhuma configuração de comissão encontrada.</>
            )}
            {' '}Configure taxas em <strong>Comissões → Configurar Taxas</strong>.
          </AlertDescription>
        </Alert>
      );
    }

  const content = (
    <>
      <div className="space-y-4">
        {/* Produtos Agrupados */}
        {Object.entries(groupedByProduct).map(([productName, options]) => (
          <div key={productName} className="space-y-2">
            <Collapsible
              open={expandedGroups.has(productName)}
              onOpenChange={() => toggleGroup(productName)}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between p-3 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📦 {productName}</span>
                    <Badge variant="secondary">{options.length} configurações</Badge>
                  </div>
                  {expandedGroups.has(productName) ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedOption?.id === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{option.name}</span>
                          {getOptionBadge(option)}
                        </div>
                        {getOptionDescription(option) && (
                          <div className="text-xs text-gray-500">
                            {getOptionDescription(option)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}

        {/* Resultado do Cálculo */}
        {calculationResult && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Calculator className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-2">Comissão Calculada</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Configuração:</span>
                    <span className="font-medium text-green-800">
                      {calculationResult.option.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Valor da operação:</span>
                    <span className="font-medium text-green-800">
                      {formatCurrency(numericAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Percentual:</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {calculationResult.percentage.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-green-300 pt-2">
                    <span className="text-green-700">Comissão:</span>
                    <span className="text-green-800">
                      {formatCurrency(calculationResult.calculatedValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {numericAmount > 0 && !calculationResult && selectedOption && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              A configuração selecionada não se aplica aos valores informados. 
              Verifique os critérios da faixa.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Produtos
        </CardTitle>
        <CardDescription>
          Clique na configuração desejada para definir o produto e comissão
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default CommissionConfigSelector; 