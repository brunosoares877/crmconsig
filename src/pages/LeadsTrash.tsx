
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DeletedLead {
  id: string;
  original_lead_id: string;
  original_lead_data: any;
  deleted_at: string;
  expires_at: string;
}

const LeadsTrash = () => {
  const [deletedLeads, setDeletedLeads] = useState<DeletedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<DeletedLead | null>(null);
  const [actionType, setActionType] = useState<'restore' | 'delete' | null>(null);

  useEffect(() => {
    fetchDeletedLeads();
  }, []);

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
      toast.error(`Erro ao carregar lixeira: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (deletedLead: DeletedLead) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Prepare lead data with only valid columns for the leads table
      const leadDataToRestore = {
        id: deletedLead.original_lead_id,
        user_id: userData.user.id,
        name: deletedLead.original_lead_data.name || '',
        email: deletedLead.original_lead_data.email || null,
        phone: deletedLead.original_lead_data.phone || null,
        phone2: deletedLead.original_lead_data.phone2 || null,
        phone3: deletedLead.original_lead_data.phone3 || null,
        cpf: deletedLead.original_lead_data.cpf || null,
        status: deletedLead.original_lead_data.status || 'novo',
        source: deletedLead.original_lead_data.source || null,
        notes: deletedLead.original_lead_data.notes || null,
        amount: deletedLead.original_lead_data.amount || null,
        product: deletedLead.original_lead_data.product || null,
        employee: deletedLead.original_lead_data.employee || null,
        bank: deletedLead.original_lead_data.bank || null,
        benefit_type: deletedLead.original_lead_data.benefit_type || null,
        representative_name: deletedLead.original_lead_data.representative_name || null,
        representative_cpf: deletedLead.original_lead_data.representative_cpf || null
      };

      // Restore lead to active leads table
      const { error: restoreError } = await supabase
        .from("leads")
        .insert(leadDataToRestore);

      if (restoreError) throw restoreError;

      // Remove from deleted leads
      const { error: removeError } = await supabase
        .from("deleted_leads")
        .delete()
        .eq("id", deletedLead.id);

      if (removeError) throw removeError;

      setDeletedLeads(deletedLeads.filter(lead => lead.id !== deletedLead.id));
      toast.success("Lead restaurado com sucesso!");
      setSelectedLead(null);
      setActionType(null);
    } catch (error: any) {
      console.error("Error restoring lead:", error);
      toast.error(`Erro ao restaurar lead: ${error.message}`);
    }
  };

  const handlePermanentDelete = async (deletedLead: DeletedLead) => {
    try {
      const { error } = await supabase
        .from("deleted_leads")
        .delete()
        .eq("id", deletedLead.id);

      if (error) throw error;

      setDeletedLeads(deletedLeads.filter(lead => lead.id !== deletedLead.id));
      toast.success("Lead excluído permanentemente!");
      setSelectedLead(null);
      setActionType(null);
    } catch (error: any) {
      console.error("Error permanently deleting lead:", error);
      toast.error(`Erro ao excluir lead permanentemente: ${error.message}`);
    }
  };

  const filteredLeads = deletedLeads.filter(deletedLead => {
    const leadData = deletedLead.original_lead_data;
    const searchLower = searchQuery.toLowerCase();
    return (
      leadData.name?.toLowerCase().includes(searchLower) ||
      leadData.phone?.includes(searchQuery) ||
      leadData.email?.toLowerCase().includes(searchLower) ||
      leadData.cpf?.includes(searchQuery)
    );
  });

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-slate-50/30 w-full flex">
      <AppSidebar />
      <div className="flex-1 w-full transition-all duration-300">
        <Header />
        <main className="w-full p-4 md:p-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <SidebarTrigger />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Lixeira de Leads</h1>
              <p className="text-muted-foreground mt-1">Gerencie leads excluídos que podem ser recuperados</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                className="pl-10 py-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 animate-pulse rounded-md bg-gray-100"></div>
              ))}
            </div>
          ) : filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredLeads.map(deletedLead => {
                const leadData = deletedLead.original_lead_data;
                const daysLeft = getDaysUntilExpiry(deletedLead.expires_at);
                const isExpiringSoon = daysLeft <= 7;

                return (
                  <Card key={deletedLead.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg leading-none">{leadData.name}</CardTitle>
                          <CardDescription className="text-sm">
                            Excluído em {format(new Date(deletedLead.deleted_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {isExpiringSoon && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {!isExpiringSoon && (
                            <Badge variant="secondary" className="text-xs">
                              {daysLeft} dia{daysLeft !== 1 ? 's' : ''} restante{daysLeft !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {leadData.phone && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Telefone:</span>
                            <span>{leadData.phone}</span>
                          </div>
                        )}
                        
                        {leadData.email && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">E-mail:</span>
                            <span className="truncate">{leadData.email}</span>
                          </div>
                        )}
                        
                        {leadData.amount && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Valor:</span>
                            <span className="font-semibold text-green-600">
                              {leadData.amount}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedLead(deletedLead);
                            setActionType('restore');
                          }}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restaurar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedLead(deletedLead);
                            setActionType('delete');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead na lixeira</h3>
              <p className="text-gray-500">
                {searchQuery ? "Nenhum lead encontrado com os termos de busca." : "A lixeira está vazia."}
              </p>
            </div>
          )}

          <AlertDialog open={!!selectedLead && !!actionType} onOpenChange={() => {
            setSelectedLead(null);
            setActionType(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {actionType === 'restore' ? 'Restaurar Lead' : 'Excluir Permanentemente'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {actionType === 'restore' 
                    ? `Tem certeza que deseja restaurar o lead "${selectedLead?.original_lead_data?.name}"? Ele voltará para a lista ativa de leads.`
                    : `Tem certeza que deseja excluir permanentemente o lead "${selectedLead?.original_lead_data?.name}"? Esta ação não pode ser desfeita.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (selectedLead) {
                      if (actionType === 'restore') {
                        handleRestore(selectedLead);
                      } else {
                        handlePermanentDelete(selectedLead);
                      }
                    }
                  }}
                  className={actionType === 'restore' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {actionType === 'restore' ? 'Restaurar' : 'Excluir Permanentemente'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
};

export default LeadsTrash;
