import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommissionRate } from "@/types/models";
import type { PostgrestError } from "@/types/database.types";
import logger from "@/utils/logger";

interface FixedRateFormProps {
  onCancel: () => void;
  onSave: () => void;
  initialData?: CommissionRate | null;
}

const FixedRateForm: React.FC<FixedRateFormProps> = ({ onCancel, onSave, initialData }) => {
  const [product, setProduct] = useState(initialData?.product || "");
  const [name, setName] = useState(initialData?.name || "");
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>(
    initialData?.commission_type || 'percentage'
  );
  const [percentage, setPercentage] = useState(initialData?.percentage?.toString() || "");
  const [fixedValue, setFixedValue] = useState(initialData?.fixed_value?.toString() || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !name) {
      toast.error("Produto e nome são obrigatórios");
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

      const rateData = {
        product,
        name,
        commission_type: commissionType,
        percentage: commissionType === 'percentage' ? parseFloat(percentage) : 0,
        fixed_value: commissionType === 'fixed' ? parseFloat(fixedValue) : null,
        user_id: user.id,
        active: true,
      };

      let result;
      if (initialData) {
        result = await supabase
          .from('commission_rates')
          .update(rateData)
          .eq('id', initialData.id);
      } else {
        result = await supabase
          .from('commission_rates')
          .insert(rateData);
      }

      if (result.error) throw result.error;

      toast.success(`Taxa de comissão ${initialData ? 'atualizada' : 'criada'} com sucesso!`);
      onSave();
    } catch (error) {
      const err = error as PostgrestError;
      logger.error("Error saving commission rate", err);
      toast.error(`Erro ao ${initialData ? 'atualizar' : 'criar'} taxa de comissão: ${err.message}`);
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
            placeholder="Ex: Taxa padrão, Promoção especial..."
          />
        </div>
      </div>

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
                Valor fixo independente do valor da venda
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
            Digite o valor fixo da comissão em reais
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

export default FixedRateForm;
