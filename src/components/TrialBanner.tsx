
import React from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CircleCheck, AlertCircle } from "lucide-react";

const TrialBanner = () => {
  const { status, trialDaysLeft, isTrialActive, isSubscriptionActive } = useSubscription();
  const navigate = useNavigate();

  if (isSubscriptionActive) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <CircleCheck className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-700 font-medium">
            Assinatura ativa
          </span>
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
          onClick={() => navigate("/settings")}
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
        onClick={() => navigate("/settings")}
        variant="outline"
        className="ml-4 bg-white border-red-200 text-red-600 hover:bg-red-50"
      >
        Assinar agora
      </Button>
    </div>
  );
};

export default TrialBanner;
