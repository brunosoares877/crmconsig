import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MessageSquare, Send, RefreshCw, Search, Phone, CheckCheck,
  Check, Clock, AlertCircle, User, Smile, Paperclip, ArrowLeft,
  Circle, CheckCircle, MoreVertical, Archive, ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  telefone: string;
  nome_contato: string;
  ultima_mensagem: string;
  ultima_mensagem_at: string;
  direcao_ultima: "enviada" | "recebida";
  nao_lidas: number;
  status: string;
  lead_id?: string;
  instance_id: string;
  whatsapp_instances?: { instance_name: string };
}

interface Message {
  id: string;
  direcao: "enviada" | "recebida";
  tipo: string;
  conteudo: string;
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

export default function WhatsAppInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [search, setSearch] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("whatsapp_conversations")
      .select("*, whatsapp_instances(instance_name)")
      .eq("user_id", user.id)
      .order("ultima_mensagem_at", { ascending: false });

    if (data) setConversations(data as Conversation[]);
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
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchInstances]);

  useEffect(() => {
    if (selectedConv) {
      fetchMessages(selectedConv.id);
      // Marcar como lida
      supabase.from("whatsapp_conversations").update({ nao_lidas: 0 }).eq("id", selectedConv.id);
      const interval = setInterval(() => fetchMessages(selectedConv.id), 8000);
      return () => clearInterval(interval);
    }
  }, [selectedConv, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedConv || !newMessage.trim() || !user) return;
    setSending(true);

    const instance = instances.find((i) => i.id === selectedConv.instance_id);
    if (!instance) {
      toast.error("Instância não conectada");
      setSending(false);
      return;
    }

    const digits = selectedConv.telefone.replace(/\D/g, "");
    const normalized = digits.startsWith("55") ? digits : `55${digits}`;

    try {
      const response = await fetch(
        `${instance.evolution_api_url}/message/sendText/${instance.instance_name}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: instance.api_key },
          body: JSON.stringify({ number: normalized, text: newMessage.trim(), delay: 1000 }),
        }
      );

      if (!response.ok) throw new Error("Falha ao enviar");

      const result = await response.json();

      // Salvar mensagem localmente
      const { data: savedMsg } = await supabase.from("whatsapp_messages").insert({
        conversation_id: selectedConv.id,
        evolution_message_id: result?.key?.id,
        direcao: "enviada",
        tipo: "texto",
        conteudo: newMessage.trim(),
        status: "enviado",
        timestamp_whatsapp: new Date().toISOString(),
      }).select().single();

      if (savedMsg) setMessages((prev) => [...prev, savedMsg as Message]);

      // Atualizar última mensagem da conversa
      await supabase.from("whatsapp_conversations").update({
        ultima_mensagem: newMessage.trim(),
        ultima_mensagem_at: new Date().toISOString(),
        direcao_ultima: "enviada",
      }).eq("id", selectedConv.id);

      setNewMessage("");
      fetchConversations();
    } catch (err: any) {
      toast.error("Erro ao enviar mensagem");
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
      !search ||
      c.nome_contato?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone?.includes(search)
  );

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
      {/* Sidebar de conversas */}
      <div className={`w-80 border-r border-slate-700/50 bg-slate-900/60 backdrop-blur flex flex-col shrink-0 ${selectedConv ? "hidden lg:flex" : "flex"}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-white">Caixa de Entrada</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversa..."
              className="pl-9 h-8 bg-slate-800 border-slate-700 text-white text-sm"
            />
          </div>
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
              <p className="text-xs text-slate-600 mt-1">As respostas dos leads aparecerão aqui</p>
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
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      <div className={`flex-1 flex flex-col ${!selectedConv ? "hidden lg:flex" : "flex"}`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-slate-600" />
            </div>
            <p className="text-lg font-semibold text-slate-300 mb-2">Selecione uma conversa</p>
            <p className="text-sm text-slate-500">Escolha um contato na lista ao lado para ver as mensagens</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConv(null)}
                  className="lg:hidden text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="font-bold text-white">
                    {(selectedConv.nome_contato || selectedConv.telefone).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedConv.nome_contato || selectedConv.telefone}</p>
                  <p className="text-xs text-slate-400">{selectedConv.telefone} · {selectedConv.whatsapp_instances?.instance_name}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge className={`text-xs ${selectedConv.status === "em_atendimento" ? "bg-amber-900/40 text-amber-400 border-amber-700/40" : "bg-slate-700 text-slate-300 border-slate-600"}`}>
                    {selectedConv.status === "em_atendimento" ? "Em Atendimento" : "Aberta"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direcao === "enviada" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 ${
                      msg.direcao === "enviada"
                        ? "bg-emerald-700 text-white rounded-br-sm"
                        : "bg-slate-700/80 text-white rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.conteudo}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.direcao === "enviada" ? "justify-end" : "justify-start"}`}>
                      <span className="text-xs opacity-60">{formatTime(msg.created_at)}</span>
                      {msg.direcao === "enviada" && STATUS_ICONS[msg.status as keyof typeof STATUS_ICONS]}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 shrink-0">
              <div className="flex items-end gap-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem... (Enter para enviar)"
                  rows={1}
                  className="flex-1 bg-slate-800 border-slate-700 text-white resize-none min-h-[40px] max-h-32 text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10 p-0 shrink-0"
                >
                  {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-600 mt-1">Shift+Enter para nova linha</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
