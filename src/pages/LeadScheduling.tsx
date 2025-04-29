
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2, Plus, Trash2, Edit, Check, X } from "lucide-react";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Lead, Appointment } from "@/types/models";

const LeadScheduling = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Agendamentos</h1>
              <p className="text-muted-foreground">Gerencie os agendamentos com seus clientes</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={openNewAppointmentDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingAppointment ? "Editar Agendamento" : "Criar Novo Agendamento"}</DialogTitle>
                  <DialogDescription>
                    {editingAppointment 
                      ? "Atualize os detalhes do agendamento." 
                      : "Agende uma visita ou reunião com o cliente."}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título*</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Título do agendamento"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lead">Cliente*</Label>
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Horário*</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {editingAppointment && (
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={(value: "scheduled" | "completed" | "cancelled") => setStatus(value)}>
                        <SelectTrigger>
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detalhes adicionais sobre o agendamento..."
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
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

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={cn(
                    "p-4 rounded-md border border-gray-200",
                    appointment.status === "cancelled" ? "bg-gray-50 opacity-80" : "bg-white"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="font-medium text-lg">{appointment.title}</h3>
                        <span className={cn("ml-2 text-xs px-2 py-1 rounded", getStatusColor(appointment.status))}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Cliente: <span className="font-medium">{getLeadName(appointment.lead_id)}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Data: {formatDate(appointment.date)} às {appointment.time}
                      </p>
                      {appointment.notes && (
                        <div className="mt-2 bg-gray-50 p-2 rounded-md text-sm">
                          <span className="font-medium">Observações:</span>
                          <p className="text-gray-600">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {appointment.status === "scheduled" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            title="Marcar como concluído"
                            onClick={() => handleStatusChange(appointment, "completed")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-red-600"
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
                        className="h-8 w-8"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Nenhum agendamento</h3>
              <p className="mt-1 text-sm text-gray-500">
                Crie o seu primeiro agendamento com um cliente.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LeadScheduling;
