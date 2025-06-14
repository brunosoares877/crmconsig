
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import TrialBanner from "@/components/TrialBanner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import AddLeadButton from "@/components/leads/AddLeadButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  const {
    status,
    isTrialActive
  } = useSubscription();
  const {
    isPrivilegedUser
  } = useAuth();
  const navigate = useNavigate();

  // Redirect to payment plans ONLY if trial is expired AND not privileged
  useEffect(() => {
    if (status === 'expired' && !isTrialActive && !isPrivilegedUser) {
      navigate("/settings");
    }
  }, [status, isTrialActive, isPrivilegedUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-50/30 w-full flex">
      <AppSidebar />
      <div className="flex-1 w-full transition-all duration-300">
        <Header />
        <main className="w-full p-0 md:p-0">
          <div className="w-full space-y-6">
            <div className="flex items-center gap-4 px-4 py-2">
              <SidebarTrigger />
              <TrialBanner />
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 text-base mt-2">
                  Visão geral dos seus leads e vendas
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <WhatsAppButton 
                  phoneNumber="5584991850149" 
                  message="Olá! Tenho dúvidas sobre o sistema LeadConsig" 
                  label="Suporte" 
                  className="text-sm md:text-base px-4 py-2" 
                />
                <AddLeadButton />
              </div>
            </div>
            <div className="px-4">
              <Dashboard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
