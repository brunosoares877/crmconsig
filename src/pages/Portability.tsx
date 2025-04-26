
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Check } from "lucide-react";
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
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

const Portability = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        user_id: userData.user.id // Add the required user_id field
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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Portabilidade - Lembretes</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Lembrete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Lembrete</DialogTitle>
                  <DialogDescription>
                    Adicione um novo lembrete para acompanhamento de portabilidade.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título*</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título do lembrete"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lead">Cliente</Label>
                    <Select value={leadId} onValueChange={setLeadId}>
                      <SelectTrigger>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Data*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detalhes adicionais..."
                    />
                  </div>
                </div>
                
                <DialogFooter>
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
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-md border",
                    reminder.is_completed ? "bg-gray-50 opacity-70" : "bg-white",
                    isPastDue(reminder.due_date, reminder.is_completed) ? "border-red-300" : "border-gray-200"
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className={cn(
                        "font-medium",
                        reminder.is_completed && "line-through text-gray-500"
                      )}>
                        {reminder.title}
                      </h3>
                      {isPastDue(reminder.due_date, reminder.is_completed) && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Atrasado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliente: {getLeadName(reminder.lead_id)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data: {formatDate(reminder.due_date)}
                    </p>
                    {reminder.notes && (
                      <p className="text-sm text-gray-600 mt-2">{reminder.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        reminder.is_completed ? "text-green-600" : ""
                      )}
                      onClick={() => handleToggleComplete(reminder)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => handleDeleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Nenhum lembrete</h3>
              <p className="mt-1 text-sm text-gray-500">
                Crie o seu primeiro lembrete para acompanhamento de portabilidade.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Portability;
