
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import AccountSection from "@/components/settings/AccountSection";
import AppearanceSection from "@/components/settings/AppearanceSection";
import NotificationSection from "@/components/settings/NotificationSection";
import SecuritySection from "@/components/settings/SecuritySection";
import LogoutButton from "@/components/settings/LogoutButton";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import SubscriptionPlans from "@/components/sales/SubscriptionPlans";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações de conta
        </p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex-1 space-y-6">
          {activeTab === "account" && <AccountSection />}
          {activeTab === "appearance" && <AppearanceSection />}
          {activeTab === "notifications" && <NotificationSection />}
          {activeTab === "security" && <SecuritySection />}
          {activeTab === "plans" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Planos de Assinatura</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Gerencie seu plano e acesso ao sistema
                </p>
              </div>
              <SubscriptionPlans />
            </div>
          )}
          
          <Separator />
          
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-medium">Sair da conta</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Clique no botão abaixo para sair da sua conta
            </p>
            <div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
