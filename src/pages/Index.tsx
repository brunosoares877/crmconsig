
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import AddLeadButton from "@/components/leads/AddLeadButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";

const Index = () => {
  const {
    status,
    isTrialActive
  } = useSubscription();
  const {
    isPrivilegedUser
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the automatic redirect - let users stay on dashboard
  }, [status, isTrialActive, isPrivilegedUser, navigate]);

  const headerActions = (
    <>
      <WhatsAppButton 
        phoneNumber="5584991850149" 
        message="Olá! Tenho dúvidas sobre o sistema LeadConsig" 
        label="Suporte" 
        className="text-sm md:text-base px-4 py-2" 
      />
      <AddLeadButton />
    </>
  );

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Visão geral dos seus leads e vendas"
      headerActions={headerActions}
    >
      <Dashboard />
    </PageLayout>
  );
};

export default Index;
