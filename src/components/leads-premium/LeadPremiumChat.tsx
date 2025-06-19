
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, User, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageLayout from "@/components/PageLayout";

interface LeadPremium {
  id: string;
  nome: string;
  telefone: string;
  mensagem: string;
  origem: string;
  modalidade: string;
  status: string;
  created_at: string;
}

interface Mensagem {
  id: string;
  conteudo: string;
  remetente: 'lead' | 'atendente';
  created_at: string;
}

interface LeadPremiumChatProps {
  lead: LeadPremium;
  onBack: () => void;
  onLeadUpdate: (updatedLead: LeadPremium) => void;
}

const LeadPremiumChat: React.FC<LeadPremiumChatProps> = ({ lead, onBack, onLeadUpdate }) => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getModalidadeBadgeColor = (modalidade: string) => {
    switch (modalidade) {
      case "Aposentado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Bolsa Família":
        return "bg-green-100 text-green-800 border-green-200";
      case "FGTS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMensagens = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mensagens_premium')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        toast.error("Erro ao carregar mensagens");
        return;
      }

      // Tipagem correta dos dados vindos do Supabase
      const mensagensTyped: Mensagem[] = (data || []).map(msg => ({
        id: msg.id,
        conteudo: msg.conteudo,
        remetente: msg.remetente as 'lead' | 'atendente',
        created_at: msg.created_at
      }));

      setMensagens(mensagensTyped);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast.error("Erro ao carregar mensagens");
    } finally {
      setIsLoading(false);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || isSending) return;

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from('mensagens_premium')
        .insert({
          lead_id: lead.id,
          user_id: user.id,
          conteudo: novaMensagem.trim(),
          remetente: 'atendente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast.error("Erro ao enviar mensagem");
        return;
      }

      // Tipagem correta da nova mensagem
      const novaMensagemTyped: Mensagem = {
        id: data.id,
        conteudo: data.conteudo,
        remetente: data.remetente as 'lead' | 'atendente',
        created_at: data.created_at
      };

      setMensagens(prev => [...prev, novaMensagemTyped]);
      setNovaMensagem("");
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const atualizarStatus = async (novoStatus: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from('leads_premium')
        .update({ status: novoStatus })
        .eq('id', lead.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error("Erro ao atualizar status");
        return;
      }

      onLeadUpdate(data);
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error("Erro ao atualizar status");
    }
  };

  useEffect(() => {
    fetchMensagens();
  }, [lead.id]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Adicionar mensagem inicial se não existir
  useEffect(() => {
    if (!isLoading && mensagens.length === 0 && lead.mensagem) {
      const addInitialMessage = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('mensagens_premium')
            .insert({
              lead_id: lead.id,
              user_id: user.id,
              conteudo: lead.mensagem,
              remetente: 'lead'
            })
            .select()
            .single();

          if (!error && data) {
            const mensagemTyped: Mensagem = {
              id: data.id,
              conteudo: data.conteudo,
              remetente: data.remetente as 'lead' | 'atendente',
              created_at: data.created_at
            };
            setMensagens([mensagemTyped]);
          }
        } catch (error) {
          console.error('Erro ao adicionar mensagem inicial:', error);
        }
      };

      addInitialMessage();
    }
  }, [isLoading, mensagens.length, lead]);

  const headerActions = (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Select value={lead.status} onValueChange={atualizarStatus}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Novo">Novo</SelectItem>
          <SelectItem value="Em atendimento">Em atendimento</SelectItem>
          <SelectItem value="Fechado">Fechado</SelectItem>
          <SelectItem value="Perdido">Perdido</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PageLayout 
      title={`Chat com ${lead.nome}`}
      subtitle={`📱 ${lead.telefone} • 📍 ${lead.origem}`}
      headerActions={headerActions}
      showTrialBanner={false}
    >
      <div className="flex flex-col gap-4">
        {/* Badge da modalidade */}
        <div className="flex items-center gap-2">
          <Badge className={getModalidadeBadgeColor(lead.modalidade)}>
            {lead.modalidade}
          </Badge>
        </div>

        {/* Área de Mensagens */}
        <Card className="flex-1 flex flex-col h-[calc(100vh-300px)]">
          <CardContent className="flex-1 flex flex-col p-4">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {isLoading ? (
                <div className="text-center py-8">Carregando conversa...</div>
              ) : mensagens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma mensagem ainda</p>
                </div>
              ) : (
                mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`flex ${mensagem.remetente === 'atendente' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      mensagem.remetente === 'atendente'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="flex items-center gap-1 mb-1">
                        {mensagem.remetente === 'atendente' ? (
                          <Headphones className="h-3 w-3" />
                        ) : (
                          <User className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-75">
                          {mensagem.remetente === 'atendente' ? 'Atendente' : lead.nome}
                        </span>
                      </div>
                      <p className="text-sm">{mensagem.conteudo}</p>
                      <p className={`text-xs mt-1 ${
                        mensagem.remetente === 'atendente' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {format(new Date(mensagem.created_at), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Campo de Envio */}
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                disabled={isSending}
              />
              <Button onClick={enviarMensagem} disabled={!novaMensagem.trim() || isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default LeadPremiumChat;
