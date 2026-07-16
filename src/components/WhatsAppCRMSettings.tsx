import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Tag, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface WhatsAppTag {
  id: string;
  label: string;
  color: string;
}

export interface WhatsAppQuickReply {
  id: string;
  title: string;
  text: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: WhatsAppTag[];
  quickReplies: WhatsAppQuickReply[];
  onUpdate: () => void;
}

const COLORS = [
  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "bg-teal-500/20 text-teal-400 border-teal-500/30",
  "bg-red-500/20 text-red-400 border-red-500/30",
  "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "bg-rose-500/20 text-rose-400 border-rose-500/30",
  "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
];

export function WhatsAppCRMSettings({ open, onOpenChange, tags, quickReplies, onUpdate }: Props) {
  const { user } = useAuth();
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);

  const [newReplyTitle, setNewReplyTitle] = useState("");
  const [newReplyText, setNewReplyText] = useState("");

  const handleAddTag = async () => {
    if (!newTagLabel.trim()) return;
    try {
      await supabase.from("whatsapp_tags").insert({
        user_id: user?.id,
        label: newTagLabel,
        color: newTagColor
      });
      toast.success("Etiqueta adicionada!");
      setNewTagLabel("");
      onUpdate();
    } catch (e) {
      toast.error("Erro ao adicionar etiqueta");
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await supabase.from("whatsapp_tags").delete().eq("id", id);
      toast.success("Etiqueta removida");
      onUpdate();
    } catch (e) {
      toast.error("Erro ao remover");
    }
  };

  const handleAddReply = async () => {
    if (!newReplyTitle.trim() || !newReplyText.trim()) return;
    try {
      await supabase.from("whatsapp_quick_replies").insert({
        user_id: user?.id,
        title: newReplyTitle,
        text: newReplyText
      });
      toast.success("Mensagem salva!");
      setNewReplyTitle("");
      setNewReplyText("");
      onUpdate();
    } catch (e) {
      toast.error("Erro ao salvar mensagem");
    }
  };

  const handleDeleteReply = async (id: string) => {
    try {
      await supabase.from("whatsapp_quick_replies").delete().eq("id", id);
      toast.success("Mensagem removida");
      onUpdate();
    } catch (e) {
      toast.error("Erro ao remover");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Configurações do CRM
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="tags" className="mt-4">
          <TabsList className="bg-slate-800 border border-slate-700 w-full justify-start rounded-lg overflow-x-auto">
            <TabsTrigger value="tags" className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400">
              <Tag className="w-4 h-4 mr-2" /> Etiquetas
            </TabsTrigger>
            <TabsTrigger value="replies" className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-400">
              <Zap className="w-4 h-4 mr-2" /> Respostas Rápidas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tags" className="space-y-4 mt-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3">
              <h3 className="font-semibold text-slate-300">Nova Etiqueta</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  placeholder="Nome (Ex: Urgente)" 
                  value={newTagLabel}
                  onChange={e => setNewTagLabel(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                />
                <Button onClick={handleAddTag} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {COLORS.map(color => (
                  <div 
                    key={color} 
                    onClick={() => setNewTagColor(color)}
                    className={`cursor-pointer px-3 py-1 rounded-sm border font-medium text-xs transition-transform hover:scale-105 ${color} ${newTagColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-70'}`}
                  >
                    Exemplo
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                  <span className={`px-2 py-1 rounded-sm border font-medium text-xs ${tag.color}`}>
                    {tag.label}
                  </span>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDeleteTag(tag.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma etiqueta cadastrada.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="replies" className="space-y-4 mt-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-3">
              <h3 className="font-semibold text-slate-300">Nova Mensagem (Funil)</h3>
              <Input 
                placeholder="Título (Ex: Abordagem Inicial)" 
                value={newReplyTitle}
                onChange={e => setNewReplyTitle(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
              <Textarea
                placeholder="Escreva a mensagem completa..."
                value={newReplyText}
                onChange={e => setNewReplyText(e.target.value)}
                className="bg-slate-800 border-slate-700 min-h-[100px]"
              />
              <Button onClick={handleAddReply} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                <Plus className="w-4 h-4 mr-2" /> Salvar Mensagem
              </Button>
            </div>

            <div className="space-y-3 mt-4">
              {quickReplies.map(reply => (
                <div key={reply.id} className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-emerald-400">{reply.title}</span>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-6 w-6 p-0" onClick={() => handleDeleteReply(reply.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap">{reply.text}</p>
                </div>
              ))}
              {quickReplies.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma mensagem cadastrada.</p>
              )}
            </div>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
