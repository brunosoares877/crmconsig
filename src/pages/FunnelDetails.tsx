import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Save, Trash2, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Funnel } from "./Funnels";

interface FunnelStep {
  id?: string;
  funnel_id?: string;
  ordem_etapa: number;
  delay_minutos: number;
  mensagem_template: string;
  tipo_midia: string | null;
  isNew?: boolean;
}

const FunnelDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [steps, setSteps] = useState<FunnelStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFunnelDetails();
    }
  }, [id]);

  const fetchFunnelDetails = async () => {
    try {
      setIsLoading(true);
      // Busca o funil
      const { data: funnelData, error: funnelError } = await supabase
        .from("whatsapp_funnels")
        .select("*")
        .eq("id", id)
        .single();

      if (funnelError) throw funnelError;
      setFunnel(funnelData);

      // Busca os steps
      const { data: stepsData, error: stepsError } = await supabase
        .from("whatsapp_funnel_steps")
        .select("*")
        .eq("funnel_id", id)
        .order("ordem_etapa", { ascending: true });

      if (stepsError) throw stepsError;
      setSteps(stepsData || []);
    } catch (error) {
      toast.error("Erro ao buscar detalhes do funil");
      navigate("/funnels");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        ordem_etapa: steps.length + 1,
        delay_minutos: steps.length === 0 ? 0 : 1440, // default 1 day for subsequent steps
        mensagem_template: "",
        tipo_midia: null,
        isNew: true
      }
    ]);
  };

  const handleUpdateStep = (index: number, field: keyof FunnelStep, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    // Recalculate order
    newSteps.forEach((step, i) => {
      step.ordem_etapa = i + 1;
    });
    setSteps(newSteps);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update funnel basic info if needed (not implemented in UI yet, but we could)
      
      // We'll do a simple approach: delete all existing steps and re-insert
      // This is easier to handle re-ordering, but we lose history if any.
      // Better approach: upsert based on ID. For new ones, no ID.
      
      // Delete removed ones
      const currentDbStepIds = steps.filter(s => !s.isNew).map(s => s.id);
      
      await supabase
        .from("whatsapp_funnel_steps")
        .delete()
        .eq("funnel_id", id)
        .not("id", "in", `(${currentDbStepIds.join(',')})`);

      // Upsert existing and insert new
      for (const step of steps) {
        if (step.isNew) {
          await supabase.from("whatsapp_funnel_steps").insert({
            funnel_id: id,
            ordem_etapa: step.ordem_etapa,
            delay_minutos: step.delay_minutos,
            mensagem_template: step.mensagem_template,
            tipo_midia: step.tipo_midia
          });
        } else {
          await supabase.from("whatsapp_funnel_steps").update({
            ordem_etapa: step.ordem_etapa,
            delay_minutos: step.delay_minutos,
            mensagem_template: step.mensagem_template,
            tipo_midia: step.tipo_midia
          }).eq("id", step.id);
        }
      }

      toast.success("Funil salvo com sucesso!");
      fetchFunnelDetails(); // Reload to get fresh IDs
    } catch (error) {
      toast.error("Erro ao salvar funil");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Top Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={() => navigate("/funnels")}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                      {funnel?.nome}
                    </h1>
                    <p className="text-slate-500">Configure as etapas da sua cadência de mensagens.</p>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" /> {isSaving ? "Salvando..." : "Salvar Funil"}
                </Button>
              </div>

              {/* Spintax Helper */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Dica de Variáveis e Spintax:</strong> Use <code>{"{{nome}}"}</code> para chamar o cliente pelo nome. 
                  Você também pode usar Spintax para variar as mensagens e evitar bloqueios: <code>{"{Oi|Olá|Tudo bem?}"}</code>
                </div>
              </div>

              {/* Steps Area */}
              <div className="space-y-6">
                {steps.length === 0 ? (
                  <div className="text-center py-12 bg-white border border-dashed rounded-xl">
                    <p className="text-slate-500 mb-4">Este funil ainda não tem nenhuma etapa.</p>
                    <Button onClick={handleAddStep} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Adicionar Primeira Etapa
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Linha conectora */}
                    <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-slate-200 z-0"></div>

                    {steps.map((step, index) => (
                      <div key={index} className="relative z-10 flex gap-4 mb-6 last:mb-0">
                        <div className="flex flex-col items-center pt-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-slate-50">
                            {index + 1}
                          </div>
                        </div>

                        <Card className="flex-1 shadow-sm border-slate-200">
                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-semibold text-slate-900">Etapa {index + 1}</h3>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-2 -mr-2"
                                onClick={() => handleRemoveStep(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">Tempo de espera após etapa anterior:</span>
                                <Input 
                                  type="number" 
                                  className="w-24 h-8" 
                                  value={step.delay_minutos}
                                  onChange={(e) => handleUpdateStep(index, "delay_minutos", parseInt(e.target.value) || 0)}
                                />
                                <span className="text-sm text-slate-500">minutos (0 = imediato)</span>
                              </div>

                              <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-slate-500" /> Mensagem
                                </Label>
                                <Textarea 
                                  placeholder="Digite a mensagem..." 
                                  className="min-h-[100px] resize-y"
                                  value={step.mensagem_template}
                                  onChange={(e) => handleUpdateStep(index, "mensagem_template", e.target.value)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}

                    <div className="relative z-10 flex gap-4 mt-6">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center shadow-sm ring-4 ring-slate-50">
                          <Plus className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 flex items-center">
                        <Button onClick={handleAddStep} variant="outline" className="border-dashed text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50">
                          Adicionar Nova Etapa
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default FunnelDetails;
