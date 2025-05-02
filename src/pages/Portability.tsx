
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Check, Filter } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  bank?: string | null;
  status?: string;
}

interface Lead {
  id: string;
  name: string;
  bank?: string;
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
  const [bankFilter, setBankFilter] = useState("");
  const [status, setStatus] = useState<string>("pendente");
  const [activeTab, setActiveTab] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads for the dropdown
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, name, bank")
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
      console.error("Erro ao carregar dados:", error);
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
      
      // Get the bank from the selected lead
      let bank = null;
      if (leadId) {
        const selectedLead = leads.find(lead => lead.id === leadId);
        bank = selectedLead?.bank || null;
      } else if (bankFilter) {
        bank = bankFilter;
      }
      
      const { error } = await supabase.from("reminders").insert({
        title,
        lead_id: leadId || null,
        notes,
        due_date: date?.toISOString(),
        is_completed: false,
        user_id: userData.user.id,
        bank,
        status: status
      });
      
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
      
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r
      ));
      
      toast.success(`Lembrete marcado como ${!reminder.is_completed ? "concluído" : "pendente"}`);
    } catch (error: any) {
      console.error("Erro ao atualizar lembrete:", error);
      toast.error(`Erro ao atualizar lembrete: ${error.message}`);
    }
  };

  const handleUpdateReminderStatus = async (reminder: Reminder, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ status: newStatus })
        .eq("id", reminder.id);
        
      if (error) throw error;
      
      setReminders(reminders.map(r => 
        r.id === reminder.id ? { ...r, status: newStatus } : r
      ));
      
      toast.success(`Status do lembrete atualizado para ${getStatusLabel(newStatus)}`);
    } catch (error: any) {
      console.error("Erro ao atualizar status do lembrete:", error);
      toast.error(`Erro ao atualizar status do lembrete: ${error.message}`);
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
      console.error("Erro ao excluir lembrete:", error);
      toast.error(`Erro ao excluir lembrete: ${error.message}`);
    }
  };

  const resetForm = () => {
    setTitle("");
    setLeadId("");
    setDate(new Date());
    setNotes("");
    setBankFilter("");
    setStatus("pendente");
  };

  const getLeadName = (id: string | null) => {
    if (!id) return "Nenhum cliente";
    const lead = leads.find(l => l.id === id);
    return lead ? lead.name : "Cliente não encontrado";
  };

  const getBankName = (bankCode: string | undefined) => {
    switch (bankCode) {
      case "caixa": return "Caixa Econômica Federal";
      case "bb": return "Banco do Brasil";
      case "itau": return "Itaú";
      case "bradesco": return "Bradesco";
      case "santander": return "Santander";
      case "c6": return "C6 Bank";
      case "brb": return "BRB - Banco de Brasília";
      case "bmg": return "BMG";
      case "pan": return "Banco Pan";
      case "ole": return "Banco Olé";
      case "daycoval": return "Daycoval";
      case "mercantil": return "Mercantil";
      case "cetelem": return "Cetelem";
      case "safra": return "Safra";
      case "inter": return "Inter";
      case "original": return "Original";
      case "facta": return "Facta";
      case "bonsucesso": return "Bonsucesso";
      case "banrisul": return "Banrisul";
      case "sicoob": return "Sicoob";
      case "outro": return "Outro";
      default: return "Banco não especificado";
    }
  };

  const getStatusLabel = (statusCode: string | undefined) => {
    switch (statusCode) {
      case "integrado": return "Integrado";
      case "cancelado": return "Cancelado";
      case "redigitado": return "Redigitado";
      case "pendente": return "Pendente";
      default: return "Pendente";
    }
  };

  const getStatusColor = (statusCode: string | undefined) => {
    switch (statusCode) {
      case "integrado": return "bg-green-100 text-green-800";
      case "cancelado": return "bg-red-100 text-red-800";
      case "redigitado": return "bg-orange-100 text-orange-800";
      case "pendente": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
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

  // Filter reminders based on active tab
  const filteredReminders = reminders.filter(reminder => {
    if (activeTab === "all") return true;
    return reminder.status === activeTab;
  });

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
              <DialogContent className="sm:max-w-md">
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
                    <Select value={leadId} onValueChange={(value) => {
                      setLeadId(value);
                      // Clear bank filter when selecting a client that already has a bank
                      if (value) {
                        const selectedLead = leads.find(lead => lead.id === value);
                        if (selectedLead?.bank) {
                          setBankFilter("");
                        }
                      }
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um cliente (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {leads.map((lead) => (
                          <SelectItem key={lead.id} value={lead.id}>
                            {lead.name} - {getBankName(lead.bank)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!leadId && (
                    <div className="space-y-2">
                      <Label htmlFor="bank">Banco</Label>
                      <Select value={bankFilter} onValueChange={setBankFilter}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um banco (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Bancos principais */}
                          <SelectItem value="caixa">Caixa Econômica Federal</SelectItem>
                          <SelectItem value="bb">Banco do Brasil</SelectItem>
                          <SelectItem value="itau">Itaú</SelectItem>
                          <SelectItem value="bradesco">Bradesco</SelectItem>
                          <SelectItem value="santander">Santander</SelectItem>
                          <SelectItem value="c6">C6 Bank</SelectItem>
                          <SelectItem value="brb">BRB - Banco de Brasília</SelectItem>
                          
                          {/* Todos os bancos da Rede */}
                          <SelectItem value="bmg">BMG</SelectItem>
                          <SelectItem value="pan">Banco Pan</SelectItem>
                          <SelectItem value="ole">Banco Olé</SelectItem>
                          <SelectItem value="daycoval">Daycoval</SelectItem>
                          <SelectItem value="mercantil">Mercantil</SelectItem>
                          <SelectItem value="cetelem">Cetelem</SelectItem>
                          <SelectItem value="safra">Safra</SelectItem>
                          <SelectItem value="inter">Inter</SelectItem>
                          <SelectItem value="original">Original</SelectItem>
                          <SelectItem value="facta">Facta</SelectItem>
                          <SelectItem value="bonsucesso">Bonsucesso</SelectItem>
                          <SelectItem value="banrisul">Banrisul</SelectItem>
                          <SelectItem value="sicoob">Sicoob</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="integrado">Integrado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="redigitado">Redigitado</SelectItem>
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
                      <PopoverContent className="w-auto p-0" align="start">
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
                
                <DialogFooter className="sm:justify-end">
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

          {/* Status filtering tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4 sm:grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="integrado">Integrados</TabsTrigger>
              <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
              <TabsTrigger value="redigitado">Redigitados</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : filteredReminders.length > 0 ? (
            <div className="space-y-4">
              {filteredReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border",
                    reminder.is_completed ? "bg-gray-50 opacity-70" : "bg-white",
                    isPastDue(reminder.due_date, reminder.is_completed) ? "border-red-300" : "border-gray-200"
                  )}
                >
                  <div className="flex-1 mb-3 sm:mb-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className={cn(
                        "font-medium",
                        reminder.is_completed && "line-through text-gray-500"
                      )}>
                        {reminder.title}
                      </h3>
                      {isPastDue(reminder.due_date, reminder.is_completed) && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Atrasado
                        </span>
                      )}
                      {reminder.status && (
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(reminder.status)}`}>
                          {getStatusLabel(reminder.status)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Cliente: {getLeadName(reminder.lead_id)}
                    </p>
                    {reminder.bank && (
                      <p className="text-sm text-gray-500">
                        Banco: {getBankName(reminder.bank)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Data: {formatDate(reminder.due_date)}
                    </p>
                    {reminder.notes && (
                      <p className="text-sm text-gray-600 mt-2">{reminder.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                        >
                          Status <Filter className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateReminderStatus(reminder, "pendente")}>
                          Pendente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateReminderStatus(reminder, "integrado")}>
                          Integrado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateReminderStatus(reminder, "cancelado")}>
                          Cancelado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateReminderStatus(reminder, "redigitado")}>
                          Redigitado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                {activeTab === "all" 
                  ? "Crie o seu primeiro lembrete para acompanhamento de portabilidade."
                  : `Não há lembretes com status "${getStatusLabel(activeTab)}".`}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Portability;
