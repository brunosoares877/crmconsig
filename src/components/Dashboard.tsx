
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ArrowUpRight, 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Clock
} from "lucide-react";

const Dashboard = () => {
  // Mock data for dashboard metrics
  const metrics = [
    {
      title: "Total de Leads",
      value: "237",
      change: "+12%",
      positive: true,
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Contatos Hoje",
      value: "24",
      change: "+5%",
      positive: true,
      icon: <PhoneCall className="h-5 w-5" />
    },
    {
      title: "Taxa de Conversão",
      value: "16.8%",
      change: "-2.3%",
      positive: false,
      icon: <CheckCircle2 className="h-5 w-5" />
    },
    {
      title: "Tempo Médio de Resposta",
      value: "32min",
      change: "+8min",
      positive: false,
      icon: <Clock className="h-5 w-5" />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <span className="text-sm text-muted-foreground">
          Última atualização: hoje às 10:25
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`rounded-full p-1.5 ${metric.positive ? 'bg-green-100' : 'bg-red-100'}`}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`flex items-center text-xs ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
                <ArrowUpRight className={`ml-1 h-4 w-4 ${!metric.positive && 'transform rotate-180'}`} />
                <span className="ml-1 text-muted-foreground">desde ontem</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
