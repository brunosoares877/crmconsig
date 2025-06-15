
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Crown, 
  Calendar, 
  Bell, 
  CalendarDays, 
  ArrowRightLeft, 
  DollarSign, 
  UserCheck, 
  Settings 
} from "lucide-react";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";

// Define the menu item interface
interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
  isPremium?: boolean;
}

// Menu items organized by logical groups
const principalItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/dashboard",
  },
];

const leadsItems: MenuItem[] = [
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
    match: (pathname: string) =>
      pathname === "/leads" ||
      pathname.startsWith("/leads/"),
  },
  {
    title: "Leads Premium",
    url: "/leads-premium",
    icon: Crown,
    isPremium: true,
    match: (pathname: string) => pathname === "/leads-premium",
  },
  {
    title: "Agendamentos",
    url: "/leads/scheduled",
    icon: Calendar,
    match: (pathname: string) =>
      pathname === "/leads/scheduled",
  },
];

const lembretesItems: MenuItem[] = [
  {
    title: "Lembretes",
    url: "/reminders",
    icon: Bell,
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
];

const negociosItems: MenuItem[] = [
  {
    title: "Portabilidade",
    url: "/portability",
    icon: ArrowRightLeft,
    match: (pathname: string) => pathname === "/portability",
  },
  {
    title: "Comissões",
    url: "/commission",
    icon: DollarSign,
    match: (pathname: string) =>
      pathname === "/commission" || pathname === "/commission-settings",
  },
];

const administracaoItems: MenuItem[] = [
  {
    title: "Funcionários",
    url: "/employees",
    icon: UserCheck,
    match: (pathname: string) => pathname === "/employees",
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

const allMenuItems: MenuItem[] = [
  ...principalItems,
  ...leadsItems,
  ...lembretesItems,
  ...negociosItems,
  ...administracaoItems,
];

export function AppSidebar() {
  const location = useLocation();

  const getActiveIdx = () => {
    for (let i = 0; i < allMenuItems.length; i++) {
      if (allMenuItems[i].match(location.pathname)) {
        return i;
      }
    }
    return -1;
  };
  const activeIdx = getActiveIdx();

  const renderMenuGroup = (items: MenuItem[], groupLabel?: string) => (
    <SidebarGroup>
      {groupLabel && <SidebarGroupLabel className="text-white/60 text-xs uppercase font-semibold">{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const itemIdx = allMenuItems.findIndex(menuItem => menuItem.url === item.url);
            const isActive = itemIdx === activeIdx;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`w-full transition-none font-normal justify-start text-base ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/80"
                  } ${item.isPremium ? "text-yellow-400 font-semibold" : ""} hover:bg-transparent hover:text-current`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Link to={item.url} className="flex items-center gap-2 w-full">
                    {item.isPremium ? (
                      <span className="inline-block w-4 h-4 text-yellow-400" aria-label="premium">
                        ★
                      </span>
                    ) : (
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
  );

  return (
    <Sidebar collapsible="none" className="w-64 min-w-64 max-w-64 bg-[#0f2247]">
      <SidebarHeader>
        <div className="flex items-center px-2 py-2">
          <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center mr-3">
            <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
          </div>
          <h1 className="text-lg font-bold text-sidebar-foreground text-white">
            LeadConsig
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderMenuGroup(principalItems, "Principal")}
        
        <SidebarSeparator className="bg-white/20" />
        {renderMenuGroup(leadsItems, "Leads")}
        
        <SidebarSeparator className="bg-white/20" />
        {renderMenuGroup(lembretesItems, "Lembretes")}
        
        <SidebarSeparator className="bg-white/20" />
        {renderMenuGroup(negociosItems, "Negócios")}
        
        <SidebarSeparator className="bg-white/20" />
        {renderMenuGroup(administracaoItems, "Administração")}
      </SidebarContent>
    </Sidebar>
  );
}
