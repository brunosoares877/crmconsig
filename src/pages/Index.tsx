
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import LeadList from "@/components/LeadList";
import TrialBanner from "@/components/TrialBanner";
import { useSubscription } from "@/contexts/SubscriptionContext";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  const { status } = useSubscription();
  const navigate = useNavigate();

  // Redirect to payment plans if trial is expired
  useEffect(() => {
    if (status === 'expired') {
      navigate("/plans");
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto space-y-8 p-4 py-8">
          <TrialBanner />
          <Dashboard />
          <LeadList />
        </main>
      </div>
    </div>
  );
};

export default Index;
