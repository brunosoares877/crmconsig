import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, Filter, Users, CheckCircle, XCircle, Send, MessageSquare,
  HandshakeIcon, Upload, RefreshCw, ChevronDown, MoreVertical,
  Phone, MapPin, CreditCard, Zap, Clock, Eye, UserCheck, AlertTriangle,
  Play, Pause, BarChart3, ArrowRight, Plus, FileText, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type KanbanStatus = "para_validar" | "sem_whatsapp" | "fila_disparo" | "mensagem_enviada" | "atendimento_manual";

interface ProspectingLead {
  id: string;
  nome: string;
  cpf?: string;
  beneficio?: string;
  municipio?: string;
  telefone1?: string;
  telefone2?: string;
  telefone3?: string;
  tel_valido?: string;
  kanban_status: KanbanStatus;
  mensagens_enviadas: number;
  ultima_mensagem_at?: string;
  observacoes?: string;
  importado_em: string;
}

interface WhatsAppInstance {
  id: string;
  instance_name: string;
  status: string;
  daily_limit: number;
  messages_sent_today: number;
}

// ─── Configuração das colunas ─────────────────────────────────────────────────
const COLUMNS: { status: KanbanStatus; label: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  {
    status: "para_validar",
    label: "Para Validar",
    icon: Search,
    color: "text-slate-300",
    bg: "bg-slate-700/30",
    border: "border-slate-600/40",
  },
  {
    status: "sem_whatsapp",
    label: "Sem WhatsApp",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-900/20",
    border: "border-red-700/30",
  },
  {
    status: "fila_disparo",
    label: "Fila de Disparo",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-900/20",
    border: "border-amber-700/30",
  },
  {
    status: "mensagem_enviada",
    label: "Mensagem Enviada",
    icon: Send,
    color: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-700/30",
  },
  {
    status: "atendimento_manual",
    label: "Atendimento Manual",
    icon: MessageSquare,
    color: "text-emerald-400",
    bg: "bg-emerald-900/20",
    border: "border-emerald-700/30",
  },
];

// ─── Lead Card ─────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  onMove,
  onView,
}: {
  lead: ProspectingLead;
  onMove: (id: string, status: KanbanStatus) => void;
  onView: (lead: ProspectingLead) => void;
}) {
  const firstName = lead.nome?.split(" ")[0] || lead.nome;

  return (
    <div
      className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-3.5 hover:border-slate-500/70 
                 hover:bg-slate-800/90 transition-all cursor-pointer group shadow-sm hover:shadow-md"
      onClick={() => onView(lead)}
    >
      {/* Nome + Menu */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{firstName.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">{firstName}</p>
            {lead.municipio && (
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5" /> {lead.municipio}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-700">
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white" align="end">
            {COLUMNS.filter((c) => c.status !== lead.kanban_status).map((col) => (
              <DropdownMenuItem
                key={col.status}
                onClick={(e) => { e.stopPropagation(); onMove(lead.id, col.status); }}
                className="text-xs hover:bg-slate-700"
              >
                <col.icon className={`h-3.5 w-3.5 mr-2 ${col.color}`} /> Mover para {col.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Benefício */}
      {lead.beneficio && (
        <div className="flex items-center gap-1.5 mb-2">
          <CreditCard className="h-3 w-3 text-slate-500" />
          <span className="text-xs text-slate-400 font-mono truncate">{lead.beneficio}</span>
        </div>
      )}

      {/* Telefones */}
      <div className="flex flex-col gap-0.5 mb-2">
        {lead.tel_valido ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-300 font-mono">{lead.tel_valido}</span>
          </div>
        ) : (
          [lead.telefone1, lead.telefone2, lead.telefone3]
            .filter(Boolean)
            .slice(0, 2)
            .map((tel, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                <span className="text-xs text-slate-500 font-mono">{tel}</span>
              </div>
            ))
        )}
      </div>

      {/* Footer */}
      {lead.mensagens_enviadas > 0 && (
        <div className="flex items-center gap-1 text-xs text-blue-400">
          <Send className="h-3 w-3" /> {lead.mensagens_enviadas} msg{lead.mensagens_enviadas > 1 ? "s" : ""} enviada{lead.mensagens_enviadas > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// ─── Import CSV Modal ──────────────────────────────────────────────────────────
function ImportLeadsModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [rawText, setRawText] = useState("");
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [colMap, setColMap] = useState({
    beneficio: "0",
    cpf: "1",
    nome: "2",
    municipio: "3",
    telefone1: "6",
    telefone2: "7",
    telefone3: "8",
  });

  const parseCSV = useCallback(() => {
    const lines = rawText.trim().split("\n").filter(Boolean);
    const parsed = lines.slice(0, 5).map((line) => {
      const cols = line.split(/[,;\t|]/).map((c) => c.trim().replace(/"/g, ""));
      return {
        nome: cols[Number(colMap.nome)] || "",
        beneficio: cols[Number(colMap.beneficio)] || "",
        cpf: cols[Number(colMap.cpf)] || "",
        municipio: cols[Number(colMap.municipio)] || "",
        telefone1: cols[Number(colMap.telefone1)] || "",
        telefone2: cols[Number(colMap.telefone2)] || "",
        telefone3: cols[Number(colMap.telefone3)] || "",
      };
    });
    setPreview(parsed);
  }, [rawText, colMap]);

  useEffect(() => { if (rawText) parseCSV(); }, [rawText, colMap, parseCSV]);

  const handleImport = async () => {
    if (!user || !rawText.trim()) return;
    setImporting(true);

    try {
      const lines = rawText.trim().split("\n").filter(Boolean);
      const BATCH = 100;
      let total = 0;

      for (let i = 0; i < lines.length; i += BATCH) {
        const batch = lines.slice(i, i + BATCH).map((line) => {
          const cols = line.split(/[,;\t|]/).map((c) => c.trim().replace(/"/g, ""));
          const telefones = [
            cols[Number(colMap.telefone1)] || null,
            cols[Number(colMap.telefone2)] || null,
            cols[Number(colMap.telefone3)] || null,
          ].filter(Boolean);

          return {
            user_id: user.id,
            nome: cols[Number(colMap.nome)] || "Sem nome",
            beneficio: cols[Number(colMap.beneficio)] || null,
            cpf: cols[Number(colMap.cpf)] || null,
            municipio: cols[Number(colMap.municipio)] || null,
            telefone1: telefones[0] || null,
            telefone2: telefones[1] || null,
            telefone3: telefones[2] || null,
            kanban_status: "para_validar",
          };
        });

        const { error } = await supabase.from("prospecting_leads").insert(batch);
        if (error) throw error;
        total += batch.length;
      }

      toast.success(`✅ ${total} leads importados com sucesso!`);
      onSuccess();
      onClose();
      setRawText("");
    } catch (err: any) {
      toast.error("Erro na importação: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-400" /> Importar Leads
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Cole o conteúdo do CSV/Excel abaixo. Separe colunas por vírgula, ponto-e-vírgula ou tab.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mapeamento de colunas */}
          <div>
            <Label className="text-slate-300 text-sm font-semibold">Mapeamento de Colunas (índice, começa em 0)</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {Object.entries(colMap).map(([key, val]) => (
                <div key={key}>
                  <Label className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={val}
                    onChange={(e) => setColMap({ ...colMap, [key]: e.target.value })}
                    className="mt-1 bg-slate-800 border-slate-600 text-white h-8 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Área de colar */}
          <div>
            <Label className="text-slate-300 text-sm font-semibold">Dados (CSV/Excel colado)</Label>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"João Silva;123456789;000.000.000-00;Natal;84999990001;84999990002;84999990003\nMaria Santos;987654321;111.111.111-11;Mossoró;84988880001;;"}
              className="mt-1.5 bg-slate-800 border-slate-600 text-white font-mono text-xs min-h-32"
            />
            {rawText && (
              <p className="text-xs text-slate-500 mt-1">
                {rawText.trim().split("\n").filter(Boolean).length} linha(s) detectadas
              </p>
            )}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <Label className="text-slate-300 text-sm font-semibold">Preview (5 primeiros)</Label>
              <div className="mt-1.5 rounded-lg border border-slate-700 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800/50">
                      {Object.keys(preview[0]).map((k) => (
                        <th key={k} className="px-2 py-2 text-left text-slate-400 capitalize">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/30">
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} className="px-2 py-1.5 text-slate-300 truncate max-w-24">{v || "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-slate-400">Cancelar</Button>
          <Button
            onClick={handleImport}
            disabled={!rawText.trim() || importing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {importing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {importing ? "Importando..." : "Importar Leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function WhatsAppProspecting() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<ProspectingLead[]>([]);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ProspectingLead | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState({ current: 0, total: 0 });

  const fetchData = useCallback(async () => {
    if (!user) return;

    const [leadsRes, instRes] = await Promise.all([
      supabase.from("prospecting_leads").select("*").eq("user_id", user.id).order("importado_em", { ascending: false }),
      supabase.from("whatsapp_instances").select("*").eq("user_id", user.id).eq("status", "connected"),
    ]);

    if (leadsRes.data) setLeads(leadsRes.data as ProspectingLead[]);
    if (instRes.data) {
      setInstances(instRes.data as WhatsAppInstance[]);
      if (instRes.data.length > 0 && !selectedInstance) {
        setSelectedInstance(instRes.data[0].id);
      }
    }
    setLoading(false);
  }, [user, selectedInstance]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMoveCard = async (leadId: string, newStatus: KanbanStatus) => {
    await supabase.from("prospecting_leads").update({ kanban_status: newStatus }).eq("id", leadId);
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, kanban_status: newStatus } : l));
    toast.success("Lead movido!");
  };

  const handleValidateBatch = async () => {
    if (!selectedInstance) { toast.error("Selecione uma instância conectada"); return; }
    setValidating(true);

    try {
      const inst = instances.find(i => i.id === selectedInstance);
      if (!inst) throw new Error("Instância não encontrada");

      const { data: leadsToValidate } = await supabase
        .from("prospecting_leads")
        .select("*")
        .eq("kanban_status", "para_validar")
        .is("whatsapp_validado_at", null);

      if (!leadsToValidate || leadsToValidate.length === 0) {
        toast.info("Nenhum lead aguardando validação nesta instância.");
        setValidating(false);
        return;
      }

      setValidationProgress({ current: 0, total: leadsToValidate.length });
      toast.info(`Iniciando validação de ${leadsToValidate.length} leads... Aguarde.`);

      let withWA = 0;
      let withoutWA = 0;
      let current = 0;

      for (const lead of leadsToValidate) {
        const phones = [lead.telefone1, lead.telefone2, lead.telefone3].filter(Boolean);
        let validPhone = null;

        for (const phone of phones) {
          const digits = phone.replace(/\D/g, "");
          if (digits.length < 10) continue;
          const normalized = digits.startsWith("55") ? digits : `55${digits}`;

          try {
            const evolutionUrl = inst.evolution_api_url.replace(/\/$/, "");
            const res = await fetch(`${evolutionUrl}/chat/whatsappNumbers/${inst.instance_name}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", apikey: inst.api_key },
              body: JSON.stringify({ numbers: [normalized] })
            });
            const data = await res.json();
            
            if (Array.isArray(data)) {
              const result = data.find((item: any) => item.number === normalized || item.jid?.includes(normalized));
              if (result?.exists === true || result?.onWhatsapp === true || result?.exists) {
                validPhone = phone;
                break;
              }
            }
          } catch (e) {
            console.error("Erro ao validar telefone", phone, e);
          }
          await new Promise(r => setTimeout(r, 500)); // Pequena pausa
        }

        await supabase.from("prospecting_leads").update({
          tel_valido: validPhone,
          whatsapp_validado_at: new Date().toISOString(),
          kanban_status: validPhone ? "fila_disparo" : "sem_whatsapp",
        }).eq("id", lead.id);

        if (validPhone) withWA++; else withoutWA++;
        
        current++;
        setValidationProgress(prev => ({ ...prev, current }));
      }

      toast.success(`✅ ${withWA} com WhatsApp, ${withoutWA} sem`);
      fetchData();
    } catch (e: any) {
      toast.error("Erro na validação: " + e.message);
    } finally {
      setValidating(false);
    }
  };

  const filteredLeads = leads.filter((l) =>
    !search ||
    l.nome?.toLowerCase().includes(search.toLowerCase()) ||
    l.municipio?.toLowerCase().includes(search.toLowerCase()) ||
    l.cpf?.includes(search) ||
    l.beneficio?.includes(search)
  );

  const countByStatus = (status: KanbanStatus) => filteredLeads.filter((l) => l.kanban_status === status).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Prospecção WhatsApp</h1>
              <p className="text-xs text-slate-400">{leads.length} leads no funil</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Instância selecionada */}
            {instances.length > 0 && (
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="h-8 w-48 bg-slate-800 border-slate-600 text-white text-xs">
                  <SelectValue placeholder="Selecionar chip" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {instances.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id} className="text-xs">
                      📱 {inst.instance_name} ({inst.messages_sent_today}/{inst.daily_limit}/dia)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Limpar Todos */}
            <Button
              size="sm"
              onClick={async () => {
                if (!confirm("Tem certeza que deseja apagar TODOS os leads?")) return;
                const { error } = await supabase.from("prospecting_leads").delete().eq("user_id", user?.id);
                if (error) toast.error("Erro ao apagar: " + error.message);
                else { toast.success("Todos os leads apagados!"); fetchData(); }
              }}
              className="bg-red-900/50 hover:bg-red-800 text-red-100 text-xs h-8 border border-red-800"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Limpar Tudo
            </Button>

            {/* Validar lote */}
            <Button
              size="sm"
              onClick={handleValidateBatch}
              disabled={validating || !selectedInstance}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
            >
              {validating ? <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
              Validar Lote
            </Button>

            {/* Importar */}
            <Button
              size="sm"
              onClick={() => setShowImport(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Importar CSV
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {validating && validationProgress.total > 0 && (
          <div className="absolute bottom-0 left-0 w-full bg-slate-800 h-1">
            <div 
              className="bg-emerald-500 h-1 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
              style={{ width: `${(validationProgress.current / validationProgress.total) * 100}%` }}
            />
          </div>
        )}

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, município, CPF ou benefício..."
            className="pl-9 h-8 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 text-sm"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-3 min-w-max h-full">
          {COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.kanban_status === col.status);
            const ColIcon = col.icon;

            return (
              <div
                key={col.status}
                className={`w-64 rounded-2xl border ${col.border} ${col.bg} flex flex-col`}
                style={{ minHeight: "calc(100vh - 220px)" }}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-700/30 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ColIcon className={`h-4 w-4 ${col.color}`} />
                      <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                    </div>
                    <Badge className="bg-slate-700/60 text-slate-300 border-0 text-xs">
                      {colLeads.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-20">
                      <RefreshCw className="h-4 w-4 text-slate-500 animate-spin" />
                    </div>
                  ) : colLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-center">
                      <ColIcon className={`h-6 w-6 ${col.color} opacity-30 mb-1`} />
                      <p className="text-xs text-slate-600">Nenhum lead aqui</p>
                    </div>
                  ) : (
                    colLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onMove={handleMoveCard}
                        onView={setSelectedLead}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Import Modal */}
      <ImportLeadsModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={fetchData}
      />

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Dialog open onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold">{selectedLead.nome.charAt(0)}</span>
                </div>
                {selectedLead.nome}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                {selectedLead.beneficio && (
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Benefício</p>
                    <p className="text-sm font-mono text-white">{selectedLead.beneficio}</p>
                  </div>
                )}
                {selectedLead.cpf && (
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">CPF</p>
                    <p className="text-sm font-mono text-white">{selectedLead.cpf}</p>
                  </div>
                )}
                {selectedLead.municipio && (
                  <div className="bg-slate-800 rounded-lg p-3 col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Município</p>
                    <p className="text-sm text-white">{selectedLead.municipio}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-2">Telefones</p>
                {[
                  { tel: selectedLead.telefone1, label: "Tel 1" },
                  { tel: selectedLead.telefone2, label: "Tel 2" },
                  { tel: selectedLead.telefone3, label: "Tel 3" },
                ].filter((t) => t.tel).map((t) => (
                  <div key={t.label} className="flex items-center gap-2 py-1">
                    <div className={`w-2 h-2 rounded-full ${t.tel === selectedLead.tel_valido ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <span className="text-xs text-slate-400">{t.label}:</span>
                    <span className="text-xs font-mono text-white">{t.tel}</span>
                    {t.tel === selectedLead.tel_valido && (
                      <Badge className="text-xs bg-emerald-900/50 text-emerald-400 border-emerald-700/50 h-4">WA</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge className="text-xs">
                  {COLUMNS.find((c) => c.status === selectedLead.kanban_status)?.label}
                </Badge>
                <span className="text-xs text-slate-500">{selectedLead.mensagens_enviadas} msg(s) enviada(s)</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedLead(null)} className="text-slate-400">Fechar</Button>
              {selectedLead.tel_valido && (
                <Button
                  onClick={() => {
                    window.open(`https://wa.me/55${selectedLead.tel_valido?.replace(/\D/g, "")}`, "_blank");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Abrir WhatsApp
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
