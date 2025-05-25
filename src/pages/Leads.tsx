import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import LeadList from "@/components/LeadList";
import Filters from "@/components/Filters";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
const Leads = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const fetchLeadStats = async () => {
      setIsLoading(true);
      try {
        // Total leads count
        const {
          count: totalCount,
          error: totalError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        });
        if (totalError) {
          console.error('Error fetching total leads:', totalError);
          throw totalError;
        }

        // New leads count
        const {
          count: newCount,
          error: newError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'novo');
        if (newError) {
          console.error('Error fetching new leads:', newError);
          throw newError;
        }

        // Qualified leads count
        const {
          count: qualifiedCount,
          error: qualifiedError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'qualificado');
        if (qualifiedError) {
          console.error('Error fetching qualified leads:', qualifiedError);
          throw qualifiedError;
        }

        // Converted leads count
        const {
          count: convertedCount,
          error: convertedError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'convertido');
        if (convertedError) {
          console.error('Error fetching converted leads:', convertedError);
          throw convertedError;
        }
        setLeadStats({
          total: totalCount || 0,
          new: newCount || 0,
          qualified: qualifiedCount || 0,
          converted: convertedCount || 0
        });
      } catch (error) {
        console.error('Error fetching lead statistics:', error);
        toast.error("Erro ao carregar estatísticas de leads");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeadStats();
  }, []);
  return <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto space-y-6 p-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestão de Leads</h1>
              <p className="text-muted-foreground mt-1">Gerencie e acompanhe todos os seus leads em um só lugar</p>
            </div>
            <div className="mt-4 md:mt-0 relative w-full md:w-auto">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
              <Input placeholder="Buscar por nome, telefone ou CPF..." className="pl-10 py-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full w-full md:w-[280px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="new">Novos</TabsTrigger>
              <TabsTrigger value="contacted">Contatados</TabsTrigger>
              <TabsTrigger value="qualified">Qualificados</TabsTrigger>
              <TabsTrigger value="converted">Convertidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{isLoading ? "..." : leadStats.total}</CardTitle>
                    <CardDescription>Total de Leads</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-blue-600">{isLoading ? "..." : leadStats.new}</CardTitle>
                    <CardDescription>Novos Leads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Aguardando primeiro contato
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-amber-600">{isLoading ? "..." : leadStats.qualified}</CardTitle>
                    <CardDescription>Leads Qualificados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Prontos para negociação
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-green-600">{isLoading ? "..." : leadStats.converted}</CardTitle>
                    <CardDescription>Conversões</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Este mês
                    </div>
                  </CardContent>
                </Card>
              </div>
              <LeadList searchQuery={searchQuery} />
            </TabsContent>
            
            <TabsContent value="new">
              <LeadList searchQuery={searchQuery} status="novo" />
            </TabsContent>
            
            <TabsContent value="contacted">
              <LeadList searchQuery={searchQuery} status="contatado" />
            </TabsContent>
            
            <TabsContent value="qualified">
              <LeadList searchQuery={searchQuery} status="qualificado" />
            </TabsContent>
            
            <TabsContent value="converted">
              <LeadList searchQuery={searchQuery} status="convertido" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>;
};
export default Leads;