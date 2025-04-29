
import React from "react";
import { Button } from "@/components/ui/button";
import { CircleCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SubscriptionPlans = () => {
  const handlePayment = async (priceId: string, url: string) => {
    try {
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Monthly Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden transition-all hover:shadow-xl">
        <div className="p-8">
          <div className="inline-block px-4 py-1 bg-yellow-100 text-amber-800 rounded-full text-sm font-medium mb-4">
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
            onClick={() => handlePayment("price_monthly", "https://buy.stripe.com/test_6oE03haZsbuP5sAeUU")}
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
              "Renovação automática",
              "Pagamento via PIX ou Cartão"
            ].map((feature, index) => (
              <li key={index} className="flex items-center">
                <CircleCheck className="h-5 w-5 mr-3 text-green-500" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Semestral Plan */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-400 overflow-hidden transition-all hover:shadow-xl relative">
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-950 px-4 py-1 text-sm font-medium rounded-bl-lg">
          Recomendado
        </div>
        <div className="p-8">
          <div className="inline-block px-4 py-1 bg-yellow-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            Plano Semestral
          </div>
          <div className="flex items-end mb-2">
            <span className="text-5xl font-bold">R$187,00</span>
            <span className="text-gray-500 ml-2">/6 meses</span>
          </div>
          <div className="text-green-600 font-medium mb-4">
            Apenas R$31,17/mês (Economize 17%)
          </div>
          <p className="text-gray-600 mb-6">
            Economia sem um compromisso de longo prazo.
          </p>
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => handlePayment("price_semestral", "https://buy.stripe.com/test_28o03h8RkgP92go3cd")}
          >
            Assinar Plano Semestral
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
              "Economia semestral",
              "Ideal para equipes em crescimento"
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
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
          Melhor Custo-Benefício
        </div>
        <div className="p-8">
          <div className="inline-block px-4 py-1 bg-yellow-100 text-amber-700 rounded-full text-sm font-medium mb-4">
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
            onClick={() => handlePayment("price_annual", "https://buy.stripe.com/test_5kA5nBd7A2YjcV23ce")}
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
