
import React from "react";
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
import { CircleCheck } from "lucide-react";

export default function AccountSection() {
  const { user, isPrivilegedUser } = useAuth();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      toast({
        title: "Configurações salvas",
        description: "Suas configurações foram salvas com sucesso",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar suas configurações",
        variant: "destructive",
      });
    }
  };

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="seu@email.com" {...field} disabled />
                </FormControl>
                <FormDescription>
                  Este é o email associado à sua conta
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Salvar alterações</Button>
        </form>
      </Form>
    </div>
  );
}
