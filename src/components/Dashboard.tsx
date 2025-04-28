
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Users, 
  PhoneCall, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    contactsToday: 0,
    conversionRate: 0,
    averageResponseTime: "0min"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailyProduction, setDailyProduction] = useState([]);
  const [employeeSales, setEmployeeSales] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Get total leads
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        // Get contacts today
        const today = new Date();
        const { count: contactsToday } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'contatado')
          .gte('updated_at', startOfToday().toISOString())
          .lte('updated_at', endOfToday().toISOString());

        // Get converted leads for conversion rate
        const { count: convertedLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'convertido');

        // Calculate conversion rate
        const conversionRate = totalLeads ? ((convertedLeads || 0) / totalLeads) * 100 : 0;

        // Fetch daily production data
        const { data: dailyData, error: dailyError } = await supabase
          .from('leads')
          .select('*')
          .eq('status', 'convertido')
          .gte('updated_at', startOfToday().toISOString())
          .lte('updated_at', endOfToday().toISOString());
        
        if (dailyError) {
          console.error('Error fetching daily production:', dailyError);
          toast.error("Erro ao carregar produção diária");
        } else {
          setDailyProduction(dailyData || []);
        }
        
        // Fetch employee sales data
        const { data: salesData, error: salesError } = await supabase
          .from('leads')
          .select('employee, count(*), amount')
          .eq('status', 'convertido')
          .not('employee', 'is', null)
          .group('employee')
          .order('count', { ascending: false });
          
        if (salesError) {
          console.error('Error fetching employee sales:', salesError);
          toast.error("Erro ao carregar vendas por funcionário");
        } else {
          setEmployeeSales(salesData || []);
        }

        setMetrics({
          totalLeads: totalLeads || 0,
          contactsToday: contactsToday || 0,
          conversionRate: parseFloat(conversionRate.toFixed(1)),
          averageResponseTime: "32min" // This would need actual data tracking to calculate
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error("Erro ao carregar métricas do dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return { value: "+0%", positive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      positive: change >= 0
    };
  };

  const metricsData = [
    {
      title: "Total de Leads",
      value: metrics.totalLeads.toString(),
      change: calculateChange(metrics.totalLeads, metrics.totalLeads - 5), // Example previous value
      positive: true,
      icon: <Users className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Contatos Hoje",
      value: metrics.contactsToday.toString(),
      change: calculateChange(metrics.contactsToday, metrics.contactsToday - 2), // Example previous value
      positive: true,
      icon: <PhoneCall className="h-5 w-5 text-green-500" />
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics.conversionRate}%`,
      change: calculateChange(metrics.conversionRate, metrics.conversionRate - 0.5), // Example previous value
      positive: false,
      icon: <CheckCircle2 className="h-5 w-5 text-purple-500" />
    },
    {
      title: "Tempo Médio de Resposta",
      value: metrics.averageResponseTime,
      change: { value: "+8min", positive: false },
      positive: false,
      icon: <Clock className="h-5 w-5 text-amber-500" />
    }
  ];

  // Function to calculate daily production total
  const calculateDailyTotal = () => {
    return dailyProduction.reduce((total, lead) => {
      const amount = parseFloat(lead.amount || "0");
      return isNaN(amount) ? total : total + amount;
    }, 0).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="dashboard-card animate-fade-in overflow-hidden" style={{animationDelay: `${index * 0.1}s`}}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800 dark:to-transparent">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${metric.positive ? 'bg-green-100' : 'bg-red-100'}`}>
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{metric.value}</div>
              <p className={`mt-2 flex items-center text-xs ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change.value}
                {metric.positive ? 
                  <TrendingUp className="ml-1 h-4 w-4" /> : 
                  <TrendingDown className="ml-1 h-4 w-4" />
                }
                <span className="ml-1 text-muted-foreground">desde ontem</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Daily Production Section */}
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
              Produção Diária
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">
              R$ {calculateDailyTotal()}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyProduction.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda registrada hoje
                        </TableCell>
                      </TableRow>
                    ) : (
                      dailyProduction.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.product || "—"}</TableCell>
                          <TableCell className="text-right">
                            {lead.amount ? `R$ ${lead.amount}` : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Employee Sales Section */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="mr-2 h-5 w-5 text-purple-500" />
              Vendas por Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Carregando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead className="text-center">Vendas</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda por funcionário registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeeSales.map((employee) => (
                        <TableRow key={employee.employee}>
                          <TableCell className="font-medium">{employee.employee}</TableCell>
                          <TableCell className="text-center">{employee.count}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <div className={`h-2 w-24 rounded-full bg-gray-200 mr-2 overflow-hidden`}>
                                <div 
                                  className="h-full bg-green-500" 
                                  style={{ width: `${Math.min(employee.count * 10, 100)}%` }}
                                />
                              </div>
                              {Math.min(employee.count * 10, 100)}%
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
