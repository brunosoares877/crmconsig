
import React from "react";
import { Button } from "@/components/ui/button";

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsSidebar({ 
  activeTab, 
  setActiveTab 
}: SettingsSidebarProps) {
  const tabs = [
    { id: "account", label: "Conta" },
    { id: "appearance", label: "Aparência" },
    { id: "notifications", label: "Notificações" },
    { id: "security", label: "Segurança" },
    { id: "commissions", label: "Comissões" },
  ];

  return (
    <div className="w-full md:w-1/4">
      <div className="space-y-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
