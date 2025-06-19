import React, { useState, useEffect } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, X, RefreshCw, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TrialBanner = () => {
  const { status, trialDaysLeft, isTrialActive, isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [hasReloaded, setHasReloaded] = useState(false);

  useEffect(() => {
    // Mostrar banner de atualização se o usuário não recarregou ainda
    const lastUpdate = localStorage.getItem('last_update_check');
    const today = new Date().toDateString();
    
    if (lastUpdate !== today) {
      setShowUpdateBanner(true);
      localStorage.setItem('last_update_check', today);
    }
  }, []);

  const handleReload = () => {
    setHasReloaded(true);
    window.location.reload();
  };

  const dismissUpdateBanner = () => {
    setShowUpdateBanner(false);
  };

  // Don't show any banner if subscription is active
  if (isSubscriptionActive) {
    return null;
  }

  // Banner de atualização
  if (showUpdateBanner && !hasReloaded) {
    return (
      <div className="bg-blue-600 text-white px-4 py-3 relative">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <div>
              <div className="font-semibold flex items-center gap-2">
                Atualização Disponível
                <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                  v1.0.1
                </Badge>
              </div>
              <p className="text-sm opacity-90">
                Correções importantes foram aplicadas. Recarregue a página para obter a melhor experiência.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleReload}
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Recarregar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={dismissUpdateBanner}
              className="text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isTrialActive) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex items-center justify-between animate-fade-in">
        <div>
          <p className="text-blue-700 font-medium">
            Período de teste: {trialDaysLeft} {trialDaysLeft === 1 ? 'dia' : 'dias'} restantes
          </p>
          <p className="text-sm text-blue-600">
            Escolha um plano para continuar usando todas as funcionalidades após o período de teste.
          </p>
        </div>
        <Button
          onClick={() => navigate("/plans")}
          variant="outline"
          className="ml-4 bg-white"
        >
          Ver planos
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-center justify-between animate-fade-in">
      <div>
        <p className="text-red-700 font-medium flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Seu período de teste expirou
        </p>
        <p className="text-sm text-red-600">
          Escolha um plano para continuar usando todas as funcionalidades.
        </p>
      </div>
      <Button
        onClick={() => navigate("/plans")}
        variant="outline"
        className="ml-4 bg-white border-red-200 text-red-600 hover:bg-red-50"
      >
        Assinar agora
      </Button>
    </div>
  );
};

export default TrialBanner;
