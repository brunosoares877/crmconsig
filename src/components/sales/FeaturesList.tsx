import React from "react";
import { Users, BarChart3, CalendarClock, CircleDollarSign, BellRing, FileBarChart, ShieldCheck, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
const features = [
  {
    icon: <Target className="h-8 w-8" />,
    title: "Tráfego Pago Premium Incluso",
    description: "Receba leads qualificados todos os meses sem pagar gestor de tráfego. Gestão profissional de campanhas já inclusa no seu plano!",
    highlight: true,
    badge: "Exclusivo LeadConsig"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Gerenciamento de Leads",
    description: "Nunca mais perca uma oportunidade de venda com nosso sistema intuitivo que organiza seus contatos do primeiro clique à conversão."
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Dashboard Analítico",
    description: "Visualize métricas importantes e tome decisões baseadas em dados reais em tempo real para maximizar seus resultados."
  },
  {
    icon: <BellRing className="h-8 w-8" />,
    title: "Lembretes e Agendamentos",
    description: "Nunca mais perca um compromisso ou prazo importante com nosso sistema de lembretes inteligente."
  },
  {
    icon: <CircleDollarSign className="h-8 w-8" />,
    title: "Controle de Comissões",
    description: "Gerencie comissões de vendedores automaticamente com facilidade e transparência total."
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: "Segurança de Dados",
    description: "Seus dados estão protegidos com as mais modernas práticas de segurança e criptografia."
  }
];
const FeaturesList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <Card
          key={index}
          className={`group hover:shadow-xl transition-all duration-300 border-0 ${
            feature.highlight 
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white shadow-md hover:shadow-lg"
          }`}
        >
          <CardContent className="p-6">
            {feature.badge && (
              <div className="mb-4">
                <span className="inline-block bg-yellow-400 text-blue-900 font-bold text-xs px-3 py-1 rounded-full">
                  {feature.badge}
                </span>
              </div>
            )}
            
            <div className={`inline-flex p-3 rounded-2xl mb-4 ${
              feature.highlight 
                ? "bg-blue-500" 
                : "bg-blue-100"
            }`}>
              {React.cloneElement(feature.icon, {
                className: feature.highlight 
                  ? "h-8 w-8 text-white" 
                  : "h-8 w-8 text-blue-600"
              })}
            </div>
            
            <h3 className={`text-xl font-bold mb-3 ${
              feature.highlight ? "text-white" : "text-gray-900"
            }`}>
              {feature.title}
            </h3>
            
            <p className={`leading-relaxed ${
              feature.highlight ? "text-blue-100" : "text-gray-600"
            }`}>
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default FeaturesList;