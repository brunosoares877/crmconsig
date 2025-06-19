import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, CalendarDays, CalendarPlus, DollarSign, List, ListCheck, Settings, Users, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ListCheck,
    match: (pathname) => pathname === "/dashboard",
  },
  {
    title: "Leads",
    url: "/leads",
    icon: List,
    match: (pathname) => pathname === "/leads" || pathname.startsWith("/leads/"),
  },
  {
    title: "Leads Premium",
    url: "/leads-premium",
    icon: Star,
    isPremium: true,
    match: (pathname) => pathname === "/leads-premium",
  },
  {
    title: "Lembretes",
    url: "/reminders",
    icon: Calendar,
    match: (pathname) => pathname === "/reminders",
  },
  {
    title: "Calendário",
    url: "/reminders/calendar",
    icon: CalendarDays,
    match: (pathname) => pathname === "/reminders/calendar",
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled",
    icon: CalendarPlus,
    match: (pathname) => pathname === "/leads/scheduled",
  },
  {
    title: "Funcionários",
    url: "/employees",
    icon: Users,
    match: (pathname) => pathname === "/employees",
  },
  {
    title: "Portabilidade",
    url: "/portability",
    icon: ListCheck,
    match: (pathname) => pathname === "/portability",
  },
  {
    title: "Comissões",
    url: "/commission",
    icon: DollarSign,
    match: (pathname) => pathname === "/commission" || pathname === "/commission-settings",
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    match: (pathname) => pathname === "/settings",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  // Aponta para o primeiro índice ativo encontrando via match
  let activeIdx = -1;
  for (let i = 0; i < menuItems.length; i++) {
    if (menuItems[i].match(location.pathname)) {
      activeIdx = i;
      break; // Garante que só um item fique ativo
    }
  }

  return (
    <Sidebar collapsible="none" className="w-64 min-w-64 max-w-64 h-screen flex flex-col">
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <h1 className="text-lg font-bold text-sidebar-foreground">
            LeadConsig
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupLabel>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => {
                const isActive = idx === activeIdx;
                const isLeadsPremium = item.title === "Leads Premium";
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`w-full text-sm font-normal transition-all duration-150 ${
                        isActive
                          ? isLeadsPremium
                            ? "bg-yellow-400 text-yellow-900 font-bold"
                            : "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : isLeadsPremium
                            ? "text-yellow-400 font-semibold"
                            : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link to={item.url} className="flex items-center gap-2 w-full">
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isLeadsPremium ? "text-yellow-400 fill-yellow-400" : ""}`} />
                        <span className={`flex-1 text-left ${
                          isLeadsPremium ? "text-yellow-400 font-semibold" : ""
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
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground">
          {user?.email}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
