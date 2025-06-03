import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import TrialBanner from "@/components/TrialBanner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Sidebar from "@/components/Sidebar";
import AddLeadButton from "@/components/leads/AddLeadButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAuth } from "@/contexts/AuthContext";
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
  return <div className="min-h-screen bg-slate-50/30 w-full">
      <Sidebar />
      <div className="w-full md:ml-64 transition-all duration-300">
        <Header />
        <main className="w-full p-3 md:p-4 lg:p-5 xl:p-6 px-[10px] py-[16px] my-[3px] mx-0">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-5">
            <TrialBanner />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 text-sm mt-1">
                  Visão geral dos seus leads e vendas
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full sm:w-auto">
                <WhatsAppButton phoneNumber="5584991850149" message="Olá! Tenho dúvidas sobre o sistema LeadConsig" label="Suporte" className="text-xs md:text-sm" />
                <AddLeadButton />
              </div>
            </div>
            <Dashboard />
          </div>
        </main>
      </div>
    </div>;
};
export default Index;