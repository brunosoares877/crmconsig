import React from "react";
import { Users, BarChart3, CalendarClock, CircleDollarSign, BellRing, FileBarChart, ShieldCheck, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
const features = [
  {
    icon: <Target className="h-10 w-10" />,
    title: "Tráfego Pago Premium Incluso",
    description: "Receba leads qualificados todos os meses sem pagar gestor de tráfego. Gestão profissional de campanhas já inclusa no seu plano!",
    highlight: true,
    badge: "Exclusivo LeadConsig"
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: "Gerenciamento de Leads",
    description: "Acompanhe todos os seus leads em um só lugar, desde o primeiro contato até a conversão."
  },
  {
    icon: <BarChart3 className="h-10 w-10" />,
    title: "Dashboard Analítico",
    description: "Visualize métricas importantes e tome decisões baseadas em dados reais em tempo real."
  },
  {
    icon: <CalendarClock className="h-10 w-10" />,
    title: "Lembretes e Agendamentos",
    description: "Nunca mais perca um compromisso ou prazo importante com nosso sistema de lembretes."
  },
  {
    icon: <CircleDollarSign className="h-10 w-10" />,
    title: "Controle de Comissões",
    description: "Gerencie comissões de vendedores automaticamente com facilidade e transparência."
  },
  {
    icon: <BellRing className="h-10 w-10" />,
    title: "Notificações Automáticas",
    description: "Receba alertas sobre atividades importantes e mantenha-se informado em tempo real."
  },
  {
    icon: <FileBarChart className="h-10 w-10" />,
    title: "Relatórios Detalhados",
    description: "Gere relatórios personalizados para análise de desempenho e resultados com facilidade."
  },
  {
    icon: <ShieldCheck className="h-10 w-10" />,
    title: "Segurança de Dados",
    description: "Seus dados estão protegidos com as mais modernas práticas de segurança e criptografia."
  }
];
const FeaturesList = () => {
  return <div className="py-6">
      {/* Título principal com estilo sofisticado */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 pb-2">
          Funcionalidades poderosas
        </h2>
        <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
          Tudo o que você precisa para alavancar seus resultados em um só lugar papae
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={index}
            className={
              `transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-2 ` +
              (feature.highlight ? "border-blue-900 bg-blue-900 text-white shadow-2xl" : "border-gray-200/60 bg-white text-gray-900")
            }
          >
            <CardContent className="p-6">
              <div className={
                feature.highlight
                  ? "bg-blue-800 rounded-full p-4 inline-flex mb-4 border-4 border-blue-700 shadow-lg"
                  : "bg-gray-100 rounded-full p-4 inline-flex mb-4"
              }>
                {React.cloneElement(feature.icon as React.ReactElement, {
                  className: feature.highlight ? "h-8 w-8 text-yellow-400" : "h-8 w-8 text-primary"
                })}
              </div>
              {feature.badge && (
                <span className="inline-block bg-yellow-400 text-blue-900 font-bold text-xs px-3 py-1 rounded-full mb-2 animate-pulse">
                  {feature.badge}
                </span>
              )}
              <h3 className={feature.highlight ? "text-2xl font-bold mb-3 text-white" : "text-xl font-bold mb-3"}>{feature.title}</h3>
              <p className={feature.highlight ? "text-blue-100" : "text-gray-700"}>{feature.description}</p>
              <div className={feature.highlight ? "mt-4 flex items-center text-yellow-400 font-semibold" : "mt-4 flex items-center text-primary font-semibold"}>
                <span>Saiba mais</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Mantendo a barra de progresso com estatísticas */}
      <div className="mt-20 bg-gradient-to-r from-gray-900 to-primary text-white p-8 rounded-2xl shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-4xl font-bold mb-2">+250%</div>
            <p className="text-gray-100">Aumento na taxa de conversão</p>
          </div>
          <div className="p-4 border-l border-r border-white/20">
            <div className="text-4xl font-bold mb-2">99%</div>
            <p className="text-gray-100">De satisfação dos clientes</p>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold mb-2">100%</div>
            <p className="text-gray-100">Assertividade</p>
          </div>
        </div>
      </div>
    </div>;
};
export default FeaturesList;