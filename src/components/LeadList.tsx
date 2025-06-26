import React, { useState, useEffect } from "react";
import LeadCard from "./LeadCard";
import EmptyState from "./EmptyState";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Filter, X, ChevronLeft, ChevronRight, Trash2, Check, Square, CheckSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import LeadForm from "./LeadForm";
import { Link } from "react-router-dom";
import LeadImportButton from "@/components/leads/LeadImportButton";
import { formatLeadDate } from "@/utils/dateUtils";

interface LeadListProps {
  searchQuery?: string;
  selectedTags?: string[];
  statusFilter?: string;
  employeeFilter?: string;
  productFilter?: string;
  bankFilter?: string;
}

const LEADS_PER_PAGE = 20;

const LeadList: React.FC<LeadListProps> = ({
  searchQuery = "",
  selectedTags = [],
  statusFilter = "",
  employeeFilter = "",
  productFilter = "",
  bankFilter = ""
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenSheet, setIsOpenSheet] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Multi-selection states
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // User authenticated, proceed with queries

      // Get total count first - create separate query for count
      let countQuery = supabase
        .from("leads")
        .select("*", { count: 'exact', head: true })
        .eq('user_id', userData.user.id);

      // Apply same filters to count query
      if (statusFilter) {
        countQuery = countQuery.eq('status', statusFilter);
      }
      if (employeeFilter) {
        countQuery = countQuery.eq('employee', employeeFilter);
      }
      if (productFilter) {
        countQuery = countQuery.eq('product', productFilter);
      }
      if (bankFilter) {
        countQuery = countQuery.eq('bank', bankFilter);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }
      
      setTotalLeads(count || 0);
      setTotalPages(Math.ceil((count || 0) / LEADS_PER_PAGE));

      // Get actual data with same filters
      let dataQuery = supabase
        .from("leads")
        .select("*")
        .eq('user_id', userData.user.id);

      // Aplicar filtros nos dados
      if (statusFilter) {
        dataQuery = dataQuery.eq('status', statusFilter);
      }
      if (employeeFilter) {
        dataQuery = dataQuery.eq('employee', employeeFilter);
      }
      if (productFilter) {
        dataQuery = dataQuery.eq('product', productFilter);
      }
      if (bankFilter) {
        dataQuery = dataQuery.eq('bank', bankFilter);
      }

      const from = (page - 1) * LEADS_PER_PAGE;
      const to = from + LEADS_PER_PAGE - 1;

      const { data, error } = await dataQuery
        .range(from, to)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('Data error:', error);
        throw error;
      }

      const formattedLeads = (data || []).map(lead => ({
        ...lead,
        createdAt: formatLeadDate((lead as any).date ? (lead as any).date : lead.created_at),
        status: lead.status || "novo"
      })) as Lead[];

      setLeads(formattedLeads);
      setFilteredLeads(formattedLeads);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      
      // Melhor tratamento de erro
      if (error.message?.includes('Failed to fetch')) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (error.message?.includes('JWT')) {
        toast.error("Sessão expirada. Faça login novamente.");
      } else {
        toast.error(`Erro ao carregar leads: ${error.message || 'Erro desconhecido'}`);
      }
      
      // Em caso de erro, definir estados seguros
      setLeads([]);
      setFilteredLeads([]);
      setTotalLeads(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadsWithTags = async (page = 1) => {
    if (selectedTags.length === 0) {
      fetchLeads(page);
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // First, get leads that have the selected tags
      const { data: tagAssignments, error: tagError } = await (supabase as any)
        .from('lead_tag_assignments')
        .select('lead_id')
        .in('tag_id', selectedTags);

      if (tagError) throw tagError;

      const leadIds = tagAssignments?.map((assignment: any) => assignment.lead_id) || [];

      if (leadIds.length === 0) {
        setLeads([]);
        setFilteredLeads([]);
        setTotalLeads(0);
        setTotalPages(0);
        setIsLoading(false);
        return;
      }

      // Create count query
      let countQuery = supabase
        .from("leads")
        .select("*", { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .in('id', leadIds);

      // Apply filters to count query
      if (statusFilter) {
        countQuery = countQuery.eq('status', statusFilter);
      }
      if (employeeFilter) {
        countQuery = countQuery.eq('employee', employeeFilter);
      }
      if (productFilter) {
        countQuery = countQuery.eq('product', productFilter);
      }
      if (bankFilter) {
        countQuery = countQuery.eq('bank', bankFilter);
      }

      // Get total count for filtered leads
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }
      
      setTotalLeads(count || 0);
      setTotalPages(Math.ceil((count || 0) / LEADS_PER_PAGE));

      // Get actual data
      let dataQuery = supabase
        .from("leads")
        .select("*")
        .eq('user_id', userData.user.id)
        .in('id', leadIds);

      // Apply filters to data query
      if (statusFilter) {
        dataQuery = dataQuery.eq('status', statusFilter);
      }
      if (employeeFilter) {
        dataQuery = dataQuery.eq('employee', employeeFilter);
      }
      if (productFilter) {
        dataQuery = dataQuery.eq('product', productFilter);
      }
      if (bankFilter) {
        dataQuery = dataQuery.eq('bank', bankFilter);
      }

      const from = (page - 1) * LEADS_PER_PAGE;
      const to = from + LEADS_PER_PAGE - 1;

      const { data, error } = await dataQuery
        .range(from, to)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error('Data error:', error);
        throw error;
      }

      const formattedLeads = (data || []).map(lead => ({
        ...lead,
        createdAt: formatLeadDate((lead as any).date ? (lead as any).date : lead.created_at),
        status: lead.status || "novo"
      })) as Lead[];

      setLeads(formattedLeads);
      setFilteredLeads(formattedLeads);
    } catch (error: any) {
      console.error("Error fetching leads with tags:", error);
      
      // Melhor tratamento de erro
      if (error.message?.includes('Failed to fetch')) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else if (error.message?.includes('JWT')) {
        toast.error("Sessão expirada. Faça login novamente.");
      } else {
        toast.error(`Erro ao carregar leads: ${error.message || 'Erro desconhecido'}`);
      }
      
      // Em caso de erro, definir estados seguros
      setLeads([]);
      setFilteredLeads([]);
      setTotalLeads(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // CORRIGIDO: useEffect que causava loop infinito
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    if (selectedTags.length > 0) {
      fetchLeadsWithTags(1);
    } else {
      fetchLeads(1);
    }
  }, [statusFilter, employeeFilter, productFilter, bankFilter]); // Removido selectedTags para evitar loop

  useEffect(() => {
    setInternalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    let result = [...leads];

    const searchTerms = internalSearchQuery || searchQuery;
    if (searchTerms) {
      const searchLower = searchTerms.toLowerCase();
      result = result.filter(lead => 
        lead.name && lead.name.toLowerCase().includes(searchLower) || 
        lead.phone && lead.phone.includes(searchTerms) || 
        lead.phone2 && lead.phone2.includes(searchTerms) || 
        lead.phone3 && lead.phone3.includes(searchTerms) || 
        lead.cpf && lead.cpf.includes(searchTerms) || 
        lead.email && lead.email?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLeads(result);
  }, [leads, searchQuery, internalSearchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (selectedTags.length > 0) {
      fetchLeadsWithTags(page);
    } else {
      fetchLeads(page);
    }
  };

  const handleLeadSubmit = async (values: any) => {
    console.log("New lead submission:", values);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { selectedTags, ...leadData } = values;
      
      // Processar payment_period para evitar erro de integer
      const processedLeadData = {
        ...leadData,
        payment_period: leadData.payment_period && leadData.payment_period !== "" && leadData.payment_period !== "none" 
          ? parseInt(leadData.payment_period) 
          : undefined
      };
      
      // Debug: verificar se o campo está sendo processado corretamente
      console.log("Lead data to insert:", processedLeadData);
      console.log("Payment period conversion:", {
        original: leadData.payment_period,
        processed: processedLeadData.payment_period,
        type: typeof processedLeadData.payment_period
      });

      const { data: leadInsertData, error: leadError } = await supabase
        .from("leads")
        .insert({
          ...processedLeadData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (leadError) {
        console.error("Database insert error:", leadError);
        throw leadError;
      }

      console.log("Lead inserted successfully:", leadInsertData);

      // Save tag assignments if any tags were selected
      if (selectedTags && selectedTags.length > 0) {
        const tagAssignments = selectedTags.map((tagId: string) => ({
          lead_id: leadInsertData.id,
          tag_id: tagId,
          user_id: userData.user.id,
        }));

        const { error: tagError } = await (supabase as any)
          .from('lead_tag_assignments')
          .insert(tagAssignments);

        if (tagError) {
          console.error('Error saving tag assignments:', tagError);
          toast.error('Lead salvo, mas erro ao aplicar etiquetas');
        }
      }
      
      console.log("Lead saved successfully:", leadInsertData);
      toast.success("Lead cadastrado com sucesso!");
      setIsOpenSheet(false);
      
      // Refresh leads based on current filters
      if (selectedTags.length > 0) {
        fetchLeadsWithTags(currentPage);
      } else {
        fetchLeads(currentPage);
      }
      
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(`Erro ao cadastrar lead: ${error.message}`);
    }
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(leads.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  };

  const handleLeadDelete = (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
    // Remove from selection if it was selected
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Multi-selection functions
  const handleSelectLead = (leadId: string, selected: boolean) => {
    setSelectedLeads(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedLeads(new Set());
  };

  const handleMultipleDelete = async () => {
    if (selectedLeads.size === 0) return;

    setIsDeletingMultiple(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const leadsToDelete = leads.filter(lead => selectedLeads.has(lead.id));
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Move all selected leads to trash
      const deletedLeadsData = leadsToDelete.map(lead => ({
        original_lead_id: lead.id,
        user_id: userData.user.id,
        original_lead_data: {
          id: lead.id,
          user_id: lead.user_id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          phone2: lead.phone2,
          phone3: lead.phone3,
          cpf: lead.cpf,
          status: lead.status,
          source: lead.source,
          notes: lead.notes,
          amount: lead.amount,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          scheduledAt: lead.scheduledAt,
          product: lead.product,
          employee: lead.employee,
          created_at: lead.created_at,
          date: (lead as any).date,
          bank: (lead as any).bank,
          benefit_type: (lead as any).benefit_type,
          payment_period: (lead as any).payment_period,
          representative_mode: (lead as any).representative_mode,
          representative_name: (lead as any).representative_name,
          representative_cpf: (lead as any).representative_cpf
        },
        deleted_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      }));

      // Insert to deleted_leads table
      const { error: trashError } = await supabase
        .from("deleted_leads")
        .insert(deletedLeadsData);

      if (trashError) throw trashError;

      // Delete from active leads
      const { error: deleteError } = await supabase
        .from("leads")
        .delete()
        .in("id", Array.from(selectedLeads));

      if (deleteError) throw deleteError;

      // Update local state
      setLeads(leads.filter(lead => !selectedLeads.has(lead.id)));
      setSelectedLeads(new Set());
      setIsSelectionMode(false);
      setIsDeleteDialogOpen(false);

      toast.success(`${selectedLeads.size} leads movidos para a lixeira com sucesso!`);
    } catch (error: any) {
      console.error("Error deleting multiple leads:", error);
      toast.error(`Erro ao deletar leads: ${error.message}`);
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Leads</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            Mostrando {filteredLeads.length} de {totalLeads} leads
          </span>
          {isSelectionMode && (
            <div className="flex items-center gap-2 mr-2">
              <Checkbox
                checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="text-sm font-medium">Selecionar todos</span>
              {selectedLeads.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isDeletingMultiple}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir ({selectedLeads.size})
                </Button>
              )}
            </div>
          )}
          <Button
            variant={isSelectionMode ? "secondary" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
            className="flex items-center gap-2"
          >
            {isSelectionMode ? (
              <>
                <X className="h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4" />
                Selecionar
              </>
            )}
          </Button>
          <LeadImportButton />
        </div>
      </div>
      
      {/* REMOVIDO: Filtros antigos duplicados */}
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 animate-pulse rounded-md bg-gray-100"></div>
          ))}
        </div>
      ) : filteredLeads.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredLeads.map(lead => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onUpdate={handleLeadUpdate} 
                onDelete={handleLeadDelete}
                isSelected={selectedLeads.has(lead.id)}
                onSelect={handleSelectLead}
                showSelection={isSelectionMode}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-6 py-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">
                  Página {currentPage} de {totalPages}
                </p>
                <p className="text-sm text-muted-foreground">
                  ({totalLeads} leads no total)
                </p>
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, currentPage - 2) + index;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === currentPage}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}

      {/* Modal de confirmação para exclusão múltipla */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Leads Selecionados</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} para a lixeira? 
              Os leads ficarão disponíveis por 30 dias na lixeira antes de serem excluídos automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingMultiple}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMultipleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeletingMultiple}
            >
              {isDeletingMultiple ? "Excluindo..." : "Excluir Leads"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default React.memo(LeadList);
