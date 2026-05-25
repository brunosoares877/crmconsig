import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MoreVertical, Paperclip, Lock, Mic, Square } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Message {
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
    status: string;
    is_internal_note?: boolean;
    metadata?: any;
}

interface ChatWindowProps {
    lead: any;
    messages: Message[];
    onSendMessage: (text: string, isInternal: boolean) => Promise<void>;
    sending: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ lead, messages, onSendMessage, sending }) => {
    const [newMessage, setNewMessage] = useState('');
    const [isInternalMode, setIsInternalMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    // Helper to extract media URL from Evolution API metadata
    const getMediaUrl = (msg: Message) => {
        if (!msg.metadata) {
            console.log('[ChatWindow] No metadata for message:', msg.id);
            return null;
        }

        console.log('[ChatWindow] Message metadata:', JSON.stringify(msg.metadata, null, 2));

        // The webhook saves the full payload in metadata
        // The message key is in metadata.key.id
        const messageKey = msg.metadata?.key?.id;

        console.log('[ChatWindow] Message key:', messageKey);

        // Check if this message has media (image, audio, video, etc.)
        const hasImage = !!(msg.metadata?.message?.imageMessage);
        const hasAudio = !!(msg.metadata?.message?.audioMessage);
        const hasVoice = !!(msg.metadata?.message?.voiceMessage);
        const hasVideo = !!(msg.metadata?.message?.videoMessage);
        const hasDocument = !!(msg.metadata?.message?.documentMessage);

        const hasMedia = hasImage || hasAudio || hasVoice || hasVideo || hasDocument;

        console.log('[ChatWindow] Media detection:', { hasImage, hasAudio, hasVoice, hasVideo, hasDocument, hasMedia });

        // If we have a message key and media, use the backend proxy to decrypt
        if (messageKey && hasMedia) {
            const proxyUrl = `${BACKEND_URL}/message/media-proxy?instanceName=crm-principal&messageId=${encodeURIComponent(messageKey)}`;
            console.log('[ChatWindow] Generated proxy URL:', proxyUrl);
            return proxyUrl;
        }

        console.log('[ChatWindow] No media URL generated - messageKey:', messageKey, 'hasMedia:', hasMedia);
        return null;
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;
        onSendMessage(newMessage, isInternalMode);
        setNewMessage('');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Evolution API prefers base64 or URL
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            // Simple type mapping
            let type: 'image' | 'video' | 'audio' | 'document' = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';

            // We can prompt for a caption or just send
            const caption = window.prompt("Legenda opcional para o arquivo:", "");

            // Custom event or update onSendMessage to support media?
            // For simplicity, let's assume we'll add onSendMedia to props 
            // but for now let's see if we can use onSendMessage with special structure or add a new prop
            if ((window as any).sendMediaHandler) {
                await (window as any).sendMediaHandler(base64, file.name, caption, type);
            } else {
                toast.error("Erro: Função de envio de mídia não inicializada");
            }
        };
        reader.readAsDataURL(file);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
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

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg; codecs=opus' });
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64 = reader.result as string;
                    if ((window as any).sendMediaHandler) {
                        await (window as any).sendMediaHandler(base64, "audio_record.ogg", null, "audio");
                    }
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            toast.info("Gravando áudio...");
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Erro ao acessar microfone. Verifique as permissões.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast.success("Áudio gravado!");
        }
    };

    if (!lead) return null;

    return (
        <Card className="flex-1 flex flex-col shadow-none border-none rounded-none overflow-hidden bg-[#E2E5E9]">
            {/* Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Avatar>
                        {lead.avatar_url && (
                            <img src={lead.avatar_url} alt={lead.name} className="h-full w-full object-cover" />
                        )}
                        <AvatarFallback className="bg-blue-600 text-white">
                            {lead.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-gray-900">{lead.name}</h3>
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Online (WhatsApp)
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                {messages.map((msg) => {
                    const mediaUrl = getMediaUrl(msg);
                    const isImage = msg.metadata?.message?.imageMessage || msg.metadata?.imageMessage;
                    const isAudio = msg.metadata?.message?.audioMessage || msg.metadata?.audioMessage || msg.metadata?.message?.voiceMessage || msg.metadata?.voiceMessage;

                    return (
                        <div
                            key={msg.id}
                            className={`flex w-full ${msg.is_internal_note
                                ? 'justify-center'
                                : msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`
                                    max-w-[70%] p-3 rounded-lg shadow-sm text-sm relative
                                    ${msg.is_internal_note
                                        ? 'bg-yellow-100 text-yellow-900 border border-yellow-200 text-center font-medium w-[80%]'
                                        : msg.direction === 'outbound'
                                            ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                                            : 'bg-white text-gray-900 rounded-tl-none'
                                    }
                                `}
                            >
                                {msg.is_internal_note && <span className="text-xs font-bold block mb-1 uppercase tracking-wide opacity-50">Nota Interna</span>}

                                {isImage && mediaUrl ? (
                                    <div className="space-y-2">
                                        <img src={mediaUrl} alt="WhatsApp Image" className="rounded-md max-w-[65%] cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(mediaUrl, '_blank')} />
                                        {msg.content && msg.content !== '[Imagem]' && <p>{msg.content}</p>}
                                    </div>
                                ) : isAudio && mediaUrl ? (
                                    <div className="space-y-2 min-w-[200px]">
                                        <audio controls className="w-full h-8">
                                            <source src={mediaUrl} type="audio/mpeg" />
                                            Seu navegador não suporta áudio.
                                        </audio>
                                    </div>
                                ) : (
                                    <p>{msg.content}</p>
                                )}

                                <span className="text-[10px] opacity-60 block text-right mt-1">
                                    {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t flex items-center gap-2 transition-colors ${isInternalMode ? 'bg-yellow-50' : 'bg-white'}`}>
                <Button
                    variant={isInternalMode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsInternalMode(!isInternalMode)}
                    className={`h-10 w-10 p-0 rounded-full transition-all ${isInternalMode ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900' : 'text-gray-400'}`}
                    title="Nota Interna (Privado)"
                >
                    <Lock className="h-4 w-4" />
                </Button>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
                />

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>

                {!isInternalMode && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`h-10 w-10 p-0 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500'}`}
                        title={isRecording ? "Parar Gravação" : "Gravar Áudio"}
                    >
                        {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                )}

                <Input
                    placeholder={isInternalMode ? "Escrever nota interna (não será enviada ao cliente)..." : "Digite uma mensagem..."}
                    className={`flex-1 border-none focus-visible:ring-0 ${isInternalMode ? 'bg-yellow-100 placeholder:text-yellow-700/50' : 'bg-gray-100'}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={sending}
                />

                <Button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    className={`rounded-full w-10 h-10 p-0 flex items-center justify-center transition-all shadow-sm ${isInternalMode
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                        : 'bg-[#00a884] hover:bg-[#008f6f] text-white'
                        }`}
                >
                    {sending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        isInternalMode ? <Lock className="h-4 w-4" /> : <Send className="h-5 w-5 ml-0.5" />
                    )}
                </Button>
            </div>
        </Card>
    );
};

