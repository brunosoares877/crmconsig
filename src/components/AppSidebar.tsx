
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, DollarSign, List, Users, Settings } from "lucide-react";
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
    icon: List,
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
    icon: List,
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
    icon: Calendar,
    match: (pathname: string) =>
      pathname === "/reminders/calendar",
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled",
    icon: Calendar,
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
    icon: List,
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

  // Ajuste: só UM item ativo por vez, fixo, todos sempre aparecem
  const getActiveIdx = () => {
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].match(location.pathname)) {
        return i;
      }
    }
    return -1;
  };
  const activeIdx = getActiveIdx();

  return (
    <Sidebar collapsible="none" className="w-64 min-w-64 max-w-64 bg-[#0f2247]">
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <h1 className="text-lg font-bold text-sidebar-foreground text-white">
            LeadConsig
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* Label removido para igualar visual à primeira imagem */}
          {/* <SidebarGroupLabel>Menu Principal</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full transition-all font-normal justify-start text-base ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/80 hover:bg-white/5"
                      } ${item.isPremium ? "text-yellow-400 font-semibold" : ""}`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link to={item.url} className="flex items-center gap-2 w-full">
                        {/* Para "Leads Premium", estrela amarela à esquerda */}
                        {item.isPremium && (
                          <span className="inline-block w-4 h-4 text-yellow-400">
                            {/* Simples estrela unicode: */}
                            ★
                          </span>
                        )}
                        {/* Icone padrão para os outros */}
                        {!item.isPremium && (
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-left">{item.title}</span>
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
