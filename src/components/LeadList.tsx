import React, { useState, useEffect } from "react";
import LeadCard from "./LeadCard";
import EmptyState from "./EmptyState";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Plus, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import LeadForm from "./LeadForm";

interface LeadListProps {
  searchQuery?: string;
  selectedTags?: string[];
}

const LeadList: React.FC<LeadListProps> = ({
  searchQuery = "",
  selectedTags = []
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

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("leads").select("*");

      const { data, error } = await query.order("created_at", { ascending: false });
      
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

  const fetchLeadsWithTags = async () => {
    if (selectedTags.length === 0) {
      fetchLeads();
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
        setIsLoading(false);
        return;
      }

      // Then get the actual leads
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .in('id', leadIds)
        .order("created_at", { ascending: false });
      
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
    if (selectedTags.length > 0) {
      fetchLeadsWithTags();
    } else {
      fetchLeads();
    }
  }, [selectedTags]);

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
        fetchLeadsWithTags();
      } else {
        fetchLeads();
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
            Mostrando {filteredLeads.length} leads
          </span>
          <Button variant="outline" className="gap-1" onClick={() => {
          window.location.href = "/leads/import";
        }}>
            <Plus className="h-3.5 w-3.5" />
            <span>Importar</span>
          </Button>
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
            
            <div className="flex items-center gap-2">
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
              
              <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
                <SheetTrigger asChild>
                  <Button className="h-10 gap-1 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Novo Lead</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Adicionar Novo Lead</SheetTitle>
                    <SheetDescription>
                      Preencha os dados do novo lead no formulário abaixo.
                    </SheetDescription>
                  </SheetHeader>
                  <LeadForm onSubmit={handleLeadSubmit} onCancel={() => setIsOpenSheet(false)} />
                </SheetContent>
              </Sheet>
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
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default LeadList;
