
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(!isMobile);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Leads", href: "/leads" },
    { icon: Bell, label: "Lembretes", href: "/reminders" },
    { icon: ArrowRight, label: "Portabilidade", href: "/portability" },
    { icon: DollarSign, label: "Comissão", href: "/commission" },
    { icon: UserPlus, label: "Funcionários", href: "/employees" },
    { icon: BarChart3, label: "Relatórios", href: "/reports" },
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
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">Leadconsig</h1>
        </div>

        <nav className="mt-6 px-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.href || 
                               (item.href === "/dashboard" && location.pathname === "/");
              
              return (
                <li key={index}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center rounded-md px-4 py-3 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sidebar-foreground text-sm font-medium">LC</span>
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Leadconsig</p>
              <p className="text-xs text-sidebar-foreground/70">Sistema de Leads</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
