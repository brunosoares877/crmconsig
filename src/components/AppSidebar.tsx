
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, CalendarDays, CalendarPlus, DollarSign, List, ListCheck, Settings, Users, Star } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ListCheck,
    match: (pathname: string) => pathname === "/dashboard",
  },
  {
    title: "Leads",
    url: "/leads",
    icon: List,
    match: (pathname: string) =>
      pathname === "/leads" ||
      pathname.startsWith("/leads/"),
  },
  {
    title: "Leads Premium",
    url: "/leads-premium",
    icon: Star,
    isPremium: true,
    match: (pathname: string) => pathname === "/leads-premium",
  },
  {
    title: "Lembretes",
    url: "/reminders",
    icon: Calendar,
    match: (pathname: string) =>
      pathname === "/reminders" ||
      pathname.startsWith("/reminders/"),
  },
  {
    title: "Calendário",
    url: "/reminders/calendar",
    icon: CalendarDays,
    match: (pathname: string) =>
      pathname === "/reminders/calendar",
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled",
    icon: CalendarPlus,
    match: (pathname: string) =>
      pathname === "/leads/scheduled",
  },
  {
    title: "Funcionários",
    url: "/employees",
    icon: Users,
    match: (pathname: string) => pathname === "/employees",
  },
  {
    title: "Portabilidade",
    url: "/portability",
    icon: ListCheck,
    match: (pathname: string) => pathname === "/portability",
  },
  {
    title: "Comissões",
    url: "/commission",
    icon: DollarSign,
    match: (pathname: string) =>
      pathname === "/commission" || pathname === "/commission-settings",
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    match: (pathname: string) =>
      pathname === "/settings" ||
      pathname.startsWith("/settings/"),
  },
];

export function AppSidebar() {
  const location = useLocation();

  // Aponta para o primeiro índice ativo encontrando via match
  let firstActiveIdx = -1;
  for (let i = 0; i < menuItems.length; i++) {
    if (menuItems[i].match(location.pathname)) {
      firstActiveIdx = i;
      break;
    }
  }

  return (
    <Sidebar collapsible="none" className="w-64 min-w-64 max-w-64">
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <h1 className="text-lg font-bold text-sidebar-foreground">
            LeadConsig
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => {
                const isActive = idx === firstActiveIdx;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link to={item.url} className="flex items-center gap-2 w-full">
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${item.isPremium ? "text-yellow-400 fill-yellow-400" : ""}`} />
                        <span className={`flex-1 text-left ${
                          item.isPremium ? "text-yellow-400 font-semibold" : ""
                        }`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
