import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Instagram, Send, MapPin } from "lucide-react";
import SalesHeader from "@/components/sales/SalesHeader";
import SubscriptionPlans from "@/components/sales/SubscriptionPlans";
import FeaturesList from "@/components/sales/FeaturesList";
import Testimonials from "@/components/sales/Testimonials";
import WhatsAppButton from "@/components/WhatsAppButton";
import FAQ from "@/components/sales/FAQ";

const Sales = () => {
  const navigate = useNavigate();
  const handleStartTrial = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50 w-full overflow-x-hidden">
      <SalesHeader />
      
      {/* WhatsApp Floating Button */}
      <WhatsAppButton 
        phoneNumber="5584991850149" 
        message="Olá! Gostaria de saber mais sobre o sistema LeadConsig" 
        variant="floating" 
      />
      
      <main className="flex-1 w-full">
        {/* Hero Section with 7-day free trial highlight */}
        <section className="w-full px-4 py-12 md:py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 lg:mb-6">
                  Use o CRM completo por <span className="text-blue-600">7 dias grátis!</span>
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 lg:mb-8">
                  Feito de corban para corban.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button 
                    onClick={handleStartTrial} 
                    size="lg" 
                    variant="blue" 
                    className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
                  >
                    Começar Teste Gratuito <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative max-w-lg mx-auto lg:max-w-none">
                  <img 
                    alt="CRM Dashboard Preview" 
                    className="rounded-lg shadow-xl w-full h-auto" 
                    src="/lovable-uploads/406aa32b-8872-4e79-b7e3-681a3c81491b.png" 
                  />
                  <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transform rotate-12 shadow-lg text-sm md:text-base">
                    7 DIAS GRÁTIS!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-blue-50/30 to-white w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <FeaturesList />
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="w-full">
          <Testimonials />
        </div>

        {/* Subscription Plans with Free Trial Highlight */}
        <section className="py-12 md:py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-lg md:text-xl text-center text-gray-600 mb-4">
              Comece grátis e escolha seu plano quando estiver pronto
            </p>
            <div className="text-center mb-6 md:mb-8">
              <span className="inline-block bg-blue-600 text-white text-base md:text-lg font-bold px-4 md:px-6 py-2 md:py-3 rounded-full">
                EXPERIMENTE 7 DIAS GRÁTIS!
              </span>
            </div>
            <SubscriptionPlans />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="text-white py-12 md:py-16 bg-gradient-to-r from-blue-600 to-blue-700 w-full">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 text-white">
              Pronto para aumentar suas vendas?
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-blue-100">
              Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleStartTrial} 
                size="lg" 
                className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto"
              >
                Começar agora mesmo <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <WhatsAppButton 
                phoneNumber="5584991850149" 
                message="Olá! Tenho dúvidas sobre o LeadConsig" 
                label="Falar com Suporte"
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 md:py-12 w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Redes Sociais */}
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-4 justify-center md:justify-start">
                <a href="#" className="hover:text-primary transition-colors">
                  <Facebook size={24} />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Send size={24} />
                </a>
              </div>
            </div>

            {/* Nossos Contatos */}
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Nossos Contatos</h3>
              <div className="space-y-2">
                <a 
                  href="https://wa.me/5584991850149?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20sistema%20Leadconsig" 
                  className="flex items-center gap-2 hover:text-primary transition-colors justify-center md:justify-start"
                >
                  <Send size={20} />
                  (84) 99185-0149
                </a>
                <a 
                  href="mailto:suporte@leadconsig.com.br" 
                  className="hover:text-primary transition-colors block"
                >
                  suporte@leadconsig.com.br
                </a>
              </div>
            </div>

            {/* Localização */}
            <div className="text-center md:text-left">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Localização</h3>
              <div className="flex items-start gap-2 justify-center md:justify-start">
                <MapPin size={20} />
                <p>Natal - RN</p>
              </div>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-700 text-center">
            <p className="text-sm md:text-base">© 2025 LeadConsig - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Sales;
