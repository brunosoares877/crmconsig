
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";

const SubscriptionPlans = () => {
  const openPaymentLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Monthly Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden transition-all hover:shadow-xl">
        <div className="p-8">
          <div className="inline-block px-4 py-1 bg-blue-100 text-primary rounded-full text-sm font-medium mb-4">
            Plano Mensal
          </div>
          <div className="flex items-end mb-6">
            <span className="text-5xl font-bold">R$37,90</span>
            <span className="text-gray-500 ml-2">/mês</span>
          </div>
          <p className="text-gray-600 mb-6">
            Perfeito para começar sem um grande investimento inicial.
          </p>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => openPaymentLink("https://luana-santos3.pay.yampi.com.br/r/IRK51VOO8J")}
          >
            Assinar Plano Mensal
          </Button>
        </div>
        <div className="border-t border-gray-100 p-8">
          <ul className="space-y-4">
            {[
              "Acesso completo ao sistema",
              "Dashboard e relatórios",
              "Gerenciamento de leads ilimitados",
              "Controle de comissões",
              "Suporte por email",
              "Renovação automática"
            ].map((feature, index) => (
              <li key={index} className="flex items-center">
                <CircleCheck className="h-5 w-5 mr-3 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Annual Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-primary overflow-hidden transition-all hover:shadow-xl relative">
        <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
          Melhor Custo-Benefício
        </div>
        <div className="p-8">
          <div className="inline-block px-4 py-1 bg-blue-100 text-primary rounded-full text-sm font-medium mb-4">
            Plano Anual
          </div>
          <div className="flex items-end mb-2">
            <span className="text-5xl font-bold">R$297,00</span>
            <span className="text-gray-500 ml-2">/ano</span>
          </div>
          <div className="text-green-600 font-medium mb-4">
            Apenas R$24,75/mês (Economize 34%)
          </div>
          <p className="text-gray-600 mb-6">
            A melhor opção para quem busca economia e estabilidade.
          </p>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => openPaymentLink("https://luana-santos3.pay.yampi.com.br/r/PBYIFKXNB9")}
          >
            Assinar Plano Anual
          </Button>
        </div>
        <div className="border-t border-gray-100 p-8">
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
              <li key={index} className="flex items-center">
                <CircleCheck className="h-5 w-5 mr-3 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
