import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Instagram, Send, MapPin } from "lucide-react";
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
        {/* Hero Section with 7-day free trial highlight */}
        <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Use o CRM completo por <span className="text-primary">7 dias grátis!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">Feito de corban para corban.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button onClick={handleStartTrial} size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                Começar Teste Gratuito <ArrowRight className="ml-2" />
              </Button>
              
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative">
              <img alt="CRM Dashboard Preview" className="rounded-lg shadow-xl w-full" src="/lovable-uploads/406aa32b-8872-4e79-b7e3-681a3c81491b.png" />
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-blue-900 font-bold py-2 px-4 rounded-lg transform rotate-12 shadow-lg">
                7 DIAS GRÁTIS!
              </div>
            </div>
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

        {/* Subscription Plans with Free Trial Highlight */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
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

        {/* CTA Section */}
        <section className="text-white py-16 bg-slate-300">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-950">
              Pronto para aumentar suas vendas?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-slate-950">
              Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer.
            </p>
            <Button onClick={handleStartTrial} size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              Começar agora mesmo <ArrowRight className="ml-2" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Redes Sociais */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
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
            <div>
              <h3 className="text-xl font-semibold mb-4">Nossos Contatos</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Send size={20} />
                  (71) 98764-8829
                </a>
                <a href="mailto:consignadoleadhub@gmail.com" className="hover:text-primary transition-colors">
                  consignadoleadhub@gmail.com
                </a>
              </div>
            </div>

            {/* Localização */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Localização</h3>
              <div className="flex items-start gap-2">
                <MapPin size={20} />
                <p>Natal - RN</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>© 2025 ConsignadoLeadHub - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Sales;