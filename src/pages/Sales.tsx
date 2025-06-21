import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-white w-full overflow-x-hidden">
      <SalesHeader />
      
      {/* WhatsApp Floating Button */}
      <WhatsAppButton 
        phoneNumber="5584991850149" 
        message="Olá! Gostaria de saber mais sobre o sistema LeadConsig" 
        variant="floating" 
      />
      
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full px-4 py-20 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
              ⚡ 7 DIAS GRÁTIS!
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              CRM completo para corbans:{" "}
              <span className="text-blue-600">Aumente suas vendas</span> e{" "}
              <span className="text-blue-600">otimize sua gestão</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Feito de corban para corban. Transforme leads em vendas com o 
              sistema mais completo do mercado.
            </p>
            <Button 
              onClick={handleStartTrial} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
            >
              🚀 Começar Teste Gratuito <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-base text-gray-500">
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
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">+250%</h3>
                <p className="text-gray-600">Aumento na taxa de conversão</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">99%</h3>
                <p className="text-gray-600">De satisfação dos clientes</p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
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
        <section className="py-16 bg-white w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Funcionalidades poderosas
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tudo o que você precisa para alavancar seus resultados em um só lugar
              </p>
            </div>
            <FeaturesList />
          </div>
        </section>

        {/* Testimonials Section */}
        <Testimonials />

        {/* Tráfego Pago Premium Section */}
        <section className="py-16 bg-gray-50 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-bold">
                    Turbine seu Plano
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">
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
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-16 bg-white w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-4xl font-bold text-center mb-4">
              Escolha o plano ideal para você
            </h2>
            <p className="text-xl text-center text-gray-600 mb-4">
              Comece grátis e escolha seu plano quando estiver pronto
            </p>
            <div className="text-center mb-8">
              <span className="inline-block bg-blue-600 text-white text-lg font-bold px-6 py-3 rounded-full">
                EXPERIMENTE 7 DIAS GRÁTIS!
              </span>
            </div>
            <SubscriptionPlans />
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="text-white py-20 bg-gradient-to-r from-blue-600 to-blue-700 w-full">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-5xl font-bold mb-8 text-white">
              Pronto para aumentar suas vendas?
            </h2>
            <p className="text-2xl mb-12 text-blue-100 leading-relaxed">
              Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer.
            </p>
            
            <Button 
              onClick={handleStartTrial} 
              size="lg" 
              className="text-2xl px-16 py-8 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold"
            >
              🚀 Começar agora mesmo <ArrowRight className="ml-3 h-7 w-7" />
            </Button>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>7 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Sales;
