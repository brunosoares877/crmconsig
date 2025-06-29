import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Edit, Check, X, Clock, MapPin, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lead, Appointment } from "@/types/models";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type AppointmentStatus = "all" | "completed" | "overdue" | "pending";

const LeadScheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState("");
  const [date, setDate] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"scheduled" | "completed" | "cancelled">("scheduled");

  // Client search state
  const [clientSearch, setClientSearch] = useState("");
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads with cpf for the dropdown
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, name, cpf")
        .order("name");
      
      if (leadsError) throw leadsError;
      
      const leadsWithCpf = leadsData as Lead[];
      setLeads(leadsWithCpf);
      setFilteredLeads(leadsWithCpf);
      
      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .order("date");
        
      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData as Appointment[]);
      setFilteredAppointments(appointmentsData as Appointment[]);
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
    filterAppointments(currentStatus);
  }, [appointments, currentStatus]);

  // Update filtered leads when leads change
  useEffect(() => {
    setFilteredLeads(leads);
  }, [leads]);

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

  const filterAppointments = (status: AppointmentStatus) => {
    setCurrentStatus(status);
    
    if (status === "all") {
      setFilteredAppointments(appointments);
      return;
    }
    
    const now = new Date();
    // Remover os segundos e milissegundos para comparação mais precisa
    now.setSeconds(0, 0);
    
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
      appointmentDate.setSeconds(0, 0);
      
      if (status === "completed") {
        return appointment.status === "completed";
      } else if (status === "overdue") {
        return appointment.status === "scheduled" && appointmentDate < now;
      } else if (status === "pending") {
        return appointment.status === "scheduled" && appointmentDate >= now;
      }
      
      return false;
    });
    
    setFilteredAppointments(filtered);
  };

  const handleSubmit = async () => {
    if (!title || !leadId || !date || !time) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const formattedDate = format(date, "yyyy-MM-dd");
      
      if (editingAppointment) {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update({
            title,
            lead_id: leadId,
            date: formattedDate,
            time,
            notes,
            status,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingAppointment.id);
          
        if (error) throw error;
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        // Create new appointment
        const { error } = await supabase
          .from("appointments")
          .insert({
            title,
            lead_id: leadId,
            date: formattedDate,
            time,
            notes,
            status,
            user_id: userData.user.id
          });
          
        if (error) throw error;
        toast.success("Agendamento criado com sucesso!");
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error("Error submitting appointment:", error);
      toast.error(`Erro ao ${editingAppointment ? "atualizar" : "criar"} agendamento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setLeadId(appointment.lead_id);
    setDate(new Date(appointment.date));
    setTime(appointment.time);
    setNotes(appointment.notes || "");
    setStatus(appointment.status);
    setIsDialogOpen(true);
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setAppointments(appointments.filter(a => a.id !== id));
      toast.success("Agendamento excluído com sucesso!");
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      toast.error(`Erro ao excluir agendamento: ${error.message}`);
    }
  };

  const handleStatusChange = async (appointment: Appointment, newStatus: "scheduled" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", appointment.id);
        
      if (error) throw error;
      
      // Atualizar o estado local
      const updatedAppointments = appointments.map(a => 
        a.id === appointment.id ? { ...a, status: newStatus } : a
      );
      setAppointments(updatedAppointments);
      
      // Recarregar os dados para garantir que tudo esteja sincronizado
      await fetchData();
      
      toast.success(`Status atualizado para ${getStatusText(newStatus)}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
    }
  };

  const resetForm = () => {
    setTitle("");
    setLeadId("");
    setDate(new Date());
    setTime("09:00");
    setNotes("");
    setStatus("scheduled");
    setEditingAppointment(null);
  };

  const getLeadName = (id: string) => {
    const lead = leads.find(l => l.id === id);
    return lead ? lead.name : "Cliente não encontrado";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: ptBR });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "Agendado";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const openNewAppointmentDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const isPastDue = (dateString: string, timeString: string, appointmentStatus: string) => {
    if (appointmentStatus !== "scheduled") return false;
    const appointmentDate = new Date(`${dateString} ${timeString}`);
    const now = new Date();
    // Remover os segundos e milissegundos para comparação mais precisa
    appointmentDate.setSeconds(0, 0);
    now.setSeconds(0, 0);
    return appointmentDate < now;
  };

  const getAppointmentStatusBadge = (appointment: Appointment) => {
    if (appointment.status === "completed") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">Concluído</Badge>;
    } else if (appointment.status === "cancelled") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 text-sm">Cancelado</Badge>;
    } else if (isPastDue(appointment.date, appointment.time, appointment.status)) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 text-sm">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm">Pendente</Badge>;
    }
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id}>
      <CardHeader className="relative">
        <div className="absolute right-6 top-6">
          {getAppointmentStatusBadge(appointment)}
        </div>
        <CardTitle className="text-lg font-semibold mb-3">{appointment.title}</CardTitle>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-base">
            <span className="font-medium text-gray-700">Cliente:</span>
            <span className="text-xl font-bold text-gray-900">{getLeadName(appointment.lead_id)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(appointment.date)}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{appointment.time}</span>
          </div>
          
          {appointment.notes && (
            <div className="text-sm text-muted-foreground">
              {appointment.notes}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditAppointment(appointment)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            
            {appointment.status !== "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(appointment, "completed")}
              >
                <Check className="h-4 w-4 mr-1" />
                Concluir
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o agendamento "{appointment.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 w-full flex">
        <AppSidebar />
        <div className="flex-1 w-full overflow-hidden min-w-0">
          <Header />
          <main className="w-full h-full">
            <div className="p-6 space-y-6">
              {/* Header moderno customizado */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl mb-8 shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Agendamentos</h1>
                <p className="text-blue-100 text-lg mt-1">Gerencie seus agendamentos com clientes</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Total de Agendamentos</div>
                <div className="text-2xl font-bold">
                  {appointments.length}
                </div>
              </div>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={openNewAppointmentDialog} className="bg-white/20 hover:bg-white/30 border-white/30">
                <Plus className="mr-2 h-4 w-4" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8">

        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => filterAppointments(value as AppointmentStatus)}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="overdue">Atrasados</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nenhum agendamento encontrado</CardTitle>
                      <CardDescription>
                        Clique no botão "Novo Agendamento" para criar um agendamento
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ) : (
                                filteredAppointments.map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nenhum agendamento pendente</CardTitle>
                      <CardDescription>
                        Todos os agendamentos estão em dia
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ) : (
                filteredAppointments.map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nenhum agendamento concluído</CardTitle>
                      <CardDescription>
                        Não há agendamentos concluídos
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ) : (
                filteredAppointments.map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {isLoading ? (
                <div className="col-span-full flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nenhum agendamento atrasado</CardTitle>
                      <CardDescription>
                        Todos os agendamentos estão em dia
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              ) : (
                filteredAppointments.map(renderAppointmentCard)
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do agendamento abaixo
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Visita ao cliente"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lead">Cliente</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !leadId ? "text-muted-foreground" : ""
                      )}
                    >
                      {leadId 
                        ? (() => {
                            const selectedLead = leads.find(lead => lead.id === leadId);
                            return selectedLead ? formatClientDisplay(selectedLead) : "Cliente não encontrado";
                          })()
                        : "Selecione um cliente"
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

              <div className="grid gap-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
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

              <div className="grid gap-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre o agendamento"
                />
              </div>

              {editingAppointment && (
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAppointment ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LeadScheduling;
