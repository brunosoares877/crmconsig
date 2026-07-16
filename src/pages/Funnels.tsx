import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Settings, Play, Pause, Trash2, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface Funnel {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
  step_count?: number;
}

const Funnels = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState("");
  const [newFunnelDesc, setNewFunnelDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFunnels();
    }
  }, [user]);

  const fetchFunnels = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("whatsapp_funnels")
        .select(`
          id, nome, descricao, ativo, created_at,
          whatsapp_funnel_steps(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        ativo: item.ativo,
        created_at: item.created_at,
        step_count: item.whatsapp_funnel_steps[0]?.count || 0
      }));

      setFunnels(formattedData);
    } catch (error: any) {
      if (error.message.includes("does not exist")) {
        toast.error("Você precisa rodar a Migration no banco de dados primeiro!");
      } else {
        toast.error("Erro ao buscar funis");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFunnel = async () => {
    if (!newFunnelName.trim()) {
      toast.error("Nome do funil é obrigatório");
      return;
    }
    
    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from("whatsapp_funnels")
        .insert({
          user_id: user?.id,
          nome: newFunnelName,
          descricao: newFunnelDesc
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Funil criado com sucesso!");
      setIsNewDialogOpen(false);
      navigate(`/funnels/${data.id}`);
    } catch (error: any) {
      toast.error("Erro ao criar funil");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleFunnelStatus = async (funnelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("whatsapp_funnels")
        .update({ ativo: !currentStatus })
        .eq("id", funnelId);
        
      if (error) throw error;
      
      setFunnels(prev => prev.map(f => f.id === funnelId ? { ...f, ativo: !currentStatus } : f));
      toast.success(currentStatus ? "Funil pausado" : "Funil ativado");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este funil? Todos os agendamentos pendentes associados a ele serão perdidos.")) return;
    
    try {
      const { error } = await supabase
        .from("whatsapp_funnels")
        .delete()
        .eq("id", funnelId);
        
      if (error) throw error;
      
      setFunnels(prev => prev.filter(f => f.id !== funnelId));
      toast.success("Funil excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir funil");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <GitMerge className="h-6 w-6 text-blue-600" />
                    Funis de Cadência
                  </h1>
                  <p className="text-slate-500 mt-1">Crie sequências automatizadas de mensagens para seus leads.</p>
                </div>
                <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Novo Funil
                </Button>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-24 bg-slate-100 rounded-t-xl" />
                      <CardContent className="h-20 bg-slate-50" />
                    </Card>
                  ))}
                </div>
              ) : funnels.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
                  <GitMerge className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">Nenhum funil criado</h3>
                  <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    Crie seu primeiro funil de cadência para começar a enviar sequências automatizadas de mensagens.
                  </p>
                  <Button onClick={() => setIsNewDialogOpen(true)} className="mt-6">
                    Criar meu primeiro Funil
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {funnels.map(funnel => (
                    <Card key={funnel.id} className={`transition-all hover:shadow-md ${!funnel.ativo ? 'opacity-70 grayscale-[30%]' : ''}`}>
                      <CardHeader className="pb-3 border-b">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg truncate pr-4" title={funnel.nome}>
                            {funnel.nome}
                          </CardTitle>
                          <Badge variant={funnel.ativo ? "default" : "secondary"} className={funnel.ativo ? "bg-green-500 hover:bg-green-600" : ""}>
                            {funnel.ativo ? "Ativo" : "Pausado"}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 min-h-[40px]">
                          {funnel.descricao || "Sem descrição"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-semibold text-slate-900">{funnel.step_count}</span> 
                          etapas configuradas
                        </div>
                      </CardContent>
                      <CardFooter className="bg-slate-50 border-t flex justify-between gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/funnels/${funnel.id}`)}
                        >
                          <Settings className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleFunnelStatus(funnel.id, funnel.ativo)}
                          title={funnel.ativo ? "Pausar funil" : "Ativar funil"}
                        >
                          {funnel.ativo ? <Pause className="h-4 w-4 text-orange-500" /> : <Play className="h-4 w-4 text-green-500" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteFunnel(funnel.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Funil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Funil</Label>
              <Input 
                placeholder="Ex: Funil de Portabilidade INSS" 
                value={newFunnelName}
                onChange={e => setNewFunnelName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (Opcional)</Label>
              <Input 
                placeholder="Ex: Envio para base de clientes que já portaram" 
                value={newFunnelDesc}
                onChange={e => setNewFunnelDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateFunnel} disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Funil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Funnels;
