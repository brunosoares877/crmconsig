
import React, { useState, useEffect } from "react";
import LeadCard from "./LeadCard";
import EmptyState from "./EmptyState";
import Filters from "./Filters";
import AddLeadButton from "./leads/AddLeadButton";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LeadList = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedLeads = data.map(lead => ({
        ...lead,
        createdAt: new Date(lead.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }));

      setLeads(formattedLeads);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      toast.error(`Erro ao carregar leads: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(leads.map(lead => lead.id === updatedLead.id ? updatedLead : lead));
  };

  const handleLeadDelete = (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Mostrando {leads.length} leads
          </span>
          <AddLeadButton onLeadAdded={fetchLeads} />
        </div>
      </div>

      <Filters />
      
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-md bg-gray-100"></div>
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
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
