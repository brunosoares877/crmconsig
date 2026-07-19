
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Calendar, Clock } from "lucide-react";
import { TodayAgendaModal } from "./TodayAgendaModal";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import SupportButton from "@/components/SupportButton";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PostgrestError } from "@/types/database.types";

interface Notification {
  id: string;
  title: string;
  type: "reminder" | "appointment";
  href: string;
  dueAt: Date;
}

const Header = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();

  // FIXED: Call hooks unconditionally at the top level
  const sidebar = useSidebar();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      const err = error as PostgrestError;
      console.error("Erro ao fazer logout:", err.message);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.charAt(0).toUpperCase();
  };

  // Carregar notificações de lembretes e agendamentos próximos ou vencidos
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        setLoadingNotifs(true);
        const now = new Date();
        const nowIso = now.toISOString();

        // 1. Lembretes: vencidos ou marcados para hoje e não concluídos
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const endOfTodayIso = endOfToday.toISOString();

        const { data: reminders, error: remErr } = await supabase
          .from("reminders")
          .select("id, title, due_date")
          .eq("user_id", user.id)
          .eq("is_completed", false)
          .lte("due_date", endOfTodayIso);
        if (remErr) throw remErr;

        // 2. Agendamentos: agendados para hoje ou datas passadas (pendentes)
        const todayStr = now.toISOString().split("T")[0];
        const { data: appointments, error: appErr } = await supabase
          .from("appointments")
          .select("id, title, date, time")
          .eq("user_id", user.id)
          .eq("status", "scheduled")
          .lte("date", todayStr);
        if (appErr) throw appErr;

        const parsedReminders = (reminders || []).map((r) => ({
          id: `rem-${r.id}`,
          title: r.title || "Lembrete",
          type: "reminder" as const,
          href: "/reminders",
          dueAt: new Date(r.due_date),
        }));

        const parsedApps = (appointments || []).map((a) => {
          const dtStr = a.time ? `${a.date}T${a.time}` : `${a.date}T00:00:00`;
          const dueAt = new Date(dtStr);
          return {
            id: `app-${a.id}`,
            title: a.title || "Agendamento",
            type: "appointment" as const,
            href: "/leads/scheduled",
            dueAt,
          };
        });

        const all = [...parsedReminders, ...parsedApps]
          .filter(n => !isNaN(n.dueAt.getTime()))
          .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());

        setNotifications(all);
      } catch (error) {
        const err = error as PostgrestError;
        console.error("Erro ao carregar notificações:", err);
        toast.error("Erro ao carregar notificações");
      } finally {
        setLoadingNotifs(false);
      }
    };

    load();
    const interval = setInterval(load, 60_000); // atualiza a cada minuto
    return () => clearInterval(interval);
  }, [user]);

  const hasNotifications = notifications.length > 0;

  return (
    <header className="border-b py-2 px-3 md:py-3 md:px-4 flex justify-between items-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center gap-2">
        {isMobile && sidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => sidebar?.setOpenMobile(true)}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <Menu className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}

        {/* Logo aumentada com cores brancas elegantes - Oculta no Desktop para não duplicar */}
        <div className="flex items-center md:hidden">
          <div className="w-10 h-10 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mr-3 shadow-md">
            <div className="w-5 h-5 bg-blue-600 rounded-md"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">LeadConsig</h1>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <SupportButton />
        
        {/* Botão de Agenda do Dia */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAgendaModal(true)}
          className="relative h-8 w-8 md:h-10 md:w-10 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl"
          title="Agenda do Dia"
        >
          <Calendar className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 md:h-10 md:w-10"
            >
              <Bell className={`h-4 w-4 md:h-5 md:w-5 ${hasNotifications ? 'animate-bounce text-amber-500' : 'text-slate-600'}`} />
              {hasNotifications && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse border border-white">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-sm font-semibold">
              Notificações
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loadingNotifs && (
              <DropdownMenuItem className="text-xs text-muted-foreground">
                Carregando...
              </DropdownMenuItem>
            )}
            {!loadingNotifs && !hasNotifications && (
              <DropdownMenuItem className="text-xs text-muted-foreground">
                Nenhuma notificação para agora
              </DropdownMenuItem>
            )}
            {!loadingNotifs && hasNotifications && notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start text-xs"
                onClick={() => navigate(n.href)}
              >
                <span className="font-semibold">
                  {n.type === "reminder" ? "Lembrete" : "Agendamento"}
                </span>
                <span className="text-muted-foreground">{n.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {n.dueAt.toLocaleString("pt-BR")}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 md:h-10 md:w-10"
            >
              <Avatar className="h-6 w-6 md:h-8 md:w-8">
                <AvatarFallback className="text-xs md:text-sm">
                  {user ? getInitials(user.email || "") : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 md:w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-xs">
              <div className="flex flex-col space-y-1">
                <p className="text-xs md:text-sm font-medium leading-none truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* Placeholder para futuras opções */}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-xs md:text-sm">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Modal global de Agenda Diária */}
      <TodayAgendaModal triggerOpen={showAgendaModal} onCloseTrigger={() => setShowAgendaModal(false)} />
    </header>
  );
};

export default Header;
