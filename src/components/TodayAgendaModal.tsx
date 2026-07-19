import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Bell, Clock, AlertTriangle, CheckSquare, ArrowRight, User } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface TodayAgendaModalProps {
  triggerOpen?: boolean;
  onCloseTrigger?: () => void;
}

export const TodayAgendaModal: React.FC<TodayAgendaModalProps> = ({ 
  triggerOpen = false, 
  onCloseTrigger 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formatar datas para hoje
  const getTodayStringStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // Se o triggerOpen mudar para true, abre o modal
    if (triggerOpen) {
      setIsOpen(true);
      fetchAgenda();
    }
  }, [triggerOpen]);

  useEffect(() => {
    // Execução automática na primeira carga diária
    const checkDailyView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = getTodayStringStr();
      const lastViewed = localStorage.getItem(`last_agenda_view_${user.id}`);

      if (lastViewed !== todayStr && !triggerOpen) {
        setIsOpen(true);
        localStorage.setItem(`last_agenda_view_${user.id}`, todayStr);
        fetchAgenda();
      }
    };
    checkDailyView();
  }, []);

  const fetchAgenda = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const todayStr = getTodayStringStr();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const tomorrowIso = tomorrow.toISOString();

      // 1. Buscar Lembretes não concluídos (vencidos ou marcados para hoje)
      const { data: remData, error: remErr } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .lte("due_date", tomorrowIso)
        .order("due_date", { ascending: true });

      if (remErr) throw remErr;

      // 2. Buscar Agendamentos marcados para hoje
      const { data: appData, error: appErr } = await supabase
        .from("appointments")
        .select("*, lead:leads(name, phone)")
        .eq("user_id", user.id)
        .eq("date", todayStr)
        .order("time", { ascending: true });

      if (appErr) throw appErr;

      setReminders(remData || []);
      setAppointments(appData || []);
    } catch (err) {
      console.error("Erro ao carregar agenda diária:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReminder = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from("reminders")
        .update({ is_completed: newStatus })
        .eq("id", id);

      if (error) throw error;

      // Atualizar estado local
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success("Lembrete concluído com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao atualizar lembrete: " + err.message);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseTrigger) onCloseTrigger();
  };

  const overdueReminders = reminders.filter(r => new Date(r.due_date) < new Date(new Date().setHours(0, 0, 0, 0)));
  const todayReminders = reminders.filter(r => new Date(r.due_date) >= new Date(new Date().setHours(0, 0, 0, 0)));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden p-0 border border-slate-100">
        
        {/* Header Customizado Premium */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex justify-between items-start">
          <div className="space-y-1">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-0.5 px-2">
              Agenda do Dia 📅
            </Badge>
            <DialogTitle className="text-2xl font-bold text-white leading-tight">
              Seus compromissos e lembretes de hoje
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm">
              Confira tudo o que está programado para otimizar suas vendas hoje.
            </DialogDescription>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md">
            <Calendar className="h-6 w-6 text-blue-100 animate-pulse" />
          </div>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">Carregando sua agenda...</p>
            </div>
          ) : (
            <>
              {/* Seção 1: Agendamentos de Clientes (Leads) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-lg">Agendamentos de Hoje</h3>
                  <Badge variant="secondary" className="ml-auto bg-blue-50 text-blue-700">
                    {appointments.length}
                  </Badge>
                </div>
                
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">Nenhum agendamento para hoje.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map(app => (
                      <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-md transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {app.time || "O dia todo"}
                            </span>
                            <span className="font-bold text-slate-800">{app.title}</span>
                          </div>
                          {app.lead && (
                            <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>Cliente: <strong>{app.lead.name}</strong></span>
                              <span className="text-slate-300">|</span>
                              <span>{app.lead.phone}</span>
                            </div>
                          )}
                          {app.notes && (
                            <p className="text-xs text-slate-400 italic bg-white p-2 rounded border border-slate-100 mt-2">
                              Obs: {app.notes}
                            </p>
                          )}
                        </div>
                        {app.lead_id && (
                          <Button asChild size="sm" variant="ghost" className="mt-3 md:mt-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1" onClick={handleClose}>
                            <Link to={`/leads?id=${app.lead_id}`}>
                              Ir para o Lead
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção 2: Lembretes Atrasados (Alerta) */}
              {overdueReminders.length > 0 && (
                <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 border-b border-red-100 pb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-bold text-lg">Lembretes Pendentes Atrasados</h3>
                    <Badge variant="destructive" className="ml-auto">
                      {overdueReminders.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {overdueReminders.map(rem => (
                      <div key={rem.id} className="flex items-start gap-3 py-1.5">
                        <Checkbox 
                          id={`overdue-${rem.id}`}
                          checked={false}
                          onCheckedChange={() => handleToggleReminder(rem.id, false)}
                          className="mt-1 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor={`overdue-${rem.id}`} className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-red-700">
                            {rem.title}
                          </label>
                          <p className="text-xs text-red-600 font-medium">
                            Venceu em: {new Date(rem.due_date).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seção 3: Lembretes de Hoje */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Bell className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-800 text-lg">Lembretes de Hoje</h3>
                  <Badge variant="secondary" className="ml-auto bg-indigo-50 text-indigo-700">
                    {todayReminders.length}
                  </Badge>
                </div>
                
                {todayReminders.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">Nenhum lembrete marcado para hoje.</p>
                ) : (
                  <div className="space-y-2">
                    {todayReminders.map(rem => (
                      <div key={rem.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                        <Checkbox 
                          id={`today-${rem.id}`}
                          checked={false}
                          onCheckedChange={() => handleToggleReminder(rem.id, false)}
                          className="mt-1 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor={`today-${rem.id}`} className="text-sm font-medium text-slate-700 cursor-pointer hover:text-indigo-600">
                            {rem.title}
                          </label>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(rem.due_date).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <Button onClick={handleClose} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            <CheckSquare className="h-4 w-4 mr-2" />
            Entendido, começar o dia!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
