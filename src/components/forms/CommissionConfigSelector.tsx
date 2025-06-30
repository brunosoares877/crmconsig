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
    
    // Remover símbolos de moeda e espaços, manter apenas números, vírgulas e pontos
    let cleaned = amount.toString().replace(/[^\d,.]/g, '');
    
    // Se tem vírgula e ponto, assumir formato brasileiro: 1.234,56
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Remove pontos (separadores de milhares) e substitui vírgula por ponto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      // Se só tem vírgula, substituir por ponto
      cleaned = cleaned.replace(',', '.');
    }
    
    const parsed = parseFloat(cleaned) || 0;
    console.log('Valor convertido:', { original: amount, cleaned, parsed });
    return parsed;
  }, [amount]);

  const numericPeriod = React.useMemo(() => {
    if (!paymentPeriod) return undefined;
    const parsed = parseInt(paymentPeriod.toString()) || undefined;
    console.log('Período convertido:', { original: paymentPeriod, parsed });
    return parsed;
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
      console.log('Calculando comissão:', {
        selectedOption: selectedOption.name,
        type: selectedOption.type,
        commission_type: selectedOption.commission_type,
        value: selectedOption.value,
        numericAmount,
        numericPeriod,
        min_amount: selectedOption.min_amount,
        max_amount: selectedOption.max_amount,
        min_period: selectedOption.min_period,
        max_period: selectedOption.max_period
      });
      
      const result = calculateCommission(selectedOption, numericAmount, numericPeriod);
      console.log('Resultado do cálculo:', result);
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

  // Se um produto específico está selecionado, auto-expandir apenas esse grupo
  useEffect(() => {
    if (productName && groupedByProduct[productName]) {
      setExpandedGroups(new Set([productName]));
    } else if (!productName) {
      // Se nenhum produto específico, não expandir nenhum automaticamente
      setExpandedGroups(new Set());
    }
  }, [productName, groupedByProduct]);

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
    // Se clicar na mesma opção já selecionada, desselecionar
    if (selectedOption?.id === option.id) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
    }
  };

  const handleClearSelection = () => {
    setSelectedOption(null);
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
            {' '}Configure comissões em <strong>Comissões → Configurar Comissões</strong>.
          </AlertDescription>
        </Alert>
      );
    }

  const content = (
    <>
      <div className="space-y-4">
        {/* Botão para limpar seleção */}
        {selectedOption && (
          <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">
                ✅ {selectedOption.name} selecionado
              </span>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {selectedOption.product}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearSelection}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              🗑️ Limpar
            </Button>
          </div>
        )}

        {/* Produtos Agrupados */}
        {productName ? (
          Object.entries(groupedByProduct)
            .filter(([groupProductName]) => groupProductName === productName)
            .map(([groupProductName, options]) => (
            <div key={groupProductName} className="space-y-2">
              <Collapsible
                open={expandedGroups.has(groupProductName)}
                onOpenChange={() => toggleGroup(groupProductName)}
              >
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between p-3 h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📦 {groupProductName}</span>
                      <Badge variant="secondary">{options.length} configurações</Badge>
                    </div>
                    {expandedGroups.has(groupProductName) ? 
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
                      title={selectedOption?.id === option.id ? "Clique novamente para desselecionar" : "Clique para selecionar"}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {selectedOption?.id === option.id && "✅ "}
                              {option.name}
                            </span>
                            {getOptionBadge(option)}
                          </div>
                          {getOptionDescription(option) && (
                            <div className="text-xs text-gray-500">
                              {getOptionDescription(option)}
                            </div>
                          )}
                          {selectedOption?.id === option.id && (
                            <div className="text-xs text-blue-600 mt-1">
                              💡 Clique novamente para desselecionar
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))
        ) : (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <div className="font-semibold">🎯 Selecione um produto primeiro</div>
                <div className="text-sm">
                  Para calcular a comissão, primeiro selecione um produto no campo "Produto" acima.
                </div>
                <div className="text-sm">
                  Após selecionar o produto, as configurações de comissão específicas aparecerão aqui.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
        
        {/* Alerta quando valores estão fora da faixa */}
        {numericAmount > 0 && !calculationResult && selectedOption && (
          <Alert className="border-amber-200 bg-amber-50">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="space-y-2">
                <div className="font-semibold">⚠️ Configuração não se aplica aos valores informados</div>
                <div className="text-sm">
                  A configuração "<strong>{selectedOption.name}</strong>" (tipo: {selectedOption.type}) não pode ser aplicada:
                </div>
                <div className="text-sm space-y-1 ml-4">
                  <div>• Valor: <strong>{formatCurrency(numericAmount)}</strong></div>
                  {numericPeriod && <div>• Prazo: <strong>{numericPeriod}x parcelas</strong></div>}
                  <div>• Tipo de comissão: <strong>{selectedOption.commission_type === 'fixed' ? 'Valor fixo' : 'Percentual'}</strong></div>
                  <div>• Produto: <strong>{selectedOption.product}</strong></div>
                </div>
                
                {/* Critérios específicos da configuração */}
                <div className="text-sm mt-2 p-2 bg-amber-100 rounded border">
                  <strong>Critérios da configuração:</strong><br/>
                  {selectedOption.type === 'value_tier' && (
                    <div>
                      📊 Faixa de valor: {selectedOption.min_amount ? formatCurrency(selectedOption.min_amount) : 'sem mínimo'} até {selectedOption.max_amount ? formatCurrency(selectedOption.max_amount) : 'sem máximo'}
                    </div>
                  )}
                  {selectedOption.type === 'period_tier' && (
                    <div>
                      📅 Faixa de período: {selectedOption.min_period ? `${selectedOption.min_period}x` : 'sem mínimo'} até {selectedOption.max_period ? `${selectedOption.max_period}x` : 'sem máximo'}
                    </div>
                  )}
                  {selectedOption.type === 'fixed_rate' && (
                    <div>
                      🎯 Taxa fixa - Deveria funcionar para qualquer valor (possível erro do sistema)
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-amber-700 mt-2">
                  💡 <em>Dicas:</em>
                  <ul className="list-disc list-inside ml-2">
                    <li>Verifique se o valor está dentro da faixa configurada</li>
                    <li>Escolha outra configuração que aceite esses valores</li>
                    <li>Configure novas faixas em "Comissões → Configurar Comissões"</li>
                  </ul>
                </div>
                
                {/* Botão de debug temporário */}
                <div className="mt-3 p-2 bg-gray-100 rounded border">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log('=== DEBUG COMISSÃO ===');
                      console.log('Opção selecionada:', selectedOption);
                      console.log('Valor numérico:', numericAmount);
                      console.log('Período numérico:', numericPeriod);
                      console.log('Teste de cálculo:', calculateCommission(selectedOption, numericAmount, numericPeriod));
                      console.log('=== FIM DEBUG ===');
                    }}
                    className="text-xs"
                  >
                    🔍 Debug no Console
                  </Button>
                  <p className="text-xs text-gray-600 mt-1">
                    Clique para ver informações detalhadas no console do navegador (F12)
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Dica quando há valores mas nenhuma seleção */}
        {numericAmount > 0 && !selectedOption && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <div className="font-semibold">💡 Selecione uma configuração</div>
                <div className="text-sm">
                  Você informou um valor de <strong>{formatCurrency(numericAmount)}</strong>
                  {numericPeriod && ` e prazo de ${numericPeriod}x parcelas`}.
                </div>
                <div className="text-sm">
                  Clique em uma das configurações acima para definir o produto e calcular a comissão.
                </div>
              </div>
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
          Clique na configuração desejada para definir o produto e calcular a comissão
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default CommissionConfigSelector; 