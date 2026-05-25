import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Target, TrendingUp, Eye, Rocket, Zap, 
  Users, BarChart3, Clock, DollarSign, CheckCircle,
  Star, Gift, BookOpen, MessageCircle
} from "lucide-react";

const TrafficPremium = () => {
  const navigate = useNavigate();

  const handleContact = () => {
    window.open("https://wa.me/5584991850149?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20Tráfego%20Pago%20Premium", "_blank");
  };

  const handleAddTraffic = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-900">LeadConsig</div>
          <Button variant="ghost" className="text-blue-700 hover:text-blue-900" onClick={() => navigate("/login")}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30" />
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 text-sm font-semibold">
            <Zap className="w-4 h-4 mr-2 inline" />
            Solução Completa para Correspondentes Bancários
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Conquiste mais <span className="text-blue-600">Clientes</span> com
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gestão de Tráfego Pago
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Capte <strong>Leads Qualificados</strong> e aumente as aprovações de crédito usando estratégias avançadas no Google, Facebook e Instagram Ads.
          </p>

          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
            onClick={handleContact}
          >
            QUERO SABER MAIS
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O Tráfego Pago vai:
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Leads Qualificados</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Aumentar a sua <strong>demanda diária de Leads Qualificados</strong> chamando no WhatsApp e trazer oportunidades de vendas o tempo todo, com alta demanda.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Funil de Vendas Turbo</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Alimentar o seu <strong>Funil de Vendas</strong> com pessoas que tem o real interesse, por região, gênero, interesses, comportamento e convênios.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Invest Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Porque a sua Empresa deve investir em <span className="text-blue-600">Tráfego Pago</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Atrair Novos Clientes", desc: "Seus clientes estão no Google, Facebook e Instagram. Nosso método atrai o público alvo direto pra você." },
              { icon: DollarSign, title: "Aumentar Faturamento", desc: "É possível aumentar o seu faturamento mais rápido. Este é o principal motivo para investir." },
              { icon: Eye, title: "Visibilidade", desc: "Seu negócio se torna amplamente mais visível estando bem posicionado com anúncios estratégicos." },
              { icon: Rocket, title: "Crescimento do Negócio", desc: "Seu negócio irá crescer exponencialmente e permitirá você escalar seus resultados." },
              { icon: Zap, title: "Aprimorar", desc: "Você vai entrar para um novo mundo onde vai poder aprimorar sua forma de atendimento e melhorar todo o seu negócio." },
              { icon: Target, title: "Conquistar", desc: "A conquista de novos patamares será inevitável. A estratégia bem elaborada fará você multiplicar seus resultados." },
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-all border hover:border-blue-300">
                <CardContent className="p-6">
                  <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Inicie hoje no Tráfego Pago!
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Acelere os resultados da sua Empresa contratando um Especialista.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-6 text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            onClick={handleContact}
          >
            QUERO VENDER MAIS COM TRÁFEGO PAGO
            <Rocket className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Vantagens em ter um <span className="text-blue-600">Gestor de Tráfego</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Facilidade", desc: "É somente ajustar as estratégias e o gestor estará pronto para trazer os melhores clientes até você." },
              { icon: Clock, title: "Velocidade", desc: "A contratação pode ser feita de maneira rápida, sem precisar sair de casa, tudo pelo seu celular." },
              { icon: BarChart3, title: "Praticidade", desc: "Entrega semanal de como está indo o desempenho das campanhas e resultados." },
              { icon: DollarSign, title: "Economia", desc: "Você economiza tempo e dinheiro por estar contratando um profissional capacitado e experiente." },
              { icon: Rocket, title: "Antecipação", desc: "Você se antecipa a sua concorrência. Com a decisão de iniciar você larga na frente." },
              { icon: CheckCircle, title: "Sem Comprometimentos", desc: "Uma boa estratégia digital nunca irá comprometer os resultados do seu negócio." },
            ].map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que nossos <span className="text-blue-600">Clientes</span> dizem
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Moises Ferrari",
                text: "Foi excelente contratar os Serviços de Gestão de Tráfego Pago da Agência RTG com o Rodrigo. Consegui resolver meus problemas de demanda e minhas vendas triplicaram em dois meses.",
              },
              {
                name: "Fernanda Nascimento",
                text: "Depois que contratei a Agência RTG, o cenário das minhas vendas mudou completamente. Só tenho a agradecer pelo resultado e por toda atenção que recebo sempre que preciso de algo.",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Hora de Começar a acelerar seus resultados de forma profissional
          </h2>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-bold px-10 py-6 text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            onClick={handleContact}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            ENTRAR EM CONTATO
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center">
        <p>Copyright © 2025 RTG Agência – Todos os direitos reservados.</p>
      </footer>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/5584991850149?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20Tráfego%20Pago%20Premium"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="rounded-full w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all border-4 border-white animate-bounce">
            <MessageCircle className="w-8 h-8 text-white" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default TrafficPremium;

