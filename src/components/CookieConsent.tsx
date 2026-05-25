
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-primary" />
          <p className="text-sm text-gray-700">
            Usamos cookies para aprimorar sua experiência e para fins de publicidade. 
            <a href="/politica-de-cookies" className="text-primary underline ml-1">
              Leia nossa Política de Cookies.
            </a>
          </p>
        </div>
        <Button onClick={handleAccept} className="whitespace-nowrap">
          Aceitar Cookies
        </Button>
      </div>
    </div>
  );
};

export default CookieConsent;
