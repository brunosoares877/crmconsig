
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
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const isMobile = useMobile();
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
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar-background text-sidebar-foreground transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          className
        )}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <h1 className="text-xl font-bold text-sidebar-primary">Leadconsig</h1>
        </div>

        <nav className="mt-6 px-2">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    location.pathname === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
