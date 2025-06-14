
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Copy, MessageCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import LeadPremiumChat from "@/components/leads-premium/LeadPremiumChat";

interface LeadPremium {
  id: string;
  nome: string;
  telefone: string;
  mensagem: string;
  origem: string;
  modalidade: string;
  status: string;
  created_at: string;
}

const LeadsPremium = () => {
  const [leads, setLeads] = useState<LeadPremium[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadPremium[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalidadeFilter, setModalidadeFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<LeadPremium | null>(null);

  const getModalidadeBadgeColor = (modalidade: string) => {
    switch (modalidade) {
      case "Aposentado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Bolsa Família":
        return "bg-green-100 text-green-800 border-green-200";
      case "FGTS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Em atendimento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fechado":
        return "bg-green-100 text-green-800 border-green-200";
      case "Perdido":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Telefone copiado!");
  };

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads_premium')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar leads premium:', error);
        toast.error("Erro ao carregar leads premium");
        return;
      }

      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (error) {
      console.error('Erro ao buscar leads premium:', error);
      toast.error("Erro ao carregar leads premium");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;

    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.telefone.includes(searchQuery)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (modalidadeFilter !== "all") {
      filtered = filtered.filter(lead => lead.modalidade === modalidadeFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchQuery, statusFilter, modalidadeFilter]);

  if (selectedLead) {
    return (
      <LeadPremiumChat 
        lead={selectedLead} 
        onBack={() => setSelectedLead(null)}
        onLeadUpdate={(updatedLead) => {
          setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
          setSelectedLead(updatedLead);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <AppSidebar />
        <div className="flex-1 transition-all duration-300">
          <Header />
          <main className="w-full space-y-6 p-4 md:p-6 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Leads Premium</h1>
                  <p className="text-muted-foreground mt-1">Leads recebidos via tráfego pago</p>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={modalidadeFilter} onValueChange={setModalidadeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as modalidades</SelectItem>
                  <SelectItem value="Aposentado">Aposentado</SelectItem>
                  <SelectItem value="Bolsa Família">Bolsa Família</SelectItem>
                  <SelectItem value="FGTS">FGTS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em atendimento">Em atendimento</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Leads */}
            <div className="grid gap-4">
              {isLoading ? (
                <div className="text-center py-8">Carregando leads...</div>
              ) : filteredLeads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum lead premium encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                filteredLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{lead.nome}</h3>
                            <div className="flex gap-2">
                              <Badge className={getModalidadeBadgeColor(lead.modalidade)}>
                                {lead.modalidade}
                              </Badge>
                              <Badge className={getStatusBadgeColor(lead.status)}>
                                {lead.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-gray-600">
                            <span>📱 {lead.telefone}</span>
                            <span>📍 {lead.origem}</span>
                            <span>🕒 {format(new Date(lead.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                          </div>
                          {lead.mensagem && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              💬 {lead.mensagem}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.telefone);
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LeadsPremium;
