
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { WhiteLabelProvider } from "./contexts/WhiteLabelContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Sales from "./pages/Sales";
import PaymentPlans from "./pages/PaymentPlans";
import Portability from "./pages/Portability";
import Commission from "./pages/Commission";
import CookiePolicy from "./pages/CookiePolicy";
import CookieConsent from "./components/CookieConsent";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Fix the redirect URL issue
if (typeof window !== "undefined") {
  const currentUrl = window.location.href;
  // Check if the URL contains error due to expired email link
  if (currentUrl.includes("error=access_denied") && currentUrl.includes("error_code=otp_expired")) {
    window.location.href = "/login?error=email_link_expired";
  }
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <WhiteLabelProvider>
              <TooltipProvider>
                <CookieConsent />
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Sales />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/plans" element={<PaymentPlans />} />
                  <Route path="/portability" element={<Portability />} />
                  <Route path="/commission" element={<Commission />} />
                  <Route path="/politica-de-cookies" element={<CookiePolicy />} />
                  <Route path="/payment-success" element={<Navigate to="/dashboard" />} />
                  <Route path="/payment-canceled" element={<Navigate to="/plans" />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </WhiteLabelProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
