import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Edit, Check, X, Clock, MapPin, AlertCircle } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lead, Appointment } from "@/types/models";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type AppointmentStatus = "all" | "completed" | "overdue" | "pending";

const LeadScheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"scheduled" | "completed" | "cancelled">("scheduled");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads for the dropdown - only fetch id and name for efficiency
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, name")
        .order("name");
      
      if (leadsError) throw leadsError;
      
      // We need to type-assert here since we're only selecting certain fields
      setLeads(leadsData as Lead[]);
      
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

  const filterAppointments = (status: AppointmentStatus) => {
    setCurrentStatus(status);
    
    if (status === "all") {
      setFilteredAppointments(appointments);
      return;
    }
    
    const now = new Date();
    
    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
      
      if (status === "completed") {
        return appointment.status === "completed";
      } else if (status === "overdue") {
        return appointment.status === "scheduled" && appointmentDate < now;
      } else if (status === "pending") {
        return appointment.status === "scheduled" && appointmentDate >= now;
      }
      
      return true;
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
      
      setAppointments(appointments.map(a => 
        a.id === appointment.id ? { ...a, status: newStatus } : a
      ));
      
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
    if (appointmentStatus === "completed") return false;
    const appointmentDate = new Date(`${dateString} ${timeString}`);
    const now = new Date();
    return appointmentDate < now && appointmentStatus === "scheduled";
  };

  const getAppointmentStatusBadge = (appointment: Appointment) => {
    if (appointment.status === "completed") {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 text-sm">Finalizado</Badge>;
    } else if (appointment.status === "cancelled") {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 text-sm">Cancelado</Badge>;
    } else if (isPastDue(appointment.date, appointment.time, appointment.status)) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 text-sm">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1 text-sm">Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-0 md:ml-64">
        <Header />
        <main className="w-full p-4 md:p-6 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Agendamentos</h1>
              <p className="text-muted-foreground text-lg">Gerencie os agendamentos com seus clientes</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={openNewAppointmentDialog}>
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl">{editingAppointment ? "Editar Agendamento" : "Criar Novo Agendamento"}</DialogTitle>
                  <DialogDescription className="text-base">
                    {editingAppointment 
                      ? "Atualize os detalhes do agendamento." 
                      : "Agende uma visita ou reunião com o cliente."}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-medium">Título*</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título do agendamento"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="lead" className="text-sm font-medium">Cliente*</Label>
                    <Select value={leadId} onValueChange={setLeadId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione um cliente" />
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="time" className="text-sm font-medium">Horário*</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                  
                  {editingAppointment && (
                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={status} onValueChange={(value: "scheduled" | "completed" | "cancelled") => setStatus(value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detalhes adicionais sobre o agendamento..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                </div>
                
                <DialogFooter className="gap-3">
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAppointment ? "Atualizando..." : "Salvando..."}
                      </>
                    ) : (
                      editingAppointment ? "Atualizar" : "Salvar"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => filterAppointments(value as AppointmentStatus)}>
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
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-6">
              {filteredAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className={cn(
                    "transition-all hover:shadow-md",
                    appointment.status === "cancelled" ? "bg-gray-50 opacity-80" : "bg-white"
                  )}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl">{appointment.title}</CardTitle>
                          {getAppointmentStatusBadge(appointment)}
                        </div>
                        
                        <div className="space-y-2">
                          <CardDescription className="flex items-center gap-2 text-base">
                            <MapPin className="h-4 w-4" />
                            Cliente: <span className="font-medium text-foreground">{getLeadName(appointment.lead_id)}</span>
                          </CardDescription>
                          <CardDescription className="flex items-center gap-2 text-base">
                            <Clock className="h-4 w-4" />
                            {formatDate(appointment.date)} às {appointment.time}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {appointment.status === "scheduled" && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 text-green-600 hover:bg-green-50"
                              title="Marcar como concluído"
                              onClick={() => handleStatusChange(appointment, "completed")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 text-red-600 hover:bg-red-50"
                              title="Cancelar agendamento"
                              onClick={() => handleStatusChange(appointment, "cancelled")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteAppointment(appointment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {appointment.notes && (
                    <CardContent className="pt-0">
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-sm text-gray-700">Observações:</span>
                        </div>
                        <p className="text-gray-600">{appointment.notes}</p>
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
                <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum agendamento</h3>
                <p className="text-gray-500 text-lg">
                  Crie o seu primeiro agendamento com um cliente.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default LeadScheduling;
