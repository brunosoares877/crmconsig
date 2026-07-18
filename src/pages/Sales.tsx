import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BarChart3, Bell, Calculator, Shield, Target, Star, MessageCircle, ArrowRight, Play, Zap, TrendingUp, Award, BookOpen, Gift, CreditCard, Lock } from "lucide-react";
import { useEffect } from "react";
import Testimonials from "@/components/sales/Testimonials";
import SubscriptionPlans from "@/components/sales/SubscriptionPlans";

const Sales = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    // Programmatically change favicon from heart to bolt
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%232563eb%22/><path d=%22M50 15L30 55h15l-5 30 25-40H50l5-30z%22 fill=%22white%22/></svg>';
    }
  }, []);

  const handleStartTrial = () => {
    const plansSection = document.getElementById('planos');
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePayment = (url: string) => {
    try {
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Controle Total de Leads",
      description: "Centralize todos os seus contatos em um fluxo lógico. Nunca mais perca uma venda por esquecer de responder um WhatsApp ou perder um papel."
    },
    {
      icon: Award,
      title: "Sua Equipe na Palma da Mão",
      description: "Monitore a performance de cada vendedor em tempo real. Atribua metas, gerencie acessos e escale seu time com dados concretos."
    },
    {
      icon: BarChart3,
      title: "Inteligência de Vendas",
      description: "Dashboard analítico com métricas reais. Saiba exatamente qual convênio ou produto está trazendo mais lucro para sua operação."
    },
    {
      icon: Bell,
      title: "Agendamento Sem Falhas",
      description: "O sistema te avisa o momento exato de retornar para o seu cliente. Mais organização significa mais conversão no final do mês."
    },
    {
      icon: Calculator,
      title: "Comissões Automatizadas",
      description: "Elimine as planilhas complexas. Calcule a comissão do seu time automaticamente com transparência total e zero erros."
    },
    {
      icon: Shield,
      title: "Proteção Nível Bancário",
      description: "Seus dados são seu maior patrimônio. Utilizamos criptografia de ponta para garantir que suas informações estejam sempre protegidas."
    }
  ];

  const stats = [
    { value: "+250%", label: "Aumento na taxa de conversão", icon: TrendingUp },
    { value: "99%", label: "De satisfação dos clientes", icon: Award },
    { value: "97%", label: "Assertividade", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-200">
      {/* Premium Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[150px] animate-pulse opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full blur-[150px] animate-pulse delay-700 opacity-20" />
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-pink-300 rounded-full blur-[120px] animate-pulse delay-1000 opacity-15" />
      </div>


      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-blue-200 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            LeadConsig
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl transition-all hover:scale-105" onClick={handleStartTrial}>
              Assinar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 px-4 relative z-10">
        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-xs sm:text-sm font-bold tracking-wide">7 DIAS DE GARANTIA TOTAL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9] sm:leading-[0.9]">
            CRM DE ALTA<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PERFORMANCE</span>
          </h1>

          <p className="text-lg sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            A ferramenta definitiva para correspondentes bancários que buscam escala real e gestão impecável.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-16">
            <Button size="lg" className="h-16 px-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xl font-black shadow-2xl transition-all hover:scale-110 rounded-2xl w-full sm:w-auto" onClick={handleStartTrial}>
              COMEÇAR AGORA
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0F172A] bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-2 border-[#0F172A] bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                +2k
              </div>
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest pl-2">Corbans Lucrando</p>
          </div>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Facebook */}
            <svg className="h-8 md:h-10 w-auto fill-current text-[#1877F2]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>

            {/* Instagram */}
            <svg className="h-8 md:h-10 w-auto fill-current text-[#E4405F]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.069-1.644-.069-4.849 0-3.204.012-3.584.069-4.849.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>

            {/* Google */}
            <svg className="h-8 md:h-10 w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>

            {/* WhatsApp */}
            <svg className="h-8 md:h-10 w-auto fill-current text-[#25D366]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </div>
        </div>
      </section>
      {/* Problem Section - Agitation */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl relative z-10 border-y border-red-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-[120px] opacity-20" />
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">
              O PREJUÍZO <span className="text-red-500 underline decoration-4 underline-offset-8">INVISÍVEL</span> DO AMADORISMO
            </h2>
            <p className="text-xl text-slate-400 font-medium">
              Planilhas e cadernos são as ferramentas que a sua concorrência quer que você continue usando.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/30 p-8 hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all group">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">LEADS PERDIDOS</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Você esquece um lead hoje, ele compra com o vizinho amanha. O LeadConsig blinda sua base.</p>
            </Card>

            <Card className="bg-slate-800/50 border-white/10 p-8 hover:border-red-500/50 transition-all group">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calculator className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">CAOS FINANCEIRO</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Erros em comissões matam a moral do time. Automatize tudo e tenha 100% de transparência.</p>
            </Card>

            <Card className="bg-slate-800/50 border-white/10 p-8 hover:border-red-500/50 transition-all group">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">FALTA DE ESCALA</h3>
              <p className="text-slate-400 leading-relaxed font-medium">Sem dados você está voando às cegas. Descubra qual produto realmente bota dinheiro no bolso.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden z-10">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-repeat" style={{ backgroundImage: "radial-gradient(circle, white 2px, transparent 2px)", backgroundSize: "40px 40px sm:60px 60px" }} />
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
      <section className="py-24 px-4 bg-[#0F172A] relative z-10 overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">ECOSSISTEMA <span className="text-blue-500 italic">COMPLETO</span></h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Cada milímetro do LeadConsig foi desenhado para maximizar a sua lucratividade.</p>
          </div>

          {/* Bento Grid Concept */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 grid-rows-auto gap-6">

            {/* Main Feature - Large Box */}
            <Card className="md:col-span-4 lg:col-span-4 lg:row-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 border-0 p-10 flex flex-col justify-between overflow-hidden group relative shadow-2xl">
              <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-black text-white mb-6 leading-[0.9]">DASHBOARD DE ALTA PERFORMANCE</h3>
                <p className="text-blue-50 text-xl font-medium leading-relaxed max-w-md">
                  Acompanhe sua operação em tempo real. Cada clique é um dado valioso para sua estratégia de escala.
                </p>
              </div>
              <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-end">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />)}
                  </div>
                  <p className="text-blue-50 text-sm font-bold uppercase tracking-widest">O mais amado pelos Corbans</p>
                </div>
                <Users className="w-24 h-24 text-white/5 absolute bottom-[-10%] right-[-5%]" />
              </div>
            </Card>

            {/* Automation Box */}
            <Card className="md:col-span-2 lg:col-span-2 bg-slate-800 border-white/5 p-8 flex flex-col justify-between hover:bg-slate-700/80 transition-all cursor-pointer group">
              <div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">COMISSÕES NO AUTOMÁTICO</h3>
                <p className="text-slate-400 font-medium">Diga adeus às planilhas e erros contábeis.</p>
              </div>
            </Card>

            {/* Support Box */}
            <Card className="md:col-span-2 lg:col-span-2 bg-slate-800 border-white/5 p-8 flex flex-col justify-between hover:bg-slate-700/80 transition-all cursor-pointer group">
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-4">SUPORTE VIP BRASILEIRO</h3>
                <p className="text-slate-400 font-medium">Nossa equipe entende o seu dia a dia.</p>
              </div>
            </Card>

            {/* Security Box - Modern Dark */}
            {/* Security Box - Modern Dark */}
            <Card className="md:col-span-4 lg:col-span-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-blue-500/40 p-8 flex flex-col md:flex-row gap-8 items-center group overflow-hidden relative hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full md:w-1/3 flex flex-col gap-4 relative z-10">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-white leading-tight">DADOS BLINDADOS</h3>
                <p className="text-slate-400 font-medium text-sm">Criptografia bancária para proteger sua lista de leads.</p>
              </div>
              <div className="hidden md:flex flex-1 justify-around items-center opacity-20 relative z-10">
                <Shield className="w-16 h-16 text-blue-500 animate-pulse" />
                <Lock className="w-12 h-12 text-blue-500" />
                <Zap className="w-16 h-16 text-blue-500 animate-pulse delay-500" />
              </div>
            </Card>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#0F172A] relative">
        <div className="container mx-auto px-4 sm:px-6">
          <Testimonials />
        </div>
      </section>

      <section id="planos" className="py-24 px-4 bg-[#0F172A] relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">INVESTIMENTO <span className="text-blue-500 underline underline-offset-8">INTELIGENTE</span></h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">Escolha o plano que melhor se adapta ao momento da sua operação.</p>
          </div>

          <div className="mt-12">
            <SubscriptionPlans />
          </div>
        </div>
      </section>



      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:40px_40px]" />
        </div>
        <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
          <h2 className="text-4xl sm:text-7xl font-black mb-8 tracking-tighter leading-tight">
            PRONTO PARA<br />
            <span className="text-yellow-300 italic">DOMINAR</span> O MERCADO?
          </h2>
          <p className="text-xl sm:text-2xl mb-12 font-medium text-blue-50 max-w-2xl mx-auto">
            Não deixe mais nenhum centavo na mesa. Junte-se aos Corbans que já escalaram sua gestão com o LeadConsig.
          </p>
          <Button
            size="lg"
            className="h-20 px-16 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-blue-950 text-2xl font-black rounded-2xl shadow-[0_15px_50px_rgba(251,191,36,0.5)] transition-all hover:scale-105 active:scale-[0.98] border-0"
            onClick={handleStartTrial}
          >
            QUERO MEU ACESSO AGORA
          </Button>
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
