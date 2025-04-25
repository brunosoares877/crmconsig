
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import LeadList from "@/components/LeadList";
import TrialBanner from "@/components/TrialBanner";
import { useSubscription } from "@/contexts/SubscriptionContext";

const Index = () => {
  const { status } = useSubscription();
  const navigate = useNavigate();

  // Redirect to payment plans if trial is expired
  React.useEffect(() => {
    if (status === 'expired') {
      navigate("/plans");
    }
  }, [status, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto space-y-8 p-4 py-8">
        <TrialBanner />
        <Dashboard />
        <LeadList />
      </main>
    </div>
  );
};

export default Index;
