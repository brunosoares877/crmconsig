
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Instagram, Send, MapPin, CheckCircle, BarChart3, Users, Shield, Zap, HeadphonesIcon, Clock } from "lucide-react";
import SalesHeader from "@/components/sales/SalesHeader";
import SubscriptionPlans from "@/components/sales/SubscriptionPlans";
import FeaturesList from "@/components/sales/FeaturesList";
import Testimonials from "@/components/sales/Testimonials";
import WhatsAppButton from "@/components/WhatsAppButton";

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
        {/* Hero Section - Inspirado no design da Huggy */}
        <section className="w-full px-4 py-16 md:py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  🚀 Teste Grátis por 7 Dias
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  Automatize seus <span className="text-blue-600">atendimentos</span> e os centralize em uma única plataforma
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  Gerencie leads, acompanhe propostas e aumente suas vendas com o CRM feito especialmente para o mercado de consignado.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                  <Button 
                    onClick={handleStartTrial} 
                    size="lg" 
                    className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  >
                    Testar grátis por 7 dias
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-8 py-4 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-full w-full sm:w-auto"
                  >
                    Solicitar demo <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                {/* Benefits list */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Sem cartão de crédito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Configuração em 5 minutos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Suporte especializado</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/2">
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 shadow-2xl">
                    <img 
                      alt="CRM Dashboard Preview" 
                      className="rounded-2xl shadow-xl w-full h-auto border-4 border-white/20" 
                      src="/lovable-uploads/406aa32b-8872-4e79-b7e3-681a3c81491b.png" 
                    />
                  </div>
                  {/* Floating elements */}
                  <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-gray-700">Online 24h</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white rounded-2xl p-4 shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold">+250%</div>
                      <div className="text-sm opacity-90">Conversões</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Icons Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tudo que você precisa em um só lugar
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Centralize todos os seus processos e aumente a produtividade da sua equipe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestão de Leads</h3>
                <p className="text-gray-600">Organize e acompanhe todos os seus leads em tempo real</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Relatórios Inteligentes</h3>
                <p className="text-gray-600">Dashboards com métricas em tempo real para decisões assertivas</p>
              </div>
              
              <div className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Automação</h3>
                <p className="text-gray-600">Automatize tarefas repetitivas e foque no que importa</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <FeaturesList />
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 bg-blue-600">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
              Mais de 1000+ profissionais já confiam no LeadConsig
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-white">
                <div className="text-4xl font-bold mb-2">1000+</div>
                <div className="text-blue-100">Usuários ativos</div>
              </div>
              <div className="text-white">
                <div className="text-4xl font-bold mb-2">250%</div>
                <div className="text-blue-100">Aumento em vendas</div>
              </div>
              <div className="text-white">
                <div className="text-4xl font-bold mb-2">99%</div>
                <div className="text-blue-100">Satisfação</div>
              </div>
              <div className="text-white">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Suporte</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <div className="w-full">
          <Testimonials />
        </div>

        {/* Subscription Plans */}
        <section className="py-20 bg-gray-50 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Escolha o plano ideal para você
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Comece grátis e escolha seu plano quando estiver pronto
              </p>
              <div className="inline-block bg-blue-600 text-white text-lg font-bold px-6 py-3 rounded-full">
                🎉 EXPERIMENTE 7 DIAS GRÁTIS!
              </div>
            </div>
            <SubscriptionPlans />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 w-full">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Pronto para revolucionar suas vendas?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Junte-se a mais de 1000 profissionais que já transformaram seus resultados com o LeadConsig.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                onClick={handleStartTrial} 
                size="lg" 
                className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
              >
                Começar teste gratuito <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <WhatsAppButton 
                phoneNumber="5584991850149" 
                message="Olá! Tenho dúvidas sobre o LeadConsig" 
                label="Falar com especialista"
                className="bg-green-500 hover:bg-green-600 text-white rounded-full px-8 py-4 w-full sm:w-auto"
              />
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-8 justify-center mt-12 text-blue-100">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Dados 100% seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                <span>Suporte especializado</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Setup em 5 minutos</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-16 w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e descrição */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-blue-400">LeadConsig</h3>
              <p className="text-gray-300 mb-6 max-w-md">
                O CRM completo para profissionais do mercado de consignado. 
                Gerencie leads, acompanhe propostas e aumente suas vendas.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Facebook size={24} />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Instagram size={24} />
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  <Send size={24} />
                </a>
              </div>
            </div>

            {/* Contatos */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contatos</h4>
              <div className="space-y-3">
                <a 
                  href="https://wa.me/5584991850149?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20sistema%20Leadconsig" 
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                  <Send size={18} />
                  (84) 99185-0149
                </a>
                <a 
                  href="mailto:suporte@leadconsig.com.br" 
                  className="hover:text-blue-400 transition-colors block"
                >
                  suporte@leadconsig.com.br
                </a>
              </div>
            </div>

            {/* Localização */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Localização</h4>
              <div className="flex items-start gap-2">
                <MapPin size={18} />
                <p className="text-gray-300">Natal - RN</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2025 LeadConsig - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Sales;
