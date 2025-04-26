import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import SalesHeader from "@/components/sales/SalesHeader";
import SubscriptionPlans from "@/components/sales/SubscriptionPlans";
import FeaturesList from "@/components/sales/FeaturesList";
import Testimonials from "@/components/sales/Testimonials";
const Sales = () => {
  const navigate = useNavigate();
  const handleStartTrial = () => {
    navigate("/login");
  };
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <SalesHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Use o CRM completo por <span className="text-primary">7 dias grátis!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">Feito de corban para corban.</p>
            <Button onClick={handleStartTrial} size="lg" className="text-lg px-8 py-6">
              Começar Teste Gratuito <ArrowRight className="ml-2" />
            </Button>
            <p className="text-sm text-gray-500 mt-4">
          </p>
          </div>
          <div className="md:w-1/2">
            <img alt="CRM Dashboard Preview" className="rounded-lg shadow-xl w-full" src="/lovable-uploads/406aa32b-8872-4e79-b7e3-681a3c81491b.png" />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Funcionalidades poderosas para seu negócio
            </h2>
            <FeaturesList />
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Subscription Plans */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-center text-gray-600 mb-12">
              Comece grátis e escolha seu plano quando estiver pronto
            </p>
            <SubscriptionPlans />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-white py-16">
          <div className="container mx-auto px-4 text-center bg-[#4848ff]">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para aumentar suas vendas?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer.
            </p>
            <Button onClick={handleStartTrial} variant="secondary" size="lg" className="text-primary text-lg px-8 py-6">
              Começar agora mesmo <ArrowRight className="ml-2" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 ConsignadoLeadHub - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>;
};
export default Sales;