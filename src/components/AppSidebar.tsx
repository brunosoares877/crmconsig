
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
    <Sidebar collapsible="none" className="w-64 min-w-64 max-w-64 border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center px-4 py-4">
          <h1 className="text-lg font-bold text-sidebar-foreground">LeadConsig</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <Link to={item.url} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                      <item.icon className={`w-5 h-5 flex-shrink-0 ${
                        item.isPremium ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                      }`} />
                      <span className={`flex-1 text-left text-sm font-medium ${
                        item.isPremium ? "text-yellow-400 font-semibold" : "text-gray-700"
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
