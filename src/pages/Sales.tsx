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
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  ⚡ 7 DIAS GRÁTIS!
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  CRM completo para corbans:{" "}
                  <span className="text-blue-600">Aumente suas vendas</span> e{" "}
                  <span className="text-blue-600">otimize sua gestão</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  Feito de corban para corban. Transforme leads em vendas com o 
                  sistema mais completo do mercado.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button 
                    onClick={handleStartTrial} 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg px-8 md:px-10 py-4 md:py-6 w-full sm:w-auto rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    🚀 Começar Teste Gratuito <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Cancele quando quiser</span>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="relative max-w-lg mx-auto lg:max-w-none">
                  <img 
                    alt="CRM Dashboard Preview" 
                    className="rounded-lg shadow-xl w-full h-auto" 
                    src="/lovable-uploads/f0e5ee00-1480-4e39-83b6-0cbb29b8f5a4.png" 
                    loading="lazy"
                  />
                  <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-blue-600 text-white font-bold py-2 px-3 md:px-4 rounded-lg transform rotate-12 shadow-lg text-sm md:text-base">
                    7 DIAS GRÁTIS!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">+250%</h3>
                <p className="text-gray-600">Aumento na taxa de conversão</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">99%</h3>
                <p className="text-gray-600">De satisfação dos clientes</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">100%</h3>
                <p className="text-gray-600">Assertividade</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-blue-50/30 to-white w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Funcionalidades poderosas
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Tudo o que você precisa para alavancar seus resultados em um só lugar
              </p>
            </div>
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

            {/* Tráfego Pago Premium Section */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-bold">
                    Turbine seu Plano
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Tráfego Pago Premium
                  </h3>
                  <div className="text-4xl font-bold mb-4">
                    R$ 397,00<span className="text-lg font-normal">/mês</span>
                  </div>
                  <p className="text-orange-100 mb-6">
                    Adicional aos planos existentes - Leads qualificados para INSS, Bolsa Família e FGTS
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Leads segmentados INSS</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Leads Bolsa Família</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Leads FGTS qualificados</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Campanhas otimizadas</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>Relatórios de performance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span>ROI garantido</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-white text-orange-500 hover:bg-orange-50 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg w-full md:w-auto"
                    onClick={handleStartTrial}
                  >
                    Adicionar Tráfego Pago
                  </Button>
                </div>
              </div>
            </div>

            <SubscriptionPlans />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="text-white py-16 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 w-full relative overflow-hidden">
          {/* Background pattern for visual appeal */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-white">
              Pronto para aumentar suas vendas?
            </h2>
            <p className="text-xl md:text-2xl mb-8 md:mb-12 text-blue-100 leading-relaxed">
              Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer.
            </p>
            
            {/* Main CTA Button - White background with blue text */}
            <div className="mb-8 md:mb-10">
              <Button 
                onClick={handleStartTrial} 
                size="lg" 
                className="text-xl md:text-2xl px-12 md:px-16 py-6 md:py-8 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold w-full sm:w-auto min-w-[320px]"
              >
                🚀 Começar agora mesmo <ArrowRight className="ml-3 h-6 w-6 md:h-7 md:w-7" />
              </Button>
            </div>
            
            {/* Secondary action */}
            <div className="flex justify-center">
              <WhatsAppButton 
                phoneNumber="5584991850149" 
                message="Olá! Tenho dúvidas sobre o LeadConsig" 
                label="Falar com Suporte"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              />
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">7 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">Cancele quando quiser</span>
              </div>
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
