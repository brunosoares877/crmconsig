
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
import LeadScheduling from "@/pages/LeadScheduling";
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";
import Portability from "@/pages/Portability";
import Reminders from "@/pages/Reminders";
import RemindersCalendar from "@/pages/RemindersCalendar";
import Commission from "@/pages/Commission";
import CommissionSettings from "@/pages/CommissionSettings";
import Settings from "@/pages/Settings";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/new" element={<LeadNew />} />
              <Route path="/leads/import" element={<LeadImport />} />
              <Route path="/leads/scheduled" element={<LeadScheduling />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/portability" element={<Portability />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/reminders/calendar" element={<RemindersCalendar />} />
              <Route path="/commission" element={<Commission />} />
              <Route path="/commission/settings" element={<CommissionSettings />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <Toaster />
          </SidebarProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
