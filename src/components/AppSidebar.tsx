
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
  const location = useLocation();
  const isLeadsPremium = location.pathname === "/leads-premium";

  return (
    <Sidebar 
      collapsible="none" 
      className={`w-64 min-w-64 max-w-64 ${
        isLeadsPremium ? "bg-blue-900" : ""
      }`}
    >
      <SidebarHeader className={isLeadsPremium ? "bg-blue-900" : ""}>
        <div className="flex items-center px-2 py-2">
          <h1 className={`text-lg font-bold ${
            isLeadsPremium ? "text-white" : "text-sidebar-foreground"
          }`}>
            LeadConsig
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className={isLeadsPremium ? "bg-blue-900" : ""}>
        <SidebarGroup>
          <SidebarGroupLabel className={isLeadsPremium ? "text-blue-200" : ""}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`w-full ${
                        isLeadsPremium 
                          ? isActive 
                            ? "bg-blue-700 text-white hover:bg-blue-600" 
                            : "text-blue-100 hover:bg-blue-800 hover:text-white"
                          : isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                            : ""
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-2 w-full">
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${
                          item.isPremium ? "text-yellow-400 fill-yellow-400" : 
                          isLeadsPremium ? "text-blue-100" : ""
                        }`} />
                        <span className={`flex-1 text-left ${
                          item.isPremium ? "text-yellow-400 font-semibold" : 
                          isLeadsPremium ? "text-blue-100" : ""
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
