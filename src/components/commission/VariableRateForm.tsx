
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommissionTier } from "@/types/models";

interface VariableRateFormProps {
  onCancel: () => void;
  onSave: () => void;
  initialData?: CommissionTier | null;
}

const VariableRateForm = ({ onCancel, onSave, initialData }: VariableRateFormProps) => {
  const [product, setProduct] = useState(initialData?.product || "");
  const [name, setName] = useState(initialData?.name || "");
  const [minAmount, setMinAmount] = useState(initialData?.min_amount?.toString() || "");
  const [maxAmount, setMaxAmount] = useState(initialData?.max_amount?.toString() || "");
  const [percentage, setPercentage] = useState(initialData?.percentage?.toString() || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.trim() || !name.trim() || !minAmount.trim() || !percentage.trim()) {
      toast.error("Produto, nome, valor mínimo e percentagem são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const tierData = {
        product: product.trim(),
        name: name.trim(),
        min_amount: parseFloat(minAmount),
        max_amount: maxAmount.trim() ? parseFloat(maxAmount) : null,
        percentage: parseFloat(percentage),
        user_id: userData.user.id,
        active: true
      };

      let error;
      
      if (initialData) {
        // Update existing tier
        const { error: updateError } = await supabase
          .from('commission_tiers')
          .update(tierData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        // Create new tier
        const { error: insertError } = await supabase
          .from('commission_tiers')
          .insert(tierData);
        error = insertError;
      }

      if (error) throw error;

      toast.success(initialData ? "Taxa atualizada com sucesso!" : "Taxa criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Error saving tier:", error);
      toast.error("Erro ao salvar taxa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product">Produto *</Label>
          <Input
            id="product"
            type="text"
            placeholder="Ex: CREDITO FGTS"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Ex: Até R$ 250,00"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="minAmount">Valor Mínimo *</Label>
          <Input
            id="minAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 0"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="maxAmount">Valor Máximo</Label>
          <Input
            id="maxAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Deixe vazio para sem limite"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="percentage">Percentagem *</Label>
          <Input
            id="percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="Ex: 15"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
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
