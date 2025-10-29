
import React, { useState, useEffect } from "react";
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
import { CommissionTier } from "@/types/models";
import { getEmployees, Employee } from "@/utils/employees";

const formSchema = z.object({
  lead_id: z.string().min(1, { message: "Cliente é obrigatório" }),
  amount: z.string().min(1, { message: "Valor é obrigatório" }),
  status: z.string().min(1, { message: "Status é obrigatório" }),
  product: z.string().min(1, { message: "Produto é obrigatório" }),
  payment_period: z.string().min(1, { message: "Período de pagamento é obrigatório" }),
  employee: z.string().min(1, { message: "Funcionário é obrigatório" }),
});

interface NewCommissionFormProps {
  leads: Array<{ id: string; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "paid", label: "Pago" },
  { value: "cancelled", label: "Cancelado" },
];

const periodOptions = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
];

const productOptions = [
  { value: "CREDITO FGTS", label: "CRÉDITO FGTS" },
  { value: "CREDITO CLT", label: "CRÉDITO CLT" },
  { value: "CREDITO PIX/CARTAO", label: "CRÉDITO PIX/CARTÃO" },
  { value: "CREDITO INSS", label: "CRÉDITO INSS" },
  { value: "PORTABILIDADE INSS", label: "PORTABILIDADE INSS" },
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
      status: "pending",
      product: "",
      payment_period: "monthly",
      employee: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [calculatedCommission, setCalculatedCommission] = useState<number | null>(null);
  const [flatRates, setFlatRates] = useState<Record<string, number>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  const watchAmount = form.watch("amount");
  const watchProduct = form.watch("product");

  useEffect(() => {
    // Fetch commission tiers from the database
    async function fetchCommissionTiers() {
      try {
        const { data, error } = await supabase
          .from("commission_tiers")
          .select("*")
          .eq("active", true);

        if (error) throw error;

        if (data) {
          setCommissionTiers(data as CommissionTier[]);
        }
      } catch (error: any) {
        console.error("Error fetching commission tiers:", error);
      }
    }

    // Fetch flat commission rates
    async function fetchCommissionRates() {
      try {
        const { data, error } = await supabase
          .from("commission_rates")
          .select("*")
          .eq("active", true);

        if (error) throw error;

        if (data) {
          const rateMap: Record<string, number> = {};
          data.forEach(rate => {
            rateMap[rate.product] = rate.percentage;
          });
          setFlatRates(rateMap);
        }
      } catch (error: any) {
        console.error("Error fetching commission rates:", error);
      }
    }

    // Fetch employees
    async function fetchEmployees() {
      const employeeList = await getEmployees();
      setEmployees(employeeList);
    }

    fetchCommissionTiers();
    fetchCommissionRates();
    fetchEmployees();
  }, []);

  // Calculate commission based on amount and product whenever they change
  useEffect(() => {
    if (watchAmount && watchProduct) {
      calculateCommission(parseFloat(watchAmount.replace(/\./g, "").replace(",", ".")), watchProduct);
    } else {
      setCalculatedCommission(null);
    }
  }, [watchAmount, watchProduct, commissionTiers, flatRates]);

  const calculateCommission = (amount: number, product: string) => {
    // First check if there are any tiers for this product
    const productTiers = commissionTiers.filter(tier => tier.product === product);
    
    if (productTiers.length > 0) {
      // Find the applicable tier
      const applicableTier = productTiers.find(tier => {
        const minAmount = tier.min_amount;
        const maxAmount = tier.max_amount;
        
        if (maxAmount === null) {
          // No maximum, just check minimum
          return amount >= minAmount;
        } else {
          // Check if amount is in range
          return amount >= minAmount && amount <= maxAmount;
        }
      });
      
      if (applicableTier) {
        const commission = (amount * applicableTier.percentage) / 100;
        setCalculatedCommission(commission);
        return;
      }
    }
    
    // If no tiers found or no applicable tier, use flat rate
    if (flatRates[product]) {
      const commission = (amount * flatRates[product]) / 100;
      setCalculatedCommission(commission);
    } else {
      setCalculatedCommission(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const amount = parseFloat(values.amount.replace(/\./g, "").replace(",", "."));
      
      // If we have a calculated commission, use that as the commission amount
      const commissionAmount = calculatedCommission !== null ? calculatedCommission : amount;

      const { data, error } = await supabase.from("commissions").insert({
        lead_id: values.lead_id,
        amount: amount,
        commission_value: commissionAmount,
        percentage: flatRates[values.product] || 0,
        status: values.status,
        product: values.product,
        payment_period: values.payment_period,
        employee: values.employee,
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Operação</FormLabel>
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

        {calculatedCommission !== null && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium">
              Comissão calculada: 
              <span className="text-green-600 ml-2">
                R$ {calculatedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="employee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Funcionário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.name}>
                      {employee.name}
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
