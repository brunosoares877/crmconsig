import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import BenefitTypeSelect from "@/components/forms/BenefitTypeSelect";
import { BankSelect } from "@/components/forms/BankSelect";
import EmployeeSelect from "@/components/EmployeeSelect";
import CommissionConfigSelector from "@/components/forms/CommissionConfigSelector";
import { useAuth } from "@/contexts/AuthContext";
import { CommissionCalculationResult, useCommissionConfig } from "@/hooks/useCommissionConfig";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  bank: z.string().optional(),
  product: z.string().optional(),
  amount: z.string().optional(),
  employee: z.string().optional(),
  notes: z.string().optional(),
  benefit_type: z.string().optional(),
  representative_mode: z.string().optional(),
  representative_name: z.string().optional(),
  representative_cpf: z.string().optional(),
  date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Tipo para dados processados
type ProcessedFormData = FormData;

interface LeadFormProps {
  onSubmit: (data: ProcessedFormData) => void;
  onCancel: () => void;
  initialData?: Partial<FormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

// Função para formatar CPF
function formatCPF(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

// Função para formatar moeda brasileira
function formatBRL(value: string) {
  let v = value.replace(/\D/g, "");
  v = (parseInt(v, 10) || 0).toString();
  v = v.padStart(3, "0");
  let cents = v.slice(-2);
  let reais = v.slice(0, -2);
  reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return reais + "," + cents;
}

// Função para extrair data do lead
const getInitialDate = (initialData: any, isEditing: boolean) => {
  if (initialData?.date) return initialData.date;
  if ((initialData as any)?.date) return (initialData as any).date;
  if (isEditing && (initialData as any)?.created_at) {
    // Se estamos editando mas não há data personalizada, usar created_at como referência
    return new Date((initialData as any).created_at).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
};

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false, isLoading = false }) => {
  const { user } = useAuth ? useAuth() : { user: null };
  const [isInitialized, setIsInitialized] = useState(false);
  const [commissionResult, setCommissionResult] = useState<CommissionCalculationResult | null>(null);
  const [showCommissionSection, setShowCommissionSection] = useState(false);
  
  // Hook para buscar todas as configurações de comissão disponíveis
  const { availableOptions: allCommissionOptions, loading: loadingOptions } = useCommissionConfig();
  
  // Criar lista única de produtos (sem duplicatas)
  const availableProducts = useMemo(() => {
    const uniqueProducts = new Set<string>();
    allCommissionOptions.forEach(option => {
      if (option.product) {
        uniqueProducts.add(option.product);
      }
    });
    return Array.from(uniqueProducts).sort();
  }, [allCommissionOptions]);

  console.log("LeadForm rendering - isEditing:", isEditing, "employee:", initialData?.employee);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      phone2: "",
      bank: "none",
      product: "",
      amount: "",
      employee: "none",
      notes: "",
      benefit_type: "none",
      representative_mode: "nao",
      representative_name: "",
      representative_cpf: "",
      date: new Date().toISOString().slice(0, 10),
    }
  });

  const representativeMode = watch("representative_mode");

  // Effect para carregar dados iniciais quando estiver editando
  useEffect(() => {
    if (isEditing && initialData && isInitialized) {
      console.log("🔄 Loading initial data for editing...");
      console.log("📋 Raw initialData.employee:", initialData.employee);
      
      // Processar o valor do employee de forma mais robusta
      let employeeValue = "none";
      if (initialData.employee) {
        if (typeof initialData.employee === 'string' && initialData.employee.trim() !== "") {
          employeeValue = initialData.employee.trim();
        }
      }
      
      console.log("🎯 Processing employee:", initialData.employee, "->", employeeValue);
      
      // Usar setValue individual para garantir que funcione
      setValue("name", initialData?.name || "");
      setValue("cpf", initialData?.cpf || "");
      setValue("phone", initialData?.phone || "");
      setValue("phone2", initialData?.phone2 || "");
      setValue("bank", initialData?.bank || "none");
      setValue("product", initialData?.product || "");
      setValue("amount", initialData?.amount || "");
      setValue("employee", employeeValue);
      setValue("notes", initialData?.notes || "");
      setValue("benefit_type", initialData?.benefit_type || "none");
      setValue("representative_mode", initialData?.representative_mode || "nao");
      setValue("representative_name", initialData?.representative_name || "");
      setValue("representative_cpf", initialData?.representative_cpf || "");
      setValue("date", getInitialDate(initialData, isEditing));
      
      setTimeout(() => {
        console.log("✅ After setValue - employee value:", watch("employee"));
      }, 100);
    }
  }, [isEditing, initialData, isInitialized, setValue, watch]);

  useEffect(() => {
    console.log("LeadForm useEffect - initializing form");
    setIsInitialized(true);
  }, []);

  // Monitorar mudanças no campo employee
  useEffect(() => {
    const currentEmployee = watch("employee");
    if (currentEmployee) {
      console.log("Employee field changed:", currentEmployee);
    }
  }, [watch("employee")]);

  const onFormSubmit = (data: FormData) => {
    console.log("Form submission started with values:", data);
    console.log("Date field being submitted:", data.date);
    
    if (!data.name || data.name.trim() === "") {
      console.error("Validation failed: Name is required");
      toast.error("Nome é obrigatório");
      return;
    }

    // Validar se há produto selecionado quando há valor
    const hasValue = data.amount && parseFloat(data.amount.replace(/[^\d,]/g, '').replace(',', '.')) > 0;
    
    if (hasValue && (!data.product || data.product.trim() === "")) {
      toast.error("⚠️ Selecione uma configuração de produto quando informar valor");
      return;
    }

    // Validar se a comissão foi calculada corretamente quando há produto selecionado
    if (data.product && hasValue && !commissionResult) {
      toast.error("⚠️ A configuração selecionada não se aplica aos valores informados. Verifique as faixas ou escolha outra configuração.");
      return;
    }

    // Processar dados do formulário
    const processedData = {
      ...data,
      employee: data.employee && data.employee !== "none" && data.employee.trim() !== "" ? data.employee.trim() : null,
      bank: data.bank === "none" ? undefined : data.bank,
      product: data.product && data.product.trim() !== "" ? data.product.trim() : undefined,
      benefit_type: data.benefit_type === "none" ? undefined : data.benefit_type
    };

    console.log("Form data processed for submission:", {
      employee: processedData.employee,
      hasProduct: !!processedData.product
    });

    onSubmit(processedData);
  };

  if (!user) {
    return <div className="p-4 text-center text-red-600 font-semibold">Você precisa estar logado para cadastrar um lead.</div>;
  }

  if (!isInitialized) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando formulário...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register("cpf")}
            placeholder="000.000.000-00"
            maxLength={14}
            onChange={e => setValue("cpf", formatCPF(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register("phone")} placeholder="(00) 00000-0000" />
        </div>

        <div>
          <Label htmlFor="phone2">Telefone 2</Label>
          <Input id="phone2" {...register("phone2")} placeholder="(00) 00000-0000" />
        </div>

        <BankSelect
          value={watch("bank") || "none"}
          onValueChange={(value) => setValue("bank", value)}
          label="Banco"
          placeholder="Selecione o banco"
          showNoneOption={true}
        />

        <div>
          <Label htmlFor="product">Produto</Label>
          <Select 
            onValueChange={(value) => setValue("product", value === "none" ? "" : value)}
            value={watch("product") || "none"}
            disabled={loadingOptions}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingOptions ? "Carregando produtos..." : "Selecione o produto"} />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="none">Nenhum produto</SelectItem>
              {availableProducts.map((product) => (
                <SelectItem key={product} value={product}>
                  <div className="flex items-center gap-2">
                    <span>📦 {product}</span>
                    <span className="text-xs text-gray-500">
                      ({allCommissionOptions.filter(opt => opt.product === product).length} configurações)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input id="amount" {...register("amount")}
            placeholder="R$ 0,00"
            onChange={e => setValue("amount", formatBRL(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="employee">Funcionário</Label>
          <div className="space-y-2">
            <EmployeeSelect
              value={watch("employee") || "none"}
              onValueChange={(value) => {
                console.log("🎯 Employee selection changed:", value);
                setValue("employee", value);
                console.log("🔄 After setValue, watch value:", watch("employee"));
              }}
              placeholder="Selecione o funcionário"
            />
            {isEditing && (
              <div className="text-xs text-amber-700 p-2 bg-amber-50 border border-amber-200 rounded">
                💡 <strong>Importante:</strong> Leads que já possuem comissão gerada não devem ter o funcionário alterado para manter a integridade dos dados.
              </div>
            )}
          </div>
        </div>

        <BenefitTypeSelect
          value={watch("benefit_type") || "none"}
          onValueChange={(value) => setValue("benefit_type", value)}
          defaultValue={initialData?.benefit_type || "none"}
        />

        <div>
          <Label htmlFor="representative_mode">Modo Representante</Label>
          <Select onValueChange={(value) => setValue("representative_mode", value)} defaultValue={representativeMode || "nao"} value={representativeMode || "nao"}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nao">Não</SelectItem>
              <SelectItem value="sim">Sim</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Data do Lead</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>

        {/* Botão para Calcular Comissão */}
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant={showCommissionSection ? "default" : "outline"}
            onClick={() => setShowCommissionSection(!showCommissionSection)}
            className="flex items-center gap-2"
          >
            <span>💰</span>
            {showCommissionSection ? "Ocultar Cálculo de Comissão" : "Calcular Comissão"}
          </Button>
          
          {commissionResult && !showCommissionSection && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span>✅ Comissão:</span>
              <span className="font-bold">
                R$ {commissionResult.calculatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs">({commissionResult.percentage.toFixed(2)}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Representante - aparece logo após os campos básicos */}
      {representativeMode === "sim" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50 mt-4">
          <div>
            <Label htmlFor="representative_name">Nome do Representante</Label>
            <Input id="representative_name" {...register("representative_name")} />
          </div>
          <div>
            <Label htmlFor="representative_cpf">CPF do Representante</Label>
            <Input id="representative_cpf" {...register("representative_cpf")} 
              placeholder="000.000.000-00"
              maxLength={14}
              onChange={e => setValue("representative_cpf", formatCPF(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Seletor de Configuração de Comissão - Condicional */}
      {showCommissionSection && (
        <div className="mt-4">
          <CommissionConfigSelector
            productName={watch("product") && watch("product") !== "" ? watch("product") : undefined}
            amount={watch("amount") || undefined}
            paymentPeriod={undefined}
            onCommissionCalculated={setCommissionResult}
            onOptionSelected={(option) => {
              // Quando uma opção de comissão é selecionada, definir o produto automaticamente
              if (option?.product) {
                setValue("product", option.product);
              } else {
                // Quando opção é limpa, limpar o produto também
                setValue("product", "");
              }
            }}
            showCard={true}
            autoCalculate={false}
          />
        </div>
      )}

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : (isEditing ? "Atualizar Lead" : "Salvar Lead")}
          {commissionResult && (
            <span className="ml-2 text-xs opacity-75">
              (Com comissão)
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
