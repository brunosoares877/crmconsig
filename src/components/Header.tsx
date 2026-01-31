
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
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
        const windowMinutes = 60; // próximos 60 minutos
        const windowDate = new Date(now.getTime() + windowMinutes * 60000).toISOString();

        // Lembretes: due_date até a próxima 1h e não completados
        const { data: reminders, error: remErr } = await supabase
          .from("reminders")
          .select("id, title, due_date")
          .eq("user_id", user.id)
          .eq("is_completed", false)
          .lte("due_date", windowDate);
        if (remErr) throw remErr;

        // Agendamentos: data/hora até próxima 1h
        const { data: appointments, error: appErr } = await supabase
          .from("appointments")
          .select("id, title, date, time")
          .eq("user_id", user.id)
          .lte("date", windowDate.split("T")[0]);
        if (appErr) throw appErr;

        const parsedReminders = (reminders || []).map((r) => ({
          id: `rem-${r.id}`,
          title: r.title || "Lembrete",
          type: "reminder" as const,
          href: "/reminders",
          dueAt: new Date(r.due_date),
        }));

        const parsedApps = (appointments || []).flatMap((a) => {
          if (!a.date) return [];
          const dtStr = a.time ? `${a.date}T${a.time}` : `${a.date}T00:00:00`;
          const dueAt = new Date(dtStr);
          if (dueAt.getTime() > new Date(windowDate).getTime()) return [];
          return [{
            id: `app-${a.id}`,
            title: a.title || "Agendamento",
            type: "appointment" as const,
            href: "/leads/scheduled",
            dueAt,
          }];
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

        {/* Logo aumentada com cores brancas elegantes */}
        <div className="flex items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center mr-3 md:mr-4 shadow-md">
            <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-600 rounded-md"></div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">LeadConsig</h1>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <SupportButton />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 md:h-10 md:w-10"
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              {hasNotifications && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
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
    </header>
  );
};

export default Header;
