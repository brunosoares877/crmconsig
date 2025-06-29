import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, setHours, setMinutes, isPast, startOfDay } from "date-fns";
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
import { Plus, Check, Trash2, Clock, User, FileText, CalendarIcon, AlertCircle, Loader2, Edit3, ChevronDown } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { BankSelect } from "@/components/forms/BankSelect";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

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
  priority: string;
}

interface Lead {
  id: string;
  name: string;
  bank?: string;
  cpf?: string;
}

type ReminderStatus = "all" | "completed" | "overdue" | "pending";

const REMINDERS_PER_PAGE = 10;

const Reminders = () => {
  console.log("🚀 === LEMBRETES COMPLETO ===");
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<ReminderStatus>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalReminders, setTotalReminders] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState("none");
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [bank, setBank] = useState("none");
  const [priority, setPriority] = useState<string>("media");
  const [category, setCategory] = useState("");

  // Client search state
  const [clientSearch, setClientSearch] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  // Filter clients based on search
  const handleClientSearch = (searchValue: string) => {
    setClientSearch(searchValue);
    if (!searchValue.trim()) {
      setFilteredLeads(leads);
        return;
      }

    const filtered = leads.filter(lead => 
      lead.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (lead.cpf && lead.cpf.includes(searchValue.replace(/\D/g, '')))
    );
    setFilteredLeads(filtered);
  };

  // Format client display with name and CPF
  const formatClientDisplay = (lead: Lead) => {
    if (lead.cpf) {
      const formattedCpf = lead.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      return `${lead.name} - ${formattedCpf}`;
    }
    return lead.name;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Fetch leads with cpf
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, name, bank, cpf")
        .eq("user_id", userData.user.id)
        .order("name");

      if (leadsError) throw leadsError;
      
      const leadsWithCpf = (leadsData || []) as Lead[];
      setLeads(leadsWithCpf);
      setFilteredLeads(leadsWithCpf);
      
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
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

  // Update filtered leads when leads change
  useEffect(() => {
    setFilteredLeads(leads);
  }, [leads]);

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
      return <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-medium">Concluído</Badge>;
    } else if (isPastDue(reminder.due_date, reminder.is_completed)) {
      return <Badge className="bg-red-50 text-red-700 border border-red-200 text-xs font-medium">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">Pendente</Badge>;
    }
  };

  // Função para obter prioridade do lembrete
  const getPriorityFromReminder = (reminder: Reminder): string => {
    return reminder.priority || 'media';
  };

  const handleChangePriority = async (reminderId: string, newPriority: string) => {
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
    
    if (!isClickable || !reminderId) {
      // Versão não clicável (apenas visual)
    switch (priorityLevel) {
      case "alta":
        return (
            <Badge className={`bg-red-600 text-white border-red-700 ${baseClasses}`}>
              🔴 PRIORIDADE ALTA
          </Badge>
        );
      case "baixa":
        return (
            <Badge className={`bg-green-600 text-white border-green-700 ${baseClasses}`}>
              🟢 PRIORIDADE BAIXA
          </Badge>
        );
      case "media":
      default:
        return (
            <Badge className={`bg-yellow-600 text-white border-yellow-700 ${baseClasses}`}>
              🟡 PRIORIDADE MÉDIA
          </Badge>
        );
    }
    }

    // Versão clicável com dropdown
    return (
      <Select value={priorityLevel} onValueChange={(newPriority) => handleChangePriority(reminderId, newPriority)}>
        <SelectTrigger className={cn(
          "w-auto h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0",
          baseClasses,
          priorityLevel === "alta" && "bg-red-600 hover:bg-red-700 text-white",
          priorityLevel === "media" && "bg-yellow-600 hover:bg-yellow-700 text-white",
          priorityLevel === "baixa" && "bg-green-600 hover:bg-green-700 text-white"
        )}>
          <SelectValue className="flex items-center gap-2">
            {priorityLevel === "alta" && "🔴 PRIORIDADE ALTA"}
            {priorityLevel === "media" && "🟡 PRIORIDADE MÉDIA"}
            {priorityLevel === "baixa" && "🟢 PRIORIDADE BAIXA"}
            <span className="ml-2">▼</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="alta" className="text-red-700 font-semibold">
            🔴 PRIORIDADE ALTA
          </SelectItem>
          <SelectItem value="media" className="text-yellow-700 font-semibold">
            🟡 PRIORIDADE MÉDIA
          </SelectItem>
          <SelectItem value="baixa" className="text-green-700 font-semibold">
            🟢 PRIORIDADE BAIXA
          </SelectItem>
        </SelectContent>
      </Select>
    );
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full h-11 justify-between text-left font-normal",
                    !leadId || leadId === "none" ? "text-muted-foreground" : ""
                  )}
                >
                  {leadId && leadId !== "none" 
                    ? (() => {
                        const selectedLead = leads.find(lead => lead.id === leadId);
                        return selectedLead ? formatClientDisplay(selectedLead) : "Cliente não encontrado";
                      })()
                    : "Selecione um cliente (opcional)"
                  }
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar por nome ou CPF..." 
                    value={clientSearch}
                    onValueChange={handleClientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="none"
                        onSelect={() => {
                          setLeadId("none");
                          setClientSearch("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            leadId === "none" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Nenhum cliente
                      </CommandItem>
                      {filteredLeads.map((lead) => (
                        <CommandItem
                          key={lead.id}
                          value={formatClientDisplay(lead)}
                          onSelect={() => {
                            setLeadId(lead.id);
                            setClientSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              leadId === lead.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{lead.name}</span>
                            {lead.cpf && (
                              <span className="text-sm text-gray-500">
                                CPF: {lead.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
                    <CustomCalendar
                      selected={date}
                      onSelect={setDate}
                      currentMonth={currentMonth}
                      onMonthChange={setCurrentMonth}
                      size="sm"
                      className="p-4"
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
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={priority === "baixa" ? "default" : "outline"}
                className={cn(
                  "h-10 text-sm font-medium transition-all",
                  priority === "baixa" 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setPriority("baixa")}
              >
                Baixa
              </Button>
              
              <Button
                type="button"
                variant={priority === "media" ? "default" : "outline"}
                className={cn(
                  "h-10 text-sm font-medium transition-all",
                  priority === "media" 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setPriority("media")}
              >
                Média
              </Button>
              
              <Button
                type="button"
                variant={priority === "alta" ? "default" : "outline"}
                className={cn(
                  "h-10 text-sm font-medium transition-all",
                  priority === "alta" 
                    ? "bg-slate-900 text-white hover:bg-slate-800" 
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setPriority("alta")}
              >
                Alta
              </Button>
            </div>
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

      const processedReminders = (data || []).map((reminder: any) => ({
        ...reminder,
        priority: reminder.priority || 'media'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-100 rounded-md" />
              </Card>
            ))}
          </div>
        ) : Array.isArray(filteredReminders) && filteredReminders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReminders.map((reminder) => (
              <Card
                key={reminder.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-lg border-0 shadow-sm",
                  reminder.is_completed ? "bg-gray-50/50 opacity-70" : "bg-white",
                  "hover:shadow-xl hover:-translate-y-1"
                )}
              >
                <CardHeader className="pb-4">
                  <div className="space-y-4">
                    {/* Linha 1: Título e Status */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Indicador visual minimalista da prioridade */}
                        <div className={cn(
                          "w-1 h-16 rounded-full flex-shrink-0 mt-1",
                          getPriorityFromReminder(reminder) === 'alta' && "bg-slate-800",
                          getPriorityFromReminder(reminder) === 'media' && "bg-slate-500", 
                          getPriorityFromReminder(reminder) === 'baixa' && "bg-slate-300"
                        )} />
                        <div className="flex-1">
                          <CardTitle className="text-lg font-medium text-slate-900 leading-tight mb-1">
                            {reminder.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              getPriorityFromReminder(reminder) === 'alta' && "bg-slate-100 text-slate-800",
                              getPriorityFromReminder(reminder) === 'media' && "bg-slate-50 text-slate-600", 
                              getPriorityFromReminder(reminder) === 'baixa' && "bg-slate-50 text-slate-500"
                            )}>
                              {getPriorityFromReminder(reminder) === 'alta' && "Alta prioridade"}
                              {getPriorityFromReminder(reminder) === 'media' && "Prioridade média"}
                              {getPriorityFromReminder(reminder) === 'baixa' && "Baixa prioridade"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getReminderStatusBadge(reminder)}
                      </div>
                    </div>
                    
                    {/* Linha 2: Informações do Cliente e Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">Cliente:</span>
                          <span className="text-slate-900 font-medium">{getLeadName(reminder.lead_id)}</span>
                        </div>
                        {reminder.bank && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">Banco:</span>
                            <span className="text-slate-900 font-medium">{getBankName(reminder.bank)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">Data:</span>
                          <span className="text-slate-900 font-medium">{formatDate(reminder.due_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Linha 3: Ações */}
                    <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 pl-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 text-xs font-medium",
                          reminder.is_completed 
                            ? "text-green-700 hover:bg-green-50" 
                            : "text-slate-600 hover:text-green-700 hover:bg-green-50"
                        )}
                        onClick={() => handleToggleComplete(reminder)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {reminder.is_completed ? "Concluído" : "Concluir"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteReminder(reminder.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {reminder.notes && (
                  <CardContent className="pt-0 pb-4 pl-7">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Observações</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed break-words">
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