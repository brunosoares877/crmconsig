
import React, { useState } from "react";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LeadForm from "./LeadForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EmptyState = () => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLeadSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase.from("leads").insert({
        ...values,
        user_id: userData.user.id,
      });

      if (error) throw error;
      
      toast.success("Lead cadastrado com sucesso!");
      setIsOpenDialog(false);
      // Reload the page to show the new lead
      window.location.reload();
    } catch (error: any) {
      toast.error(`Erro ao cadastrar lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <UsersRound className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">Nenhum lead encontrado</h3>
      <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground">
        Parece que você ainda não tem leads registrados ou os filtros atuais não retornaram resultados.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary">Importar Leads</Button>
        
        <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
          <DialogTrigger asChild>
            <Button>Adicionar Lead</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Lead</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo lead no formulário abaixo.
              </DialogDescription>
            </DialogHeader>
            <LeadForm 
              onSubmit={handleLeadSubmit}
              onCancel={() => setIsOpenDialog(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmptyState;
