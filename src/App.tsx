
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from "@/pages/Index";
import Plans from "@/pages/Plans";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancelled from "@/pages/SubscriptionCancelled";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Leads from "@/pages/Leads";
import LeadNew from "@/pages/LeadNew";
import LeadImport from "@/pages/LeadImport";
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";

function App() {
  return (
    <SubscriptionProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/new" element={<LeadNew />} />
            <Route path="/leads/import" element={<LeadImport />} />
            <Route path="/leads/qualified" element={<Leads />} />
            <Route path="/leads/to-contact" element={<Leads />} />
            <Route path="/leads/pending" element={<Leads />} />
            <Route path="/leads/scheduled" element={<Leads />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sales" element={<Sales />} />
          </Routes>
        </AuthProvider>
      </Router>
    </SubscriptionProvider>
  );
}

export default App;
