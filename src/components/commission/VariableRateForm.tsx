import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommissionTier } from "@/types/models";

interface VariableRateFormProps {
  onCancel: () => void;
  onSave: () => void;
  initialData?: CommissionTier | null;
}

const VariableRateForm: React.FC<VariableRateFormProps> = ({ onCancel, onSave, initialData }) => {
  const [product, setProduct] = useState(initialData?.product || "");
  const [name, setName] = useState(initialData?.name || "");
  const [tierType, setTierType] = useState<'value' | 'period'>(
    initialData?.tier_type || 'value'
  );
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>(
    initialData?.commission_type || 'percentage'
  );
  const [minAmount, setMinAmount] = useState(initialData?.min_amount?.toString() || "");
  const [maxAmount, setMaxAmount] = useState(initialData?.max_amount?.toString() || "");
  const [minPeriod, setMinPeriod] = useState(initialData?.min_period?.toString() || "");
  const [maxPeriod, setMaxPeriod] = useState(initialData?.max_period?.toString() || "");
  const [percentage, setPercentage] = useState(initialData?.percentage?.toString() || "");
  const [fixedValue, setFixedValue] = useState(initialData?.fixed_value?.toString() || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !name) {
      toast.error("Produto e nome são obrigatórios");
      return;
    }

    if (tierType === 'value' && !minAmount) {
      toast.error("Valor mínimo é obrigatório para faixa por valor");
      return;
    }

    if (tierType === 'period' && !minPeriod) {
      toast.error("Período mínimo é obrigatório para faixa por prazo");
      return;
    }

    if (commissionType === 'percentage' && !percentage) {
      toast.error("Percentagem é obrigatória para comissão percentual");
      return;
    }

    if (commissionType === 'fixed' && !fixedValue) {
      toast.error("Valor fixo é obrigatório para comissão fixa");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const tierData = {
        product,
        name,
        tier_type: tierType,
        commission_type: commissionType,
        min_amount: tierType === 'value' ? parseFloat(minAmount) : 0,
        max_amount: tierType === 'value' && maxAmount ? parseFloat(maxAmount) : null,
        min_period: tierType === 'period' ? parseInt(minPeriod) : null,
        max_period: tierType === 'period' && maxPeriod ? parseInt(maxPeriod) : null,
        percentage: commissionType === 'percentage' ? parseFloat(percentage) : 0,
        fixed_value: commissionType === 'fixed' ? parseFloat(fixedValue) : null,
        user_id: user.id,
        active: true,
      };

      let result;
      if (initialData) {
        result = await supabase
          .from('commission_tiers')
          .update(tierData)
          .eq('id', initialData.id);
      } else {
        result = await supabase
          .from('commission_tiers')
          .insert(tierData);
      }

      if (result.error) throw result.error;

      toast.success(`Taxa de comissão ${initialData ? 'atualizada' : 'criada'} com sucesso!`);
      onSave();
    } catch (error: any) {
      console.error("Error saving commission tier:", error);
      toast.error(`Erro ao ${initialData ? 'atualizar' : 'criar'} taxa de comissão: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Produto *</Label>
          <Input
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Ex: Portabilidade, Crefaz, Novo, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nome da Taxa *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Faixa básica, Faixa premium..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Tipo de Faixa *</Label>
        <RadioGroup 
          value={tierType} 
          onValueChange={(value: 'value' | 'period') => setTierType(value)}
          className="flex flex-col space-y-3"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="value" id="tier-value" />
            <div className="flex-1">
              <Label htmlFor="tier-value" className="font-medium cursor-pointer">
                💰 Por Valor da Venda
              </Label>
              <p className="text-sm text-gray-500">
                Comissão baseada na faixa do valor da venda (ex: R$ 1.000 a R$ 5.000)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="period" id="tier-period" />
            <div className="flex-1">
              <Label htmlFor="tier-period" className="font-medium cursor-pointer">
                📅 Por Prazo de Pagamento
              </Label>
              <p className="text-sm text-gray-500">
                Comissão baseada no número de parcelas (ex: 8x a 12x, 13x a 24x)
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {tierType === 'value' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-amount">Valor Mínimo (R$) *</Label>
            <Input
              id="min-amount"
              type="number"
              step="0.01"
              min="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Ex: 1000.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-amount">Valor Máximo (R$)</Label>
            <Input
              id="max-amount"
              type="number"
              step="0.01"
              min="0"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Ex: 5000.00 (vazio = sem limite)"
            />
            <p className="text-sm text-gray-500">
              Deixe vazio para indicar "sem limite máximo"
            </p>
          </div>
        </div>
      )}

      {tierType === 'period' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-period">Período Mínimo (parcelas) *</Label>
            <Input
              id="min-period"
              type="number"
              min="1"
              value={minPeriod}
              onChange={(e) => setMinPeriod(e.target.value)}
              placeholder="Ex: 8"
            />
            <p className="text-sm text-gray-500">
              Número mínimo de parcelas (ex: 8 para 8x)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-period">Período Máximo (parcelas)</Label>
            <Input
              id="max-period"
              type="number"
              min="1"
              value={maxPeriod}
              onChange={(e) => setMaxPeriod(e.target.value)}
              placeholder="Ex: 12 (vazio = sem limite)"
            />
            <p className="text-sm text-gray-500">
              Número máximo de parcelas (deixe vazio para sem limite)
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Label>Tipo de Comissão *</Label>
        <RadioGroup 
          value={commissionType} 
          onValueChange={(value: 'percentage' | 'fixed') => setCommissionType(value)}
          className="flex flex-col space-y-3"
        >
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="percentage" id="percentage" />
            <div className="flex-1">
              <Label htmlFor="percentage" className="font-medium cursor-pointer">
                📊 Comissão Percentual
              </Label>
              <p className="text-sm text-gray-500">
                Comissão calculada como % do valor da venda
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
            <RadioGroupItem value="fixed" id="fixed" />
            <div className="flex-1">
              <Label htmlFor="fixed" className="font-medium cursor-pointer">
                💰 Comissão Fixa
              </Label>
              <p className="text-sm text-gray-500">
                Valor fixo para esta faixa de valores
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {commissionType === 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="percentage-value">Percentagem (%) *</Label>
          <Input
            id="percentage-value"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Ex: 2.5"
          />
          <p className="text-sm text-gray-500">
            Digite o percentual de comissão (exemplo: 2.5 para 2,5%)
          </p>
        </div>
      )}

      {commissionType === 'fixed' && (
        <div className="space-y-2">
          <Label htmlFor="fixed-value">Valor Fixo (R$) *</Label>
          <Input
            id="fixed-value"
            type="number"
            step="0.01"
            min="0"
            value={fixedValue}
            onChange={(e) => setFixedValue(e.target.value)}
            placeholder="Ex: 150.00"
          />
          <p className="text-sm text-gray-500">
            Digite o valor fixo da comissão para esta faixa
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : (initialData ? "Atualizar" : "Criar")}
        </Button>
      </div>
    </form>
  );
};

export default VariableRateForm;
