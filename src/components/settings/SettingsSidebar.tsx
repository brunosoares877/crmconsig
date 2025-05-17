
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Cpu, User, PaintBucket, Bell, Shield, CreditCard, BarChartHorizontal } from "lucide-react";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsSidebar({
  activeTab,
  setActiveTab,
}: SettingsSidebarProps) {
  const tabs = [
    {
      id: "account",
      label: "Conta",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      id: "appearance",
      label: "Aparência",
      icon: <PaintBucket className="h-4 w-4 mr-2" />,
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: <Bell className="h-4 w-4 mr-2" />,
    },
    {
      id: "security",
      label: "Segurança",
      icon: <Shield className="h-4 w-4 mr-2" />,
    },
    {
      id: "plans",
      label: "Planos",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
    },
    {
      id: "commissions",
      label: "Comissões",
      icon: <BarChartHorizontal className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="w-full md:w-[200px] md:flex-shrink-0 flex flex-col md:border-r pr-6">
      <div className="hidden md:block text-sm font-semibold mb-2">
        Configurações
      </div>
      <div className="md:space-y-1 mb-4 md:mb-0 flex overflow-x-auto md:flex-col">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "justify-start whitespace-nowrap md:whitespace-normal",
              activeTab === tab.id
                ? "bg-secondary text-secondary-foreground"
                : ""
            )}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
