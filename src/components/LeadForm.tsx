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
import { format } from "date-fns";

import BenefitTypeSelect from "@/components/forms/BenefitTypeSelect";
import { BankSelect } from "@/components/forms/BankSelect";
import EmployeeSelect from "@/components/EmployeeSelect";
import { useAuth } from "@/contexts/AuthContext";

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

const LeadForm: React.FC<LeadFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false, isLoading = false }) => {
  const { user } = useAuth ? useAuth() : { user: null };
  const [isInitialized, setIsInitialized] = useState(false);

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
      };
    }

    // Para edição, processar dados corretamente
    const values = {
      name: initialData?.name || "",
      cpf: initialData?.cpf || "",
      phone: initialData?.phone || "",
      phone2: initialData?.phone2 || "",
      bank: initialData?.bank || "none",
      product: initialData?.product || "",
      amount: initialData?.amount || "",
      employee: initialData?.employee || "none", 
      notes: initialData?.notes || "",
      benefit_type: initialData?.benefit_type || "none",
      representative_mode: initialData?.representative_mode || "nao",
      representative_name: initialData?.representative_name || "",
      representative_cpf: initialData?.representative_cpf || "",
      date: initialData?.date || new Date().toISOString().slice(0, 10),
    };
    
    console.log("🔧 Form initialized with:", {
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

  useEffect(() => {
    if (isEditing && initialData && isInitialized) {
      const values = getInitialValues();
      reset(values);
    }
  }, [isEditing, initialData, isInitialized, reset]);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const onFormSubmit = (data: FormData) => {
    console.log("🚀 LeadForm - Submitting data:", data);
    
    if (!data.name || data.name.trim() === "") {
      toast.error("Nome é obrigatório");
      return;
    }

    // Processar dados do formulário
    const processedData: ProcessedFormData = {
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      phone2: data.phone2 || null,
      bank: data.bank && data.bank !== "none" ? data.bank : null,
      product: data.product && data.product !== "none" ? data.product : null,
      amount: data.amount || null,
      employee: data.employee && data.employee !== "none" ? data.employee : null,
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
    };

    console.log("📤 LeadForm - Processed data to send:", {
      employee: processedData.employee,
      name: processedData.name,
      originalEmployee: data.employee
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
            value={watch("product") === "" || !watch("product") ? "none" : watch("product")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum produto</SelectItem>
              <SelectItem value="CREDITO CLT">CREDITO CLT</SelectItem>
              <SelectItem value="CREDITO INSS">CREDITO INSS</SelectItem>
              <SelectItem value="CREDITO PRIVADO">CREDITO PRIVADO</SelectItem>
              <SelectItem value="CARTAO BENEFICIO">CARTAO BENEFICIO</SelectItem>
              <SelectItem value="CARTAO CREDITO">CARTAO CREDITO</SelectItem>
              <SelectItem value="PORTABILIDADE">PORTABILIDADE</SelectItem>
              <SelectItem value="REFINANCIAMENTO">REFINANCIAMENTO</SelectItem>
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
          <EmployeeSelect
            value={watch("employee") || "none"}
            onValueChange={(value) => {
              console.log("🎯 Employee changed to:", value);
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
