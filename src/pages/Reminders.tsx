import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, setHours, setMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Check, Trash2, Clock, User, FileText, CalendarIcon, AlertCircle, Loader2, Edit3 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { BankSelect } from "@/components/forms/BankSelect";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const getBankName = (bankCode: string | null | undefined) => {
  if (!bankCode) return "Não informado";
  
  const banks: { [key: string]: string } = {
    "caixa": "Caixa Econômica Federal",
    "bb": "Banco do Brasil",
    "itau": "Itaú Unibanco",
    "bradesco": "Bradesco",
    "santander": "Santander",
    "c6": "C6 Bank",
    "brb": "BRB - Banco de Brasília",
    "bmg": "Banco BMG",
    "pan": "Banco Pan",
    "ole": "Banco Olé",
    "daycoval": "Banco Daycoval",
    "mercantil": "Banco Mercantil do Brasil",
    "cetelem": "Cetelem",
    "safra": "Banco Safra",
    "inter": "Banco Inter",
    "original": "Banco Original",
    "facta": "Facta",
    "bonsucesso": "Bonsucesso",
    "banrisul": "Banrisul",
    "sicoob": "Sicoob",
    "outro": "Outro banco"
  };
  
  return banks[bankCode] || bankCode;
};

interface Reminder {
  id: string;
  title: string;
  lead_id: string | null;
  notes: string | null;
  due_date: string;
  is_completed: boolean;
  created_at: string;
  bank?: string | null;
  priority?: string;
}

interface Lead {
  id: string;
  name: string;
  bank?: string;
}

type ReminderStatus = "all" | "completed" | "overdue" | "pending";

const REMINDERS_PER_PAGE = 15;

const Reminders = () => {
  console.log("🚀 === LEMBRETES COMPLETO ===");
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<ReminderStatus>("all");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState<string>("none");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bank, setBank] = useState<string>("none");
  const [priority, setPriority] = useState("media");
  const [category, setCategory] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReminders, setTotalReminders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = async () => {
    try {
      console.log("🔄 Carregando dados...");
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Usuário não autenticado");
        return;
      }

      // Buscar lembretes
      const { data: remindersData, error: remindersError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (remindersError) throw remindersError;
      
      const validReminders = Array.isArray(remindersData) ? remindersData : [];
      console.log("📋 Lembretes carregados:", validReminders.length, "lembretes");
      setReminders(validReminders);

      // Buscar leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id);

      if (leadsError) throw leadsError;
      
      const validLeads = Array.isArray(leadsData) ? leadsData : [];
      setLeads(validLeads);
      
      filterReminders("all", validReminders);
      
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (Array.isArray(reminders)) {
      filterReminders(currentStatus);
    }
  }, [reminders, currentStatus]);

  useEffect(() => {
    if (leadId && leadId !== "none") {
      const selectedLead = Array.isArray(leads) ? leads.find(l => l.id === leadId) : null;
      if (selectedLead?.bank) {
        setBank(selectedLead.bank);
      }
    }
  }, [leadId, leads]);

  const filterReminders = (status: ReminderStatus, remindersToFilter = reminders) => {
    setCurrentStatus(status);
    
    if (!Array.isArray(remindersToFilter)) {
      setFilteredReminders([]);
      return;
    }
    
    let filtered = [];
    
    if (status === "all") {
      filtered = [...remindersToFilter];
    } else {
      const now = new Date();
      
      filtered = remindersToFilter.filter(reminder => {
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
    }
    
    // Ordenar por prioridade: Alta -> Média -> Baixa (se a coluna existir)
    const priorityOrder = { 'alta': 1, 'media': 2, 'baixa': 3 };
    
    filtered.sort((a, b) => {
      // Verificar se a coluna priority existe nos dados
      const hasPriority = 'priority' in a && 'priority' in b;
      
      if (hasPriority) {
        const priorityA = (a as any).priority || 'media';
        const priorityB = (b as any).priority || 'media';
        
        const orderA = priorityOrder[priorityA as keyof typeof priorityOrder] || 2;
        const orderB = priorityOrder[priorityB as keyof typeof priorityOrder] || 2;
        
        // Se as prioridades são diferentes, ordena por prioridade
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }
      
      // Se as prioridades são iguais ou não existem, ordena por data (mais próximas primeiro)
      const dateA = new Date(a.due_date).getTime();
      const dateB = new Date(b.due_date).getTime();
      return dateA - dateB;
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
      
      const [hours, minutes] = time.split(':').map(Number);
      const finalDate = setMinutes(setHours(date, hours), minutes);
      
      // Temporariamente removendo priority até a migração ser aplicada
      const reminderData: any = {
        title,
        lead_id: leadId && leadId !== "none" ? leadId : null,
        notes: notes || null,
        due_date: finalDate.toISOString(),
        is_completed: false,
        user_id: userData.user.id,
        bank: bank && bank !== "none" ? bank : null
      };

      // FORÇAR a inclusão da prioridade (migração deve estar aplicada)
      reminderData.priority = priority || "media";
      console.log("🎯 Criando lembrete com prioridade:", priority);

      const { error } = await supabase.from("reminders").insert(reminderData);
      
      if (error) throw error;
      
      toast.success("Lembrete criado com sucesso!");
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error("Erro ao criar lembrete:", error);
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
      
      if (!Array.isArray(reminders)) {
        await fetchData();
        return;
      }
      
      const updatedReminders = reminders.map(r => 
        r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r
      );
      
      setReminders(updatedReminders);
      filterReminders(currentStatus, updatedReminders);
      
      toast.success(`Lembrete marcado como ${!reminder.is_completed ? "concluído" : "pendente"}`);
    } catch (error: any) {
      console.error("Erro ao atualizar lembrete:", error);
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
      
      if (!Array.isArray(reminders)) {
        await fetchData();
        return;
      }
      
      const updatedReminders = reminders.filter(r => r.id !== id);
      setReminders(updatedReminders);
      filterReminders(currentStatus, updatedReminders);
      
      toast.success("Lembrete excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir lembrete:", error);
      toast.error(`Erro ao excluir lembrete: ${error.message}`);
    }
  };

  const getLeadName = (id: string | null) => {
    if (!id) return "Nenhum cliente";
    if (!Array.isArray(leads)) return "Cliente não encontrado";
    const lead = leads.find(l => l.id === id);
    return lead ? lead.name : "Cliente não encontrado";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const isPastDue = (dateString: string, isCompleted: boolean) => {
    if (isCompleted) return false;
    try {
      const dueDate = new Date(dateString);
      const today = new Date();
      return dueDate < today;
    } catch (error) {
      return false;
    }
  };

  const getReminderStatusBadge = (reminder: Reminder) => {
    if (reminder.is_completed) {
      return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
    } else if (isPastDue(reminder.due_date, reminder.is_completed)) {
      return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Pendente</Badge>;
    }
  };

  // Função para obter prioridade do lembrete (com fallback)
  const getPriorityFromReminder = (reminder: any): string => {
    return ('priority' in reminder && reminder.priority) ? reminder.priority : 'media';
  };

  const handleChangePriority = async (reminderId: string, currentPriority: string) => {
    // Ciclo de prioridades: baixa -> media -> alta -> baixa
    const priorityCycle = {
      'baixa': 'media',
      'media': 'alta', 
      'alta': 'baixa'
    };
    
    const newPriority = priorityCycle[currentPriority as keyof typeof priorityCycle] || 'media';
    
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ priority: newPriority } as any)
        .eq("id", reminderId);
        
      if (error) throw error;
      
      // Atualizar estado local
      if (!Array.isArray(reminders)) {
        await fetchData();
        return;
      }
      
      const updatedReminders = reminders.map(r => 
        r.id === reminderId ? { ...r, priority: newPriority } : r
      );
      
      setReminders(updatedReminders);
      filterReminders(currentStatus, updatedReminders);
      
      const priorityNames = {
        'baixa': 'Baixa',
        'media': 'Média',
        'alta': 'Alta'
      };
      
      const priorityEmojis = {
        'baixa': '🟢',
        'media': '🟡',
        'alta': '🔴'
      };
      
      toast.success(`Prioridade alterada para ${priorityEmojis[newPriority as keyof typeof priorityEmojis]} ${priorityNames[newPriority as keyof typeof priorityNames]}`);
    } catch (error: any) {
      console.error("Erro ao alterar prioridade:", error);
      toast.error(`Erro ao alterar prioridade: ${error.message}`);
    }
  };

  const getPriorityBadge = (priority: string | undefined, reminderId?: string, isClickable: boolean = false) => {
    const priorityLevel = priority || "media";
    
    const baseClasses = "text-sm px-4 py-2 font-bold shadow-lg border-2 transition-all duration-200";
    const clickableClasses = isClickable ? "cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95" : "";
    
    const onClick = isClickable && reminderId ? () => handleChangePriority(reminderId, priorityLevel) : undefined;
    const title = isClickable ? "Clique para alterar a prioridade" : undefined;
    
    switch (priorityLevel) {
      case "alta":
        return (
          <Badge 
            className={`bg-red-600 hover:bg-red-700 text-white border-red-700 ${baseClasses} ${clickableClasses}`}
            onClick={onClick}
            title={title}
          >
            🔴 PRIORIDADE ALTA {isClickable && <Edit3 className="ml-1 h-3 w-3" />}
          </Badge>
        );
      case "baixa":
        return (
          <Badge 
            className={`bg-green-600 hover:bg-green-700 text-white border-green-700 ${baseClasses} ${clickableClasses}`}
            onClick={onClick}
            title={title}
          >
            🟢 PRIORIDADE BAIXA {isClickable && <Edit3 className="ml-1 h-3 w-3" />}
          </Badge>
        );
      case "media":
      default:
        return (
          <Badge 
            className={`bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-700 ${baseClasses} ${clickableClasses}`}
            onClick={onClick}
            title={title}
          >
            🟡 PRIORIDADE MÉDIA {isClickable && <Edit3 className="ml-1 h-3 w-3" />}
          </Badge>
        );
    }
  };

  const resetForm = () => {
    setTitle("");
    setLeadId("none");
    setDate(new Date());
    setTime("09:00");
    setNotes("");
    setBank("none");
    setPriority("media");
    setCategory("");
  };

  const headerActions = (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-5 w-5" />
          Novo Lembrete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl">Criar Novo Lembrete</DialogTitle>
          <DialogDescription id="dialog-description" className="text-base">
            Adicione um novo lembrete para acompanhamento de clientes e tarefas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-medium">Título*</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ligar para cliente, Enviar documentos..."
              className="h-11"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Cliente</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um cliente (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum cliente</SelectItem>
                {Array.isArray(leads) && leads.length > 0 ? leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                )) : null}
              </SelectContent>
            </Select>
          </div>
          
          <BankSelect
            value={bank}
            onValueChange={setBank}
            label="Banco"
            placeholder="Selecione um banco (opcional)"
            className="space-y-3"
            showNoneOption={true}
          />
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Data e Horário*</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">Horário</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Prioridade</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa" className="text-green-700 font-semibold">🟢 PRIORIDADE BAIXA</SelectItem>
                <SelectItem value="media" className="text-yellow-700 font-semibold">🟡 PRIORIDADE MÉDIA</SelectItem>
                <SelectItem value="alta" className="text-red-700 font-semibold">🔴 PRIORIDADE ALTA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Categoria</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Ligação, Reunião, Documento..."
              className="h-11"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais, informações importantes..."
              rows={4}
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
            onClick={handleCreateReminder}
            disabled={isSubmitting || !title || !date}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar Lembrete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const fetchReminders = async (page = 1) => {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get total count
      const { count, error: countError } = await supabase
        .from("reminders")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userData.user.id);
      
      if (countError) throw countError;
      
      setTotalReminders(count || 0);
      setTotalPages(Math.ceil((count || 0) / REMINDERS_PER_PAGE));

      // Get paginated reminders
      const from = (page - 1) * REMINDERS_PER_PAGE;
      const to = from + REMINDERS_PER_PAGE - 1;

      let query = supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userData.user.id)
        .range(from, to);

      // Apply ordering with priority
      if (reminders.length > 0 && reminders[0].priority !== undefined) {
        query = query.order("priority", { ascending: true }).order("due_date", { ascending: true });
      } else {
        query = query.order("due_date", { ascending: true });
      }

      const { data, error } = await query;
      if (error) throw error;

      const processedReminders = (data || []).map(reminder => ({
        ...reminder,
        priority: reminder.priority || 'baixa'
      }));

      setReminders(processedReminders);
    } catch (error: any) {
      console.error("Erro ao buscar lembretes:", error);
      toast.error(`Erro ao carregar lembretes: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchReminders(page);
  };

  useEffect(() => {
    fetchReminders(1);
  }, []);

  return (
    <PageLayout
      title="Lembretes"
      subtitle="Gerencie seus lembretes e nunca perca uma tarefa importante"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <Tabs 
          defaultValue="all" 
          value={currentStatus}
          className="mb-6" 
          onValueChange={(value) => filterReminders(value as ReminderStatus)}
        >
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="overdue">Atrasados</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredReminders.length} {filteredReminders.length === 1 ? 'lembrete' : 'lembretes'}
          </h3>
          <p className="text-sm text-gray-500">
            Página {currentPage} de {totalPages} ({totalReminders} total)
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-100 rounded-md" />
              </Card>
            ))}
          </div>
        ) : Array.isArray(filteredReminders) && filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredReminders.map((reminder) => (
              <Card
                key={reminder.id}
                className={cn(
                  "transition-all hover:shadow-lg border-l-8 shadow-md",
                  reminder.is_completed ? "bg-gray-50 opacity-80 border-l-gray-400" : "bg-white",
                  // Borda colorida e fundo sutil baseado na prioridade
                  !reminder.is_completed && getPriorityFromReminder(reminder) === 'alta' && "border-l-red-500 bg-red-50/30",
                  !reminder.is_completed && getPriorityFromReminder(reminder) === 'media' && "border-l-yellow-500 bg-yellow-50/30",
                  !reminder.is_completed && getPriorityFromReminder(reminder) === 'baixa' && "border-l-green-500 bg-green-50/30"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="space-y-4">
                    {/* Linha 1: Título e Status */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <CardTitle className={cn(
                        "text-xl font-semibold flex-1 flex items-center gap-2",
                        // Cores do título baseadas na prioridade
                        getPriorityFromReminder(reminder) === 'alta' && "text-red-700",
                        getPriorityFromReminder(reminder) === 'media' && "text-yellow-700", 
                        getPriorityFromReminder(reminder) === 'baixa' && "text-green-700"
                      )}>
                        {getPriorityFromReminder(reminder) === 'alta' && <span className="text-red-500 text-2xl">🔴</span>}
                        {getPriorityFromReminder(reminder) === 'media' && <span className="text-yellow-500 text-2xl">🟡</span>}
                        {getPriorityFromReminder(reminder) === 'baixa' && <span className="text-green-500 text-2xl">🟢</span>}
                        {reminder.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {getPriorityBadge(getPriorityFromReminder(reminder), reminder.id, true)}
                        {getReminderStatusBadge(reminder)}
                      </div>
                    </div>
                    
                    {/* Linha 2: Informações do Cliente e Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-base text-gray-600">
                          <User className="h-5 w-5 text-blue-500" />
                          <span className="font-medium">Cliente:</span>
                          <span className="text-gray-900">{getLeadName(reminder.lead_id)}</span>
                        </div>
                        {reminder.bank && (
                          <div className="flex items-center gap-2 text-base text-gray-600">
                            <FileText className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Banco:</span>
                            <span className="text-gray-900">{getBankName(reminder.bank)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-base text-gray-600">
                          <Clock className="h-5 w-5 text-orange-500" />
                          <span className="font-medium">Data:</span>
                          <span className="text-gray-900">{formatDate(reminder.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Linha 3: Ações */}
                    <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex items-center gap-2 px-4 py-2",
                          reminder.is_completed 
                            ? "text-green-600 bg-green-50 border-green-200 hover:bg-green-100" 
                            : "text-gray-600 hover:text-green-600 hover:bg-green-50 hover:border-green-200"
                        )}
                        onClick={() => handleToggleComplete(reminder)}
                      >
                        <Check className="h-4 w-4" />
                        {reminder.is_completed ? "Concluído" : "Marcar como concluído"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 hover:border-red-200"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {reminder.notes && (
                  <CardContent className="pt-0 pb-4">
                    <div className={cn(
                      "p-4 rounded-lg border-2",
                                             // Cores das observações baseadas na prioridade
                       getPriorityFromReminder(reminder) === 'alta' && "bg-red-50 border-red-200",
                       getPriorityFromReminder(reminder) === 'media' && "bg-yellow-50 border-yellow-200",
                       getPriorityFromReminder(reminder) === 'baixa' && "bg-green-50 border-green-200"
                    )}>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className={cn(
                          "h-5 w-5",
                          // Cores dos ícones baseadas na prioridade
                          getPriorityFromReminder(reminder) === 'alta' && "text-red-600",
                          getPriorityFromReminder(reminder) === 'media' && "text-yellow-600",
                          getPriorityFromReminder(reminder) === 'baixa' && "text-green-600"
                        )} />
                        <span className={cn(
                          "font-semibold",
                          // Cores do texto baseadas na prioridade
                          getPriorityFromReminder(reminder) === 'alta' && "text-red-800",
                          getPriorityFromReminder(reminder) === 'media' && "text-yellow-800",
                          getPriorityFromReminder(reminder) === 'baixa' && "text-green-800"
                        )}>Observações:</span>
                      </div>
                      <p className={cn(
                        "leading-relaxed break-words",
                        // Cores do conteúdo baseadas na prioridade
                        getPriorityFromReminder(reminder) === 'alta' && "text-red-700",
                        getPriorityFromReminder(reminder) === 'media' && "text-yellow-700",
                        getPriorityFromReminder(reminder) === 'baixa' && "text-green-700"
                      )}>
                        {reminder.notes}
                      </p>
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
                Não há lembretes disponíveis no momento.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-6 py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const pageNumber = Math.max(1, currentPage - 2) + index;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Reminders; 