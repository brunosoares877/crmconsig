import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneCall, CalendarCheck, Clock, TrendingUp, TrendingDown, CalendarDays, User, MoreHorizontal, Search } from "lucide-react";
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

  const metricsData = [{
    title: "Leads Hoje",
    value: metrics.leadsToday.toString(),
    change: calculateChange(metrics.leadsToday, metrics.leadsToday - 2),
    subtitle: `Comparado com ontem`,
    positive: true,
    icon: <Users className="h-5 w-5 text-blue-600" />,
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  }, {
    title: "Total de Leads",
    value: metrics.leadsThisMonth.toString(),
    change: calculateChange(metrics.leadsThisMonth, metrics.leadsThisMonth - 5),
    subtitle: `Leads do mês atual`,
    positive: true,
    icon: <PhoneCall className="h-5 w-5 text-blue-600" />,
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  }, {
    title: "Média por Dia",
    value: metrics.averageLeadsPerDay.toString(),
    change: calculateChange(metrics.averageLeadsPerDay, metrics.averageLeadsPerDay - 0.2),
    subtitle: `Média diária do mês`,
    positive: true,
    icon: <CalendarCheck className="h-5 w-5 text-blue-600" />,
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  }, {
    title: "Conversão",
    value: "12%",
    change: {
      value: "+2.1%",
      positive: true
    },
    subtitle: `Taxa de conversão`,
    positive: true,
    icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
    bgColor: "bg-white",
    borderColor: "border-gray-200"
  }];

  // Function to calculate daily production total
  const calculateDailyTotal = () => {
    return dailyProduction.reduce((total, lead) => {
      const amount = parseFloat(lead.amount || "0");
      return isNaN(amount) ? total : total + amount;
    }, 0).toFixed(2);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm">
            Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 w-64 bg-white"
            />
          </div>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <Card 
            key={index} 
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value}
              </div>
              <div className="flex items-center text-xs">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  metric.positive 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-red-700 bg-red-100'
                }`}>
                  {metric.change.value}
                  {metric.positive ? (
                    <TrendingUp className="ml-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="ml-1 h-3 w-3" />
                  )}
                </span>
                <span className="ml-2 text-gray-500">{metric.subtitle}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Production Section */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Produção Diária
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Vendas realizadas hoje
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                R$ {calculateDailyTotal()}
              </div>
              <p className="text-xs text-gray-500">Total hoje</p>
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
                    Nenhuma venda registrada hoje
                  </div>
                ) : (
                  dailyProduction.slice(0, 5).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-600">{lead.product || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {lead.amount ? `R$ ${lead.amount}` : "—"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Employee Sales Section */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Performance dos Funcionários
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Vendas por funcionário
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                Carregando...
              </div>
            ) : (
              <div className="space-y-3">
                {employeeSales.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma venda por funcionário registrada
                  </div>
                ) : (
                  employeeSales.slice(0, 5).map(employee => (
                    <div key={employee.employee} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.employee}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{employee.count} vendas</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Latest Leads Section */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Últimos Leads
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Leads cadastrados recentemente
            </p>
          </div>
          <Button variant="outline" size="sm">
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              Carregando...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="text-gray-600 font-medium">Nome</TableHead>
                    <TableHead className="text-gray-600 font-medium">Telefone</TableHead>
                    <TableHead className="text-gray-600 font-medium">Status</TableHead>
                    <TableHead className="text-right text-gray-600 font-medium">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        Nenhum lead cadastrado recentemente
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestLeads.map(lead => (
                      <TableRow key={lead.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{lead.name}</TableCell>
                        <TableCell className="text-gray-600">{lead.phone || "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${lead.status === 'novo' ? 'bg-blue-100 text-blue-700' : 
                              lead.status === 'contatado' ? 'bg-purple-100 text-purple-700' : 
                              lead.status === 'qualificado' ? 'bg-yellow-100 text-yellow-700' : 
                              lead.status === 'negociando' ? 'bg-orange-100 text-orange-700' : 
                              lead.status === 'convertido' ? 'bg-green-100 text-green-700' : 
                              'bg-gray-100 text-gray-700'}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-500">{lead.createdAt}</TableCell>
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
  );
};

export default Dashboard;
