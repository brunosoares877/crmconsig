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

  const handlePayment = (url: string) => {
    try {
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
    }
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
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-900">LeadConsig</div>
          <div className="flex gap-2 sm:gap-4">
            <Button variant="ghost" className="text-blue-700 hover:text-blue-900 text-sm sm:text-base px-3 sm:px-4" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-3 sm:px-4" onClick={handleStartTrial}>
              Criar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30" />
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-20 sm:top-40 right-5 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000" />
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold shadow-lg">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            7 DIAS GRÁTIS - COMECE AGORA!
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight px-2">
            CRM completo para corbans:<br />
            <span className="text-blue-span font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Aumente suas vendas</span> e<br />
            <span className="text-blue-span font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">otimize sua gestão</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto font-light leading-relaxed px-4">
            Feito de corban para corban. Transforme leads em vendas com o sistema mais completo do mercado.
          </p>
          <div className="mb-6 sm:mb-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto" onClick={handleStartTrial}>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Começar Teste Gratuito
          </Button>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-repeat" style={{backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)", backgroundSize: "40px 40px sm:60px 60px"}} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-3 sm:mb-4 bg-white/20 text-white hover:bg-white/30 border-white/30 px-4 sm:px-6 py-2 text-xs sm:text-sm">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              RESULTADOS COMPROVADOS
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4">Números que <span className="text-yellow-300">impressionam</span></h2>
            <p className="text-blue-100 text-sm sm:text-lg max-w-2xl mx-auto px-4">Nossos clientes alcançam resultados extraordinários com o LeadConsig</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="group text-center border-0 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-4">
                  <div className="p-3 sm:p-4 rounded-full bg-white/20 w-fit mx-auto mb-4 sm:mb-6 group-hover:bg-white/30 transition-colors duration-300">
                    <stat.icon className="w-8 h-8 sm:w-12 sm:h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 group-hover:text-yellow-300 transition-colors duration-300">{stat.value}</div>
                  <div className="text-blue-100 font-medium text-sm sm:text-base">{stat.label}</div>
                  <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-yellow-300 to-orange-300 mx-auto mt-3 sm:mt-4 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 sm:px-6 py-2 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              RECURSOS AVANÇADOS
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">Funcionalidades <span className="text-blue-600">poderosas</span></h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">Tudo o que você precisa para alavancar seus resultados em um só lugar</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-1 sm:hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10 p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300 flex-shrink-0">
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {feature.badge && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow-lg animate-pulse text-xs sm:text-sm px-2 sm:px-3 py-1 ml-2">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300 leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50/20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-green-100 text-green-800 hover:bg-green-200 px-4 sm:px-6 py-2 text-xs sm:text-sm">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              DEPOIMENTOS REAIS
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">O que nossos <span className="text-blue-600">clientes</span> dizem</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">Histórias reais de transformação e sucesso com o LeadConsig</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm relative overflow-hidden">
              <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16" />
              <CardContent className="p-6 sm:p-8 md:p-12">
                <div className="flex items-center justify-center mb-6 sm:mb-8">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 200}ms`}} />
                  ))}
                </div>
                <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-700 mb-6 sm:mb-8 italic font-light leading-relaxed text-center px-2">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                    {testimonials[activeTestimonial].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="font-bold text-lg sm:text-xl text-gray-900">{testimonials[activeTestimonial].name}</div>
                    <div className="text-blue-600 font-semibold text-sm sm:text-base">{testimonials[activeTestimonial].role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center mt-8 sm:mt-12 gap-2 sm:gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    index === activeTestimonial 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white to-blue-50/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 px-6 py-2 text-sm font-semibold shadow-lg">
              <Zap className="w-4 h-4 mr-2" />
              EXPERIMENTE 7 DIAS GRÁTIS!
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Escolha o plano <span className="text-blue-600">ideal</span> para você</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Comece grátis e escolha seu plano quando estiver pronto. Todos os planos incluem suporte completo.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Plano Mensal */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">Plano Mensal</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">R$37,90<span className="text-base sm:text-lg text-gray-500">/mês</span></div>
                <CardDescription className="text-sm sm:text-base">Perfeito para começar sem um grande investimento inicial.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Acesso completo ao sistema</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Dashboard e relatórios</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Gerenciamento de leads ilimitados</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Controle de comissões</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Suporte por email</span></li>
                </ul>
              </CardContent>
              <CardFooter className="p-4 sm:p-6">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3" onClick={() => handlePayment("https://buy.stripe.com/test_6oE03haZsbuP5sAeUU")}>Assinar Plano Mensal</Button>
              </CardFooter>
            </Card>

            {/* Plano Semestral - Recomendado */}
            <Card className="border-2 border-blue-500 relative hover:border-blue-600 transition-colors scale-100 sm:scale-105">
              <Badge className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs sm:text-sm px-2 sm:px-3">
                Recomendado
              </Badge>
              <CardHeader className="p-4 sm:p-6 pt-6 sm:pt-8">
                <CardTitle className="text-xl sm:text-2xl">Plano Semestral</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">R$187,00<span className="text-base sm:text-lg text-gray-500">/6 meses</span></div>
                <div className="text-xs sm:text-sm text-green-600 font-semibold">Apenas R$31,17/mês (Economize 17%)</div>
                <CardDescription className="text-sm sm:text-base">Economia sem um compromisso de longo prazo.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Acesso completo ao sistema</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Dashboard e relatórios</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Gerenciamento de leads ilimitados</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Controle de comissões</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Suporte prioritário</span></li>
                </ul>
              </CardContent>
              <CardFooter className="p-4 sm:p-6">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3" onClick={() => handlePayment("https://buy.stripe.com/test_28o03h8RkgP92go3cd")}>Assinar Plano Semestral</Button>
              </CardFooter>
            </Card>

            {/* Plano Anual */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="p-4 sm:p-6">
                <Badge className="w-fit bg-green-100 text-green-800 mb-2 text-xs sm:text-sm px-2 sm:px-3">Melhor Custo-Benefício</Badge>
                <CardTitle className="text-xl sm:text-2xl">Plano Anual</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">R$297,00<span className="text-base sm:text-lg text-gray-500">/ano</span></div>
                <div className="text-xs sm:text-sm text-green-600 font-semibold">Apenas R$24,75/mês (Economize 34%)</div>
                <CardDescription className="text-sm sm:text-base">A melhor opção para quem busca economia e estabilidade.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Acesso completo ao sistema</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Dashboard e relatórios</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Gerenciamento de leads ilimitados</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Controle de comissões</span></li>
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Suporte prioritário</span></li>
                </ul>
              </CardContent>
              <CardFooter className="p-4 sm:p-6">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-3" onClick={() => handlePayment("https://buy.stripe.com/test_5kA5nBd7A2YjcV23ce")}>Assinar Plano Anual</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Upsell Tráfego Pago */}
          <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
            <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader className="text-center p-4 sm:p-6">
                <Badge className="w-fit mx-auto bg-yellow-500 text-white mb-2 text-xs sm:text-sm px-2 sm:px-3">Turbine seu Plano</Badge>
                <CardTitle className="text-xl sm:text-2xl">Tráfego Pago Premium</CardTitle>
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">R$397,00<span className="text-base sm:text-lg text-gray-500">/mês</span></div>
                <CardDescription className="text-sm sm:text-base">Adicional aos planos existentes - Leads qualificados para INSS, Bolsa Família e FGTS</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <ul className="space-y-2 sm:space-y-3">
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Leads segmentados INSS</span></li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Leads Bolsa Família</span></li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Leads FGTS qualificados</span></li>
                  </ul>
                  <ul className="space-y-2 sm:space-y-3">
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Campanhas otimizadas</span></li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">Relatórios de performance</span></li>
                    <li className="flex items-center"><Target className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" /><span className="text-sm sm:text-base">ROI garantido</span></li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-4 sm:p-6">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm sm:text-base py-2 sm:py-3" onClick={handleStartTrial}>Adicionar Tráfego Pago</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-repeat" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px sm:40px 40px"}} />
        </div>
        <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-48 sm:w-64 h-48 sm:h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse" />
        <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-60 sm:w-80 h-60 sm:h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse delay-1000" />
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-5xl relative z-10">
          <Badge className="mb-4 sm:mb-6 bg-white/20 text-white hover:bg-white/30 border-white/30 px-4 sm:px-6 py-2 text-xs sm:text-sm">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            ÚLTIMA CHANCE
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight px-2">
            Pronto para <span className="text-yellow-300">revolucionar</span><br />
            suas vendas?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 font-light opacity-90 max-w-3xl mx-auto px-4">
            Experimente nosso CRM por 7 dias gratuitamente e veja como podemos ajudar sua empresa a crescer exponencialmente.
          </p>
          <div className="mb-8 sm:mb-12">
            <Button 
              variant="outline" 
              size="lg" 
              className="!bg-white !text-blue-600 hover:!bg-blue-50 hover:!text-blue-700 font-bold text-base sm:text-lg md:text-xl px-8 sm:px-12 md:px-16 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 !border-2 !border-white hover:!border-blue-200 w-full sm:w-auto" 
              onClick={handleStartTrial}
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              Começar agora mesmo
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-green-300" />
              <span className="font-semibold text-sm sm:text-base">7 dias grátis</span>
            </div>
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-green-300" />
              <span className="font-semibold text-sm sm:text-base">Sem cartão de crédito</span>
            </div>
            <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm sm:col-span-2 md:col-span-1">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-green-300" />
              <span className="font-semibold text-sm sm:text-base">Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <a 
          href="https://wa.me/5584991850149?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20sistema%20LeadConsig"
          target="_blank"
          rel="noopener noreferrer"
          className="relative group"
        >
          {/* Botão principal */}
          <Button className="rounded-full w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-2 sm:border-4 border-white animate-bounce">
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </Button>
          
          {/* Tooltip - apenas em telas maiores */}
          <div className="hidden sm:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Fale conosco no WhatsApp
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Sales;
