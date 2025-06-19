import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import BenefitTypeSelect from "@/components/forms/BenefitTypeSelect";
import BankSelect from "@/components/forms/BankSelect";
import ProductSelect from "@/components/forms/ProductSelect";
import EmployeeSelect from "@/components/EmployeeSelect";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  phone3: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  bank: z.string().optional(),
  product: z.string().optional(),
  amount: z.string().optional(),
  employee: z.string().optional(),
  notes: z.string().optional(),
  benefit_type: z.string().optional(),
  representative_mode: z.string().optional(),
  representative_name: z.string().optional(),
  representative_cpf: z.string().optional(),
  selectedTags: z.array(z.string()).optional(),
  date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LeadFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  initialData?: Partial<FormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string;
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.selectedTags || []);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log("LeadForm rendering - user:", user, "isEditing:", isEditing);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      cpf: initialData?.cpf || "",
      phone: initialData?.phone || "",
      phone2: initialData?.phone2 || "",
      phone3: initialData?.phone3 || "",
      email: initialData?.email || "",
      bank: initialData?.bank || "",
      product: initialData?.product || "",
      amount: initialData?.amount || "",
      employee: initialData?.employee || "",
      notes: initialData?.notes || "",
      benefit_type: initialData?.benefit_type || "",
      representative_mode: initialData?.representative_mode || "nao",
      representative_name: initialData?.representative_name || "",
      representative_cpf: initialData?.representative_cpf || "",
      selectedTags: initialData?.selectedTags || [],
      date: initialData?.date || new Date().toISOString().slice(0, 10),
    }
  });

  const representativeMode = watch("representative_mode");

  useEffect(() => {
    console.log("LeadForm useEffect - fetching tags");
    const initializeForm = async () => {
      try {
        await fetchTags();
        if (isEditing && initialData?.selectedTags) {
          setSelectedTags(initialData.selectedTags);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing form:", error);
        setIsInitialized(true); // Set to true even on error to prevent infinite loading
      }
    };
    
    initializeForm();
  }, [isEditing, initialData]);

  const fetchTags = async () => {
    try {
      console.log("Fetching tags...");
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await (supabase as any)
        .from('lead_tags')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('name');

      if (error) throw error;
      console.log("Tags fetched successfully:", data?.length || 0);
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Don't throw error, just set empty array
      setTags([]);
    }
  };

  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newSelectedTags);
    setValue('selectedTags', newSelectedTags);
  };

  const removeTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter(id => id !== tagId);
    setSelectedTags(newSelectedTags);
    setValue('selectedTags', newSelectedTags);
  };

  const onFormSubmit = (data: FormData) => {
    console.log("Form submission started with values:", data);
    
    if (!data.name || data.name.trim() === "") {
      console.error("Validation failed: Name is required");
      toast.error("Nome é obrigatório");
      return;
    }

    const submitData = {
      ...data,
      selectedTags
    };

    console.log("Calling onSubmit with data:", submitData);
    onSubmit(submitData);
  };

  const getSelectedTagsDisplay = () => {
    return selectedTags.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? (
        <Badge 
          key={tagId} 
          variant="outline" 
          className="mr-1 mb-1"
          style={{ borderColor: tag.color, color: tag.color }}
        >
          {tag.name}
          <button
            type="button"
            className="ml-1 hover:bg-gray-200 rounded-full"
            onClick={() => removeTag(tagId)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ) : null;
    });
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

        <div>
          <Label htmlFor="phone3">Telefone 3</Label>
          <Input id="phone3" {...register("phone3")} placeholder="(00) 00000-0000" />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <BankSelect
          value={watch("bank") || ""}
          onValueChange={(value) => setValue("bank", value)}
          defaultValue={initialData?.bank || ""}
        />

        <ProductSelect
          value={watch("product") || ""}
          onValueChange={(value) => setValue("product", value)}
          defaultValue={initialData?.product || ""}
        />

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
            value={watch("employee") || ""}
            onValueChange={(value) => setValue("employee", value)}
            placeholder="Selecione o funcionário"
          />
        </div>

        <BenefitTypeSelect
          value={watch("benefit_type") || ""}
          onValueChange={(value) => setValue("benefit_type", value)}
          defaultValue={initialData?.benefit_type || ""}
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

      {representativeMode === "sim" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <Label htmlFor="representative_name">Nome do Representante</Label>
            <Input id="representative_name" {...register("representative_name")} />
          </div>
          <div>
            <Label htmlFor="representative_cpf">CPF do Representante</Label>
            <Input id="representative_cpf" {...register("representative_cpf")} placeholder="000.000.000-00" />
          </div>
        </div>
      )}

      <div>
        <Label>Etiquetas</Label>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className={`cursor-pointer transition-all ${
                  selectedTags.includes(tag.id) 
                    ? 'ring-2 ring-offset-1' 
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: selectedTags.includes(tag.id) ? 'white' : tag.color
                }}
                onClick={() => toggleTag(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground">Etiquetas selecionadas:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {getSelectedTagsDisplay()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Salvando..." : (isEditing ? "Atualizar Lead" : "Salvar Lead")}</Button>
      </div>
    </form>
  );
};

export default LeadForm;
