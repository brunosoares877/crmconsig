import React, { useEffect, useState } from "react";
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
import { format } from "date-fns";
import { useProducts } from "@/hooks/useProducts";

export const formSchema = z.object({
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
  payment_period: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;

export type ProcessedFormData = FormData;

import BenefitTypeSelect from "@/components/forms/BenefitTypeSelect";
import { BankSelect } from "@/components/forms/BankSelect";
import EmployeeSelect from "@/components/EmployeeSelect";
import { useAuth } from "@/contexts/AuthContext";
import { getEmployees, Employee } from "@/utils/employees";
import logger from "@/utils/logger";

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

// Função para formatar Telefone (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
export function formatPhone(value: string) {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  
  if (v.length <= 2) {
    return v;
  } else if (v.length <= 6) {
    return `(${v.substring(0, 2)}) ${v.substring(2)}`;
  } else if (v.length <= 10) {
    return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
  } else {
    return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
  }
}

// Função para formatar moeda brasileira
function formatBRL(value: string) {
  let v = value.replace(/\D/g, "");
  v = (parseInt(v, 10) || 0).toString();
  v = v.padStart(3, "0");
  const cents = v.slice(-2);
  let reais = v.slice(0, -2);
  reais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return reais + "," + cents;
}

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false, isLoading = false }) => {
  // FIXED: Call hooks unconditionally at the top level
  const { user } = useAuth();
  const { products: availableProducts, isLoading: loadingProducts } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  // Processar dados iniciais
  const getInitialValues = () => {
    if (!isEditing || !initialData) {
      return {
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
        payment_period: "",
      };
    }

    // Para edição, processar dados corretamente
    // Processar employee: se tiver valor (não null, não undefined, não "none", não vazio), usar ele, senão "none"
    const employeeValue = initialData?.employee &&
      initialData.employee !== null &&
      initialData.employee !== undefined &&
      initialData.employee !== "none" &&
      initialData.employee !== ""
      ? initialData.employee
      : "none";

    const values = {
      name: initialData?.name || "",
      cpf: initialData?.cpf || "",
      phone: initialData?.phone || "",
      phone2: initialData?.phone2 || "",
      bank: initialData?.bank || "none",
      product: initialData?.product || "",
      amount: initialData?.amount || "",
      employee: employeeValue,
      notes: initialData?.notes || "",
      benefit_type: initialData?.benefit_type || "none",
      representative_mode: initialData?.representative_mode || "nao",
      representative_name: initialData?.representative_name || "",
      representative_cpf: initialData?.representative_cpf || "",
      date: initialData?.date || new Date().toISOString().slice(0, 10),
      payment_period: initialData?.payment_period || "",
    };

    logger.debug("🔧 Form initialized with", {
      employee: values.employee,
      originalEmployee: initialData?.employee
    });

    return values;
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues()
  });

  const representativeMode = watch("representative_mode");
  const currentProduct = watch("product");
  const currentAmount = watch("amount");
  const currentPeriod = watch("payment_period");

  // Sincronizar o valor do employee quando a lista de funcionários carregar e houver um valor inicial
  useEffect(() => {
    if (isEditing && initialData?.employee && employeeList.length > 0) {
      const employeeId = initialData.employee;
      const employeeExists = employeeList.find(emp => emp.id === employeeId);
      const currentFormValue = watch("employee");

      // Apenas atualizar se o valor atual não corresponder ao valor esperado
      if (currentFormValue !== employeeId) {
        if (employeeExists) {
          logger.debug("🔄 Sincronizando employee no formulário:", employeeId, "→", employeeExists.name);
          setValue("employee", employeeId, { shouldValidate: false, shouldDirty: false });
        } else {
          console.warn("⚠️ Funcionário não encontrado na lista:", employeeId);
          // Manter o ID mesmo que não esteja na lista (funcionário pode ter sido desativado)
          if (currentFormValue === "none" || !currentFormValue) {
            setValue("employee", employeeId, { shouldValidate: false, shouldDirty: false });
          }
        }
      }
    }
  }, [employeeList, isEditing, initialData?.employee, setValue, watch]);

  useEffect(() => {
    if (isEditing && initialData && isInitialized) {
      const values = getInitialValues();
      logger.debug("🔄 Resetando formulário com valores", {
        employee: values.employee,
        originalEmployee: initialData?.employee,
        employeeListLength: employeeList.length
      });
      reset(values);

      // Se houver employee e a lista já estiver carregada, garantir que o valor seja definido
      if (values.employee && values.employee !== "none" && employeeList.length > 0) {
        setTimeout(() => {
          setValue("employee", values.employee);
          logger.debug("✅ Employee definido após reset:", values.employee);
        }, 100);
      }
    }
  }, [isEditing, initialData, isInitialized, reset, setValue, employeeList]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    getEmployees().then(setEmployeeList);
  }, []);

  const onFormSubmit = async (data: FormData) => {
    logger.debug("🚀 LeadForm - Submitting data", data);

    if (!data.name || data.name.trim() === "") {
      toast.error("Nome é obrigatório");
      return;
    }

    // Processar dados do formulário
    // Garantir que o employee seja o valor atual do watch, não apenas do data
    const currentEmployee = watch("employee");
    const employeeValue = currentEmployee && currentEmployee !== "none" && currentEmployee !== "" ? currentEmployee : null;

    const processedData: ProcessedFormData = {
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      phone2: data.phone2 || null,
      bank: data.bank && data.bank !== "none" ? data.bank : null,
      product: data.product && data.product !== "none" ? data.product : null,
      amount: data.amount || null,
      employee: employeeValue, // usar o valor atual do campo
      notes: data.notes || "",
      benefit_type: data.benefit_type && data.benefit_type !== "none" ? data.benefit_type : null,
      representative_mode: data.representative_mode || "nao",
      representative_name: data.representative_mode === "sim" && data.representative_name
        ? data.representative_name
        : null,
      representative_cpf: data.representative_mode === "sim" && data.representative_cpf
        ? data.representative_cpf
        : null,
      date: data.date || format(new Date(), "yyyy-MM-dd"),
      payment_period: data.payment_period || null,
    };

    logger.debug("📤 LeadForm - Processed data to send", {
      employee: processedData.employee,
      employeeType: typeof processedData.employee,
      name: processedData.name,
      originalEmployee: data.employee,
      currentEmployeeFromWatch: currentEmployee,
      allProcessedData: processedData
    });

     if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSubmit(processedData);
      } finally {
        setIsSubmitting(false);
      }
    };
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

  const getEmployeeNameById = (id: string | undefined) => {
    if (!id || id === "none") return "Nenhum funcionário";
    const emp = employeeList.find(e => e.id === id);
    return emp ? emp.name : "Funcionário não encontrado";
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
          <Input id="phone" {...register("phone")} 
            placeholder="(00) 00000-0000" 
            maxLength={15}
            onChange={e => setValue("phone", formatPhone(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="phone2">Telefone 2</Label>
          <Input id="phone2" {...register("phone2")} 
            placeholder="(00) 00000-0000" 
            maxLength={15}
            onChange={e => setValue("phone2", formatPhone(e.target.value))}
          />
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
            onValueChange={(value) => {
              setValue("product", value === "none" ? "" : value);
              setSelectedCommissionConfig(null); // Limpar configuração quando produto mudar
            }}
            value={watch("product") === "" || !watch("product") ? "none" : watch("product")}
            disabled={loadingProducts}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingProducts ? "Carregando produtos..." : "Selecione o produto"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum produto</SelectItem>
              {availableProducts.map((product) => (
                <SelectItem key={product} value={product}>
                  {product}
                </SelectItem>
              ))}
              {availableProducts.length === 0 && !loadingProducts && (
                <SelectItem value="no-products" disabled>
                  Nenhum produto configurado
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {availableProducts.length === 0 && !loadingProducts && (
            <p className="text-sm text-amber-600 mt-1">
              ⚠️ Configure produtos em "Configurações → Configurações de Leads"
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="amount">Valor</Label>
          <Input id="amount" {...register("amount")}
            placeholder="R$ 0,00"
            onChange={e => setValue("amount", formatBRL(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="payment_period">Prazo de Pagamento (parcelas)</Label>
          <Select
            onValueChange={(value) => setValue("payment_period", value === "none" ? "" : value)}
            value={watch("payment_period") === "" || !watch("payment_period") ? "none" : watch("payment_period")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Não informado</SelectItem>
              {Array.from({ length: 120 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={month.toString()}>
                  {month}x parcelas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="employee">Funcionário</Label>
          <EmployeeSelect
            value={watch("employee") || "none"}
            onValueChange={(value) => {
              logger.debug("🎯 Employee changed to (id):", value);
              setValue("employee", value);
            }}
            placeholder="Selecione o funcionário"
          />
        </div>

        <BenefitTypeSelect
          value={watch("benefit_type") || "none"}
          onValueChange={(value) => setValue("benefit_type", value)}
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
      </div>


      {/* Seção de Representante */}
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

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Criar Lead"}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
