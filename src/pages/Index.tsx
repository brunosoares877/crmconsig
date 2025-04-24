
import React from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import LeadList from "@/components/LeadList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto space-y-8 p-4 py-8">
        <Dashboard />
        <LeadList />
      </main>
    </div>
  );
};

export default Index;
