
import React from "react";
import { 
  Users, 
  BarChart3, 
  CalendarCheck, 
  CircleDollarSign, 
  BellRing, 
  ClipboardList, 
  CircleCheck,
  Shield 
} from "lucide-react";

const features = [
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Gerenciamento de Leads",
    description: "Acompanhe todos os seus leads em um só lugar, desde o primeiro contato até a conversão."
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-primary" />,
    title: "Dashboard Analítico",
    description: "Visualize métricas importantes e tome decisões baseadas em dados."
  },
  {
    icon: <CalendarCheck className="h-6 w-6 text-primary" />,
    title: "Lembretes e Agendamentos",
    description: "Nunca mais perca um compromisso ou prazo importante com nosso sistema de lembretes."
  },
  {
    icon: <CircleDollarSign className="h-6 w-6 text-primary" />,
    title: "Controle de Comissões",
    description: "Gerencie comissões de vendedores com facilidade e transparência."
  },
  {
    icon: <BellRing className="h-6 w-6 text-primary" />,
    title: "Notificações Automáticas",
    description: "Receba alertas sobre atividades importantes e mantenha-se informado."
  },
  {
    icon: <ClipboardList className="h-6 w-6 text-primary" />,
    title: "Relatórios Detalhados",
    description: "Gere relatórios personalizados para análise de desempenho e resultados."
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Segurança de Dados",
    description: "Seus dados estão protegidos com as mais modernas práticas de segurança."
  },
  {
    icon: <CircleCheck className="h-6 w-6 text-primary" />,
    title: "Fácil de Usar",
    description: "Interface intuitiva que não requer conhecimentos técnicos avançados."
  }
];

const FeaturesList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <div 
          key={index}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all hover:shadow-lg"
        >
          <div className="mb-4">
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesList;
