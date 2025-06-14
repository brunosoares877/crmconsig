import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { getEmployees, Employee } from "@/utils/employees";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  cpf: z.string().min(11, { message: "CPF inválido." }),
  phone: z.string().min(10, { message: "Telefone inválido." }),
  phone2: z.string().optional(),
  phone3: z.string().optional(),
  bank: z.string().min(1, { message: "Selecione um banco." }),
  product: z.string().min(1, { message: "Selecione um produto." }),
  amount: z.string().min(1, { message: "Digite um valor." }),
  status: z.string().default("novo"),
  employee: z.string().optional(),
  notes: z.string().optional(),
  benefit_type: z.string().min(1, { message: "Selecione a espécie de benefício." }),
  representative_mode: z.string().default("nao"),
  representative_name: z.string().optional(),
  representative_cpf: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  onSubmit: (values: FormValues) => void;
  onCancel: () => void;
  initialData?: any;
  isLoading?: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isLoading = false 
}) => {
  const [benefitTypes, setBenefitTypes] = useState<{code: string, description: string}[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [existingClient, setExistingClient] = useState<any>(null);
  const [isCheckingClient, setIsCheckingClient] = useState(false);
  const [hasRepresentative, setHasRepresentative] = useState(
    initialData?.representative_name || initialData?.representative_cpf ? true : false
  );

  useEffect(() => {
    const fetchBenefitTypes = async () => {
      const { data, error } = await supabase
        .from('benefit_types')
        .select('code, description')
        .order('description');

      if (error) {
        console.error('Error fetching benefit types:', error);
        return;
      }

      setBenefitTypes(data || []);
    };

    const fetchEmployees = async () => {
      const employeeList = await getEmployees();
      setEmployees(employeeList);
    };

    fetchBenefitTypes();
    fetchEmployees();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      phone2: "",
      phone3: "",
      bank: "",
      product: "",
      amount: "",
      status: "novo",
      employee: "",
      notes: "",
      benefit_type: "",
      representative_mode: initialData?.representative_name || initialData?.representative_cpf ? "sim" : "nao",
      representative_name: initialData?.representative_name || "",
      representative_cpf: initialData?.representative_cpf || "",
      ...initialData,
    },
  });

  // Check for existing client when CPF is entered
  const checkExistingClient = async (cpf: string) => {
    if (cpf.length < 14) return; // Wait for complete CPF

    setIsCheckingClient(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("cpf", cpf)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setExistingClient(data[0]);
        // Pre-fill form with existing client data
        const client = data[0];
        form.setValue("name", client.name || "");
        form.setValue("phone", client.phone || "");
        form.setValue("phone2", client.phone2 || "");
        form.setValue("phone3", client.phone3 || "");
        form.setValue("bank", client.bank || "");
        form.setValue("employee", client.employee || "");
        toast.info("Cliente encontrado! Dados preenchidos automaticamente.");
      } else {
        setExistingClient(null);
      }
    } catch (error) {
      console.error("Error checking existing client:", error);
    } finally {
      setIsCheckingClient(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    form.setValue("name", value);
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    
    form.setValue("cpf", value);
    
    // Check for existing client when CPF is complete
    if (value.length === 14) {
      checkExistingClient(value);
    }
  };

  const handlePhoneChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: "phone" | "phone2" | "phone3"
  ) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    
    form.setValue(field, value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = (parseInt(value) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    
    if (value === 'R$ NaN') value = '';
    form.setValue("amount", value);
  };

  const handleRepresentativeCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }

    form.setValue("representative_cpf", value);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      console.log("Form submission started with values:", values);
      
      // Ensure all required fields are present
      const formData = {
        ...values,
        name: values.name.trim(),
        cpf: values.cpf.trim(),
        phone: values.phone.trim(),
      };

      console.log("Calling onSubmit with data:", formData);
      await onSubmit({
        ...values,
        representative_name: values.representative_mode === "sim" ? values.representative_name : "",
        representative_cpf: values.representative_mode === "sim" ? values.representative_cpf : "",
      });
      
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error("Erro ao salvar lead. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full max-w-2xl mx-auto"
      >
        {existingClient && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cliente já cadastrado! Você está adicionando um novo produto para{" "}
              <strong>{existingClient.name}</strong>. 
              Os dados foram preenchidos automaticamente.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do cliente" 
                  {...field} 
                  onChange={handleNameChange}
                  value={field.value}
                  disabled={isLoading} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="000.000.000-00" 
                      {...field} 
                      onChange={handleCPFChange}
                      disabled={isLoading}
                    />
                    {isCheckingClient && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone Principal</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    {...field}
                    onChange={(e) => handlePhoneChange(e, "phone")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone 2</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    {...field}
                    onChange={(e) => handlePhoneChange(e, "phone2")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone 3</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(00) 00000-0000" 
                    {...field}
                    onChange={(e) => handlePhoneChange(e, "phone3")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banco</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o banco" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="caixa">Caixa Econômica Federal</SelectItem>
                    <SelectItem value="bb">Banco do Brasil</SelectItem>
                    <SelectItem value="itau">Itaú</SelectItem>
                    <SelectItem value="bradesco">Bradesco</SelectItem>
                    <SelectItem value="santander">Santander</SelectItem>
                    <SelectItem value="c6">C6 Bank</SelectItem>
                    <SelectItem value="brb">BRB - Banco de Brasília</SelectItem>
                    <SelectItem value="bmg">BMG</SelectItem>
                    <SelectItem value="pan">Banco Pan</SelectItem>
                    <SelectItem value="ole">Banco Olé</SelectItem>
                    <SelectItem value="daycoval">Daycoval</SelectItem>
                    <SelectItem value="mercantil">Mercantil</SelectItem>
                    <SelectItem value="cetelem">Cetelem</SelectItem>
                    <SelectItem value="safra">Safra</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="original">Original</SelectItem>
                    <SelectItem value="facta">Facta</SelectItem>
                    <SelectItem value="bonsucesso">Bonsucesso</SelectItem>
                    <SelectItem value="banrisul">Banrisul</SelectItem>
                    <SelectItem value="sicoob">Sicoob</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Funcionário Responsável</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CREDITO FGTS">CRÉDITO FGTS</SelectItem>
                    <SelectItem value="CREDITO CLT">CRÉDITO CLT</SelectItem>
                    <SelectItem value="CREDITO PIX/CARTAO">CRÉDITO PIX/CARTÃO</SelectItem>
                    <SelectItem value="CREDITO INSS">CRÉDITO INSS</SelectItem>
                    <SelectItem value="PORTABILIDADE INSS">PORTABILIDADE INSS</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                    <SelectItem value="portabilidade">Portabilidade</SelectItem>
                    <SelectItem value="refinanciamento">Refinanciamento</SelectItem>
                    <SelectItem value="fgts">FGTS</SelectItem>
                    <SelectItem value="cartao">Cartão Consignado</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
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
                <FormLabel>Valor do Empréstimo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="R$ 0,00" 
                    {...field}
                    onChange={handleAmountChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contatado">Contatado</SelectItem>
                  <SelectItem value="qualificado">Qualificado</SelectItem>
                  <SelectItem value="negociando">Em andamento</SelectItem>
                  <SelectItem value="convertido">Aprovado</SelectItem>
                  <SelectItem value="perdido">Recusado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações sobre o lead" 
                  className="min-h-24"
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="benefit_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Espécie de Benefício</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a espécie de benefício" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {benefitTypes.map((type) => (
                    <SelectItem key={type.code} value={type.code}>
                      {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PERGUNTA REPRESENTANTE */}
        <div className="flex items-center gap-4 pb-2">
          <span className="font-medium">Possui representante?</span>
          <Button
            type="button"
            variant={form.watch("representative_mode") === "sim" ? "default" : "outline"}
            onClick={() => {
              setHasRepresentative(true);
              form.setValue("representative_mode", "sim");
            }}
            className="rounded-full"
          >
            Sim
          </Button>
          <Button
            type="button"
            variant={form.watch("representative_mode") === "nao" ? "default" : "outline"}
            onClick={() => {
              setHasRepresentative(false);
              form.setValue("representative_mode", "nao");
              form.setValue("representative_name", "");
              form.setValue("representative_cpf", "");
            }}
            className="rounded-full"
          >
            Não
          </Button>
        </div>

        {form.watch("representative_mode") === "sim" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="representative_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Representante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo do representante"
                      {...field}
                      value={field.value}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="representative_cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF do Representante</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      {...field}
                      onChange={handleRepresentativeCPFChange}
                      value={field.value}
                      disabled={isLoading}
                      inputMode="numeric"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="pt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : existingClient ? (
              "Adicionar Novo Produto"
            ) : (
              "Salvar Lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LeadForm;
