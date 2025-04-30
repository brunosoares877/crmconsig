
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

export default function AccountSection() {
  const { user } = useAuth();
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
