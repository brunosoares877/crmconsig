import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, User, Phone, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileData {
  first_name?: string;
  last_name?: string;
  whatsapp?: string;
}

export default function AccountSection() {
  const { user, isPrivilegedUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});

  const form = useForm({
    defaultValues: {
      email: user?.email || "",
      fullName: "",
      whatsapp: "",
    },
  });

  // Carregar dados do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, whatsapp')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile(data);
          // Combinar first_name e last_name para exibir como full_name
          const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          
          form.reset({
            email: user?.email || "",
            fullName: fullName,
            whatsapp: data.whatsapp ? maskPhone(data.whatsapp) : "",
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, user?.email, form]);

  // Função para formatar telefone
  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      return `(${digits}`;
    }
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    form.setValue('whatsapp', masked);
  };

  const onSubmit = async (data: { email: string; fullName: string; whatsapp: string }) => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Dividir nome completo em first_name e last_name
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updateData = {
        first_name: firstName,
        last_name: lastName,
        whatsapp: data.whatsapp.replace(/\D/g, ''), // Salvar apenas números
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updateData
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updateData }));
      toast.success("Informações da conta atualizadas com sucesso!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Erro ao atualizar informações: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Conta</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie suas informações de conta
          </p>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Carregando informações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Conta</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie suas informações de conta
        </p>
      </div>
      
      {isPrivilegedUser && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center">
          <CircleCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          <div>
            <h4 className="text-green-700 font-medium">Acesso Vitalício Ativo</h4>
            <p className="text-sm text-green-600">
              Seu email foi identificado como um usuário com acesso vitalício a todas as funcionalidades 
              do sistema. Você tem acesso completo sem necessidade de assinatura.
            </p>
          </div>
          <Badge className="ml-auto bg-green-500">Usuário Premium</Badge>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome Completo */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Nome Completo
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite seu nome completo" 
                    {...field} 
                    disabled={isSaving}
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  Este nome será usado em relatórios e comunicações
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* WhatsApp */}
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  WhatsApp
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(99) 99999-9999" 
                    {...field}
                    onChange={handlePhoneChange}
                    disabled={isSaving}
                    maxLength={15}
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  Número do WhatsApp para contato e notificações
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email (somente leitura) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="seu@email.com" 
                    {...field} 
                    disabled 
                    className="h-11 bg-gray-50"
                  />
                </FormControl>
                <FormDescription>
                  Este é o email associado à sua conta (não pode ser alterado)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
