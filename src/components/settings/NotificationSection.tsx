
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const notifications = [
  {
    id: "all-updates",
    label: "Todas as atualizações",
    description: "Receba todas as notificações",
  },
  {
    id: "new-leads",
    label: "Novos leads",
    description: "Receba notificações quando novos leads forem adicionados",
  },
  {
    id: "lead-status",
    label: "Alterações de status de lead",
    description: "Receba notificações quando o status de um lead mudar",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Receba emails sobre novos recursos e ofertas",
  },
];

export default function NotificationSection() {
  const form = useForm({
    defaultValues: {
      notifications: ["new-leads"],
    },
  });

  const onSubmit = async (data: { notifications: string[] }) => {
    try {
      toast.success("Preferências de notificação salvas com sucesso");
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Erro ao salvar preferências de notificação");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notificações</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure suas preferências de notificação
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {notifications.map((notification) => (
            <FormField
              key={notification.id}
              control={form.control}
              name="notifications"
              render={({ field }) => {
                return (
                  <FormItem
                    key={notification.id}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(notification.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, notification.id])
                            : field.onChange(
                                field.value?.filter(
                                  (value) => value !== notification.id
                                )
                              );
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{notification.label}</FormLabel>
                      <FormDescription>
                        {notification.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                );
              }}
            />
          ))}

          <Button type="submit">Salvar alterações</Button>
        </form>
      </Form>
    </div>
  );
}
