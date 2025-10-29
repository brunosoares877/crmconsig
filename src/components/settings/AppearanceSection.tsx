
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppearanceSection() {
  const { theme } = useTheme();
  
  const form = useForm({
    defaultValues: {
      theme: theme,
    },
  });

  const onSubmit = async () => {
    try {
      toast.success("Aparência está configurada para o tema padrão");
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Erro na configuração de aparência");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Aparência</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A aparência da aplicação está definida com o tema padrão (claro)
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="theme"
            render={() => (
              <FormItem>
                <FormLabel>Tema</FormLabel>
                <div className="p-2 border rounded-md bg-gray-50">
                  Tema Claro (padrão)
                </div>
                <FormDescription>
                  O sistema utiliza o tema claro por padrão
                </FormDescription>
              </FormItem>
            )}
          />

          <Button type="submit">Salvar alterações</Button>
        </form>
      </Form>
    </div>
  );
}
