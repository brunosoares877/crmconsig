
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck, Target } from "lucide-react";

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
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden transition-all hover:shadow-xl">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-primary rounded-full text-sm font-medium mb-4">
              Plano Mensal
            </div>
            <div className="flex items-end justify-center mb-4">
              <span className="text-4xl font-bold">R$37,90</span>
              <span className="text-gray-500 ml-1 text-sm">/mês</span>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Perfeito para começar sem um grande investimento inicial.
            </p>
            <Button 
              className="w-full" 
              size="sm"
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
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Semestral Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-primary overflow-hidden transition-all hover:shadow-xl relative">
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
          Recomendado
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-primary rounded-full text-sm font-medium mb-4">
              Plano Semestral
            </div>
            <div className="flex items-end justify-center mb-2">
              <span className="text-4xl font-bold">R$187,00</span>
              <span className="text-gray-500 ml-1 text-sm">/6 meses</span>
            </div>
            <div className="text-green-600 font-medium mb-4 text-sm">
              Apenas R$31,17/mês (Economize 17%)
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Economia sem um compromisso de longo prazo.
            </p>
            <Button 
              className="w-full" 
              size="sm"
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
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Annual Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-primary overflow-hidden transition-all hover:shadow-xl relative">
        <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          Melhor Custo-Benefício
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-primary rounded-full text-sm font-medium mb-4">
              Plano Anual
            </div>
            <div className="flex items-end justify-center mb-2">
              <span className="text-4xl font-bold">R$297,00</span>
              <span className="text-gray-500 ml-1 text-sm">/ano</span>
            </div>
            <div className="text-green-600 font-medium mb-4 text-sm">
              Apenas R$24,75/mês (Economize 34%)
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              A melhor opção para quem busca economia e estabilidade.
            </p>
            <Button 
              className="w-full" 
              size="sm"
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
                  <CircleCheck className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tráfego Pago Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-orange-400 overflow-hidden transition-all hover:shadow-xl relative">
        <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          Upsell
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
              Tráfego Pago
            </div>
            <div className="flex items-end justify-center mb-2">
              <span className="text-4xl font-bold">R$397,00</span>
              <span className="text-gray-500 ml-1 text-sm">/mês</span>
            </div>
            <div className="text-orange-600 font-medium mb-4 text-sm">
              Adicional aos planos existentes
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Leads qualificados para INSS, Bolsa Família e FGTS via tráfego pago.
            </p>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600" 
              size="sm"
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
                  <Target className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                  <span>{feature}</span>
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
