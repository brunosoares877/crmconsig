
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import TrialBanner from "@/components/TrialBanner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Sidebar from "@/components/Sidebar";
import AddLeadButton from "@/components/leads/AddLeadButton";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  const { status, isTrialActive } = useSubscription();
  const navigate = useNavigate();

  // Redirect to payment plans ONLY if trial is expired (not during active trial)
  useEffect(() => {
    if (status === 'expired' && !isTrialActive) {
      navigate("/plans");
    }
  }, [status, isTrialActive, navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:ml-64 transition-all duration-300">
          <Header />
          <main className="container mx-auto space-y-8 p-4 py-8">
            <TrialBanner />
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
              <AddLeadButton />
            </div>
            <Dashboard />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
