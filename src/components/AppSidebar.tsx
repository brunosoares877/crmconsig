
import React from "react";
import { Link } from "react-router-dom";
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
  },
  {
    title: "Leads",
    url: "/leads",
    icon: List,
  },
  {
    title: "Leads Premium",
    url: "/leads-premium",
    icon: Star,
    isPremium: true,
  },
  {
    title: "Lembretes",
    url: "/reminders",
    icon: Calendar,
  },
  {
    title: "Calendário",
    url: "/reminders/calendar",
    icon: CalendarDays,
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled",
    icon: CalendarPlus,
  },
  {
    title: "Funcionários",
    url: "/employees",
    icon: Users,
  },
  {
    title: "Portabilidade",
    url: "/portability",
    icon: ListCheck,
  },
  {
    title: "Comissões",
    url: "/commission",
    icon: DollarSign,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="none" className="w-64 min-w-64 max-w-64">
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <h1 className="text-lg font-bold text-sidebar-foreground">LeadConsig</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <Link to={item.url} className="flex items-center gap-2 w-full">
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${
                        item.isPremium ? "text-yellow-400 fill-yellow-400" : ""
                      }`} />
                      <span className={`flex-1 text-left ${
                        item.isPremium ? "text-yellow-400 font-semibold" : ""
                      }`}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
