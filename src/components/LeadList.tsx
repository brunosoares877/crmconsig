
import React from "react";
import LeadCard from "./LeadCard";
import EmptyState from "./EmptyState";
import Filters from "./Filters";
import { Lead } from "@/types/models";

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
      amount: "R$ 15.000",
      source: "Site",
      cpf: "123.456.789-00",
      product: "Novo",
      bank: "Banco do Brasil"
    },
    {
      id: "2",
      name: "Maria Oliveira",
      email: "maria.oliveira@email.com", 
      phone: "(11) 91234-5678",
      createdAt: "23 Abr 2025",
      status: "contatado",
      amount: "R$ 8.500",
      source: "WhatsApp",
      cpf: "987.654.321-00",
      product: "Portabilidade",
      bank: "Caixa"
    },
    {
      id: "3",
      name: "Pedro Santos",
      email: "pedro.santos@email.com",
      phone: "(11) 99876-5432",
      createdAt: "22 Abr 2025",
      status: "qualificado",
      amount: "R$ 25.000",
      source: "Indicação",
      cpf: "111.222.333-44",
      product: "Refinanciamento",
      bank: "Itaú"
    },
    {
      id: "4",
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(11) 98877-6655",
      createdAt: "21 Abr 2025",
      status: "negociando",
      amount: "R$ 12.000", 
      source: "Facebook",
      cpf: "444.555.666-77",
      product: "FGTS",
      bank: "Santander"
    },
    {
      id: "5",
      name: "Carlos Ferreira",
      email: "carlos.ferreira@email.com",
      phone: "(11) 97788-9900",
      createdAt: "20 Abr 2025",
      status: "convertido",
      amount: "R$ 30.000",
      source: "Instagram",
      cpf: "777.888.999-00",
      product: "Novo",
      bank: "Bradesco"
    },
    {
      id: "6",
      name: "Fernanda Lima",
      email: "fernanda.lima@email.com",
      phone: "(11) 96655-4433",
      createdAt: "19 Abr 2025",
      status: "perdido",
      amount: "R$ 18.000",
      source: "Google",
      cpf: "000.111.222-33",
      product: "Portabilidade",
      bank: "Banco do Brasil"
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
