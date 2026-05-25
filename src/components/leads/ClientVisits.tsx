
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientVisit {
  id: string;
  lead_id: string;
  visit_date: string;
  visit_type: string;
  observations: string;
  created_at: string;
}

interface ClientVisitsProps {
  leadId: string;
  leadName: string;
}

const visitTypeLabels = {
  primeira_visita: "Primeira Visita",
  retorno: "Retorno",
  contato_telefonico: "Contato Telefônico",
  whatsapp: "WhatsApp",
  email: "E-mail"
};

const visitTypeColors = {
  primeira_visita: "bg-blue-100 text-blue-800",
  retorno: "bg-green-100 text-green-800",
  contato_telefonico: "bg-yellow-100 text-yellow-800",
  whatsapp: "bg-emerald-100 text-emerald-800",
  email: "bg-purple-100 text-purple-800"
};

const ClientVisits: React.FC<ClientVisitsProps> = ({ leadId, leadName }) => {
  const [visits, setVisits] = useState<ClientVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [formData, setFormData] = useState({
    visit_date: format(new Date(), 'yyyy-MM-dd'),
    visit_type: '',
    observations: ''
  });

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from("client_visits")
        .select("*")
        .eq("lead_id", leadId)
        .order("visit_date", { ascending: false });

      if (error) throw error;
      setVisits(data || []);
    } catch (error: any) {
      console.error("Error fetching visits:", error);
      toast.error("Erro ao carregar histórico de visitas");
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [leadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visit_type) {
      toast.error("Selecione o tipo de visita");
      return;
    }

    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from("client_visits")
        .insert({
          lead_id: leadId,
          user_id: userData.user.id,
          visit_date: formData.visit_date,
          visit_type: formData.visit_type,
          observations: formData.observations
        });

      if (error) throw error;

      toast.success("Visita registrada com sucesso!");
      setShowAddDialog(false);
      setFormData({
        visit_date: format(new Date(), 'yyyy-MM-dd'),
        visit_type: '',
        observations: ''
      });
      fetchVisits();
    } catch (error: any) {
      console.error("Error saving visit:", error);
      toast.error("Erro ao registrar visita");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Visita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Nova Visita</DialogTitle>
              <DialogDescription>
                Registre uma nova visita ou contato com {leadName}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visit_date">Data da Visita</Label>
                <Input
                  id="visit_date"
                  type="date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="visit_type">Tipo de Contato</Label>
                <Select value={formData.visit_type} onValueChange={(value) => setFormData(prev => ({ ...prev, visit_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primeira_visita">Primeira Visita</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="contato_telefonico">Contato Telefônico</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Descreva o que aconteceu durante a visita..."
                  value={formData.observations}
                  onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Registrar Visita"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {visits.length > 0 && (
          <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Ver Histórico ({visits.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Histórico de Visitas - {leadName}</DialogTitle>
                <DialogDescription>
                  Todas as interações registradas com este cliente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {visits.map((visit) => (
                  <Card key={visit.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(visit.visit_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </CardTitle>
                        <Badge className={visitTypeColors[visit.visit_type as keyof typeof visitTypeColors]}>
                          {visitTypeLabels[visit.visit_type as keyof typeof visitTypeLabels]}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Registrado em {format(new Date(visit.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </CardHeader>
                    {visit.observations && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{visit.observations}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {visits.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Última visita: {format(new Date(visits[0].visit_date), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      )}
    </div>
  );
};

export default ClientVisits;
