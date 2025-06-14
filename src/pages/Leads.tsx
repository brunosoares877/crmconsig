
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import LeadList from "@/components/LeadList";
import Filters from "@/components/Filters";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Plus, Tag, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const Leads = () => {
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");

  const tagColors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#f97316", "#06b6d4", "#84cc16", "#ec4899", "#6b7280"
  ];

  useEffect(() => {
    const fetchLeadStats = async () => {
      setIsLoading(true);
      try {
        // Total leads count
        const {
          count: totalCount,
          error: totalError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        });
        if (totalError) {
          console.error('Error fetching total leads:', totalError);
          throw totalError;
        }

        // New leads count
        const {
          count: newCount,
          error: newError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'novo');
        if (newError) {
          console.error('Error fetching new leads:', newError);
          throw newError;
        }

        // Qualified leads count
        const {
          count: qualifiedCount,
          error: qualifiedError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'qualificado');
        if (qualifiedError) {
          console.error('Error fetching qualified leads:', qualifiedError);
          throw qualifiedError;
        }

        // Converted leads count
        const {
          count: convertedCount,
          error: convertedError
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'convertido');
        if (convertedError) {
          console.error('Error fetching converted leads:', convertedError);
          throw convertedError;
        }
        setLeadStats({
          total: totalCount || 0,
          new: newCount || 0,
          qualified: qualifiedCount || 0,
          converted: convertedCount || 0
        });
      } catch (error) {
        console.error('Error fetching lead statistics:', error);
        toast.error("Erro ao carregar estatísticas de leads");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeadStats();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('lead_tags')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('lead_tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          user_id: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTags([...tags, data]);
      setNewTagName("");
      setNewTagColor("#3b82f6");
      setIsTagDialogOpen(false);
      toast.success("Etiqueta criada com sucesso!");
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast.error(`Erro ao criar etiqueta: ${error.message}`);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('lead_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;

      setTags(tags.filter(tag => tag.id !== tagId));
      setSelectedTags(selectedTags.filter(id => id !== tagId));
      toast.success("Etiqueta removida com sucesso!");
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error(`Erro ao remover etiqueta: ${error.message}`);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-0 md:ml-64 transition-all duration-300">
        <Header />
        <main className="w-full space-y-6 p-4 md:p-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestão de Leads</h1>
              <p className="text-muted-foreground mt-1">Gerencie e acompanhe todos os seus leads em um só lugar</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                <Input placeholder="Buscar por nome, telefone ou CPF..." className="pl-10 py-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full w-full md:w-[280px]" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Button asChild variant="outline" className="flex items-center gap-2">
                <Link to="/leads/trash">
                  <Trash2 className="h-4 w-4" />
                  Lixeira
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl">{isLoading ? "..." : leadStats.total}</CardTitle>
                <CardDescription>Total de Leads</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-blue-600">{isLoading ? "..." : leadStats.new}</CardTitle>
                <CardDescription>Novos Leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Aguardando primeiro contato
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-amber-600">{isLoading ? "..." : leadStats.qualified}</CardTitle>
                <CardDescription>Leads Qualificados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Prontos para negociação
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl text-green-600">{isLoading ? "..." : leadStats.converted}</CardTitle>
                <CardDescription>Conversões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  Este mês
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags Filter Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Filtrar por Etiquetas</h3>
              </div>
              <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Etiqueta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Etiqueta</DialogTitle>
                    <DialogDescription>
                      Crie uma nova etiqueta para organizar seus leads.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tagName">Nome da Etiqueta</Label>
                      <Input
                        id="tagName"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Ex: Cliente VIP, Urgente, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagColor">Cor da Etiqueta</Label>
                      <div className="flex gap-2 mt-2">
                        {tagColors.map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newTagColor === color ? 'border-gray-900' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewTagColor(color)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={createTag}>Criar Etiqueta</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="relative group">
                  <Badge
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      selectedTags.includes(tag.id) 
                        ? 'ring-2 ring-offset-1' 
                        : 'hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                      borderColor: tag.color,
                      color: selectedTags.includes(tag.id) ? 'white' : tag.color
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteTag(tag.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {tags.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhuma etiqueta criada. Clique em "Nova Etiqueta" para começar.
                </p>
              )}
            </div>
          </Card>

          <LeadList searchQuery={searchQuery} selectedTags={selectedTags} />
        </main>
      </div>
    </div>
  );
};
export default Leads;
