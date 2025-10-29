import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calculator, Zap, Percent, DollarSign, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { mapProductToCommissionConfig } from "@/utils/productMapping";

interface CommissionRate {
  id: string;
  product: string;
  name: string;
  commission_type: 'percentage' | 'fixed';
  percentage?: number;
  fixed_value?: number;
  active: boolean;
}

interface CommissionTier {
  id: string;
  product: string;
  name: string;
  tier_type: 'value' | 'period';
  min_amount?: number;
  max_amount?: number;
  min_period?: number;
  max_period?: number;
  commission_type: 'percentage' | 'fixed';
  percentage?: number;
  fixed_value?: number;
  active: boolean;
}

interface CommissionConfigSelectorProps {
  selectedProduct: string;
  onConfigSelect: (config: any) => void;
  selectedConfig?: any;
}

const CommissionConfigSelector: React.FC<CommissionConfigSelectorProps> = ({
  selectedProduct,
  onConfigSelect,
  selectedConfig
}) => {
  const [showConfigs, setShowConfigs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fixedRates, setFixedRates] = useState<CommissionRate[]>([]);
  const [variableTiers, setVariableTiers] = useState<CommissionTier[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>(selectedConfig?.id || 'product-only');

  const mappedProduct = mapProductToCommissionConfig(selectedProduct);

  useEffect(() => {
    if (selectedConfig) {
      setSelectedOption(selectedConfig.id);
    } else {
      setSelectedOption('product-only');
    }
  }, [selectedConfig]);

  const loadCommissionConfigs = async () => {
    if (!selectedProduct) {
      toast.error("Selecione um produto primeiro");
      return;
    }

    try {
      setLoading(true);
      
      // Buscar configurações fixas
      const { data: ratesData, error: ratesError } = await supabase
        .from('commission_rates')
        .select('*')
        .eq('product', mappedProduct)
        .eq('active', true);

      // Buscar configurações variáveis
      const { data: tiersData, error: tiersError } = await supabase
        .from('commission_tiers')
        .select('*')
        .eq('product', mappedProduct)
        .eq('active', true)
        .order('min_amount', { ascending: true })
        .order('min_period', { ascending: true });

      if (ratesError) throw ratesError;
      if (tiersError) throw tiersError;

      setFixedRates(ratesData || []);
      setVariableTiers(tiersData || []);
      setShowConfigs(true);

      if ((ratesData?.length || 0) + (tiersData?.length || 0) === 0) {
        toast.info(`Nenhuma configuração de comissão encontrada para ${mappedProduct}`);
      } else {
        toast.success(`${(ratesData?.length || 0) + (tiersData?.length || 0)} configurações encontradas!`);
      }

    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações de comissão');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    if (optionId === 'product-only') {
      onConfigSelect(null);
      return;
    }

    // Buscar configuração selecionada
    const fixedConfig = fixedRates.find(rate => rate.id === optionId);
    const variableConfig = variableTiers.find(tier => tier.id === optionId);
    
    const config = fixedConfig || variableConfig;
    if (config) {
      onConfigSelect({
        id: config.id,
        type: fixedConfig ? 'fixed' : 'variable',
        name: config.name,
        product: config.product,
        commission_type: config.commission_type,
        percentage: config.percentage,
        fixed_value: config.fixed_value,
        tier_type: variableConfig?.tier_type,
        min_amount: variableConfig?.min_amount,
        max_amount: variableConfig?.max_amount,
        min_period: variableConfig?.min_period,
        max_period: variableConfig?.max_period
      });
    }
  };

  const formatRange = (tier: CommissionTier) => {
    if (tier.tier_type === 'value') {
      const min = tier.min_amount ? `R$ ${tier.min_amount.toLocaleString('pt-BR')}` : 'R$ 0';
      const max = tier.max_amount ? `R$ ${tier.max_amount.toLocaleString('pt-BR')}` : 'sem limite';
      return `${min} - ${max}`;
    } else {
      const min = tier.min_period ? `${tier.min_period}x` : '0x';
      const max = tier.max_period ? `${tier.max_period}x` : 'sem limite';
      return `${min} - ${max}`;
    }
  };

  const formatCommissionValue = (rate: CommissionRate | CommissionTier) => {
    if (rate.commission_type === 'fixed') {
      return `R$ ${rate.fixed_value?.toLocaleString('pt-BR') || '0'}`;
    } else {
      return `${rate.percentage || 0}%`;
    }
  };

  if (!selectedProduct) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Calculator className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>Selecione um produto para ver as configurações de comissão</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={loadCommissionConfigs}
          disabled={loading}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Zap className="h-4 w-4" />
          {loading ? 'Carregando...' : 'Gerar Tabelas de Comissão'}
        </Button>
        {/* Removido: exibição do mapeamento do produto */}
      </div>

      {showConfigs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Configurações de Comissão
            </CardTitle>
            <CardDescription>
              Escolha como calcular a comissão para este produto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="commission-config">Configuração de Comissão</Label>
              <Select value={selectedOption} onValueChange={handleConfigSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma configuração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product-only">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Apenas Produto</Badge>
                      <span>Usar configuração padrão</span>
                    </div>
                  </SelectItem>
                  
                  {fixedRates.length > 0 && (
                    <>
                      <Separator />
                      <div className="px-2 py-1 text-sm font-medium text-gray-600">
                        💰 Comissões Fixas
                      </div>
                      {fixedRates.map((rate) => (
                        <SelectItem key={rate.id} value={rate.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {rate.commission_type === 'fixed' ? (
                                <DollarSign className="h-4 w-4 text-green-600" />
                              ) : (
                                <Percent className="h-4 w-4 text-blue-600" />
                              )}
                              <span>{rate.name}</span>
                            </div>
                            <Badge variant="secondary">
                              {formatCommissionValue(rate)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {variableTiers.length > 0 && (
                    <>
                      <Separator />
                      <div className="px-2 py-1 text-sm font-medium text-gray-600">
                        📊 Comissões Variáveis
                      </div>
                      {variableTiers.map((tier) => (
                        <SelectItem key={tier.id} value={tier.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {tier.tier_type === 'value' ? (
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-orange-600" />
                              )}
                              <div>
                                <span className="font-medium">{tier.name}</span>
                                <div className="text-xs text-gray-500">
                                  {formatRange(tier)}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {formatCommissionValue(tier)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedOption !== 'product-only' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">Configuração Selecionada</Badge>
                </div>
                {(() => {
                  const config = fixedRates.find(r => r.id === selectedOption) || 
                              variableTiers.find(t => t.id === selectedOption);
                  if (!config) return null;
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{config.name}</span>
                        <Badge variant="outline">
                          {formatCommissionValue(config)}
                        </Badge>
                      </div>
                      {'tier_type' in config && (
                        <div className="text-sm text-gray-600">
                          Faixa: {formatRange(config as CommissionTier)}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommissionConfigSelector; 