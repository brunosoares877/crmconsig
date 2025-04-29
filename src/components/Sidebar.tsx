import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  ArrowRight, 
  DollarSign, 
  UserPlus, 
  BarChart3,
  Menu,
  X,
  FolderPlus,
  Import,
  Calendar,
  CheckSquare,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(!isMobile);
  const [leadsOpen, setLeadsOpen] = React.useState(true);
  const [remindersOpen, setRemindersOpen] = React.useState(false);

  // Dashboard menu item
  const dashboardItem = { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" };
  
  // Reminders submenu items - simplified as requested
  const reminderMenuItems = [
    { icon: Bell, label: "Todos", href: "/reminders", description: "Ver todos os lembretes" },
    { icon: CheckSquare, label: "Gestão", href: "/reminders/management", description: "Filtrar por status dos lembretes" },
  ];

  // Other main menu items
  const mainMenuItems = [
    { icon: ArrowRight, label: "Portabilidade", href: "/portability" },
    { icon: DollarSign, label: "Comissão", href: "/commission" },
    { icon: UserPlus, label: "Funcionários", href: "/employees" },
    { icon: BarChart3, label: "Relatórios", href: "/reports" },
  ];

  // Leads submenu items
  const leadMenuItems = [
    { icon: Users, label: "Todos os Leads", href: "/leads", description: "Visão completa de todos os seus leads" },
    { icon: FolderPlus, label: "Novo Lead", href: "/leads/new", description: "Cadastre um novo lead manualmente" },
    { icon: Import, label: "Importar Leads", href: "/leads/import", description: "Importe leads de um arquivo CSV" },
    { icon: Calendar, label: "Agendamentos", href: "/leads/scheduled", description: "Leads com visitas agendadas" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  // If the screen size changes, adjust the sidebar
  React.useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  // Get the dashboard item for easier rendering
  const DashboardIcon = dashboardItem.icon;

  return (
    <>
      {/* Mobile menu toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-[#0a2647] text-sidebar-foreground transition-transform duration-300 ease-in-out shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-[rgba(255,255,255,0.1)] px-4">
          <h1 className="text-xl font-bold text-white">Leadconsig</h1>
        </div>

        <nav className="mt-6 px-2">
          <ul className="space-y-1">
            {/* Dashboard item */}
            <li>
              <Link
                to={dashboardItem.href}
                className={cn(
                  "flex items-center rounded-md px-4 py-3 text-sm transition-colors",
                  (location.pathname === dashboardItem.href || location.pathname === "/")
                    ? "bg-[#133b66] text-white font-medium shadow-sm"
                    : "text-gray-300 hover:bg-[#133b66]/70 hover:text-white"
                )}
              >
                <DashboardIcon className="mr-3 h-5 w-5" />
                {dashboardItem.label}
              </Link>
            </li>
            
            {/* Leads collapsible */}
            <li>
              <Collapsible 
                open={leadsOpen} 
                onOpenChange={setLeadsOpen} 
                className="w-full"
              >
                <CollapsibleTrigger className="w-full">
                  <div 
                    className={cn(
                      "flex items-center justify-between rounded-md px-4 py-3 text-sm transition-colors w-full",
                      location.pathname.includes("/leads")
                        ? "bg-[#133b66] text-white font-medium shadow-sm"
                        : "text-gray-300 hover:bg-[#133b66]/70 hover:text-white"
                    )}
                  >
                    <div className="flex items-center">
                      <Users className="mr-3 h-5 w-5" />
                      <span>Leads</span>
                    </div>
                    <span className="text-xs">{leadsOpen ? '▲' : '▼'}</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-5 mt-1 space-y-1">
                  {leadMenuItems.map((subItem, idx) => {
                    const isSubActive = location.pathname === subItem.href;
                    const SubItemIcon = subItem.icon;
                    return (
                      <div key={idx} className="group relative">
                        <Link
                          to={subItem.href}
                          className={cn(
                            "flex items-center rounded-md px-4 py-2 text-sm transition-colors",
                            isSubActive
                              ? "bg-[#1e4976] text-white shadow-sm"
                              : "text-gray-300 hover:bg-[#1e4976]/70 hover:text-white"
                          )}
                        >
                          <SubItemIcon className="mr-2 h-4 w-4" />
                          {subItem.label}
                        </Link>
                        <div className="absolute left-full ml-2 top-0 z-50 w-48 rounded-md bg-[#1e4976] p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {subItem.description}
                          <div className="absolute -left-1 top-3 h-2 w-2 rotate-45 bg-[#1e4976]"></div>
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </li>
            
            {/* Reminders collapsible - Simplified as requested */}
            <li>
              <Collapsible 
                open={remindersOpen} 
                onOpenChange={setRemindersOpen} 
                className="w-full"
              >
                <CollapsibleTrigger className="w-full">
                  <div 
                    className={cn(
                      "flex items-center justify-between rounded-md px-4 py-3 text-sm transition-colors w-full",
                      location.pathname.includes("/reminders")
                        ? "bg-[#133b66] text-white font-medium shadow-sm"
                        : "text-gray-300 hover:bg-[#133b66]/70 hover:text-white"
                    )}
                  >
                    <div className="flex items-center">
                      <Bell className="mr-3 h-5 w-5" />
                      <span>Lembretes</span>
                    </div>
                    <span className="text-xs">{remindersOpen ? '▲' : '▼'}</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-5 mt-1 space-y-1">
                  {reminderMenuItems.map((subItem, idx) => {
                    const isSubActive = location.pathname === subItem.href;
                    const SubItemIcon = subItem.icon;
                    return (
                      <div key={idx} className="group relative">
                        <Link
                          to={subItem.href}
                          className={cn(
                            "flex items-center rounded-md px-4 py-2 text-sm transition-colors",
                            isSubActive
                              ? "bg-[#1e4976] text-white shadow-sm"
                              : "text-gray-300 hover:bg-[#1e4976]/70 hover:text-white"
                          )}
                        >
                          <SubItemIcon className="mr-2 h-4 w-4" />
                          {subItem.label}
                        </Link>
                        <div className="absolute left-full ml-2 top-0 z-50 w-48 rounded-md bg-[#1e4976] p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {subItem.description}
                          <div className="absolute -left-1 top-3 h-2 w-2 rotate-45 bg-[#1e4976]"></div>
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </li>
            
            {/* Render the rest of the main menu items */}
            {mainMenuItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              const ItemIcon = item.icon;
              
              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center rounded-md px-4 py-3 text-sm transition-colors",
                      isActive
                        ? "bg-[#133b66] text-white font-medium shadow-sm"
                        : "text-gray-300 hover:bg-[#133b66]/70 hover:text-white"
                    )}
                  >
                    <ItemIcon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[#1e4976] flex items-center justify-center">
              <span className="text-white text-sm font-medium">LC</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Leadconsig</p>
              <p className="text-xs text-gray-400">Sistema de Leads</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
