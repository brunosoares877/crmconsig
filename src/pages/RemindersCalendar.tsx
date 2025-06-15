
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2, Check } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PageLayout from "@/components/PageLayout";

interface Reminder {
  id: string;
  title: string;
  lead_id: string | null;
  notes: string | null;
  due_date: string;
  is_completed: boolean;
  created_at: string;
  bank?: string | null;
}

interface Lead {
  id: string;
  name: string;
  bank?: string;
}

interface DayWithReminders {
  date: Date;
  reminders: Reminder[];
}

const RemindersCalendar = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [daysWithReminders, setDaysWithReminders] = useState<Date[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads for the mapping
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

      // Process days with reminders
      processReminders(remindersData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const processReminders = (remindersList: Reminder[]) => {
    const uniqueDates = new Set<string>();
    
    remindersList.forEach(reminder => {
      const dueDate = parseISO(reminder.due_date);
      const dateKey = format(dueDate, 'yyyy-MM-dd');
      uniqueDates.add(dateKey);
    });
    
    const dates = Array.from(uniqueDates).map(dateKey => parseISO(dateKey));
    setDaysWithReminders(dates);
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      await fetchData();
    } catch (error: any) {
      console.error("Error updating reminder:", error);
      toast.error(`Erro ao atualizar lembrete: ${error.message}`);
    }
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: ptBR });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: ptBR });
  };

  const isPastDue = (dateString: string, isCompleted: boolean) => {
    if (isCompleted) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    return dueDate < today;
  };

  const getReminderStatusBadge = (reminder: Reminder) => {
    if (reminder.is_completed) {
      return <Badge className="bg-green-500 hover:bg-green-600">Finalizado</Badge>;
    } else if (isPastDue(reminder.due_date, reminder.is_completed)) {
      return <Badge className="bg-red-500 hover:bg-red-600">Atrasado</Badge>;
    } else {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Pendente</Badge>;
    }
  };

  // Find reminders for the selected day
  const selectedDayReminders = selectedDay 
    ? reminders.filter(reminder => 
        isSameDay(new Date(reminder.due_date), selectedDay)
      )
    : [];

  return (
    <PageLayout 
      title="Calendário de Lembretes" 
      subtitle="Visualize seus lembretes organizados por data"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Selecione uma data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  className="pointer-events-auto"
                  modifiers={{
                    hasReminders: daysWithReminders
                  }}
                  modifiersStyles={{
                    hasReminders: { 
                      backgroundColor: "#E5DEFF",
                      fontWeight: "bold"
                    }
                  }}
                  disabled={date => {
                    const now = new Date();
                    return date < new Date(now.getFullYear() - 1, 0, 1);
                  }}
                />
              )}
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm">Finalizado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-sm">Atrasado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm">Pendente</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDay 
                ? `Lembretes para ${format(selectedDay, 'dd/MM/yyyy', { locale: ptBR })}`
                : "Selecione uma data para ver os lembretes"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : selectedDayReminders.length > 0 ? (
              <div className="space-y-4">
                {selectedDayReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-md border",
                      reminder.is_completed ? "bg-gray-50 opacity-70" : "bg-white",
                      isPastDue(reminder.due_date, reminder.is_completed) ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          "font-medium",
                          reminder.is_completed && "line-through text-gray-500"
                        )}>
                          {reminder.title}
                        </h3>
                        {getReminderStatusBadge(reminder)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Cliente: {getLeadName(reminder.lead_id)}
                      </p>
                      {reminder.bank && (
                        <p className="text-sm text-gray-500">
                          Banco: {getBankName(reminder.bank)}
                        </p>
                      )}
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(reminder.due_date)} às {formatTime(reminder.due_date)}</span>
                      </div>
                      {reminder.notes && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-sm text-blue-600">
                              Ver detalhes
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Observações:</h4>
                              <p className="text-sm">{reminder.notes}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <h3 className="text-lg font-medium text-gray-900">Nenhum lembrete para esta data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selecione outra data ou crie um novo lembrete.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default RemindersCalendar;
