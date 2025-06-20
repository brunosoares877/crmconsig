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
import PageLayout from "@/components/PageLayout";
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

  return (
    <PageLayout>
      <div className="flex flex-col gap-8 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
            <p className="text-muted-foreground">
              Gerencie seus agendamentos com clientes
            </p>
          </div>

          <Button onClick={openNewAppointmentDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => filterAppointments(value as AppointmentStatus)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
            <TabsTrigger value="overdue">Atrasados</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="relative">
                      <div className="absolute right-6 top-6">
                        {getAppointmentStatusBadge(appointment)}
                      </div>
                      <CardTitle>{appointment.title}</CardTitle>
                      <CardDescription>
                        Cliente: {getLeadName(appointment.lead_id)}
                      </CardDescription>
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
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="relative">
                      <div className="absolute right-6 top-6">
                        {getAppointmentStatusBadge(appointment)}
                      </div>
                      <CardTitle>{appointment.title}</CardTitle>
                      <CardDescription>
                        Cliente: {getLeadName(appointment.lead_id)}
                      </CardDescription>
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
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="relative">
                      <div className="absolute right-6 top-6">
                        {getAppointmentStatusBadge(appointment)}
                      </div>
                      <CardTitle>{appointment.title}</CardTitle>
                      <CardDescription>
                        Cliente: {getLeadName(appointment.lead_id)}
                      </CardDescription>
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
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                filteredAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="relative">
                      <div className="absolute right-6 top-6">
                        {getAppointmentStatusBadge(appointment)}
                      </div>
                      <CardTitle>{appointment.title}</CardTitle>
                      <CardDescription>
                        Cliente: {getLeadName(appointment.lead_id)}
                      </CardDescription>
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
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
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
                <Select value={leadId} onValueChange={setLeadId}>
                  <SelectTrigger>
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
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={ptBR}
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
    </PageLayout>
  );
};

export default LeadScheduling;
