
import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  lead_id: z.string().min(1, { message: "Cliente é obrigatório" }),
  amount: z.string().min(1, { message: "Valor é obrigatório" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  product: z.string().min(1, { message: "Produto é obrigatório" }),
  payment_period: z.string().min(1, { message: "Período de pagamento é obrigatório" }),
});

interface NewCommissionFormProps {
  leads: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: "aprovado", label: "Aprovado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "cancelado", label: "Cancelado" },
];

const periodOptions = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
];

const productOptions = [
  { value: "portabilidade", label: "Portabilidade" },
  { value: "refinanciamento", label: "Refinanciamento" },
  { value: "crefaz", label: "Crefaz" },
  { value: "novo", label: "Novo" },
  { value: "clt", label: "CLT" },
  { value: "fgts", label: "FGTS" },
];

export default function NewCommissionForm({ leads, onSuccess, onCancel }: NewCommissionFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lead_id: "",
      amount: "",
      status: "em_andamento",
      product: "",
      payment_period: "monthly",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const amount = parseFloat(values.amount.replace(/\./g, "").replace(",", "."));

      const { data, error } = await supabase.from("commissions").insert({
        lead_id: values.lead_id,
        amount: amount, 
        status: values.status,
        product: values.product,
        payment_period: values.payment_period,
        user_id: userData.user.id
      });

      if (error) throw error;
      
      toast.success("Comissão cadastrada com sucesso!");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating commission:", error);
      toast.error(`Erro ao cadastrar comissão: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formatCurrencyInput = (value: string) => {
    // Remove all non-digit characters
    let digits = value.replace(/\D/g, "");
    
    // Convert to number and back to string to remove leading zeros
    let number = parseInt(digits, 10) || 0;
    let formatted = number.toString();
    
    // Add thousands separators
    if (formatted.length > 3) {
      formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Add decimal part if value is not zero
    if (number > 0) {
      formatted = formatted + ",00";
    }

    return formatted;
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Comissão</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2">R$</span>
                  <Input
                    className="pl-9"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => {
                      const formattedValue = formatCurrencyInput(e.target.value);
                      field.onChange(formattedValue);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Período de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
