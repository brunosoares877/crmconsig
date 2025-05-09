
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
  const { status, isTrialActive } = useSubscription();
  const { isPrivilegedUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to payment plans ONLY if trial is expired AND not privileged
  useEffect(() => {
    if (status === 'expired' && !isTrialActive && !isPrivilegedUser) {
      navigate("/plans");
    }
  }, [status, isTrialActive, isPrivilegedUser, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto space-y-8 p-4 py-8">
          <TrialBanner />
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
            <div className="flex items-center gap-3">
              <WhatsAppButton 
                phoneNumber="5584991850149"
                message="Olá! Tenho dúvidas sobre o sistema LeadConsig"
                label="Suporte"
              />
              <AddLeadButton />
            </div>
          </div>
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default Index;
