import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, MoreVertical, AlertCircle, Edit, Check, X, Ban, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BankSelect } from "@/components/forms/BankSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getBankName } from "@/utils/bankUtils";

// Interfaces
interface Reminder {
  id: string;
  title: string;
  lead_id: string | null;
  notes: string | null;
  due_date: string;
  is_completed: boolean;
  created_at: string;
  bank: string | null;
  status: 'pendente' | 'concluido' | 'cancelado' | 'redigitado';
  lead?: { name: string };
}

interface Lead {
  id:string;
  name: string;
  bank: string | null;
}

const Portability = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const initialFormState = {
    title: "",
    lead_id: "",
    due_date: new Date(),
    notes: "",
    bank: "",
    status: 'pendente' as Reminder['status'],
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: leadsData, error: leadsError } = await supabase.from("leads").select("id, name, bank");
      if (leadsError) throw leadsError;
      setLeads(leadsData || []);

      const { data: remindersData, error: remindersError } = await supabase.from("reminders").select("*, lead:leads(name)");
      if (remindersError) throw remindersError;
      setReminders((remindersData as unknown as Reminder[]) || []);

    } catch (error: any) {
      toast.error("Erro ao carregar dados", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // Auto-select bank when lead changes
  useEffect(() => {
    if (formData.lead_id) {
      const selectedLead = leads.find(l => l.id === formData.lead_id);
      if (selectedLead?.bank) {
        setFormData(prev => ({ ...prev, bank: selectedLead.bank as string }));
      }
    }
  }, [formData.lead_id, leads]);

  // Handlers
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenDialog = (reminder: Reminder | null = null) => {
    setEditingReminder(reminder);
    if (reminder) {
      setFormData({
        title: reminder.title,
        lead_id: reminder.lead_id || "",
        due_date: new Date(reminder.due_date),
        notes: reminder.notes || "",
        bank: reminder.bank || "",
        status: reminder.status,
      });
    } else {
      setFormData(initialFormState);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReminder(null);
    setFormData(initialFormState);
  };

  const handleSaveReminder = async () => {
    if (!formData.title || !formData.due_date) {
      return toast.error("Título e Data são obrigatórios.");
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const reminderData = {
        title: formData.title,
        lead_id: formData.lead_id || null,
        due_date: formData.due_date.toISOString(),
        notes: formData.notes,
        bank: formData.bank,
        status: formData.status,
        user_id: user.id,
        is_completed: formData.status === 'concluido',
      };

      let response;
      if (editingReminder) {
        response = await supabase.from("reminders").update(reminderData).eq("id", editingReminder.id).select().single();
      } else {
        response = await supabase.from("reminders").insert(reminderData).select().single();
      }

      if (response.error) throw response.error;

      toast.success(`Lembrete ${editingReminder ? 'atualizado' : 'criado'} com sucesso!`);
      handleCloseDialog();
      fetchData();

    } catch (error: any) {
      toast.error(`Erro ao salvar lembrete`, { description: error.message });
    }
  };
  
  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
      toast.success("Lembrete removido com sucesso!");
      fetchData();
    } catch (error: any) {
       toast.error(`Erro ao remover lembrete`, { description: error.message });
    }
  };

  const handleUpdateStatus = async (reminder: Reminder, newStatus: Reminder['status']) => {
    try {
      const is_completed = newStatus === 'concluido';
      
      const { error } = await supabase
        .from("reminders")
        .update({ 
          status: newStatus, 
          is_completed,
          updated_at: new Date().toISOString() 
        })
        .eq("id", reminder.id);
        
      if (error) throw error;
      
      const statusText = {
        'cancelado': 'Cancelado',
        'redigitado': 'Redigitado',
        'concluido': 'Concluído',
        'pendente': 'Pendente'
      }[newStatus];
      
      toast.success(`Lembrete marcado como ${statusText}`);
      fetchData();
    } catch (error: any) {
      toast.error(`Erro ao atualizar status do lembrete`, { description: error.message });
    }
  };
  
  // Memos
  const filteredReminders = useMemo(() => {
    if (activeTab === "all") return reminders;
    if (activeTab === "concluido") return reminders.filter(r => r.is_completed);
    return reminders.filter(r => r.status === activeTab && !r.is_completed);
  }, [reminders, activeTab]);

  // UI Components
  const getStatusBadge = (status: Reminder['status'], is_completed: boolean) => {
    const isPastDue = (dueDate: string) => new Date(dueDate) < new Date() && !is_completed;

    let text = "Pendente";
    let color: "blue" | "green" | "red" | "orange" | "gray" = "blue";

    switch(status) {
      case 'concluido':
        text = "Concluído";
        color = "green";
        break;
      case 'cancelado':
        text = "Cancelado";
        color = "red";
        break;
      case 'redigitado':
        text = "Redigitado";
        color = "orange";
        break;
      case 'pendente':
      default:
        text = "Pendente";
        color = "blue";
        break;
    }

    return <Badge variant={is_completed ? "default" : "outline"} className={cn({
      'bg-green-500': color === 'green',
      'bg-red-500': color === 'red',
      'bg-orange-500': color === 'orange',
      'bg-blue-500': color === 'blue',
    }, 'text-white')}>{text}</Badge>;
  };

  const headerActions = (
    <Button onClick={() => handleOpenDialog()}>
      <Plus className="mr-2 h-4 w-4" /> Novo Lembrete
    </Button>
  );

  return (
    <PageLayout title="Lembretes de Portabilidade" subtitle="Gerencie e acompanhe seus lembretes de portabilidade" headerActions={headerActions}>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="concluido">Concluídos</TabsTrigger>
          <TabsTrigger value="cancelado">Cancelados</TabsTrigger>
          <TabsTrigger value="redigitado">Redigitados</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReminders.map(reminder => (
            <Card key={reminder.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => handleOpenDialog(reminder)} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {!reminder.is_completed ? (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(reminder, 'concluido')} className="flex items-center gap-2 text-green-600">
                          <Check className="h-4 w-4" />
                          Marcar como Concluído
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleUpdateStatus(reminder, 'pendente')} className="flex items-center gap-2 text-blue-600">
                          <RotateCcw className="h-4 w-4" />
                          Marcar como Pendente
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => handleUpdateStatus(reminder, 'cancelado')} className="flex items-center gap-2 text-red-600">
                        <Ban className="h-4 w-4" />
                        Marcar como Cancelado
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem onClick={() => handleUpdateStatus(reminder, 'redigitado')} className="flex items-center gap-2 text-orange-600">
                        <RotateCcw className="h-4 w-4" />
                        Marcar como Redigitado
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem onClick={() => handleDeleteReminder(reminder.id)} className="flex items-center gap-2 text-red-600 focus:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(new Date(reminder.due_date), "dd/MM/yyyy")}</span>
                  {new Date(reminder.due_date) < new Date() && !reminder.is_completed && (
                     <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Atrasado
                     </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                {reminder.lead_id && <Badge variant="secondary">{reminder.lead?.name || 'Cliente...'}</Badge>}
                {reminder.bank && <Badge variant="outline">{getBankName(reminder.bank)}</Badge>}
                {reminder.notes && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground break-words overflow-wrap-anywhere hyphens-auto max-h-20 overflow-y-auto">
                      {reminder.notes}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                {getStatusBadge(reminder.status, reminder.is_completed)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && filteredReminders.length === 0 && (
          <div className="text-center py-16">
              <p className="text-lg font-semibold">Nenhum lembrete encontrado</p>
              <p className="text-muted-foreground">Tente criar um novo lembrete ou mudar de aba.</p>
          </div>
      )}

      {/* Dialog for New/Edit Reminder */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} onCloseAutoFocus={handleCloseDialog}>
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Editar Lembrete' : 'Novo Lembrete'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_id">Cliente (Opcional)</Label>
              <Select value={formData.lead_id} onValueChange={(value) => handleInputChange('lead_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(leads) && leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Data</Label>
              <Popover>
                  <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.due_date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.due_date ? format(formData.due_date, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={formData.due_date} onSelect={(date) => handleInputChange('due_date', date)} initialFocus />
                  </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (Opcional)</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="bank">Banco</Label>
                <BankSelect 
                  value={formData.bank || "none"} 
                  onValueChange={(value) => handleInputChange('bank', value)}
                  placeholder="Selecione um banco (opcional)"
                  showNoneOption={true}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                        <SelectItem value="redigitado">Redigitado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSaveReminder}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Portability;
