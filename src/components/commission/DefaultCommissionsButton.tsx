
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createDefaultCommissions } from "@/utils/defaultCommissions";
import { Settings } from "lucide-react";

interface DefaultCommissionsButtonProps {
  onSuccess: () => void;
}

const DefaultCommissionsButton = ({ onSuccess }: DefaultCommissionsButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleCreateDefaults = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const result = await createDefaultCommissions(userData.user.id);
      
      if (result.success) {
        toast.success("Comissões padrão criadas com sucesso!");
        onSuccess();
      } else {
        toast.error("Erro ao criar comissões padrão");
      }
    } catch (error: any) {
      console.error("Error creating default commissions:", error);
      toast.error("Erro ao criar comissões padrão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCreateDefaults}
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Settings className="h-4 w-4" />
      {loading ? "Criando..." : "Criar Comissões Padrão"}
    </Button>
  );
};

export default DefaultCommissionsButton;
