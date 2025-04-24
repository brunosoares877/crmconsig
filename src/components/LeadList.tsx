
import React from "react";
import LeadCard, { Lead } from "./LeadCard";
import EmptyState from "./EmptyState";
import Filters from "./Filters";

const LeadList = () => {
  // Mock leads data
  const leads: Lead[] = [
    {
      id: "1",
      name: "João da Silva",
      email: "joao.silva@email.com",
      phone: "(11) 98765-4321",
      createdAt: "24 Abr 2025",
      status: "novo",
      loanValue: "R$ 15.000",
      source: "Site"
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria.oliveira@email.com", 
      phone: "(11) 91234-5678",
      createdAt: "23 Abr 2025",
      status: "contatado",
      loanValue: "R$ 8.500",
      source: "WhatsApp"
    },
    {
      id: "3",
      name: "Pedro Santos",
      email: "pedro.santos@email.com",
      phone: "(11) 99876-5432",
      createdAt: "22 Abr 2025",
      status: "qualificado",
      loanValue: "R$ 25.000",
      source: "Indicação"
    },
    {
      id: "4",
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(11) 98877-6655",
      createdAt: "21 Abr 2025",
      status: "negociando",
      loanValue: "R$ 12.000", 
      source: "Facebook"
    },
    {
      id: "5",
      name: "Carlos Ferreira",
      email: "carlos.ferreira@email.com",
      phone: "(11) 97788-9900",
      createdAt: "20 Abr 2025",
      status: "convertido",
      loanValue: "R$ 30.000",
      source: "Instagram"
    },
    {
      id: "6",
      name: "Fernanda Lima",
      email: "fernanda.lima@email.com",
      phone: "(11) 96655-4433",
      createdAt: "19 Abr 2025",
      status: "perdido",
      loanValue: "R$ 18.000",
      source: "Google"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <span className="text-sm text-muted-foreground">
          Mostrando {leads.length} leads
        </span>
      </div>

      <Filters />
      
      {leads.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

export default LeadList;
