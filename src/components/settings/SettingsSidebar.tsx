
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, PaintBucket, Bell, Shield, CreditCard } from "lucide-react";

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
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "appearance",
      label: "Aparência",
      icon: <PaintBucket className="h-4 w-4" />,
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      id: "security",
      label: "Segurança",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      id: "plans",
      label: "Planos",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  return (
    <div className="w-full md:w-[240px] md:flex-shrink-0 flex flex-col">
      <div className="hidden md:block text-lg font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-3">
        Configurações
      </div>
      <div className="md:space-y-2 mb-4 md:mb-0 flex overflow-x-auto md:flex-col gap-2 md:gap-0">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "justify-start whitespace-nowrap md:whitespace-normal w-full md:w-auto gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
              activeTab === tab.id
                ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span className={activeTab === tab.id ? "text-blue-600" : "text-gray-400"}>
              {tab.icon}
            </span>
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
