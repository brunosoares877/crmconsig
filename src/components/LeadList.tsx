import React, { useState, useEffect } from "react";
import LeadCard from "./LeadCard";
import EmptyState from "./EmptyState";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import LeadForm from "./LeadForm";
import { Link } from "react-router-dom";
import LeadImportButton from "@/components/leads/LeadImportButton";

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
  const [activeFilters, setActiveFilters] = useState<Array<{
    id: string;
    label: string;
  }>>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLeads = async (page = 1) => {
    setIsLoading(true);
    try {
      // Construir query para contagem
      let countQuery = supabase
        .from("leads")
        .select("*", { count: 'exact', head: true });

      // Aplicar filtros na contagem
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

      // Get total count first
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      setTotalLeads(count || 0);
      setTotalPages(Math.ceil((count || 0) / LEADS_PER_PAGE));

      // Get paginated leads with same filters
      let dataQuery = supabase
        .from("leads")
        .select("*");

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

      dataQuery = dataQuery
        .range(from, to)
        .order("created_at", { ascending: false });

      const { data, error } = await dataQuery;
      
      if (error) throw error;

      const formattedLeads = data.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        status: lead.status || "novo"
      })) as Lead[];

      setLeads(formattedLeads);
      setFilteredLeads(formattedLeads);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      toast.error(`Erro ao carregar leads: ${error.message}`);
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

      // Construir query para contagem
      let countQuery = supabase
        .from("leads")
        .select("*", { count: 'exact', head: true })
        .in('id', leadIds);

      // Aplicar filtros na contagem
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
      
      if (countError) throw countError;
      
      setTotalLeads(count || 0);
      setTotalPages(Math.ceil((count || 0) / LEADS_PER_PAGE));

      // Get paginated filtered leads
      let dataQuery = supabase
        .from("leads")
        .select("*")
        .in('id', leadIds);

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

      dataQuery = dataQuery
        .range(from, to)
        .order("created_at", { ascending: false });

      const { data, error } = await dataQuery;
      
      if (error) throw error;

      const formattedLeads = data.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        status: lead.status || "novo"
      })) as Lead[];

      setLeads(formattedLeads);
      setFilteredLeads(formattedLeads);
    } catch (error: any) {
      console.error("Error fetching leads with tags:", error);
      toast.error(`Erro ao carregar leads: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    if (selectedTags.length > 0) {
      fetchLeadsWithTags(1);
    } else {
      fetchLeads(1);
    }
  }, [selectedTags, statusFilter, employeeFilter, productFilter, bankFilter]);

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

    activeFilters.forEach(filter => {
      if (filter.id === "novos") {
        result = result.filter(lead => lead.status === "novo");
      } else if (filter.id === "ultimos30dias") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        result = result.filter(lead => {
          const leadDate = new Date(lead.createdAt || lead.created_at || '');
          return leadDate >= thirtyDaysAgo;
        });
      }
    });

    setFilteredLeads(result);
  }, [leads, searchQuery, internalSearchQuery, activeFilters]);

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

      const { data: leadInsertData, error: leadError } = await supabase
        .from("leads")
        .insert({
          ...leadData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (leadError) throw leadError;

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
      console.error("Error saving lead:", error);
      toast.error(`Erro ao cadastrar lead: ${error.message}`);
    }
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(leads.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  };

  const handleLeadDelete = (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  const addFilter = (id: string, label: string) => {
    if (!activeFilters.some(filter => filter.id === id)) {
      setActiveFilters([...activeFilters, {
        id,
        label
      }]);
    }
  };

  const removeFilter = (id: string) => {
    setActiveFilters(activeFilters.filter(filter => filter.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Leads</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">
            Mostrando {filteredLeads.length} de {totalLeads} leads
          </span>
          <LeadImportButton />
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex w-full items-center space-x-2 md:w-auto">
              <div className="relative w-full md:w-[280px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                <Input 
                  placeholder="Buscar por nome, telefone ou CPF..." 
                  className="pl-10 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full" 
                  value={internalSearchQuery} 
                  onChange={e => setInternalSearchQuery(e.target.value)} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="h-8 gap-1" onClick={() => addFilter("novos", "Novos")}>
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros</span>
            </Button>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(filter => 
                <Badge key={filter.id} variant="outline" className="h-8 gap-1 pl-2 pr-1">
                  {filter.label}
                  <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-transparent" onClick={() => removeFilter(filter.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default React.memo(LeadList);
