import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// Importar AuthProvider primeiro para evitar dependência circular
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Loader2 } from "lucide-react";
import StickyQuickNote from "@/components/StickyQuickNote";
import ProtectedRoute from "@/components/ProtectedRoute";

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
const ResetAdminPassword = lazy(() => import("@/pages/ResetAdminPassword"));
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
const Roteiros = lazy(() => import("@/pages/Roteiros"));
const RoteirosDetalhes = lazy(() => import("@/pages/RoteirosDetalhes"));
const RoteirosAdmin = lazy(() => import("@/pages/RoteirosAdmin"));
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
                  {/* Rotas protegidas - requerem assinatura ou trial ativo */}
                  <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
                  <Route path="/leads/new" element={<ProtectedRoute><LeadNew /></ProtectedRoute>} />
                  <Route path="/leads/import" element={<ProtectedRoute><LeadImport /></ProtectedRoute>} />
                  <Route path="/leads/config" element={<ProtectedRoute><LeadsConfig /></ProtectedRoute>} />
                  <Route path="/leads/scheduled" element={<ProtectedRoute><LeadScheduling /></ProtectedRoute>} />
                  <Route path="/leads/trash" element={<ProtectedRoute><LeadsTrash /></ProtectedRoute>} />
                  <Route path="/portability" element={<ProtectedRoute><Portability /></ProtectedRoute>} />
                  <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                  <Route path="/reminders/calendar" element={<ProtectedRoute><RemindersCalendar /></ProtectedRoute>} />
                  <Route path="/commission" element={<ProtectedRoute><Commission /></ProtectedRoute>} />
                  <Route path="/commission/settings" element={<ProtectedRoute><CommissionSettings /></ProtectedRoute>} />
                  <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                  <Route path="/roteiros" element={<ProtectedRoute><Roteiros /></ProtectedRoute>} />
                  <Route path="/roteiros/admin" element={<ProtectedRoute><RoteirosAdmin /></ProtectedRoute>} />
                  <Route path="/roteiros/:banco" element={<ProtectedRoute><RoteirosDetalhes /></ProtectedRoute>} />

                  {/* Rotas públicas - não requerem assinatura */}
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                  <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                  <Route path="/maquina-de-leads" element={<MaquinaDeLeads />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/reset-admin-password" element={<ResetAdminPassword />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/traffic-premium" element={<TrafficPremium />} />
                  <Route path="/curso-trafego-pago" element={<CursoTrafegoPago />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              <SonnerToaster />
              <StickyQuickNote />
            </SubscriptionProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
