import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, Target, Star, Crown, Zap, Shield, Users } from "lucide-react";

const SubscriptionPlans = () => {
  const handlePayment = async (planType: string, url: string) => {
    try {
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto py-8">
      
      {/* Plano BÁSICO */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 relative flex flex-col">
        <div className="p-8 flex-grow">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold mb-6">
              <Star className="h-4 w-4" />
              Plano Básico
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-extrabold text-gray-900">R$37</span>
              <span className="text-gray-500 ml-1 text-base font-medium">/mês</span>
            </div>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed h-10">
              Ideal para corretores autônomos que estão começando a escalar.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-base rounded-xl transition-all duration-300 shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)]" 
              onClick={() => handlePayment("basico", "#")}
            >
              Assinar Plano Básico
            </Button>
          </div>
          <div className="border-t border-gray-100 pt-6 mt-6">
            <ul className="space-y-4">
              {[
                "1 Conexão de WhatsApp",
                "Até 1.000 Leads no Funil",
                "Disparos via Funil Manual",
                "Dashboard e Relatórios",
                "Gestão de Comissões",
                "Suporte por E-mail"
              ].map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CircleCheck className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Plano PRO (Recomendado) */}
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-indigo-500 overflow-hidden transition-all duration-300 hover:-translate-y-2 relative flex flex-col transform md:scale-105 z-10">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        <div className="absolute -top-1 right-8 bg-indigo-600 text-white px-4 py-1.5 text-xs font-bold rounded-b-lg shadow-md flex items-center gap-1">
          <Crown className="h-3 w-3" />
          MAIS VENDIDO
        </div>
        <div className="p-8 flex-grow flex flex-col">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-6">
              <Zap className="h-4 w-4" />
              Plano PRO
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-5xl font-black text-gray-900 tracking-tight">R$97</span>
              <span className="text-gray-500 ml-1 text-base font-medium">/mês</span>
            </div>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed h-10 font-medium">
              A máquina de vendas definitiva com automação total.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-6 text-lg rounded-xl transition-all duration-300 shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.4)]" 
              onClick={() => handlePayment("pro", "#")}
            >
              Assinar Plano PRO
            </Button>
          </div>
          <div className="border-t border-indigo-100 pt-6 mt-6 bg-indigo-50/30 -mx-8 px-8 pb-8 flex-grow rounded-b-2xl">
            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-4">Tudo do Básico, e mais:</p>
            <ul className="space-y-4">
              {[
                "3 Conexões de WhatsApp simultâneas",
                "Leads Ilimitados",
                "Funil de Cadência 100% Automático",
                "Rodízio e Aquecimento de Chips",
                "Disparos em Massa (Anti-ban)",
                "Suporte Prioritário WhatsApp"
              ].map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CircleCheck className="h-5 w-5 mr-3 text-indigo-600 flex-shrink-0" />
                  <span className="text-gray-900 font-bold leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Plano MASTER / ELITE */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-amber-500 hover:-translate-y-1 relative flex flex-col">
        {/* Subtle gold glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-amber-500/20 blur-[50px] pointer-events-none"></div>
        
        <div className="p-8 flex-grow relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-sm font-bold mb-6 border border-amber-500/20">
              <Shield className="h-4 w-4" />
              Plano Elite
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-extrabold text-white">R$197</span>
              <span className="text-slate-400 ml-1 text-base font-medium">/mês</span>
            </div>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed h-10">
              Para quem quer escalar ao máximo e não tem limites de vendas.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-900 font-black py-6 text-base rounded-xl transition-all duration-300 shadow-[0_8px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_12px_25px_rgba(245,158,11,0.3)]" 
              onClick={() => handlePayment("elite", "#")}
            >
              Assinar Plano Elite
            </Button>
          </div>
          <div className="border-t border-slate-800 pt-6 mt-6">
            <ul className="space-y-4">
              {[
                "Até 10 Conexões de WhatsApp",
                "Envios e Leads Ilimitados",
                "Funil de Cadência 100% Automático",
                "Rodízio e Aquecimento de Chips",
                "Disparos em Massa (Anti-ban)",
                "Acesso Antecipado a Novas Funções",
                "Suporte VIP Individualizado"
              ].map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <CircleCheck className="h-5 w-5 mr-3 text-amber-500 flex-shrink-0" />
                  <span className="text-slate-300 font-medium leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SubscriptionPlans;
