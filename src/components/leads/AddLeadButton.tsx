
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LeadForm from "@/components/LeadForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AddLeadButton = ({ onLeadAdded }: { onLeadAdded?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (values: any) => {
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
      setIsOpen(false);
      if (onLeadAdded) onLeadAdded();
    } catch (error: any) {
      toast.error(`Erro ao cadastrar lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Lead</DialogTitle>
          <DialogDescription>
            Preencha os dados do novo lead no formulário abaixo.
          </DialogDescription>
        </DialogHeader>
        <LeadForm 
          onSubmit={handleFormSubmit} 
          onCancel={() => setIsOpen(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddLeadButton;
