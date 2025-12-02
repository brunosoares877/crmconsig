import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Importar AuthProvider primeiro para evitar dependência circular
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Loader2 } from "lucide-react";

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

// Imports críticos (carregam imediatamente)
import Login from "@/pages/Login";
import Sales from "@/pages/Sales";

// Lazy loading para todas as outras páginas (carregam sob demanda)
const Index = lazy(() => import("@/pages/Index"));
const Plans = lazy(() => import("@/pages/Plans"));
const SubscriptionSuccess = lazy(() => import("@/pages/SubscriptionSuccess"));
const SubscriptionCancelled = lazy(() => import("@/pages/SubscriptionCancelled"));
const Leads = lazy(() => import("@/pages/Leads"));
const MaquinaDeLeads = lazy(() => import("@/pages/MaquinaDeLeads"));
const LeadNew = lazy(() => import("@/pages/LeadNew"));
const LeadImport = lazy(() => import("@/pages/LeadImport"));
const LeadsConfig = lazy(() => import("@/pages/LeadsConfig"));
const LeadScheduling = lazy(() => import("@/pages/LeadScheduling"));
const LeadsTrash = lazy(() => import("@/pages/LeadsTrash"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Portability = lazy(() => import("@/pages/Portability"));
const TrafficPremium = lazy(() => import("@/pages/TrafficPremium"));
const CursoTrafegoPago = lazy(() => import("@/pages/CursoTrafegoPago"));
const Reminders = lazy(() => import("@/pages/Reminders"));
const RemindersCalendar = lazy(() => import("@/pages/RemindersCalendar"));
const Commission = lazy(() => import("@/pages/Commission"));
const CommissionSettings = lazy(() => import("@/pages/CommissionSettings"));
const Notes = lazy(() => import("@/pages/Notes"));
const Settings = lazy(() => import("@/pages/Settings"));
const Employees = lazy(() => import("@/pages/Employees"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  // Capturar erros globais
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Erro capturado:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Promise rejeitada:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="w-full min-h-screen">
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <SubscriptionProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Sales />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                  <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/maquina-de-leads" element={<MaquinaDeLeads />} />
                  <Route path="/leads/new" element={<LeadNew />} />
                  <Route path="/leads/import" element={<LeadImport />} />
                  <Route path="/leads/config" element={<LeadsConfig />} />
                  <Route path="/leads/scheduled" element={<LeadScheduling />} />
                  <Route path="/leads/trash" element={<LeadsTrash />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/portability" element={<Portability />} />
                  <Route path="/reminders" element={<Reminders />} />
                  <Route path="/reminders/calendar" element={<RemindersCalendar />} />
                  <Route path="/traffic-premium" element={<TrafficPremium />} />
                  <Route path="/curso-trafego-pago" element={<CursoTrafegoPago />} />
                  <Route path="/commission" element={<Commission />} />
                  <Route path="/commission/settings" element={<CommissionSettings />} />
                  <Route path="/notes" element={<Notes />} />
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
