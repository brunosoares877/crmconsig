
import React from "react";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  
  const form = useForm({
    defaultValues: {
      theme: theme,
    },
  });

  const onSubmit = async (data: { theme: 'light' | 'dark' | 'classic-dark' | 'system' }) => {
    try {
      setTheme(data.theme);
      toast.success("Tema atualizado com sucesso");
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Erro ao atualizar o tema");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Aparência</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Personalize a aparência da aplicação
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="classic-dark">Escuro clássico</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Selecione o tema para a interface do usuário
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
