import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneCall, CalendarCheck, Clock, TrendingUp, TrendingDown, CalendarDays, User, MoreHorizontal, Search, DollarSign, Activity, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday, startOfMonth, endOfMonth, differenceInMinutes } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    leadsToday: 0,
    leadsThisMonth: 0,
    averageLeadsPerDay: 0,
    averageTimeBetweenLeads: "0min"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailyProduction, setDailyProduction] = useState([]);
  const [employeeSales, setEmployeeSales] = useState([]);
  const [latestLeads, setLatestLeads] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Get today's date range
        const today = new Date();
        const todayStart = startOfToday().toISOString();
        const todayEnd = endOfToday().toISOString();

        // Get month's date range
        const monthStart = startOfMonth(today).toISOString();
        const monthEnd = endOfMonth(today).toISOString();

        // Get leads created today
        const {
          count: leadsToday
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).gte('created_at', todayStart).lte('created_at', todayEnd);

        // Get leads created this month
        const {
          count: leadsThisMonth
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).gte('created_at', monthStart).lte('created_at', monthEnd);

        // Get all leads from this month to calculate average time between leads
        const {
          data: monthLeads,
          error: monthLeadsError
        } = await supabase.from('leads').select('created_at').gte('created_at', monthStart).lte('created_at', monthEnd).order('created_at', {
          ascending: true
        });
        if (monthLeadsError) {
          console.error('Error fetching month leads:', monthLeadsError);
        }

        // Calculate average time between leads (in minutes)
        let averageTimeBetweenLeads = "0min";
        if (monthLeads && monthLeads.length > 1) {
          let totalMinutesDiff = 0;
          let diffCount = 0;
          for (let i = 1; i < monthLeads.length; i++) {
            const prevDate = new Date(monthLeads[i - 1].created_at);
            const currentDate = new Date(monthLeads[i].created_at);
            const diffMinutes = differenceInMinutes(currentDate, prevDate);

            // Only count reasonable differences (ignore batch imports, etc.)
            if (diffMinutes > 0 && diffMinutes < 1440) {
              // Less than 24 hours
              totalMinutesDiff += diffMinutes;
              diffCount += 1;
            }
          }
          const avgMinutes = diffCount > 0 ? Math.round(totalMinutesDiff / diffCount) : 0;
          averageTimeBetweenLeads = `${avgMinutes}min`;
        }

        // Calculate average leads per day in this month
        const daysPassed = Math.max(1, new Date().getDate());
        const averageLeadsPerDay = leadsThisMonth ? parseFloat((leadsThisMonth / daysPassed).toFixed(1)) : 0;

        // Fetch daily production data
        const {
          data: dailyData,
          error: dailyError
        } = await supabase.from('leads').select('*').eq('status', 'convertido').gte('updated_at', todayStart).lte('updated_at', todayEnd);
        if (dailyError) {
          console.error('Error fetching daily production:', dailyError);
          toast.error("Erro ao carregar produção diária");
        } else {
          setDailyProduction(dailyData || []);
        }

        // Fetch employee sales data
        const {
          data: employeeData,
          error: employeeError
        } = await supabase.from('leads').select('employee, amount').eq('status', 'convertido').not('employee', 'is', null);
        if (employeeError) {
          console.error('Error fetching employee sales:', employeeError);
          toast.error("Erro ao carregar vendas por funcionário");
        } else {
          // Process employee data to count sales per employee
          const employeeSalesMap = {};

          // Count sales per employee
          employeeData?.forEach(lead => {
            if (lead.employee) {
              if (!employeeSalesMap[lead.employee]) {
                employeeSalesMap[lead.employee] = {
                  count: 0
                };
              }
              employeeSalesMap[lead.employee].count += 1;
            }
          });

          // Convert to array format for display
          const employeeSalesArray = Object.entries(employeeSalesMap).map(([employee, data]) => ({
            employee,
            count: (data as {
              count: number;
            }).count
          }));

          // Sort by count (highest first)
          employeeSalesArray.sort((a, b) => b.count - a.count);
          setEmployeeSales(employeeSalesArray);
        }

        // Fetch latest 6 registered leads
        const {
          data: latestLeadsData,
          error: latestLeadsError
        } = await supabase.from('leads').select('*').order('created_at', {
          ascending: false
        }).limit(6);
        if (latestLeadsError) {
          console.error('Error fetching latest leads:', latestLeadsError);
          toast.error("Erro ao carregar leads recentes");
        } else {
          const formattedLatestLeads = latestLeadsData?.map(lead => ({
            ...lead,
            createdAt: new Date(lead.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          })) || [];
          setLatestLeads(formattedLatestLeads);
        }

        // Update metrics
        setMetrics({
          leadsToday: leadsToday || 0,
          leadsThisMonth: leadsThisMonth || 0,
          averageLeadsPerDay: averageLeadsPerDay,
          averageTimeBetweenLeads: averageTimeBetweenLeads
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
    if (!previous) return {
      value: "+0%",
      positive: true
    };
    const change = (current - previous) / previous * 100;
    return {
      value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
      positive: change >= 0
    };
  };

  const metricsData = [
    {
      title: "Saldo Nominal",
      value: `R$ ${(metrics.leadsThisMonth * 150).toLocaleString('pt-BR')}`,
      subtitle: "Receita do mês atual",
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      trend: "+12.3%"
    },
    {
      title: "Total de Leads",
      value: metrics.leadsThisMonth.toString(),
      subtitle: "Leads cadastrados",
      icon: <Users className="h-5 w-5" />,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      trend: "+8.2%"
    },
    {
      title: "Receita Nominal",
      value: `R$ ${(metrics.leadsToday * 200).toLocaleString('pt-BR')}`,
      subtitle: "Receita hoje",
      icon: <Activity className="h-5 w-5" />,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      trend: "+15.1%"
    },
    {
      title: "Taxa Conversão",
      value: "23.5%",
      subtitle: "Taxa de conversão",
      icon: <Target className="h-5 w-5" />,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      trend: "+3.2%"
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Bem-vindo de volta! Aqui está o que está acontecendo com seus leads hoje.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 w-64 bg-white border-gray-200"
              />
            </div>
            <Button variant="outline" size="icon" className="bg-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsData.map((metric, index) => (
            <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                    <div className={metric.textColor}>
                      {metric.icon}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {metric.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atividade de Clientes - Chart Area */}
          <Card className="lg:col-span-2 bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Atividade de Clientes
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Visão geral das atividades dos últimos 7 dias
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Relatório
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-gray-600">Gráfico de atividades será implementado</p>
                  <p className="text-sm text-gray-500">Dados dos últimos 7 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Dados */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Estatísticas de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Em Processo</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{metrics.leadsToday}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Entrega de Processo</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{Math.round(metrics.leadsThisMonth * 0.7)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Online Diário</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{Math.round(metrics.averageLeadsPerDay)}</span>
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold">{(metrics.leadsThisMonth * 1.2).toFixed(0)}</p>
                  <p className="text-sm opacity-90">Atividade Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Produção Diária Atualizada */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Produção Diária
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Vendas realizadas hoje
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    R$ {calculateDailyTotal()}
                  </div>
                  <p className="text-xs text-green-600 font-medium">+12.5% vs ontem</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  Carregando...
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyProduction.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <PhoneCall className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Nenhuma venda registrada hoje</p>
                    </div>
                  ) : (
                    dailyProduction.slice(0, 5).map(lead => (
                      <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lead.name}</p>
                            <p className="text-sm text-gray-500">{lead.product || "Produto não especificado"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {lead.amount ? `R$ ${lead.amount}` : "—"}
                          </p>
                          <p className="text-xs text-gray-500">Hoje</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transações Recentes */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Transações Recentes
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Últimas atividades registradas
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestLeads.slice(0, 4).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {lead.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.phone || "Sem telefone"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">R$ 1.200,00</p>
                      <p className="text-xs text-gray-500">{lead.createdAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
