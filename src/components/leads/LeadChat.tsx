import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, User, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lead } from "@/types/models";

interface LeadChatProps {
    leadId: string;
    leadName: string;
    leadPhone: string;
}

interface Message {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
    status: string;
    tipo?: 'texto' | 'imagem' | 'video' | 'audio' | 'documento';
    media_url?: string;
}

// URL do backend (deve vir de env em produção)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const LeadChat: React.FC<LeadChatProps> = ({ leadId, leadName, leadPhone }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();

        // Inscrever para atualizações em tempo real
        const channel = supabase
            .channel(`chat-${leadId}`)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'lead_messages', filter: `lead_id=eq.${leadId}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new as Message]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [leadId]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('lead_messages')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
            scrollToBottom();
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            setSending(true);

            // 1. Enviar para API da Evolution (via nosso backend)
            // Precisamos saber qual instância usar. Por enquanto hardcoded ou buscar de config.
            const instanceName = "crm-principal";

            const response = await fetch(`${BACKEND_URL}/message/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceName,
                    number: leadPhone,
                    text: newMessage,
                    leadId: leadId // Backend vai salvar no banco
                })
            });

            if (!response.ok) {
                // Se falhar o backend, salvamos localmente como erro ou tentamos reenvio
                throw new Error('Falha ao enviar mensagem');
            }

            // Limpar input (a mensagem vai voltar via socket/webhook ou podemos adicionar otimista)
            setNewMessage("");

            // Adicionar otimista
            /* 
            const optimisticMsg: Message = {
                id: 'temp-' + Date.now(),
                content: newMessage,
                direction: 'outbound',
                created_at: new Date().toISOString(),
                status: 'sending'
            };
            setMessages(prev => [...prev, optimisticMsg]);
            */

        } catch (error) {
            toast.error("Erro ao enviar mensagem");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] border rounded-md shadow-sm bg-white">
            {/* Header do Chat */}
            <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">{leadName}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {leadPhone}
                        </p>
                    </div>
                </div>
            </div>

            {/* Área de Mensagens */}
            <ScrollArea className="flex-1 p-4 bg-slate-50">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Inicie a conversa abaixo.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.direction === 'outbound'
                                        ? 'bg-green-100 text-gray-800 rounded-tr-none'
                                        : 'bg-white border text-gray-800 rounded-tl-none shadow-sm'
                                        }`}
                                >
                                    {msg.tipo === 'imagem' && msg.media_url ? (
                                        <div className="mb-2 rounded-lg overflow-hidden bg-black/10 relative group">
                                            <img src={msg.media_url} alt="Mídia" className="max-w-[200px] h-auto rounded" />
                                            <a href={msg.media_url} target="_blank" download className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                            </a>
                                        </div>
                                    ) : msg.tipo === 'video' && msg.media_url ? (
                                        <div className="mb-2 rounded-lg overflow-hidden bg-black/10 relative group">
                                            <video src={msg.media_url} controls className="max-w-[200px] max-h-48 rounded" />
                                            <a href={msg.media_url} target="_blank" download className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                            </a>
                                        </div>
                                    ) : msg.tipo === 'audio' && msg.media_url ? (
                                        <div className="mb-2">
                                            <audio src={msg.media_url} controls className="w-[220px] max-w-full h-8" />
                                        </div>
                                    ) : msg.tipo === 'documento' && msg.media_url ? (
                                        <div className="mb-2 p-2 rounded bg-black/10 flex items-center gap-2">
                                            <FileText className="h-4 w-4 opacity-80" />
                                            <p className="text-xs truncate">{msg.conteudo || "Documento recebido"}</p>
                                        </div>
                                    ) : null}

                                    {(msg.content || msg.conteudo) && (msg.content || msg.conteudo) !== "[Áudio]" && (msg.content || msg.conteudo) !== "[mídia]" && (
                                        <p className="mt-1">{msg.content || msg.conteudo}</p>
                                    )}
                                    <span className="text-[10px] text-gray-400 block text-right mt-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t bg-white flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sending}
                    className="flex-1"
                />
                <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    size="icon"
                    className="bg-green-600 hover:bg-green-700"
                >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
};

export default LeadChat;
