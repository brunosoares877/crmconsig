import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GitMerge, Loader2 } from "lucide-react";
import { Funnel } from "@/pages/Funnels";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface FunnelEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
  leadName?: string;
  leadPhone: string;
  instanceId?: string;
}

export function FunnelEnrollModal({ isOpen, onClose, leadId, leadName, leadPhone, instanceId }: FunnelEnrollModalProps) {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Busca instâncias ativas (chips)
      const { data: instData } = await supabase
        .from("whatsapp_instances")
        .select("id, instance_name")
        .eq("status", "open");
        
      setInstances(instData || []);
      if (instanceId) {
        setSelectedInstance(instanceId);
      } else if (instData && instData.length > 0) {
        setSelectedInstance(instData[0].id);
      }

      // Busca funis ativos
      const { data: funData } = await supabase
        .from("whatsapp_funnels")
        .select("id, nome, descricao")
        .eq("ativo", true);
        
      setFunnels(funData || []);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar dados do funil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedFunnel) {
      toast.error("Selecione um funil");
      return;
    }
    if (!selectedInstance) {
      toast.error("Nenhum chip conectado selecionado");
      return;
    }

    try {
      setIsEnrolling(true);
      
      // 1. Pega todas as etapas do funil
      const { data: steps, error: stepsError } = await supabase
        .from("whatsapp_funnel_steps")
        .select("*")
        .eq("funnel_id", selectedFunnel)
        .order("ordem_etapa", { ascending: true });

      if (stepsError) throw stepsError;
      if (!steps || steps.length === 0) {
        toast.error("Este funil não possui etapas configuradas.");
        setIsEnrolling(false);
        return;
      }

      // 2. Calcula as datas de agendamento acumulativas
      let currentDelay = 0; // Acumulador de minutos
      const inserts = steps.map((step, index) => {
        currentDelay += step.delay_minutos;
        const agendadoPara = new Date(Date.now() + currentDelay * 60000); // Adiciona os minutos

        return {
          lead_id: leadId,
          instance_id: selectedInstance,
          telefone: leadPhone,
          status: "pendente",
          agendado_para: agendadoPara.toISOString(),
          funnel_step_id: step.id,
          numero_sequencia: step.ordem_etapa,
          user_id: user?.id
        };
      });

      // 3. Insere todos na fila de uma vez
      const { error: insertError } = await supabase
        .from("message_queue")
        .insert(inserts);

      if (insertError) throw insertError;

      toast.success(`${inserts.length} mensagens agendadas com sucesso no funil!`);
      onClose();
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao inserir no funil: " + e.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-blue-600" />
            Adicionar ao Funil de Cadência
          </DialogTitle>
          <DialogDescription>
            Escolha uma cadência automatizada para o cliente <strong>{leadName || leadPhone}</strong>.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Escolha o Funil</Label>
              <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funil..." />
                </SelectTrigger>
                <SelectContent>
                  {funnels.length === 0 ? (
                    <div className="p-4 flex flex-col items-center justify-center space-y-3 bg-slate-50 rounded-md">
                      <span className="text-sm text-slate-500 text-center">Nenhum funil ativo encontrado.</span>
                      <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => { onClose(); navigate("/funnels"); }}>
                        Criar Novo Funil
                      </Button>
                    </div>
                  ) : (
                    funnels.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {!instanceId && (
              <div className="space-y-2">
                <Label>Enviar através do Chip</Label>
                <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um número..." />
                  </SelectTrigger>
                  <SelectContent>
                    {instances.length === 0 ? (
                      <div className="p-2 text-sm text-red-500 text-center">Nenhum chip conectado.</div>
                    ) : (
                      instances.map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.instance_name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              💡 As mensagens serão pré-agendadas baseadas nos tempos do funil. Se o cliente responder a qualquer momento, o resto do funil é automaticamente cancelado.
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isEnrolling}>Cancelar</Button>
          <Button onClick={handleEnroll} disabled={isEnrolling || !selectedFunnel || !selectedInstance} className="gap-2">
            {isEnrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
            Iniciar Cadência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
