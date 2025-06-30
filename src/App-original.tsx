import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { WhiteLabelProvider } from "@/contexts/WhiteLabelContext";
import "./App.css";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import Leads from "@/pages/Leads";
import LeadNew from "@/pages/LeadNew";
import LeadImport from "@/pages/LeadImport";
import LeadScheduling from "@/pages/LeadScheduling";
import LeadsConfig from "@/pages/LeadsConfig";
import LeadsPremium from "@/pages/LeadsPremium";
import LeadsTrash from "@/pages/LeadsTrash";
import Employees from "@/pages/Employees";
import Commission from "@/pages/Commission";
import CommissionSettings from "@/pages/CommissionSettings";
import Reminders from "@/pages/Reminders";
import RemindersCalendar from "@/pages/RemindersCalendar";
import RemindersManagement from "@/pages/RemindersManagement";
import Portability from "@/pages/Portability";
import Settings from "@/pages/Settings";
import Plans from "@/pages/Plans";
import Sales from "@/pages/Sales";
import NotFound from "@/pages/NotFound";
import CookiePolicy from "@/pages/CookiePolicy";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancelled from "@/pages/SubscriptionCancelled";

// Components
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from "@/components/CookieConsent";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import SentryManager from "@/components/SentryManager";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <WhiteLabelProvider>
                <Router>
                  <SentryManager />
                  <PerformanceMonitor />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                    <Route path="/subscription-cancelled" element={<SubscriptionCancelled />} />
                    
                    {/* Private Routes (CRM) */}
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/leads/new" element={<LeadNew />} />
                    <Route path="/leads/import" element={<LeadImport />} />
                    <Route path="/leads/scheduling" element={<LeadScheduling />} />
                    <Route path="/leads/config" element={<LeadsConfig />} />
                    <Route path="/leads/premium" element={<LeadsPremium />} />
                    <Route path="/leads/trash" element={<LeadsTrash />} />
                    
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/commission" element={<Commission />} />
                    <Route path="/commission/settings" element={<CommissionSettings />} />
                    
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/reminders/calendar" element={<RemindersCalendar />} />
                    <Route path="/reminders/management" element={<RemindersManagement />} />
                    
                    <Route path="/portability" element={<Portability />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/plans" element={<Plans />} />
                    
                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                  <CookieConsent />
                </Router>
              </WhiteLabelProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
