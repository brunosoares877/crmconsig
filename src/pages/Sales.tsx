import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BarChart3, Bell, Calculator, Shield, Target, Star, MessageCircle, ArrowRight, Play, Zap, TrendingUp, Award } from "lucide-react";

const Sales = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const handleStartTrial = () => {
    navigate("/login");
  };

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Corretora Autônoma",
      content: "O CRM revolucionou minha forma de trabalhar! Consigo gerenciar todos meus leads de forma organizada e aumentei minhas vendas em 40% no primeiro mês.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Gerente Comercial",
      content: "Excelente sistema! A interface é intuitiva e o suporte é muito atencioso. Recomendo para qualquer profissional do mercado de consignado.",
      rating: 5
    },
    {
      name: "Ana Paula Oliveira",
      role: "Consultora Financeira",
      content: "O melhor investimento que fiz para meu negócio. O controle de leads e o acompanhamento das propostas ficou muito mais fácil.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: Target,
      title: "Tráfego Pago Premium Incluso",
      description: "Receba leads qualificados todos os meses sem pagar gestor de tráfego. Gestão profissional de campanhas já inclusa no seu plano!",
      badge: "Exclusivo LeadConsig"
    },
    {
      icon: Users,
      title: "Gerenciamento de Leads",
      description: "Nunca mais perca uma oportunidade de venda com nosso sistema intuitivo que organiza seus contatos do primeiro clique à conversão."
    },
    {
      icon: BarChart3,
      title: "Dashboard Analítico",
      description: "Visualize métricas importantes e tome decisões baseadas em dados reais em tempo real para maximizar seus resultados."
    },
    {
      icon: Bell,
      title: "Lembretes e Agendamentos",
      description: "Nunca mais perca um compromisso ou prazo importante com nosso sistema de lembretes inteligente."
    },
    {
      icon: Calculator,
      title: "Controle de Comissões",
      description: "Gerencie comissões de vendedores automaticamente com facilidade e transparência total."
    },
    {
      icon: Shield,
      title: "Segurança de Dados",
      description: "Seus dados estão protegidos com as mais modernas práticas de segurança e criptografia."
    }
  ];

  const stats = [
    { value: "+250%", label: "Aumento na taxa de conversão", icon: TrendingUp },
    { value: "99%", label: "De satisfação dos clientes", icon: Award },
    { value: "100%", label: "Assertividade", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-900">LeadConsig</div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-blue-700 hover:text-blue-900" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStartTrial}>
              Criar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Zap className="w-4 h-4 mr-2" />
            7 DIAS GRÁTIS!
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            CRM completo para corbans:<br />
            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>Aumente suas vendas</span> e<br />
            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>otimize sua gestão</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Feito de corban para corban. Transforme leads em vendas com o sistema mais completo do mercado.
          </p>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg" onClick={handleStartTrial}>
            <Play className="w-5 h-5 mr-2" />
            Começar Teste Gratuito
          </Button>
          <p className="text-sm text-gray-500 mt-4">Sem cartão de crédito • Cancele quando quiser</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades poderosas</h2>
            <p className="text-xl text-gray-600">Tudo o que você precisa para alavancar seus resultados em um só lugar</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                    {feature.badge && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Depoimentos de nossos clientes</h2>
            <p className="text-xl text-gray-600">Veja o que nossos clientes dizem sobre o LeadConsig</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 mb-6 italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                    <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Escolha o plano ideal para você</h2>
            <p className="text-xl text-gray-600">Comece grátis e escolha seu plano quando estiver pronto</p>
            <Badge className="mt-4 bg-green-100 text-green-800 hover:bg-green-200">
              EXPERIMENTE 7 DIAS GRÁTIS!
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">Plano Mensal</CardTitle>
                <div className="text-3xl font-bold text-blue-600">R$37,90<span className="text-lg text-gray-500">/mês</span></div>
                <CardDescription>Perfeito para começar sem um grande investimento inicial.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Acesso completo ao sistema</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Dashboard e relatórios</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Gerenciamento de leads ilimitados</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Controle de comissões</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Suporte por email</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleStartTrial}>Assinar Plano Mensal</Button>
              </CardFooter>
            </Card>

            {/* Plano Semestral - Recomendado */}
            <Card className="border-2 border-blue-500 relative hover:border-blue-600 transition-colors scale-105">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                Recomendado
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Plano Semestral</CardTitle>
                <div className="text-3xl font-bold text-blue-600">R$187,00<span className="text-lg text-gray-500">/6 meses</span></div>
                <div className="text-sm text-green-600 font-semibold">Apenas R$31,17/mês (Economize 17%)</div>
                <CardDescription>Economia sem um compromisso de longo prazo.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Acesso completo ao sistema</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Dashboard e relatórios</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Gerenciamento de leads ilimitados</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Controle de comissões</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Suporte prioritário</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleStartTrial}>Assinar Plano Semestral</Button>
              </CardFooter>
            </Card>

            {/* Plano Anual */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader>
                <Badge className="w-fit bg-green-100 text-green-800 mb-2">Melhor Custo-Benefício</Badge>
                <CardTitle className="text-2xl">Plano Anual</CardTitle>
                <div className="text-3xl font-bold text-blue-600">R$297,00<span className="text-lg text-gray-500">/ano</span></div>
                <div className="text-sm text-green-600 font-semibold">Apenas R$24,75/mês (Economize 34%)</div>
                <CardDescription>A melhor opção para quem busca economia e estabilidade.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Acesso completo ao sistema</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Dashboard e relatórios</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Gerenciamento de leads ilimitados</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Controle de comissões</li>
                  <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />Suporte prioritário</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleStartTrial}>Assinar Plano Anual</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Upsell Tráfego Pago */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader className="text-center">
                <Badge className="w-fit mx-auto bg-yellow-500 text-white mb-2">Turbine seu Plano</Badge>
                <CardTitle className="text-2xl">Tráfego Pago Premium</CardTitle>
                <div className="text-3xl font-bold text-orange-600">R$397,00<span className="text-lg text-gray-500">/mês</span></div>
                <CardDescription>Adicional aos planos existentes - Leads qualificados para INSS, Bolsa Família e FGTS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2" />Leads segmentados INSS</li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2" />Leads Bolsa Família</li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2" />Leads FGTS qualificados</li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2" />Campanhas otimizadas</li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2" />Relatórios de performance</li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2" />ROI garantido</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={handleStartTrial}>Adicionar Tráfego Pago</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para aumentar suas vendas?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg" onClick={handleStartTrial}>
            <ArrowRight className="w-5 h-5 mr-2" />
            Começar agora mesmo
          </Button>
          <div className="flex justify-center items-center gap-8 mt-8 text-blue-100">
            <div className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" />7 dias grátis</div>
            <div className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" />Sem cartão de crédito</div>
            <div className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" />Cancele quando quiser</div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://wa.me/5584991850149?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20sistema%20LeadConsig"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg">
            <MessageCircle className="w-6 h-6" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Sales;
