import React from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import Header from "@/components/Header";

const PaymentPlans = () => {
  const openPaymentLink = (planName: string, url: string) => {
    toast.info(`Redirecionando para pagamento do plano ${planName}`);
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 py-8 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl font-bold">Seu teste gratuito expirou</h1>
          <p className="text-xl text-muted-foreground">
            Escolha um plano para continuar utilizando o ConsignadoLeadHub
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Monthly Plan */}
          <Card className="border-2 relative animate-fade-in" style={{animationDelay: "0.1s"}}>
            <CardHeader>
              <CardTitle>Plano Mensal</CardTitle>
              <CardDescription>Ideal para começar sem compromisso de longo prazo</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$37,90</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Acesso completo ao sistema",
                  "Dashboard e relatórios",
                  "Gerenciamento de leads ilimitados",
                  "Controle de comissões",
                  "Suporte por email",
                  "Renovação automática"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CircleCheck className="h-5 w-5 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => openPaymentLink("Mensal", "https://buy.stripe.com/test_6oE03haZsbuP5sAeUU")}
              >
                Assinar Plano Mensal
              </Button>
            </CardFooter>
          </Card>

          {/* Semestral Plan */}
          <Card className="border-2 border-amber-400 relative animate-fade-in" style={{animationDelay: "0.15s"}}>
            <div className="absolute top-0 right-0 bg-amber-400 text-primary-foreground px-3 py-1 text-sm rounded-bl-lg">
              Recomendado
            </div>
            <CardHeader>
              <CardTitle>Plano Semestral</CardTitle>
              <CardDescription>Economia sem compromisso de longo prazo</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$187,00</span>
                <span className="text-muted-foreground">/6 meses</span>
                <div className="text-green-600 text-sm font-medium mt-1">
                  Apenas R$31,17/mês (Economize 17%)
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Acesso completo ao sistema",
                  "Dashboard e relatórios",
                  "Gerenciamento de leads ilimitados",
                  "Controle de comissões",
                  "Suporte prioritário",
                  "Economia semestral",
                  "Ideal para equipes em crescimento"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CircleCheck className="h-5 w-5 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => openPaymentLink("Semestral", "https://buy.stripe.com/test_28o03h8RkgP92go3cd")}
              >
                Assinar Plano Semestral
              </Button>
            </CardFooter>
          </Card>

          {/* Annual Plan */}
          <Card className="border-2 border-primary relative animate-fade-in" style={{animationDelay: "0.2s"}}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm rounded-bl-lg">
              Melhor Custo-Benefício
            </div>
            <CardHeader>
              <CardTitle>Plano Anual</CardTitle>
              <CardDescription>Economize com o pagamento anual</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$297,00</span>
                <span className="text-muted-foreground">/ano</span>
                <div className="text-green-600 text-sm font-medium mt-1">
                  Apenas R$24,75/mês (Economize 34%)
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Acesso completo ao sistema",
                  "Dashboard e relatórios",
                  "Gerenciamento de leads ilimitados",
                  "Controle de comissões",
                  "Suporte prioritário",
                  "Pagamento único anual",
                  "Preço garantido"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <CircleCheck className="h-5 w-5 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => openPaymentLink("Anual", "https://buy.stripe.com/test_5kA5nBd7A2YjcV23ce")}
              >
                Assinar Plano Anual
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentPlans;
