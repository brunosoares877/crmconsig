
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300 relative">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Plano Mensal
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-bold text-gray-900">R$37,90</span>
              <span className="text-gray-500 ml-2 text-base">/mês</span>
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Perfeito para começar sem um grande investimento inicial.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 text-base rounded-lg transition-colors duration-200" 
              onClick={() => handlePayment("price_monthly", "https://buy.stripe.com/test_6oE03haZsbuP5sAeUU")}
            >
              Assinar Plano Mensal
            </Button>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <ul className="space-y-3">
              {[
                "Acesso completo ao sistema",
                "Dashboard e relatórios",
                "Gerenciamento de leads ilimitados",
                "Controle de comissões",
                "Suporte por email",
                "Renovação automática",
                "Pagamento via PIX ou Cartão"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CircleCheck className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Semestral Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-purple-300 relative">
        <div className="absolute -top-1 -right-1 bg-purple-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          <span className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Recomendado
          </span>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              <Crown className="h-4 w-4" />
              Plano Semestral
            </div>
            <div className="flex items-end justify-center mb-3">
              <span className="text-4xl font-bold text-gray-900">R$187,00</span>
              <span className="text-gray-500 ml-2 text-base">/6 meses</span>
            </div>
            <div className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full mb-4 text-sm">
              Apenas R$31,17/mês (Economize 17%)
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Economia sem um compromisso de longo prazo.
            </p>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 text-base rounded-lg transition-colors duration-200" 
              onClick={() => handlePayment("price_semestral", "https://buy.stripe.com/test_28o03h8RkgP92go3cd")}
            >
              Assinar Plano Semestral
            </Button>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <ul className="space-y-3">
              {[
                "Acesso completo ao sistema",
                "Dashboard e relatórios",
                "Gerenciamento de leads ilimitados",
                "Controle de comissões",
                "Suporte prioritário",
                "Economia semestral",
                "Ideal para equipes em crescimento"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CircleCheck className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Annual Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-green-300 relative">
        <div className="absolute -top-1 -right-1 bg-green-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Melhor Custo-Benefício
          </span>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4" />
              Plano Anual
            </div>
            <div className="flex items-end justify-center mb-3">
              <span className="text-4xl font-bold text-gray-900">R$297,00</span>
              <span className="text-gray-500 ml-2 text-base">/ano</span>
            </div>
            <div className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full mb-4 text-sm">
              Apenas R$24,75/mês (Economize 34%)
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              A melhor opção para quem busca economia e estabilidade.
            </p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 text-base rounded-lg transition-colors duration-200" 
              onClick={() => handlePayment("price_annual", "https://buy.stripe.com/test_5kA5nBd7A2YjcV23ce")}
            >
              Assinar Plano Anual
            </Button>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <ul className="space-y-3">
              {[
                "Acesso completo ao sistema",
                "Dashboard e relatórios",
                "Gerenciamento de leads ilimitados",
                "Controle de comissões",
                "Suporte prioritário",
                "Pagamento único anual",
                "Preço garantido"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CircleCheck className="h-4 w-4 mr-3 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tráfego Pago Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-300 relative">
        <div className="absolute -top-1 -right-1 bg-orange-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            Upsell
          </span>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
              <Target className="h-4 w-4" />
              Tráfego Pago
            </div>
            <div className="flex items-end justify-center mb-3">
              <span className="text-4xl font-bold text-gray-900">R$397,00</span>
              <span className="text-gray-500 ml-2 text-base">/mês</span>
            </div>
            <div className="bg-orange-100 text-orange-700 font-medium px-3 py-1 rounded-full mb-4 text-sm">
              Adicional aos planos existentes
            </div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Leads qualificados para INSS, Bolsa Família e FGTS via tráfego pago.
            </p>
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 text-base rounded-lg transition-colors duration-200" 
              onClick={() => handlePayment("price_trafego", "#")}
            >
              Adicionar Tráfego Pago
            </Button>
          </div>
          <div className="border-t border-gray-100 pt-6">
            <ul className="space-y-3">
              {[
                "Leads segmentados INSS",
                "Leads Bolsa Família",
                "Leads FGTS qualificados",
                "Campanhas otimizadas",
                "Relatórios de performance",
                "Suporte especializado",
                "ROI garantido"
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Target className="h-4 w-4 mr-3 text-orange-600 flex-shrink-0" />
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
