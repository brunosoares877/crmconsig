import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Lazy imports das páginas
const Index = lazy(() => import("@/pages/Index"));
const Plans = lazy(() => import("@/pages/Plans"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const SubscriptionCancelled = lazy(() => import("@/pages/SubscriptionCancelled"));
const Leads = lazy(() => import("@/pages/Leads"));
const LeadsPremium = lazy(() => import("@/pages/LeadsPremium"));
const LeadNew = lazy(() => import("@/pages/LeadNew"));
const LeadImport = lazy(() => import("@/pages/LeadImport"));
const LeadsConfig = lazy(() => import("@/pages/LeadsConfig"));
const LeadScheduling = lazy(() => import("@/pages/LeadScheduling"));
const LeadsTrash = lazy(() => import("@/pages/LeadsTrash"));
const Login = lazy(() => import("@/pages/Login"));
const Sales = lazy(() => import("@/pages/Sales"));
const Portability = lazy(() => import("@/pages/Portability"));
const Reminders = lazy(() => import("@/pages/Reminders"));
const RemindersCalendar = lazy(() => import("@/pages/RemindersCalendar"));
const Commission = lazy(() => import("@/pages/Commission"));
const CommissionSettings = lazy(() => import("@/pages/CommissionSettings"));
const Settings = lazy(() => import("@/pages/Settings"));
const Employees = lazy(() => import("@/pages/Employees"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

function App() {
  return (
    <div className="w-full min-h-screen">
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <SubscriptionProvider>
              <Suspense fallback={<div className="w-full min-h-screen flex items-center justify-center text-lg">Carregando...</div>}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                  <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/leads-premium" element={<LeadsPremium />} />
                  <Route path="/leads/new" element={<LeadNew />} />
                  <Route path="/leads/import" element={<LeadImport />} />
                  <Route path="/leads/config" element={<LeadsConfig />} />
                  <Route path="/leads/scheduled" element={<LeadScheduling />} />
                  <Route path="/leads/trash" element={<LeadsTrash />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/portability" element={<Portability />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/reminders/calendar" element={<RemindersCalendar />} />
                  <Route path="/commission" element={<Commission />} />
                  <Route path="/commission/settings" element={<CommissionSettings />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              <SonnerToaster />
            </SubscriptionProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
