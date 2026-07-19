import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MessageSquare, Send, RefreshCw, Search, Phone, CheckCheck,
  Check, Clock, AlertCircle, User, Smile, Paperclip, ArrowLeft,
  Circle, CheckCircle, MoreVertical, Archive, ExternalLink,
  KanbanSquare, List, X, Tag, Plus, UploadCloud, ImageIcon, FileText, Film, Zap, Trash2, MessageSquarePlus, Settings, GitMerge, Mic, Square, Trash, Play
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WhatsAppCRMSettings, WhatsAppTag, WhatsAppQuickReply } from "@/components/WhatsAppCRMSettings";
import { FunnelEnrollModal } from "@/components/FunnelEnrollModal";

interface Conversation {
  id: string;
  user_id: string;
  lead_id?: string;
  instance_id?: string;
  telefone: string;
  nome_contato: string;
  ultima_mensagem: string;
  ultima_mensagem_at: string;
  direcao_ultima: "enviada" | "recebida";
  nao_lidas: number;
  status: string;
  funnel_stage: string;
  tags: string[];
  instance_id: string;
  whatsapp_instances?: { instance_name: string };
}

interface FunnelStep {
  id: string;
  funnel_id: string;
  ordem_etapa: number;
  mensagem_template: string;
  tipo_midia: string | null;
  media_url: string | null;
}

interface Funnel {
  id: string;
  nome: string;
  descricao: string;
  steps?: FunnelStep[];
}

interface Message {
  id: string;
  direcao: "enviada" | "recebida";
  tipo: string;
  conteudo: string;
  media_url?: string;
  status: string;
  timestamp_whatsapp: string;
  created_at: string;
}

interface WhatsAppInstance {
  id: string;
  instance_name: string;
  evolution_api_url: string;
  api_key: string;
  status: string;
}

const STATUS_ICONS = {
  enviando: <Clock className="h-3 w-3 text-slate-400" />,
  enviado: <Check className="h-3 w-3 text-slate-400" />,
  entregue: <CheckCheck className="h-3 w-3 text-slate-400" />,
  lido: <CheckCheck className="h-3 w-3 text-blue-400" />,
  falhou: <AlertCircle className="h-3 w-3 text-red-400" />,
};

const DEFAULT_FUNNEL_STAGES = [
  { id: "novo_contato", label: "Novo Contato", color: "border-slate-500", bg: "bg-slate-700/50" },
  { id: "em_atendimento", label: "Em Atendimento", color: "border-blue-500", bg: "bg-blue-900/40" },
  { id: "apresentacao", label: "Apresentação", color: "border-purple-500", bg: "bg-purple-900/40" },
  { id: "negociacao", label: "Negociação", color: "border-amber-500", bg: "bg-amber-900/40" },
  { id: "ganho", label: "Ganho", color: "border-emerald-500", bg: "bg-emerald-900/40" },
  { id: "perdido", label: "Perdido", color: "border-red-500", bg: "bg-red-900/40" }
];

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

export default function WhatsAppInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  
  const [tags, setTags] = useState<WhatsAppTag[]>([]);
  const [quickReplies, setQuickReplies] = useState<WhatsAppQuickReply[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedInstanceFilter, setSelectedInstanceFilter] = useState<string>("all");
  
  const getTagColor = useCallback((label: string) => {
    const tag = tags.find(t => t.label === label);
    return tag ? tag.color : "bg-slate-700 text-slate-300 border-slate-600";
  }, [tags]);

  const fetchCRMConfig = useCallback(async () => {
    if (!user) return;
    try {
      const [tagsRes, repliesRes, stagesRes] = await Promise.all([
        supabase.from("whatsapp_tags").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("whatsapp_quick_replies").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        supabase.from("whatsapp_funnel_stages").select("*").eq("user_id", user.id)
      ]);
      if (tagsRes.data) setTags(tagsRes.data as WhatsAppTag[]);
      if (repliesRes.data) setQuickReplies(repliesRes.data as WhatsAppQuickReply[]);
      if (stagesRes.data && stagesRes.data.length > 0) {
        // Mesclar com os padrões
        const mergedStages = DEFAULT_FUNNEL_STAGES.map(defaultStage => {
          const customStage = stagesRes.data.find(s => s.stage_id === defaultStage.id);
          return customStage ? { ...defaultStage, label: customStage.label } : defaultStage;
        });
        setFunnelStages(mergedStages);
      }

      // Buscar funis para disparo manual
      const { data: funnelsData } = await supabase.from("whatsapp_funnels").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
      const { data: stepsData } = await supabase.from("whatsapp_funnel_steps").select("*").order("ordem_etapa", { ascending: true });
      
      if (funnelsData && stepsData) {
        const funnelsWithSteps = funnelsData.map(f => ({
          ...f,
          steps: stepsData.filter(s => s.funnel_id === f.id)
        }));
        setFunnels(funnelsWithSteps);
      }
    } catch (e) {
      console.error("Erro ao buscar config do CRM:", e);
    }
  }, [user]);

  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "funnel">("list");
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");

  const [funnelStages, setFunnelStages] = useState(DEFAULT_FUNNEL_STAGES);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageLabel, setEditingStageLabel] = useState("");

  const [isFunnelModalOpen, setIsFunnelModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("whatsapp_conversations")
      .select("*, whatsapp_instances(instance_name)")
      .eq("user_id", user.id)
      .order("ultima_mensagem_at", { ascending: false });

    if (data) {
      // Garantir valores default
      const processed = data.map(c => ({
        ...c,
        tags: c.tags || [],
        funnel_stage: c.funnel_stage || 'novo_contato'
      }));
      setConversations(processed as Conversation[]);
      
      // Atualizar o selectedConv sem causar loop infinito
      setSelectedConv(prev => {
        if (!prev) return null;
        const updatedSelected = processed.find(c => c.id === prev.id);
        if (updatedSelected) {
          // Se for idêntico, retorna o prev para evitar re-render desnecessário
          if (JSON.stringify(prev) === JSON.stringify(updatedSelected)) {
            return prev;
          }
          return updatedSelected as Conversation;
        }
        return prev;
      });
    }
    setLoading(false);
  }, [user]);

  const fetchInstances = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("whatsapp_instances")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "connected");
    if (data) setInstances(data as WhatsAppInstance[]);
  }, [user]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchInstances();
    fetchCRMConfig();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchInstances, fetchCRMConfig]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      supabase.from("whatsapp_conversations").update({ nao_lidas: 0 }).eq("id", selectedConv.id).then(() => {
        setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, nao_lidas: 0 } : c));
      });
      const interval = setInterval(() => fetchMessages(selectedConv.id), 8000);
      return () => clearInterval(interval);
    }
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteConversation = async (convId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar todo o histórico dessa conversa? Essa ação não pode ser desfeita.")) return;
    try {
      await supabase.from("whatsapp_conversations").delete().eq("id", convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (selectedConv?.id === convId) setSelectedConv(null);
      toast.success("Conversa excluída");
    } catch (e) {
      toast.error("Erro ao excluir conversa");
    }
  };

  const handleCreateContact = async () => {
    if (!newContactName.trim() || !newContactPhone.trim()) {
      toast.error("Preencha nome e telefone");
      return;
    }
    const digits = newContactPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Telefone inválido");
      return;
    }
    const normalized = digits.startsWith("55") ? digits : `55${digits}`;
    const jid = `${normalized}@s.whatsapp.net`;
    
    const inst = instances[0];
    if (!inst) {
      toast.error("Nenhuma instância conectada para criar o contato");
      return;
    }
    
    try {
      const { data, error } = await supabase.from("whatsapp_conversations").insert({
        user_id: user?.id,
        instance_id: inst.id,
        telefone: jid,
        nome_contato: newContactName,
        status: "open",
        funnel_stage: "novo_contato"
      }).select("*, whatsapp_instances(instance_name)").single();
      
      if (error) throw error;
      
      const newConv = { ...data, tags: [], funnel_stage: "novo_contato" };
      setConversations(prev => [newConv, ...prev]);
      setSelectedConv(newConv as Conversation);
      setShowNewContactModal(false);
      setNewContactPhone("");
      setNewContactName("");
      toast.success("Contato adicionado!");
    } catch (e) {
      toast.error("Erro ao criar contato (talvez já exista)");
    }
  };

  const handleUpdateStage = async (convId: string, stage: string) => {
    try {
      await supabase.from("whatsapp_conversations").update({ funnel_stage: stage }).eq("id", convId);
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, funnel_stage: stage } : c));
      toast.success("Etapa atualizada");
    } catch (err) {
      toast.error("Erro ao atualizar etapa");
    }
  };

  const handleToggleTag = async (conv: Conversation, tag: string) => {
    try {
      const currentTags = conv.tags || [];
      const newTags = currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      
      await supabase.from("whatsapp_conversations").update({ tags: newTags }).eq("id", conv.id);
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, tags: newTags } : c));
    } catch (err) {
      toast.error("Erro ao atualizar etiquetas");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordedAudio(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSend = async () => {
    if (!selectedConv || (!newMessage.trim() && !selectedFile && !recordedAudio) || !user) return;
    setSending(true);

    const instance = instances.find((i) => i.id === selectedConv.instance_id);
    if (!instance) {
      toast.error("Instância não conectada");
      setSending(false);
      return;
    }

    // Validação de Aquecimento de Chip (Limite Diário)
    const chipAgeDays = (() => {
      if (!instance.chip_connected_at) return 0;
      const diff = Date.now() - new Date(instance.chip_connected_at).getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    })();
    const dailyLimit = chipAgeDays < 15 ? 20 : (chipAgeDays < 30 ? 65 : 125);

    if (instance.messages_sent_today >= dailyLimit) {
      toast.error(`Limite diário do chip atingido (${dailyLimit} msgs). Aguarde até amanhã para proteger o chip!`);
      setSending(false);
      return;
    }

    const digits = selectedConv.telefone.replace(/\D/g, "");
    const normalized = digits.startsWith("55") ? digits : `55${digits}`;

    try {
      let result;
      let msgTipo = "texto";
      let base64Data = null;

      if (recordedAudio) {
        // Enviar Audio Gravado
        const reader = new FileReader();
        base64Data = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(recordedAudio);
        }) as string;
        
        msgTipo = "audio";
        const response = await fetch(
          `${instance.evolution_api_url.replace(/\/$/, "")}/message/sendWhatsAppAudio/${instance.instance_name}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: instance.api_key },
            body: JSON.stringify({
              number: normalized,
              audio: base64Data.split(",")[1],
              delay: 1000
            }),
          }
        );
        if (!response.ok) throw new Error("Falha ao enviar áudio");
        result = await response.json();
      } else if (selectedFile) {
        // Enviar Mídia
        base64Data = await toBase64(selectedFile);
        let mediatype = "document";
        if (selectedFile.type.startsWith("image/")) { mediatype = "image"; msgTipo = "imagem"; }
        else if (selectedFile.type.startsWith("video/")) { mediatype = "video"; msgTipo = "video"; }
        else if (selectedFile.type.startsWith("audio/")) { mediatype = "audio"; msgTipo = "audio"; }

        const response = await fetch(
          `${instance.evolution_api_url.replace(/\/$/, "")}/message/sendMedia/${instance.instance_name}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: instance.api_key },
            body: JSON.stringify({
              number: normalized,
              options: { delay: 1000 },
              mediaMessage: {
                mediatype: mediatype,
                fileName: selectedFile.name,
                caption: newMessage.trim(),
                media: base64Data.split(",")[1] // Remove o data:image/jpeg;base64,
              }
            }),
          }
        );
        if (!response.ok) throw new Error("Falha ao enviar mídia");
        result = await response.json();
        
      } else {
        // Enviar Texto Normal
        const response = await fetch(
          `${instance.evolution_api_url.replace(/\/$/, "")}/message/sendText/${instance.instance_name}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", apikey: instance.api_key },
            body: JSON.stringify({ number: normalized, text: newMessage.trim(), delay: 1000 }),
          }
        );
        if (!response.ok) throw new Error("Falha ao enviar texto");
        result = await response.json();
      }

      // Salvar mensagem localmente
      const { data: savedMsg } = await supabase.from("whatsapp_messages").insert({
        conversation_id: selectedConv.id,
        evolution_message_id: result?.key?.id,
        direcao: "enviada",
        tipo: msgTipo,
        conteudo: newMessage.trim() || selectedFile?.name || "Mídia enviada",
        media_url: base64Data, // Salva o base64 para preview imediato (se não for gigante)
        status: "enviado",
        timestamp_whatsapp: new Date().toISOString(),
      }).select().single();

      if (savedMsg) setMessages((prev) => [...prev, savedMsg as Message]);

      // Atualizar última mensagem da conversa
      await supabase.from("whatsapp_conversations").update({
        ultima_mensagem: newMessage.trim() || selectedFile?.name || (recordedAudio ? "Áudio gravado" : "Mídia enviada"),
        ultima_mensagem_at: new Date().toISOString(),
        direcao_ultima: "enviada",
      }).eq("id", selectedConv.id);

      // Incrementar contador de disparos (Aquecimento)
      await supabase.rpc("increment_messages_sent", { p_instance_id: instance.id });
      setInstances(prev => prev.map(i => i.id === instance.id ? { ...i, messages_sent_today: (i.messages_sent_today || 0) + 1 } : i));

      setNewMessage("");
      setSelectedFile(null);
      setRecordedAudio(null);
      fetchConversations();
    } catch (err: any) {
      toast.error("Erro ao enviar: " + (err.message || "Desconhecido"));
    } finally {
      setSending(false);
    }
  };

  const handleSendManualFunnelStep = async (step: FunnelStep) => {
    if (!step.tipo_midia || step.tipo_midia === "texto") {
      setNewMessage(prev => prev + (prev ? " " : "") + step.mensagem_template);
      return;
    }

    if (!selectedConv || !user) return;
    setSending(true);

    const instance = instances.find((i) => i.id === selectedConv.instance_id);
    if (!instance) {
      toast.error("Instância não conectada");
      setSending(false);
      return;
    }

    // Validação de Aquecimento de Chip (Limite Diário)
    const chipAgeDays = (() => {
      if (!instance.chip_connected_at) return 0;
      const diff = Date.now() - new Date(instance.chip_connected_at).getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    })();
    const dailyLimit = chipAgeDays < 15 ? 20 : (chipAgeDays < 30 ? 65 : 125);

    if (instance.messages_sent_today >= dailyLimit) {
      toast.error(`Limite diário do chip atingido (${dailyLimit} msgs). Aguarde até amanhã para proteger o chip!`);
      setSending(false);
      return;
    }

    const digits = selectedConv.telefone.replace(/\D/g, "");
    const normalized = digits.startsWith("55") ? digits : `55${digits}`;

    try {
      let result;
      let endpoint = `/message/sendMedia/${instance.instance_name}`;
      let body: any = {
        number: normalized,
        delay: 1000
      };

      if (step.tipo_midia === "audio") {
        endpoint = `/message/sendWhatsAppAudio/${instance.instance_name}`;
        body.audio = step.media_url;
      } else {
        body.media = step.media_url;
        body.mediatype = step.tipo_midia === "video" ? "video" : "image";
        body.caption = step.mensagem_template || "";
      }

      const response = await fetch(`${instance.evolution_api_url.replace(/\/$/, "")}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: instance.api_key },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Falha ao enviar ${step.tipo_midia}`);
      result = await response.json();

      const { data: savedMsg } = await supabase.from("whatsapp_messages").insert({
        conversation_id: selectedConv.id,
        evolution_message_id: result?.key?.id || result?.messageId,
        direcao: "enviada",
        tipo: step.tipo_midia,
        conteudo: step.mensagem_template || (step.tipo_midia === "audio" ? "Áudio enviado do funil" : "Mídia do funil"),
        media_url: step.media_url,
        status: "enviado",
        timestamp_whatsapp: new Date().toISOString(),
      }).select().single();

      if (savedMsg) setMessages((prev) => [...prev, savedMsg as Message]);

      await supabase.from("whatsapp_conversations").update({
        ultima_mensagem: step.mensagem_template || (step.tipo_midia === "audio" ? "Áudio enviado do funil" : "Mídia do funil"),
        ultima_mensagem_at: new Date().toISOString(),
        direcao_ultima: "enviada",
      }).eq("id", selectedConv.id);

      // Incrementar contador de disparos (Aquecimento)
      await supabase.rpc("increment_messages_sent", { p_instance_id: instance.id });
      setInstances(prev => prev.map(i => i.id === instance.id ? { ...i, messages_sent_today: (i.messages_sent_today || 0) + 1 } : i));

      toast.success("Etapa enviada!");
      fetchConversations();
    } catch (err: any) {
      toast.error("Erro ao enviar etapa: " + (err.message || "Desconhecido"));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter(
    (c) =>
      (!search ||
        c.nome_contato?.toLowerCase().includes(search.toLowerCase()) ||
        c.telefone?.includes(search) ||
        c.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))) &&
      (selectedInstanceFilter === "all" || c.instance_id === selectedInstanceFilter)
  );

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true });
    } catch {
      return "";
    }
  };

  const renderTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map(tagId => {
          const colorClass = getTagColor(tagId);
          return (
            <span key={tagId} className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium border ${colorClass}`}>
              {tagId}
            </span>
          );
        })}
      </div>
    );
  };

  const handleSaveStageName = async (stageId: string) => {
    if (!editingStageLabel.trim()) {
      setEditingStageId(null);
      return;
    }
    
    // Atualização otimista
    setFunnelStages(prev => prev.map(s => s.id === stageId ? { ...s, label: editingStageLabel } : s));
    setEditingStageId(null);
    
    try {
      const stageObj = DEFAULT_FUNNEL_STAGES.find(s => s.id === stageId);
      
      const { error } = await supabase.from("whatsapp_funnel_stages").upsert({
        user_id: user?.id,
        stage_id: stageId,
        label: editingStageLabel,
        bg: stageObj?.bg || "",
        color: stageObj?.color || ""
      }, { onConflict: "user_id, stage_id" });
      
      if (error) throw error;
      toast.success("Nome da etapa alterado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar nome da etapa");
    }
  };

  // KANBAN VIEW RENDERER
  const renderKanban = () => {
    return (
      <div className="flex-1 flex overflow-x-auto p-4 gap-4 bg-slate-950">
        {funnelStages.map(stage => {
          const stageConvs = filteredConvs.filter(c => c.funnel_stage === stage.id);
          return (
            <div key={stage.id} className="flex flex-col w-72 shrink-0 bg-slate-900/60 rounded-xl border border-slate-800/50">
              <div className={`p-3 border-b-2 ${stage.color} bg-slate-800/50 rounded-t-xl flex justify-between items-center`}>
                {editingStageId === stage.id ? (
                  <Input 
                    autoFocus
                    value={editingStageLabel}
                    onChange={e => setEditingStageLabel(e.target.value)}
                    onBlur={() => handleSaveStageName(stage.id)}
                    onKeyDown={e => { if(e.key === 'Enter') handleSaveStageName(stage.id); if(e.key === 'Escape') setEditingStageId(null); }}
                    className="h-7 text-sm font-semibold bg-slate-900 border-slate-700 text-slate-200 px-2 mr-2"
                  />
                ) : (
                  <h3 
                    className="font-semibold text-slate-200 text-sm cursor-text hover:text-emerald-400 transition-colors" 
                    onClick={() => { setEditingStageId(stage.id); setEditingStageLabel(stage.label); }}
                    title="Clique para renomear"
                  >
                    {stage.label}
                  </h3>
                )}
                <Badge className="bg-slate-700 text-slate-300 hover:bg-slate-700">{stageConvs.length}</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {stageConvs.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">
                          {(conv.nome_contato || conv.telefone).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{conv.nome_contato || conv.telefone}</p>
                        <p className="text-xs text-slate-400 truncate">{formatTime(conv.ultima_mensagem_at)}</p>
                      </div>
                      {conv.nao_lidas > 0 && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-white font-bold">{conv.nao_lidas}</span>
                        </div>
                      )}
                    </div>
                    {renderTags(conv.tags)}
                  </div>
                ))}
                {stageConvs.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhuma conversa</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      
      {/* Sidebar de conversas (Lista) */}
      {viewMode === "list" && (
        <div className={`w-80 border-r border-slate-700/50 bg-slate-900/60 backdrop-blur flex flex-col shrink-0 ${selectedConv ? "hidden lg:flex" : "flex"}`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <h1 className="font-bold text-white">Caixa de Entrada</h1>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400" onClick={() => setShowNewContactModal(true)}>
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400" onClick={() => setShowSettings(true)}>
                  <Settings className="h-5 w-5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400" onClick={() => setViewMode("funnel")}>
                  <KanbanSquare className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar (Nome, número, etiqueta)..."
                className="pl-9 h-8 bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
            
            <Select value={selectedInstanceFilter} onValueChange={setSelectedInstanceFilter}>
              <SelectTrigger className="h-8 bg-slate-800 border-slate-700 text-white text-xs w-full">
                <SelectValue placeholder="Todas as instâncias" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all" className="text-xs">Todas as Instâncias</SelectItem>
                {instances.map(inst => (
                  <SelectItem key={inst.id} value={inst.id} className="text-xs">
                    {inst.instance_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <RefreshCw className="h-4 w-4 text-slate-500 animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                <MessageSquare className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">Nenhuma conversa ainda</p>
              </div>
            ) : (
              filteredConvs.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${selectedConv?.id === conv.id ? "bg-slate-800/80 border-l-2 border-l-emerald-500" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {(conv.nome_contato || conv.telefone).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {conv.nao_lidas > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">{conv.nao_lidas > 9 ? "9+" : conv.nao_lidas}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-white truncate">{conv.nome_contato || conv.telefone}</p>
                        <p className="text-xs text-slate-500 shrink-0 ml-2">
                          {conv.ultima_mensagem_at ? formatTime(conv.ultima_mensagem_at) : ""}
                        </p>
                      </div>
                      <p className={`text-xs truncate ${conv.nao_lidas > 0 ? "text-white font-medium" : "text-slate-400"}`}>
                        {conv.direcao_ultima === "enviada" && <span className="text-slate-500">Você: </span>}
                        {conv.ultima_mensagem || "Sem mensagens"}
                      </p>
                      {renderTags(conv.tags)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main View (Funnel or Chat area) */}
      {viewMode === "funnel" && !selectedConv ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-slate-900/60 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <KanbanSquare className="h-4 w-4 text-white" />
              </div>
              <h1 className="font-bold text-white">Funil de Vendas WhatsApp</h1>
            </div>
            <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-emerald-400" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4 mr-2" /> Voltar para Lista
            </Button>
          </div>
          {renderKanban()}
        </div>
      ) : (
        /* Área de chat */
        <div className={`flex-1 flex flex-col ${!selectedConv && viewMode === "list" ? "hidden lg:flex" : "flex"}`}>
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-slate-600" />
              </div>
              <p className="text-lg font-semibold text-slate-300 mb-2">Selecione uma conversa</p>
              <p className="text-sm text-slate-500">Escolha um contato na lista para ver as mensagens</p>
            </div>
          ) : (
            <>
              {/* Chat Header com CRM Tools */}
              <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/50 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConv(null)} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                    <span className="font-bold text-white text-lg">
                      {(selectedConv.nome_contato || selectedConv.telefone).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedConv.nome_contato || selectedConv.telefone}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">{selectedConv.telefone}</p>
                      {selectedConv.tags?.map(tagId => {
                        const colorClass = getTagColor(tagId);
                        return (
                          <span key={tagId} className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-medium ${colorClass}`}>
                            {tagId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <Button size="sm" variant="outline" className="h-8 bg-slate-800 border-slate-700 text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-700" onClick={() => setIsFunnelModalOpen(true)}>
                    <GitMerge className="h-3.5 w-3.5 mr-1.5" /> Inscrever no Funil
                  </Button>

                  {/* Dropdown de Funil */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 bg-slate-800 border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-700">
                        Funil: {funnelStages.find(s => s.id === selectedConv.funnel_stage)?.label || "Novo Contato"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                      <DropdownMenuLabel className="text-xs text-slate-400">Alterar Etapa</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      {funnelStages.map(stage => (
                        <DropdownMenuItem 
                          key={stage.id} 
                          onClick={() => handleUpdateStage(selectedConv.id, stage.id)}
                          className={`text-xs cursor-pointer ${selectedConv.funnel_stage === stage.id ? "bg-slate-700" : "hover:bg-slate-700/50"}`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-2 ${stage.bg.replace('/40', '')}`}></div>
                          {stage.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Dropdown de Etiquetas */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 bg-slate-800 border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-700">
                        <Tag className="h-3.5 w-3.5 mr-1.5" /> Etiquetas
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white w-48">
                      <DropdownMenuLabel className="text-xs text-slate-400">Adicionar/Remover Etiqueta</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      {tags.map(tagObj => (
                        <DropdownMenuItem 
                          key={tagObj.id}
                          onClick={(e) => { e.preventDefault(); handleToggleTag(selectedConv, tagObj.label); }}
                          className="text-xs cursor-pointer hover:bg-slate-700/50 flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${(tagObj.color || 'bg-slate-500').split(' ')[0]}`}></div>
                            {tagObj.label}
                          </div>
                          {selectedConv.tags?.includes(tagObj.label) && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Lixeira */}
                  <Button size="sm" variant="outline" className="h-8 bg-red-500/10 border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 px-2" onClick={() => handleDeleteConversation(selectedConv.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b101a]/40">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.direcao === "enviada" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] lg:max-w-md rounded-2xl px-4 py-2.5 ${
                        msg.direcao === "enviada"
                          ? "bg-emerald-700 text-white rounded-br-sm shadow-sm"
                          : "bg-slate-700/80 text-white rounded-bl-sm shadow-sm border border-slate-600/30"
                      }`}
                    >
                      {msg.tipo === 'imagem' && msg.media_url ? (
                        <div className="mb-2 rounded-xl overflow-hidden bg-black/20 relative group">
                          <img src={msg.media_url} alt="Mídia" className="w-full h-auto object-cover max-h-64" />
                          <a href={msg.media_url} target="_blank" download className="absolute bottom-2 right-2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          </a>
                        </div>
                      ) : msg.tipo === 'video' && msg.media_url ? (
                        <div className="mb-2 rounded-xl overflow-hidden bg-black/20 relative group">
                          <video src={msg.media_url} controls className="w-full max-h-64" />
                          <a href={msg.media_url} target="_blank" download className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          </a>
                        </div>
                      ) : msg.tipo === 'audio' && msg.media_url ? (
                        <div className="mb-2">
                          <audio src={msg.media_url} controls className="w-[250px] max-w-full h-10" />
                        </div>
                      ) : msg.tipo === 'documento' && msg.media_url ? (
                         <div className="mb-2 p-3 rounded-lg bg-black/20 flex items-center gap-3">
                           <FileText className="h-6 w-6 opacity-80" />
                           <p className="text-xs truncate">{msg.conteudo || "Documento recebido"}</p>
                         </div>
                      ) : null}
                      
                      {msg.conteudo && msg.conteudo !== "[Áudio]" && msg.conteudo !== "[mídia]" && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.conteudo}</p>
                      )}
                      
                      <div className={`flex items-center gap-1 mt-1 ${msg.direcao === "enviada" ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] opacity-60 font-medium">{formatTime(msg.created_at)}</span>
                        {msg.direcao === "enviada" && STATUS_ICONS[msg.status as keyof typeof STATUS_ICONS]}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-900/80 shrink-0">
                {selectedFile && (
                  <div className="mb-3 p-2 bg-slate-800 rounded-lg flex items-center justify-between border border-emerald-500/30">
                    <div className="flex items-center gap-2 truncate">
                      {selectedFile.type.startsWith("image/") ? <ImageIcon className="h-4 w-4 text-emerald-400" /> : <FileText className="h-4 w-4 text-emerald-400" />}
                      <span className="text-xs text-white truncate">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-400 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-end gap-2 sm:gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // Limite simples de 15MB para base64 nao quebrar memoria
                        if (e.target.files[0].size > 15 * 1024 * 1024) {
                          toast.error("Arquivo muito grande. Máximo 15MB.");
                          return;
                        }
                        setSelectedFile(e.target.files[0]);
                      }
                    }} 
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 shrink-0 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRecording || !!recordedAudio}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  {/* Respostas Rápidas */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full">
                        <Zap className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white w-64 mb-2">
                      <DropdownMenuLabel className="text-xs text-slate-400">Mensagens Prontas</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      {quickReplies.map(reply => (
                        <DropdownMenuItem 
                          key={reply.id}
                          onClick={() => setNewMessage(prev => prev + (prev ? " " : "") + reply.text)}
                          className="text-xs cursor-pointer hover:bg-slate-700/50 flex flex-col items-start gap-1 p-2"
                        >
                          <span className="font-semibold text-emerald-400">{reply.title}</span>
                          <span className="text-slate-300 line-clamp-2">{reply.text}</span>
                        </DropdownMenuItem>
                      ))}
                      
                      {funnels.length > 0 && (
                        <>
                          <DropdownMenuSeparator className="bg-slate-700 mt-2" />
                          <DropdownMenuLabel className="text-xs text-slate-400">Funis Manuais</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-700" />
                          {funnels.map(funnel => (
                            <DropdownMenuSub key={funnel.id}>
                              <DropdownMenuSubTrigger className="text-xs cursor-pointer hover:bg-slate-700/50 flex justify-between p-2">
                                <span className="font-semibold text-amber-400">{funnel.nome}</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuPortal>
                                <DropdownMenuSubContent className="bg-slate-800 border-slate-700 text-white w-64 shadow-xl">
                                  <DropdownMenuLabel className="text-xs text-slate-400">Etapas: {funnel.nome}</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-slate-700" />
                                  {funnel.steps && funnel.steps.length > 0 ? (
                                    funnel.steps.map(step => (
                                      <DropdownMenuItem 
                                        key={step.id}
                                        onClick={() => handleSendManualFunnelStep(step)}
                                        className="text-xs cursor-pointer hover:bg-slate-700/50 flex items-start gap-2 p-2"
                                      >
                                        <div className="mt-0.5 opacity-70">
                                          {step.tipo_midia === "audio" ? <Mic className="w-3 h-3 text-blue-400" /> : 
                                           step.tipo_midia === "imagem" || step.tipo_midia === "video" ? <ImageIcon className="w-3 h-3 text-emerald-400" /> : 
                                           <FileText className="w-3 h-3 text-slate-300" />}
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="font-semibold">Etapa {step.ordem_etapa}</span>
                                          <span className="text-slate-400 line-clamp-1">{step.mensagem_template || `Mídia: ${step.tipo_midia}`}</span>
                                        </div>
                                      </DropdownMenuItem>
                                    ))
                                  ) : (
                                    <div className="p-2 text-xs text-slate-500">Nenhuma etapa cadastrada.</div>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuPortal>
                            </DropdownMenuSub>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isRecording ? (
                    <div className="flex-1 flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 h-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        <span className="text-sm font-medium">Gravando... {formatRecordingTime(recordingTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full" onClick={cancelRecording}>
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-full" onClick={stopRecording}>
                          <Square className="h-4 w-4 fill-current" />
                        </Button>
                      </div>
                    </div>
                  ) : recordedAudio ? (
                    <div className="flex-1 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 h-10">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        <span className="text-sm font-medium">Áudio Pronto</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full" onClick={() => setRecordedAudio(null)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Digite uma mensagem..."
                      rows={1}
                      className="flex-1 bg-slate-800 border-slate-700 text-white resize-none min-h-[40px] max-h-32 text-sm rounded-xl"
                    />
                  )}
                  
                  {(!newMessage.trim() && !selectedFile && !recordedAudio && !isRecording) ? (
                    <Button
                      onClick={startRecording}
                      className="bg-slate-700 hover:bg-slate-600 text-slate-300 h-10 w-10 p-0 shrink-0 rounded-full"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSend}
                      disabled={sending || isRecording}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10 p-0 shrink-0 rounded-full shadow-lg shadow-emerald-900/20"
                    >
                      {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-1" />}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <Dialog open={showNewContactModal} onOpenChange={setShowNewContactModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar Nova Conversa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nome do Contato</label>
              <Input
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Ex: João Silva"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Telefone (WhatsApp)</label>
              <Input
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="Ex: 11999999999"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" onClick={() => setShowNewContactModal(false)}>Cancelar</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateContact}>Adicionar Contato</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedConv && (
        <FunnelEnrollModal 
          isOpen={isFunnelModalOpen}
          onClose={() => setIsFunnelModalOpen(false)}
          leadId={selectedConv.lead_id}
          leadName={selectedConv.nome_contato}
          leadPhone={selectedConv.telefone}
          instanceId={selectedConv.instance_id}
        />
      )}

      <WhatsAppCRMSettings 
        open={showSettings} 
        onOpenChange={setShowSettings} 
        tags={tags} 
        quickReplies={quickReplies} 
        onUpdate={fetchCRMConfig} 
      />
    </div>
  );
}
