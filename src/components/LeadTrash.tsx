
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Undo2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeletedLead {
  id: string;
  original_lead_data: any;
  deleted_at: string;
  expires_at: string;
  original_lead_id: string;
}

interface LeadTrashProps {
  onLeadRestored?: () => void;
}

const LeadTrash: React.FC<LeadTrashProps> = ({ onLeadRestored }) => {
  const [deletedLeads, setDeletedLeads] = useState<DeletedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<DeletedLead | null>(null);

  const fetchDeletedLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("deleted_leads")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      setDeletedLeads(data || []);
    } catch (error: any) {
      console.error("Error fetching deleted leads:", error);
      toast.error(`Erro ao carregar leads excluídos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedLeads();
  }, []);

  const handleRestoreLead = async () => {
    if (!selectedLead) return;

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Restaurar o lead na tabela principal
      const { error: insertError } = await supabase
        .from("leads")
        .insert({
          ...selectedLead.original_lead_data,
          user_id: userData.user.id,
        });

      if (insertError) throw insertError;

      // Remover da lixeira
      const { error: deleteError } = await supabase
        .from("deleted_leads")
        .delete()
        .eq("id", selectedLead.id);

      if (deleteError) throw deleteError;

      toast.success("Lead restaurado com sucesso!");
      setRestoreDialogOpen(false);
      setSelectedLead(null);
      fetchDeletedLeads();
      if (onLeadRestored) onLeadRestored();
    } catch (error: any) {
      console.error("Error restoring lead:", error);
      toast.error(`Erro ao restaurar lead: ${error.message}`);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from("deleted_leads")
        .delete()
        .eq("id", selectedLead.id);

      if (error) throw error;

      toast.success("Lead excluído permanentemente!");
      setPermanentDeleteDialogOpen(false);
      setSelectedLead(null);
      fetchDeletedLeads();
    } catch (error: any) {
      console.error("Error permanently deleting lead:", error);
      toast.error(`Erro ao excluir permanentemente: ${error.message}`);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 animate-pulse rounded-md bg-gray-100"></div>
        ))}
      </div>
    );
  }

  if (deletedLeads.length === 0) {
    return (
      <div className="text-center py-8">
        <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Lixeira vazia</h3>
        <p className="mt-1 text-sm text-gray-500">Nenhum lead excluído encontrado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deletedLeads.map((deletedLead) => {
          const leadData = deletedLead.original_lead_data;
          const daysRemaining = getDaysRemaining(deletedLead.expires_at);

          return (
            <Card key={deletedLead.id} className="hover:shadow-md transition-shadow border-red-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-none text-gray-700">
                      {leadData.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Excluído em {new Date(deletedLead.deleted_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {daysRemaining} dias
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 space-y-1">
                  {leadData.phone && <p><strong>Telefone:</strong> {leadData.phone}</p>}
                  {leadData.email && <p><strong>Email:</strong> {leadData.email}</p>}
                  {leadData.amount && <p><strong>Valor:</strong> {leadData.amount}</p>}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedLead(deletedLead);
                      setRestoreDialogOpen(true);
                    }}
                  >
                    <Undo2 className="h-3 w-3 mr-1" />
                    Restaurar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(deletedLead);
                      setPermanentDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar o lead "{selectedLead?.original_lead_data?.name}"?
              Ele será movido de volta para a lista de leads ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreLead}>
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o lead "{selectedLead?.original_lead_data?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentDelete} className="bg-red-600 hover:bg-red-700">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LeadTrash;
