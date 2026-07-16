import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Smartphone, Wifi, WifiOff, RefreshCw, QrCode, Zap,
  CheckCircle, AlertCircle, Clock, TrendingUp, MessageSquare,
  Settings, Plus, Trash2, Copy, ExternalLink, Shield, ChevronRight,
  Activity, Battery, Signal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface WhatsAppInstance {
  id: string;
  instance_name: string;
  evolution_api_url: string;
  api_key: string;
  status: "connected" | "disconnected" | "qr_code" | "connecting";
  phone_number?: string;
  chip_connected_at?: string;
  messages_sent_today: number;
}

// Calcula a idade do chip em dias a partir da data de ativação
function calcChipAgeDays(chip_connected_at?: string): number {
  if (!chip_connected_at) return 0;
  const diff = Date.now() - new Date(chip_connected_at).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Calcula o limite diário recomendado com base na idade do chip
function calcDailyLimit(chip_connected_at?: string): number {
  const days = calcChipAgeDays(chip_connected_at);
  if (days < 15) return 20;
  if (days < 30) return 65;
  return 125;
}

const STATUS_CONFIG = {
  connected: { label: "Conectado", color: "text-emerald-400", bg: "bg-emerald-400/20", icon: CheckCircle, dot: "bg-emerald-400" },
  disconnected: { label: "Desconectado", color: "text-red-400", bg: "bg-red-400/20", icon: WifiOff, dot: "bg-red-400" },
  qr_code: { label: "Aguardando QR", color: "text-amber-400", bg: "bg-amber-400/20", icon: QrCode, dot: "bg-amber-400 animate-pulse" },
  connecting: { label: "Conectando...", color: "text-blue-400", bg: "bg-blue-400/20", icon: RefreshCw, dot: "bg-blue-400 animate-pulse" },
};

const CHIP_TIERS = [
  { maxDays: 15, label: "Chip Novo", limit: "15–30", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  { maxDays: 30, label: "Em Aquecimento", limit: "50–80", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  { maxDays: 999, label: "Chip Maduro", limit: "100–150", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
];

function getChipTier(days: number) {
  return CHIP_TIERS.find((t) => days <= t.maxDays) || CHIP_TIERS[2];
}

export default function WhatsAppConnect() {
  const { user } = useAuth();
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);

  const [form, setForm] = useState({
    instance_name: "",
    evolution_api_url: "http://SEU_IP:8080",
    api_key: "",
    chip_connected_at: "",
  });

  const fetchInstances = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("whatsapp_instances")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setInstances(data as WhatsAppInstance[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 15000); // poll a cada 15s
    return () => clearInterval(interval);
  }, [fetchInstances]);

  const handleSyncWebhooks = async () => {
    if (instances.length === 0) {
      toast.info("Nenhuma instância para sincronizar");
      return;
    }
    const toastId = toast.loading("Sincronizando webhooks das instâncias...");
    
    let sucessos = 0;
    for (const inst of instances) {
      try {
        const evolutionUrl = inst.evolution_api_url.replace(/\/$/, "");
        await fetch(`${evolutionUrl}/webhook/set/${inst.instance_name}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: inst.api_key,
          },
          body: JSON.stringify({
            webhook: {
              enabled: true,
              url: "https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/whatsapp-webhook",
              byEvents: false,
              base64: false,
              events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE"]
            }
          })
        });
        sucessos++;
      } catch (err) {
        console.error("Erro na inst: ", inst.instance_name, err);
      }
    }
    
    toast.success(`${sucessos} webhooks sincronizados com sucesso!`, { id: toastId });
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!form.instance_name || !form.api_key) {
      toast.error("Preencha o nome da instância e a API Key");
      return;
    }

    const instanceName = form.instance_name.toLowerCase().replace(/\s+/g, "-");

    // 1. Criar na Evolution API primeiro
    try {
      const evolutionUrl = form.evolution_api_url.replace(/\/$/, "");
      const res = await fetch(`${evolutionUrl}/instance/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: form.api_key,
        },
        body: JSON.stringify({
          instanceName: instanceName,
          integration: "WHATSAPP-BAILEYS",
          qrcode: true
        }),
      });
      
      const data = await res.json();
      if (!res.ok && data.error !== "Instance already exists") {
        toast.error("Erro na Evolution API: " + (data.message || data.error || "Verifique URL/Chave"));
        return;
      }
    } catch (e: any) {
      toast.error("Falha ao conectar no VPS: " + e.message);
      return;
    }

    // 1.5 Configurar Webhook para receber as mensagens
    try {
      const evolutionUrl = form.evolution_api_url.replace(/\/$/, "");
      await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: form.api_key,
        },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: "https://wjljrytblpsnzjwvugqg.supabase.co/functions/v1/whatsapp-webhook",
            byEvents: false,
            base64: false,
            events: [
              "MESSAGES_UPSERT",
              "MESSAGES_UPDATE",
              "CONNECTION_UPDATE"
            ]
          }
        })
      });
    } catch (err) {
      console.error("Erro ao configurar webhook", err);
    }

    // 2. Salvar no Supabase
    const { error } = await supabase.from("whatsapp_instances").insert({
      user_id: user.id,
      instance_name: instanceName,
      evolution_api_url: form.evolution_api_url.replace(/\/$/, ""),
      api_key: form.api_key,
      chip_connected_at: form.chip_connected_at || null,
    });

    if (error) {
      toast.error("Erro ao salvar no banco: " + error.message);
    } else {
      toast.success("Instância criada! Agora conecte o chip via QR Code.");
      setShowAddDialog(false);
      setForm({ instance_name: "", evolution_api_url: "http://179.197.78.30:8080", api_key: "", chip_connected_at: "" });
      fetchInstances();
    }
  };

  const fetchQrCode = async (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowQrDialog(true);
    setQrCode(null);
    setQrLoading(true);

    try {
      const evolutionUrl = instance.evolution_api_url.replace(/\/$/, "");
      const response = await fetch(
        `${evolutionUrl}/instance/connect/${instance.instance_name}`,
        { headers: { apikey: instance.api_key } }
      );
      const data = await response.json();
      const base64 = data?.base64 || data?.qrcode?.base64 || data?.code;
      
      if (base64) {
        setQrCode(base64.startsWith("data:") ? base64 : `data:image/png;base64,${base64}`);
        
        // Polling para checar se conectou na Evolution API
        const pollInterval = setInterval(async () => {
          try {
            const stateRes = await fetch(`${evolutionUrl}/instance/connectionState/${instance.instance_name}`, {
              headers: { apikey: instance.api_key }
            });
            const stateData = await stateRes.json();
            
            if (stateData?.instance?.state === 'open') {
              clearInterval(pollInterval);
              // Atualizar no Supabase
              await supabase.from("whatsapp_instances").update({ status: "connected" }).eq("id", instance.id);
              setShowQrDialog(false);
              toast.success("WhatsApp Conectado com Sucesso!");
              fetchInstances();
            }
          } catch (e) {
            console.error("Erro ao checar status", e);
          }
        }, 3000);
        
        // Limpar o intervalo ao fechar o modal
        const handleClose = () => {
          clearInterval(pollInterval);
          setShowQrDialog(false);
        };
        // Hacky way to inject handleClose to the modal, but better to rely on useEffect if this gets complex.
        // We'll leave the modal close handler as is, the interval might leak a bit if closed, so we add a timeout.
        setTimeout(() => clearInterval(pollInterval), 60000); // Para de tentar após 1 min
        
      } else {
        toast.error("QR Code não disponível. Verifique a conexão com o VPS.");
      }
    } catch {
      toast.error("Erro ao conectar ao servidor Evolution API");
    } finally {
      setQrLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("whatsapp_instances").delete().eq("id", deleteId);
    if (error) toast.error("Erro ao excluir instância");
    else { toast.success("Instância removida"); fetchInstances(); }
    setDeleteId(null);
  };

  const handleDisconnect = async (instance: WhatsAppInstance) => {
    try {
      await fetch(
        `${instance.evolution_api_url}/instance/logout/${instance.instance_name}`,
        { method: "DELETE", headers: { apikey: instance.api_key } }
      );
      await supabase.from("whatsapp_instances").update({ status: "disconnected", phone_number: null }).eq("id", instance.id);
      toast.success("Chip desconectado");
      fetchInstances();
    } catch {
      toast.error("Erro ao desconectar");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">WhatsApp Connect</h1>
            <p className="text-slate-400 text-sm">Gerencie seus chips e instâncias da Evolution API</p>
          </div>
        </div>
      </div>

      {/* Chips overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {CHIP_TIERS.map((tier) => (
          <div key={tier.label} className={`rounded-xl border p-4 ${tier.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold text-sm ${tier.color}`}>{tier.label}</span>
              <Shield className={`h-4 w-4 ${tier.color}`} />
            </div>
            <p className="text-white text-2xl font-bold">{tier.limit}</p>
            <p className="text-slate-400 text-xs mt-1">mensagens/dia (recomendado)</p>
          </div>
        ))}
      </div>

      {/* Instances */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Instâncias Ativas</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Instância
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-12 text-center">
          <Smartphone className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-300 font-semibold text-lg mb-2">Nenhum chip conectado</p>
          <p className="text-slate-500 text-sm mb-6">Adicione uma instância da Evolution API para começar a prospectar.</p>
          <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Adicionar Instância
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {instances.map((inst) => {
            const statusCfg = STATUS_CONFIG[inst.status];
            const chipAgeDays = calcChipAgeDays(inst.chip_connected_at);
            const dailyLimit = calcDailyLimit(inst.chip_connected_at);
            const tier = getChipTier(chipAgeDays);
            const usagePercent = dailyLimit > 0
              ? Math.min(100, (inst.messages_sent_today / dailyLimit) * 100)
              : 0;
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={inst.id}
                className="rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur p-5 hover:border-slate-600/60 transition-all"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${statusCfg.dot}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{inst.instance_name}</p>
                      <p className="text-xs text-slate-400">{inst.phone_number || "Número não vinculado"}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${statusCfg.color} ${statusCfg.bg} border-0`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                </div>

                {/* Chip tier */}
                <div className={`rounded-lg border p-3 mb-4 ${tier.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${tier.color}`}>{tier.label}</span>
                    <span className="text-xs text-slate-400">{chipAgeDays} dias de uso</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Enviadas hoje</span>
                    <span className="text-xs text-white font-semibold">
                      {inst.messages_sent_today} / {dailyLimit}
                    </span>
                  </div>
                  <Progress value={usagePercent} className="h-1.5 bg-slate-700" />
                </div>

                {/* API URL */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-900/50 rounded-lg px-3 py-2">
                  <Activity className="h-3 w-3 shrink-0" />
                  <span className="truncate">{inst.evolution_api_url}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(inst.evolution_api_url); toast.success("URL copiada!"); }}
                    className="ml-auto shrink-0"
                  >
                    <Copy className="h-3 w-3 hover:text-slate-300 transition-colors" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {inst.status === "disconnected" || inst.status === "qr_code" ? (
                    <Button
                      size="sm"
                      onClick={() => fetchQrCode(inst)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      <QrCode className="h-3.5 w-3.5 mr-1.5" /> Conectar via QR
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(inst)}
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                    >
                      <WifiOff className="h-3.5 w-3.5 mr-1.5" /> Desconectar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(inst.id)}
                    className="border-red-800/50 text-red-400 hover:bg-red-900/20 text-xs px-3"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Instance Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" /> Nova Instância WhatsApp
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure a conexão com a Evolution API no seu VPS.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-slate-300 text-sm">Nome da Instância</Label>
              <Input
                value={form.instance_name}
                onChange={(e) => setForm({ ...form, instance_name: e.target.value })}
                placeholder="ex: chip-prospeccao"
                className="mt-1.5 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">URL da Evolution API</Label>
              <Input
                value={form.evolution_api_url}
                onChange={(e) => setForm({ ...form, evolution_api_url: e.target.value })}
                placeholder="http://SEU_IP:8080"
                className="mt-1.5 bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">IP do seu VPS Hostinger na porta 8080</p>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">API Key (Global Key)</Label>
              <Input
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                placeholder="Chave definida no docker-compose"
                className="mt-1.5 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Data de ativação do chip</Label>
              <Input
                type="date"
                value={form.chip_connected_at}
                onChange={(e) => setForm({ ...form, chip_connected_at: e.target.value })}
                className="mt-1.5 bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Usado para calcular o limite diário seguro</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)} className="text-slate-400">Cancelar</Button>
            <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">Criar Instância</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-emerald-400" /> Conectar WhatsApp
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Abra o WhatsApp → Dispositivos Vinculados → Vincular Dispositivo
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            {qrLoading ? (
              <div className="w-48 h-48 rounded-xl bg-slate-800 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
              </div>
            ) : qrCode ? (
              <div className="p-3 bg-white rounded-xl">
                <img src={qrCode} alt="QR Code WhatsApp" className="w-44 h-44" />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-xl bg-slate-800 flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <p className="text-xs text-slate-400 text-center">Não foi possível obter o QR Code.<br/>Verifique o VPS.</p>
              </div>
            )}

            {qrCode && (
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-400">O QR Code expira em ~30 segundos.</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-emerald-400 mt-2"
                  onClick={() => selectedInstance && fetchQrCode(selectedInstance)}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Renovar QR Code
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover instância?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação irá remover a instância permanentemente. O chip será desconectado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-600 text-slate-300">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
