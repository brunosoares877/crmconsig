import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit3, FileText, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const NotesBlock = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setNotes((data || []) as Note[]);
      setFilteredNotes((data || []) as Note[]);
    } catch (error: any) {
      console.error("Erro ao buscar notas:", error);
      // Se a tabela não existir, apenas mostra array vazio
      if (error.code !== "PGRST116") {
        toast.error(`Erro ao carregar notas: ${error.message}`);
      }
      setNotes([]);
      setFilteredNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const handleOpenDialog = (note: Note | null = null) => {
    setEditingNote(note);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingNote(null);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const noteData = {
        title: title.trim(),
        content: content.trim() || null,
        user_id: userData.user.id,
        updated_at: new Date().toISOString(),
      };

      if (editingNote) {
        const { error } = await supabase
          .from("notes")
          .update(noteData)
          .eq("id", editingNote.id);

        if (error) throw error;
        toast.success("Nota atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("notes").insert({
          ...noteData,
          created_at: new Date().toISOString(),
        });

        if (error) throw error;
        toast.success("Nota criada com sucesso!");
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchNotes();
    } catch (error: any) {
      console.error("Erro ao salvar nota:", error);
      toast.error(`Erro ao salvar nota: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);

      if (error) throw error;

      setNotes(notes.filter((n) => n.id !== id));
      setFilteredNotes(filteredNotes.filter((n) => n.id !== id));
      toast.success("Nota excluída com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir nota:", error);
      toast.error(`Erro ao excluir nota: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com busca e botão de nova nota */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar notas por título ou conteúdo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              onClick={() => handleOpenDialog(null)}
            >
              <Plus className="mr-2 h-5 w-5" />
              Nova Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingNote ? "Editar Nota" : "Nova Nota"}
              </DialogTitle>
              <DialogDescription>
                {editingNote
                  ? "Edite os detalhes da sua nota"
                  : "Crie uma nova nota para suas anotações rápidas"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título*
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião com cliente, Ideias importantes..."
                  className="h-11"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="content" className="text-sm font-medium">
                  Conteúdo
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva suas anotações aqui..."
                  rows={8}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNote}
                disabled={isSubmitting || !title.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {editingNote ? "Atualizar" : "Criar"} Nota
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de notas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-100 rounded-md" />
            </Card>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="transition-all duration-200 hover:shadow-lg border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white flex flex-col"
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1">
                    {note.title}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                      onClick={() => handleOpenDialog(note)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá
                            permanentemente a nota "{note.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteNote(note.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sim, excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-0">
                {note.content ? (
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-6 mb-4 flex-1">
                    {note.content}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic mb-4 flex-1">
                    Sem conteúdo
                  </p>
                )}
                <div className="text-xs text-slate-500 border-t border-slate-100 pt-3 mt-auto">
                  <div>
                    Criado: {formatDate(note.created_at)}
                  </div>
                  {note.updated_at !== note.created_at && (
                    <div className="mt-1">
                      Atualizado: {formatDate(note.updated_at)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery
                ? "Nenhuma nota encontrada"
                : "Nenhuma nota ainda"}
            </h3>
            <p className="text-gray-500 text-lg mb-4">
              {searchQuery
                ? "Tente buscar com outros termos"
                : "Comece criando sua primeira nota!"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => handleOpenDialog(null)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Nota
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotesBlock;

