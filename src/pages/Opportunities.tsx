import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Plus, Trash2, Calendar, Phone, Eye, ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

interface Rule {
  id: string;
  product_source: string;
  days_after: number;
  opportunity_title: string;
}

interface Opportunity {
  id: string; // generated combination
  lead: any;
  rule: Rule;
  daysDiff: number;
}

const Opportunities = () => {
  const { products } = useProducts();
  const [rules, setRules] = useState<Rule[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [loadingOpps, setLoadingOpps] = useState(true);

  // Form states for new rule
  const [productSource, setProductSource] = useState("");
  const [daysAfter, setDaysAfter] = useState("");
  const [oppTitle, setOppTitle] = useState("");
  const [submittingRule, setSubmittingRule] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    if (rules.length > 0) {
      fetchOpportunities();
    } else {
      setOpportunities([]);
      setLoadingOpps(false);
    }
  }, [rules]);

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("opportunity_rules")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (err: any) {
      toast.error("Erro ao carregar regras: " + err.message);
    } finally {
      setLoadingRules(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      setLoadingOpps(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      // Buscar todos os leads ativos (não deletados)
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userData.user.id);

      if (leadsError) throw leadsError;

      const calculatedOpps: Opportunity[] = [];
      const now = new Date();

      (leads || []).forEach(lead => {
        if (!lead.product) return;

        // Achar regras que se aplicam ao produto deste lead
        const matchingRules = rules.filter(r => r.product_source === lead.product);

        matchingRules.forEach(rule => {
          const dateToUse = lead.date || lead.created_at;
          if (!dateToUse) return;

          const leadDate = new Date(dateToUse);
          const timeDiff = now.getTime() - leadDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          // Se a quantidade de dias passados for maior ou igual ao configurado na regra
          if (daysDiff >= rule.days_after) {
            calculatedOpps.push({
              id: `${lead.id}-${rule.id}`,
              lead,
              rule,
              daysDiff
            });
          }
        });
      });

      // Ordenar por maior tempo atrasado (prioridade)
      calculatedOpps.sort((a, b) => b.daysDiff - a.daysDiff);
      setOpportunities(calculatedOpps);
    } catch (err: any) {
      toast.error("Erro ao calcular oportunidades: " + err.message);
    } finally {
      setLoadingOpps(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productSource || !daysAfter || !oppTitle.trim()) {
      toast.warning("Preencha todos os campos da regra.");
      return;
    }

    try {
      setSubmittingRule(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("opportunity_rules")
        .insert({
          user_id: userData.user.id,
          product_source: productSource,
          days_after: parseInt(daysAfter),
          opportunity_title: oppTitle.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setRules(prev => [data, ...prev]);
      setProductSource("");
      setDaysAfter("");
      setOppTitle("");
      toast.success("Nova regra de oportunidade cadastrada!");
    } catch (err: any) {
      toast.error("Erro ao salvar regra: " + err.message);
    } finally {
      setSubmittingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("opportunity_rules")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRules(prev => prev.filter(r => r.id !== id));
      toast.success("Regra removida com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao deletar regra: " + err.message);
    }
  };

  const handleWhatsAppContact = (phone: string, name: string, title: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Olá ${name}! Vi aqui no sistema que já faz algum tempo desde o seu último cadastro conosco. Gostaria de te apresentar uma nova oportunidade de: ${title}. Podemos conversar?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50/50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 space-y-6">
            
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Target className="h-7 w-7 text-indigo-600" />
                  Oportunidades de Negócio 🎯
                </h1>
                <p className="text-sm text-slate-500">
                  Monitore e crie ações de pós-venda, renovação e cross-sell automáticas com base na data de cadastro dos seus leads.
                </p>
              </div>
            </div>

            <Tabs defaultValue="active" className="w-full space-y-4">
              <TabsList className="bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="active" className="rounded-lg font-medium px-4 py-2">
                  Oportunidades Ativas ({opportunities.length})
                </TabsTrigger>
                <TabsTrigger value="config" className="rounded-lg font-medium px-4 py-2">
                  Configurar Regras de Retenção
                </TabsTrigger>
              </TabsList>

              {/* Aba 1: Oportunidades Ativas */}
              <TabsContent value="active" className="space-y-4">
                <Card className="border-slate-100 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      Ações Recomendadas para Hoje
                    </CardTitle>
                    <CardDescription>
                      Clientes que se enquadram nas regras de tempo configuradas para contato.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingOpps ? (
                      <div className="flex flex-col items-center justify-center py-10 space-y-2">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-500">Calculando oportunidades...</p>
                      </div>
                    ) : opportunities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="bg-slate-100 p-4 rounded-full">
                          <Target className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-700">Tudo em dia!</h3>
                          <p className="text-sm text-slate-400 max-w-sm">
                            Nenhum lead atingiu a janela de tempo de pós-venda configurada nas regras ainda.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead className="font-bold text-slate-800">Cliente</TableHead>
                              <TableHead className="font-bold text-slate-800">Produto Origem</TableHead>
                              <TableHead className="font-bold text-slate-800">Tempo Decorrido</TableHead>
                              <TableHead className="font-bold text-slate-800">Ação Recomendada</TableHead>
                              <TableHead className="font-bold text-slate-800 text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {opportunities.map(opp => (
                              <TableRow key={opp.id} className="hover:bg-slate-50/50">
                                <TableCell>
                                  <div className="font-semibold text-slate-800">{opp.lead.name}</div>
                                  <div className="text-xs text-slate-400">{opp.lead.phone}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                    {opp.lead.product}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-slate-600 font-medium flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    {opp.daysDiff} dias desde o cadastro
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                                    {opp.rule.opportunity_title}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button asChild size="sm" variant="ghost" className="h-8 text-slate-600 hover:bg-slate-100">
                                      <Link to={`/leads?id=${opp.lead.id}`}>
                                        <Eye className="h-4 w-4 mr-1" />
                                        Perfil
                                      </Link>
                                    </Button>
                                    <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleWhatsAppContact(opp.lead.phone, opp.lead.name, opp.rule.opportunity_title)}>
                                      <Phone className="h-4 w-4 mr-1" />
                                      WhatsApp
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 2: Configurar Regras de Retenção */}
              <TabsContent value="config" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form para adicionar regras */}
                <Card className="border-slate-100 shadow-md lg:col-span-1 h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Plus className="h-5 w-5 text-indigo-600" />
                      Nova Regra
                    </CardTitle>
                    <CardDescription>
                      Crie uma regra de tempo para produtos específicos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddRule} className="space-y-4">
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Se o lead contratou:</label>
                        <Select value={productSource} onValueChange={setProductSource}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o produto contratado" />
                          </SelectTrigger>
                          <SelectTrigger className="w-full" />
                          <SelectContent>
                            {products.map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Passados quantos dias?</label>
                        <Input
                          type="number"
                          placeholder="Ex: 90 dias (3 meses)"
                          value={daysAfter}
                          onChange={e => setDaysAfter(e.target.value)}
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Ação recomendada (Título da Oportunidade):</label>
                        <Input
                          placeholder="Ex: Oferecer Margem Nova / Refin"
                          value={oppTitle}
                          onChange={e => setOppTitle(e.target.value)}
                        />
                      </div>

                      <Button type="submit" disabled={submittingRule} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                        {submittingRule ? "Salvando..." : "Adicionar Regra"}
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Tabela de regras atuais */}
                <Card className="border-slate-100 shadow-md lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Regras de Oportunidades Cadastradas</CardTitle>
                    <CardDescription>
                      Regras de tempo que o robô de pós-venda está processando.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingRules ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : rules.length === 0 ? (
                      <p className="text-sm text-slate-400 italic py-6 text-center">Nenhuma regra de oportunidade criada ainda.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead className="font-bold text-slate-800">Produto</TableHead>
                              <TableHead className="font-bold text-slate-800">Prazo (Dias)</TableHead>
                              <TableHead className="font-bold text-slate-800">Ação / Título</TableHead>
                              <TableHead className="font-bold text-slate-800 text-right">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rules.map(rule => (
                              <TableRow key={rule.id} className="hover:bg-slate-50/50">
                                <TableCell className="font-semibold text-slate-700">{rule.product_source}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                                    {rule.days_after} dias
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-600">{rule.opportunity_title}</TableCell>
                                <TableCell className="text-right">
                                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRule(rule.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Opportunities;
