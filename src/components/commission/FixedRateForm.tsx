
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommissionRate } from "@/types/models";

interface FixedRateFormProps {
  onCancel: () => void;
  onSave: () => void;
  initialData?: CommissionRate | null;
}

const FixedRateForm = ({ onCancel, onSave, initialData }: FixedRateFormProps) => {
  const [product, setProduct] = useState(initialData?.product || "");
  const [name, setName] = useState(initialData?.name || "");
  const [percentage, setPercentage] = useState(initialData?.percentage?.toString() || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.trim() || !name.trim() || !percentage.trim()) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const rateData = {
        product: product.trim(),
        name: name.trim(),
        percentage: parseFloat(percentage),
        user_id: userData.user.id,
        active: true
      };

      let error;
      
      if (initialData) {
        // Update existing rate
        const { error: updateError } = await supabase
          .from('commission_rates')
          .update(rateData)
          .eq('id', initialData.id);
        error = updateError;
      } else {
        // Create new rate
        const { error: insertError } = await supabase
          .from('commission_rates')
          .insert(rateData);
        error = insertError;
      }

      if (error) throw error;

      toast.success(initialData ? "Taxa atualizada com sucesso!" : "Taxa criada com sucesso!");
      onSave();
    } catch (error: any) {
      console.error("Error saving rate:", error);
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
            placeholder="Ex: CREDITO CLT"
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
            placeholder="Ex: 8x a 12x"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="percentage">Percentagem *</Label>
        <Input
          id="percentage"
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="Ex: 1.5"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          disabled={loading}
        />
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

export default FixedRateForm;
