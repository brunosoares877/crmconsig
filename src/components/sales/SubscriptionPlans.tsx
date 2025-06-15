
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, Target, Star, Crown, Zap } from "lucide-react";

const SubscriptionPlans = () => {
  const handlePayment = async (priceId: string, url: string) => {
    try {
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
      {/* Monthly Plan */}
      <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-blue-200 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Star className="h-4 w-4" />
              Plano Mensal
            </div>
            <div className="flex items-end justify-center mb-6">
              <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">R$37,90</span>
              <span className="text-gray-500 ml-2 text-lg font-medium">/mês</span>
            </div>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              Perfeito para começar sem um grande investimento inicial.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              size="lg"
              onClick={() => handlePayment("price_monthly", "https://buy.stripe.com/test_6oE03haZsbuP5sAeUU")}
            >
              Assinar Plano Mensal
            </Button>
          </div>
          <div className="border-t border-blue-100 pt-8">
            <ul className="space-y-4">
              {[
                "Acesso completo ao sistema",
                "Dashboard e relatórios",
                "Gerenciamento de leads ilimitados",
                "Controle de comissões",
                "Suporte por email",
                "Renovação automática",
                "Pagamento via PIX ou Cartão"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-base">
                  <CircleCheck className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Semestral Plan */}
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/50 rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-105 hover:border-purple-300 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
          <span className="flex items-center gap-1">
            <Crown className="h-4 w-4" />
            Recomendado
          </span>
        </div>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Crown className="h-4 w-4" />
              Plano Semestral
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">R$187,00</span>
              <span className="text-gray-500 ml-2 text-lg font-medium">/6 meses</span>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded-full mb-6 text-sm shadow-lg">
              Apenas R$31,17/mês (Economize 17%)
            </div>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              Economia sem um compromisso de longo prazo.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              size="lg"
              onClick={() => handlePayment("price_semestral", "https://buy.stripe.com/test_28o03h8RkgP92go3cd")}
            >
              Assinar Plano Semestral
            </Button>
          </div>
          <div className="border-t border-purple-100 pt-8">
            <ul className="space-y-4">
              {[
                "Acesso completo ao sistema",
                "Dashboard e relatórios",
                "Gerenciamento de leads ilimitados",
                "Controle de comissões",
                "Suporte prioritário",
                "Economia semestral",
                "Ideal para equipes em crescimento"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-base">
                  <CircleCheck className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Annual Plan */}
      <div className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 rounded-2xl shadow-2xl border-2 border-emerald-200 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-105 hover:border-emerald-300 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-green-600"></div>
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
          <span className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Melhor Custo-Benefício
          </span>
        </div>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Zap className="h-4 w-4" />
              Plano Anual
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-800 bg-clip-text text-transparent">R$297,00</span>
              <span className="text-gray-500 ml-2 text-lg font-medium">/ano</span>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-4 py-2 rounded-full mb-6 text-sm shadow-lg">
              Apenas R$24,75/mês (Economize 34%)
            </div>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              A melhor opção para quem busca economia e estabilidade.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              size="lg"
              onClick={() => handlePayment("price_annual", "https://buy.stripe.com/test_5kA5nBd7A2YjcV23ce")}
            >
              Assinar Plano Anual
            </Button>
          </div>
          <div className="border-t border-emerald-100 pt-8">
            <ul className="space-y-4">
              {[
                "Acesso completo ao sistema",
                "Dashboard e relatórios",
                "Gerenciamento de leads ilimitados",
                "Controle de comissões",
                "Suporte prioritário",
                "Pagamento único anual",
                "Preço garantido"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-base">
                  <CircleCheck className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tráfego Pago Plan */}
      <div className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/50 rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-105 hover:border-orange-300 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-600"></div>
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 text-sm font-bold rounded-bl-2xl shadow-lg">
          <span className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Upsell
          </span>
        </div>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Target className="h-4 w-4" />
              Tráfego Pago
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-800 bg-clip-text text-transparent">R$397,00</span>
              <span className="text-gray-500 ml-2 text-lg font-medium">/mês</span>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold px-4 py-2 rounded-full mb-6 text-sm shadow-lg">
              Adicional aos planos existentes
            </div>
            <p className="text-gray-600 mb-8 text-base leading-relaxed">
              Leads qualificados para INSS, Bolsa Família e FGTS via tráfego pago.
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              size="lg"
              onClick={() => handlePayment("price_trafego", "#")}
            >
              Adicionar Tráfego Pago
            </Button>
          </div>
          <div className="border-t border-orange-100 pt-8">
            <ul className="space-y-4">
              {[
                "Leads segmentados INSS",
                "Leads Bolsa Família",
                "Leads FGTS qualificados",
                "Campanhas otimizadas",
                "Relatórios de performance",
                "Suporte especializado",
                "ROI garantido"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-base">
                  <Target className="h-5 w-5 mr-3 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
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
