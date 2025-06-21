import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Trash2, RotateCcw, AlertTriangle, User, Phone, Mail, Calendar, Clock, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageLayout from "@/components/PageLayout";

interface DeletedLead {
  id: string;
  original_lead_id: string;
  original_lead_data: any;
  deleted_at: string;
  expires_at: string;
  user_id: string;
}

const LeadsTrash = () => {
  const [deletedLeads, setDeletedLeads] = useState<DeletedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<DeletedLead | null>(null);
  const [actionType, setActionType] = useState<'restore' | 'delete' | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkActionType, setBulkActionType] = useState<'bulk_restore' | 'bulk_delete' | null>(null);

  useEffect(() => {
    fetchDeletedLeads();
  }, []);

  const fetchDeletedLeads = async () => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("deleted_leads")
        .select("*")
        .eq("user_id", userData.user.id)
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

  const handleBulkRestore = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const leadsToRestore = deletedLeads.filter(lead => selectedLeads.has(lead.id));
      
      for (const deletedLead of leadsToRestore) {
        // Prepare lead data
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

        // Restore lead
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
      }

      setDeletedLeads(deletedLeads.filter(lead => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      toast.success(`${leadsToRestore.length} leads restaurados com sucesso!`);
      setBulkActionType(null);
    } catch (error: any) {
      console.error("Error bulk restoring leads:", error);
      toast.error(`Erro ao restaurar leads: ${error.message}`);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const selectedIds = Array.from(selectedLeads);
      
      const { error } = await supabase
        .from("deleted_leads")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;

      setDeletedLeads(deletedLeads.filter(lead => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      toast.success(`${selectedIds.length} leads excluídos permanentemente!`);
      setBulkActionType(null);
    } catch (error: any) {
      console.error("Error bulk deleting leads:", error);
      toast.error(`Erro ao excluir leads: ${error.message}`);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
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

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
        <Input 
          placeholder="Buscar por nome, telefone ou CPF..." 
          className="pl-10 py-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full w-full md:w-[280px]" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
      </div>
      
      {filteredLeads.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            {selectedLeads.size === filteredLeads.length ? 
              <CheckSquare className="h-4 w-4" /> : 
              <Square className="h-4 w-4" />
            }
            {selectedLeads.size === filteredLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
          
          {selectedLeads.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkActionType('bulk_restore')}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restaurar ({selectedLeads.size})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkActionType('bulk_delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir ({selectedLeads.size})
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <PageLayout 
      title="Lixeira de Leads" 
      subtitle="Leads excluídos ficam disponíveis por 30 dias para restauração"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLeads.map((deletedLead) => {
              const leadData = deletedLead.original_lead_data;
              const daysLeft = getDaysUntilExpiry(deletedLead.expires_at);
              const isExpiringSoon = daysLeft <= 3;
              const isSelected = selectedLeads.has(deletedLead.id);

              return (
                <Card key={deletedLead.id} className={`transition-all hover:shadow-md h-fit ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectLead(deletedLead.id)}
                            className="mt-1"
                          />
                          <CardTitle className="text-lg leading-tight line-clamp-2 flex-1">{leadData.name}</CardTitle>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          {isExpiringSoon && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {daysLeft}d
                            </Badge>
                          )}
                          {!isExpiringSoon && (
                            <Badge variant="secondary" className="text-xs">
                              {daysLeft}d
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-xs ml-6">
                        Excluído em {format(new Date(deletedLead.deleted_at), "dd/MM/yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4 ml-6">
                      {leadData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <span className="text-xs truncate">{leadData.phone}</span>
                        </div>
                      )}
                      
                      {leadData.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="text-xs truncate">{leadData.email}</span>
                        </div>
                      )}
                      
                      {leadData.amount && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">Valor:</span>
                          <span className="font-semibold text-green-600 text-xs">
                            {leadData.amount}
                          </span>
                        </div>
                      )}

                      {leadData.status && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {leadData.status}
                          </Badge>
                        </div>
                      )}

                      {leadData.notes && (
                        <div className="text-xs text-gray-600 line-clamp-2">
                          {leadData.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => {
                          setSelectedLead(deletedLead);
                          setActionType('restore');
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restaurar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => {
                          setSelectedLead(deletedLead);
                          setActionType('delete');
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12 max-w-2xl mx-auto">
            <CardContent>
              <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead na lixeira</h3>
              <p className="text-gray-500">
                {searchQuery ? "Nenhum lead encontrado com os termos de busca." : "A lixeira está vazia."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dialog para ação individual */}
        <AlertDialog open={!!selectedLead} onOpenChange={() => {
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

        {/* Dialog para ações em massa */}
        <AlertDialog open={!!bulkActionType} onOpenChange={() => setBulkActionType(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {bulkActionType === 'bulk_restore' ? 'Restaurar Leads Selecionados' : 'Excluir Leads Selecionados'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {bulkActionType === 'bulk_restore' 
                  ? `Tem certeza que deseja restaurar ${selectedLeads.size} leads selecionados? Eles voltarão para a lista ativa de leads.`
                  : `Tem certeza que deseja excluir permanentemente ${selectedLeads.size} leads selecionados? Esta ação não pode ser desfeita.`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (bulkActionType === 'bulk_restore') {
                    handleBulkRestore();
                  } else {
                    handleBulkDelete();
                  }
                }}
                className={bulkActionType === 'bulk_restore' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {bulkActionType === 'bulk_restore' ? 'Restaurar Todos' : 'Excluir Todos'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default LeadsTrash; 