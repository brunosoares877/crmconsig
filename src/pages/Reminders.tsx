import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Check, Clock, User, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";

interface Reminder {
  id: string;
  title: string;
  lead_id: string | null;
  notes: string | null;
  due_date: string;
  is_completed: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
}

type ReminderStatus = "all" | "completed" | "overdue" | "pending";

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ReminderStatus>("all");
  
  // Form state
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads for the dropdown
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, name")
        .order("name");
        
      if (leadsError) throw leadsError;
      setLeads(leadsData || []);
      
      // Fetch reminders
      const { data: remindersData, error: remindersError } = await supabase
        .from("reminders")
        .select("*")
        .order("due_date");
        
      if (remindersError) throw remindersError;
      setReminders(remindersData || []);
      setFilteredReminders(remindersData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterReminders(currentStatus);
  }, [reminders, currentStatus]);

  const filterReminders = (status: ReminderStatus) => {
    setCurrentStatus(status);
    
    if (status === "all") {
      setFilteredReminders(reminders);
      return;
    }
    
    const now = new Date();
    
    const filtered = reminders.filter(reminder => {
      const dueDate = new Date(reminder.due_date);
      
      if (status === "completed") {
        return reminder.is_completed;
      } else if (status === "overdue") {
        return !reminder.is_completed && dueDate < now;
      } else if (status === "pending") {
        return !reminder.is_completed && dueDate >= now;
      }
      
      return true;
    });
    
    setFilteredReminders(filtered);
  };

  const handleCreateReminder = async () => {
    if (!title || !date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const { error } = await supabase.from("reminders").insert({
        title,
        lead_id: leadId || null,
        notes,
        due_date: date?.toISOString(),
        is_completed: false,
        user_id: userData.user.id
      });
      
      if (error) throw error;
      
      toast.success("Lembrete criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error("Error creating reminder:", error);
      toast.error(`Erro ao criar lembrete: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ is_completed: !reminder.is_completed })
        .eq("id", reminder.id);
        
      if (error) throw error;
      
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r
      ));
      
      toast.success(`Lembrete marcado como ${!reminder.is_completed ? "concluído" : "pendente"}`);
    } catch (error: any) {
      console.error("Error updating reminder:", error);
      toast.error(`Erro ao atualizar lembrete: ${error.message}`);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setReminders(reminders.filter(r => r.id !== id));
      toast.success("Lembrete excluído com sucesso!");
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      toast.error(`Erro ao excluir lembrete: ${error.message}`);
    }
  };

  const resetForm = () => {
    setTitle("");
    setLeadId("");
    setDate(new Date());
    setNotes("");
  };

  const getLeadName = (id: string | null) => {
    if (!id) return "Nenhum cliente";
    const lead = leads.find(l => l.id === id);
    return lead ? lead.name : "Cliente não encontrado";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: ptBR });
  };

  const isPastDue = (dateString: string, isCompleted: boolean) => {
    if (isCompleted) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    return dueDate < today;
  };

  const getReminderStatusBadge = (reminder: Reminder) => {
    if (reminder.is_completed) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">Finalizado</Badge>;
    } else if (isPastDue(reminder.due_date, reminder.is_completed)) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 text-sm">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm">Pendente</Badge>;
    }
  };

  const headerActions = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-5 w-5" />
          Novo Lembrete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">Criar Novo Lembrete</DialogTitle>
          <DialogDescription className="text-base">
            Adicione um novo lembrete para acompanhamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-medium">Título*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do lembrete"
              className="h-11"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="lead" className="text-sm font-medium">Cliente</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um cliente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="date" className="text-sm font-medium">Data*</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-11"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateReminder}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Lembrete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <PageLayout
      title="Lembretes"
      subtitle="Gerencie seus lembretes e tarefas importantes"
    >
      <div className="space-y-8">
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => filterReminders(value as ReminderStatus)}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="completed">Finalizados</TabsTrigger>
            <TabsTrigger value="overdue">Atrasados</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-100 rounded-md" />
              </Card>
            ))}
          </div>
        ) : filteredReminders.length > 0 ? (
          <div className="space-y-6">
            {filteredReminders.map((reminder) => (
              <Card
                key={reminder.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  reminder.is_completed ? "bg-gray-50 opacity-80" : "bg-white"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{reminder.title}</CardTitle>
                        {getReminderStatusBadge(reminder)}
                      </div>
                      
                      <div className="space-y-2">
                        <CardDescription className="flex items-center gap-2 text-base">
                          <User className="h-4 w-4" />
                          Cliente: <span className="font-medium text-foreground">{getLeadName(reminder.lead_id)}</span>
                        </CardDescription>
                        <CardDescription className="flex items-center gap-2 text-base">
                          <Clock className="h-4 w-4" />
                          Data: <span className="font-medium text-foreground">{formatDate(reminder.due_date)}</span>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-10 w-10",
                          reminder.is_completed ? "text-green-600 bg-green-50" : "hover:bg-green-50"
                        )}
                        onClick={() => handleToggleComplete(reminder)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {reminder.notes && (
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-sm text-gray-700">Observações:</span>
                      </div>
                      <p className="text-gray-600">{reminder.notes}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum lembrete</h3>
              <p className="text-gray-500 text-lg">
                Crie o seu primeiro lembrete para acompanhamento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default Reminders;
