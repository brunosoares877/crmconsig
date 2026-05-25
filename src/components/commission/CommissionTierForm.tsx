
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CommissionTier } from "@/types/models";

const formSchema = z.object({
  product: z.string().min(1, { message: "Produto é obrigatório" }),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  min_amount: z.string().min(1, { message: "Valor mínimo é obrigatório" }),
  max_amount: z.string().optional(),
  percentage: z.string().min(1, { message: "Percentual é obrigatório" }),
  has_max: z.boolean().default(true),
});

interface CommissionTierFormProps {
  initialData?: CommissionTier | null;
  onCancel: () => void;
  onSave: () => void;
}

export default function CommissionTierForm({ initialData, onCancel, onSave }: CommissionTierFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: initialData?.product || "",
      name: initialData?.name || "",
      min_amount: initialData ? String(initialData.min_amount) : "",
      max_amount: initialData?.max_amount ? String(initialData.max_amount) : "",
      percentage: initialData ? String(initialData.percentage) : "",
      has_max: initialData ? initialData.max_amount !== null : true,
    },
  });

  const hasMaxValue = form.watch("has_max");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      const commissionData = {
        product: values.product,
        name: values.name,
        min_amount: parseFloat(values.min_amount.replace(/\./g, "").replace(",", ".")),
        max_amount: values.has_max ? parseFloat(values.max_amount?.replace(/\./g, "").replace(",", ".") || "0") : null,
        percentage: parseFloat(values.percentage.replace(",", ".")),
        user_id: userData.user.id,
        active: initialData?.active !== undefined ? initialData.active : true,
      };
      
      if (initialData?.id) {
        // Update existing tier
        const { error } = await supabase
          .from("commission_tiers")
          .update(commissionData)
          .eq("id", initialData.id);
          
        if (error) throw error;
        toast.success("Nível de comissão atualizado com sucesso");
      } else {
        // Insert new tier
        const { error } = await supabase
          .from("commission_tiers")
          .insert(commissionData);
          
        if (error) throw error;
        toast.success("Nível de comissão criado com sucesso");
      }
      
      onSave();
    } catch (error: any) {
      console.error("Error saving commission tier:", error);
      toast.error(`Erro ao salvar nível de comissão: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrencyInput = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    
    // Convert to number and back to string to remove leading zeros
    const number = parseInt(digits, 10) || 0;
    let formatted = number.toString();
    
    // Add thousands separators
    if (formatted.length > 3) {
      formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    return formatted;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Portabilidade, Crefaz, Novo, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Nível</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Básico, Intermediário, Premium, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="min_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Mínimo (R$)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 1000" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(formatCurrencyInput(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="has_max"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div>
                <FormLabel>Possui valor máximo?</FormLabel>
                <FormDescription>
                  Desative para não ter limite máximo
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {hasMaxValue && (
          <FormField
            control={form.control}
            name="max_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Máximo (R$)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: 5000" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(formatCurrencyInput(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Percentual (%)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 2.5" 
                  {...field} 
                  onChange={(e) => {
                    // Allow only numbers and a single comma or dot
                    const value = e.target.value.replace(/[^\d.,]/g, "");
                    // Replace the last dot or comma with the current one
                    const formatted = value.replace(/[.,]/g, (match, index, str) => {
                      return index === str.lastIndexOf(match) ? match : "";
                    });
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
