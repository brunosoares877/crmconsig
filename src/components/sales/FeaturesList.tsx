
import React from "react";
import { 
  Users, 
  BarChart3, 
  CalendarClock, 
  CircleDollarSign, 
  BellRing, 
  FileBarChart, 
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Users className="h-10 w-10" />,
    title: "Gerenciamento de Leads",
    description: "Acompanhe todos os seus leads em um só lugar, desde o primeiro contato até a conversão.",
    bgColor: "from-blue-50 to-blue-100 border-blue-200",
    iconColor: "text-blue-600 bg-blue-100",
    hoverColor: "hover:border-blue-300 hover:shadow-blue-200"
  },
  {
    icon: <BarChart3 className="h-10 w-10" />,
    title: "Dashboard Analítico",
    description: "Visualize métricas importantes e tome decisões baseadas em dados reais em tempo real.",
    bgColor: "from-purple-50 to-purple-100 border-purple-200",
    iconColor: "text-purple-600 bg-purple-100",
    hoverColor: "hover:border-purple-300 hover:shadow-purple-200"
  },
  {
    icon: <CalendarClock className="h-10 w-10" />,
    title: "Lembretes e Agendamentos",
    description: "Nunca mais perca um compromisso ou prazo importante com nosso sistema de lembretes.",
    bgColor: "from-green-50 to-green-100 border-green-200",
    iconColor: "text-green-600 bg-green-100",
    hoverColor: "hover:border-green-300 hover:shadow-green-200"
  },
  {
    icon: <CircleDollarSign className="h-10 w-10" />,
    title: "Controle de Comissões",
    description: "Gerencie comissões de vendedores automaticamente com facilidade e transparência.",
    bgColor: "from-amber-50 to-amber-100 border-amber-200",
    iconColor: "text-amber-600 bg-amber-100",
    hoverColor: "hover:border-amber-300 hover:shadow-amber-200"
  },
  {
    icon: <BellRing className="h-10 w-10" />,
    title: "Notificações Automáticas",
    description: "Receba alertas sobre atividades importantes e mantenha-se informado em tempo real.",
    bgColor: "from-red-50 to-red-100 border-red-200",
    iconColor: "text-red-600 bg-red-100",
    hoverColor: "hover:border-red-300 hover:shadow-red-200"
  },
  {
    icon: <FileBarChart className="h-10 w-10" />,
    title: "Relatórios Detalhados",
    description: "Gere relatórios personalizados para análise de desempenho e resultados com facilidade.",
    bgColor: "from-cyan-50 to-cyan-100 border-cyan-200",
    iconColor: "text-cyan-600 bg-cyan-100",
    hoverColor: "hover:border-cyan-300 hover:shadow-cyan-200"
  },
  {
    icon: <ShieldCheck className="h-10 w-10" />,
    title: "Segurança de Dados",
    description: "Seus dados estão protegidos com as mais modernas práticas de segurança e criptografia.",
    bgColor: "from-indigo-50 to-indigo-100 border-indigo-200",
    iconColor: "text-indigo-600 bg-indigo-100",
    hoverColor: "hover:border-indigo-300 hover:shadow-indigo-200"
  },
  {
    icon: <Sparkles className="h-10 w-10" />,
    title: "Fácil de Usar",
    description: "Interface intuitiva projetada para todos os níveis de experiência, sem complicações.",
    bgColor: "from-pink-50 to-pink-100 border-pink-200",
    iconColor: "text-pink-600 bg-pink-100",
    hoverColor: "hover:border-pink-300 hover:shadow-pink-200"
  }
];

const FeaturesList = () => {
  return (
    <div className="py-6">
      {/* Título principal com animação e estilo moderno */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-primary to-purple-600 bg-clip-text text-transparent pb-2">
          Funcionalidades poderosas
        </h2>
        <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
          Tudo o que você precisa para alavancar seus resultados em um só lugar
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={cn(
              "bg-gradient-to-br border rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1",
              feature.bgColor,
              feature.hoverColor,
              "hover:shadow-lg"
            )}
          >
            <div className={cn("rounded-full p-3 inline-flex mb-4", feature.iconColor)}>
              {React.cloneElement(feature.icon as React.ReactElement, {
                className: cn("h-8 w-8", feature.iconColor.split(' ')[0])
              })}
            </div>
            
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-700">{feature.description}</p>
            
            <div className="mt-4 flex items-center text-primary font-semibold">
              <span>Saiba mais</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      {/* Barra de progresso com estatísticas */}
      <div className="mt-20 bg-gradient-to-r from-blue-600 to-primary text-white p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-4xl font-bold mb-2">+250%</div>
            <p className="text-blue-100">Aumento na taxa de conversão</p>
          </div>
          <div className="p-4 border-l border-r border-white/20">
            <div className="text-4xl font-bold mb-2">98%</div>
            <p className="text-blue-100">De satisfação dos clientes</p>
          </div>
          <div className="p-4">
            <div className="text-4xl font-bold mb-2">-65%</div>
            <p className="text-blue-100">Redução no tempo de atendimento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesList;
