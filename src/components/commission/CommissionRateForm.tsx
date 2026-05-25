
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommissionRate } from "@/types/models";

const formSchema = z.object({
  product: z.string().min(1, { message: "Produto é obrigatório" }),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  percentage: z.string().min(1, { message: "Percentual é obrigatório" }),
});

interface CommissionRateFormProps {
  initialData?: CommissionRate | null;
  onCancel: () => void;
  onSave: () => void;
}

export default function CommissionRateForm({ initialData, onCancel, onSave }: CommissionRateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product: initialData?.product || "",
      name: initialData?.name || "",
      percentage: initialData ? String(initialData.percentage) : "",
    },
  });

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
        percentage: parseFloat(values.percentage.replace(",", ".")),
        user_id: userData.user.id,
        active: initialData?.active !== undefined ? initialData.active : true,
      };
      
      if (initialData?.id) {
        // Update existing rate
        const { error } = await supabase
          .from("commission_rates")
          .update(commissionData)
          .eq("id", initialData.id);
          
        if (error) throw error;
        toast.success("Taxa de comissão atualizada com sucesso");
      } else {
        // Insert new rate
        const { error } = await supabase
          .from("commission_rates")
          .insert(commissionData);
          
        if (error) throw error;
        toast.success("Taxa de comissão criada com sucesso");
      }
      
      onSave();
    } catch (error: any) {
      console.error("Error saving commission rate:", error);
      toast.error(`Erro ao salvar taxa de comissão: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
              <FormLabel>Nome da Taxa</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Taxa padrão, Taxa premium, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
