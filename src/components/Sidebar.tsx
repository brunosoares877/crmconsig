
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
  FileText,
  FolderPlus,
  UserCheck,
  Phone,
  Calendar
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

  const mainMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Bell, label: "Lembretes", href: "/reminders" },
    { icon: ArrowRight, label: "Portabilidade", href: "/portability" },
    { icon: DollarSign, label: "Comissão", href: "/commission" },
    { icon: UserPlus, label: "Funcionários", href: "/employees" },
    { icon: BarChart3, label: "Relatórios", href: "/reports" },
  ];

  const leadMenuItems = [
    { icon: Users, label: "Todos os Leads", href: "/leads" },
    { icon: FolderPlus, label: "Novo Lead", href: "/leads/new" },
    { icon: FileText, label: "Importar Leads", href: "/leads/import" },
    { icon: UserCheck, label: "Leads Qualificados", href: "/leads/qualified" },
    { icon: Phone, label: "Leads para Contato", href: "/leads/to-contact" },
    { icon: Calendar, label: "Agendamentos", href: "/leads/scheduled" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  // If the screen size changes, adjust the sidebar
  React.useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

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
            {mainMenuItems.map((item, index) => {
              const isActive = location.pathname === item.href || 
                               (item.href === "/dashboard" && location.pathname === "/");
              
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
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {/* Enhanced Leads Section with Submenu */}
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
                    return (
                      <Link
                        key={idx}
                        to={subItem.href}
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm transition-colors",
                          isSubActive
                            ? "bg-[#1e4976] text-white shadow-sm"
                            : "text-gray-300 hover:bg-[#1e4976]/70 hover:text-white"
                        )}
                      >
                        <subItem.icon className="mr-2 h-4 w-4" />
                        {subItem.label}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </li>
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
