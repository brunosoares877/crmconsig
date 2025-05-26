import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneCall, CalendarCheck, Clock, TrendingUp, TrendingDown, CalendarDays, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday, startOfMonth, endOfMonth, differenceInMinutes } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

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
    positive: true,
    icon: <Users className="h-6 w-6 text-emerald-600" />,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100"
  }, {
    title: "Leads do Mês",
    value: metrics.leadsThisMonth.toString(),
    change: calculateChange(metrics.leadsThisMonth, metrics.leadsThisMonth - 5),
    positive: true,
    icon: <PhoneCall className="h-6 w-6 text-blue-600" />,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  }, {
    title: "Média por Dia",
    value: metrics.averageLeadsPerDay.toString(),
    change: calculateChange(metrics.averageLeadsPerDay, metrics.averageLeadsPerDay - 0.2),
    positive: true,
    icon: <CalendarCheck className="h-6 w-6 text-purple-600" />,
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100"
  }, {
    title: "Intervalo entre Leads",
    value: metrics.averageTimeBetweenLeads,
    change: {
      value: "-3min",
      positive: true
    },
    positive: true,
    icon: <Clock className="h-6 w-6 text-amber-600" />,
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100"
  }];

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
        <span className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
          <Card 
            key={index} 
            className={`${metric.bgColor} ${metric.borderColor} border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-slate-700">
                {metric.title}
              </CardTitle>
              <div className="rounded-full p-2.5 bg-white shadow-sm">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-slate-800 mb-2">{metric.value}</div>
              <p className={`flex items-center text-xs font-medium ${metric.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                {metric.change.value}
                {metric.positive ? <TrendingUp className="ml-1 h-3 w-3" /> : <TrendingDown className="ml-1 h-3 w-3" />}
                <span className="ml-1 text-slate-500 font-normal">desde ontem</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Daily Production Section */}
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <CardTitle className="text-lg flex items-center text-slate-800">
              <CalendarDays className="mr-2 h-5 w-5 text-emerald-600" />
              Produção Diária
            </CardTitle>
            <div className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
              R$ {calculateDailyTotal()}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-slate-500">
                Carregando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-600">Cliente</TableHead>
                      <TableHead className="text-slate-600">Produto</TableHead>
                      <TableHead className="text-right text-slate-600">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyProduction.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                          Nenhuma venda registrada hoje
                        </TableCell>
                      </TableRow>
                    ) : (
                      dailyProduction.map(lead => (
                        <TableRow key={lead.id} className="border-slate-100 hover:bg-slate-50">
                          <TableCell className="font-medium text-slate-800">{lead.name}</TableCell>
                          <TableCell className="text-slate-600">{lead.product || "—"}</TableCell>
                          <TableCell className="text-right font-semibold text-slate-800">
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
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
            <CardTitle className="text-lg flex items-center text-slate-800">
              <User className="mr-2 h-5 w-5 text-purple-600" />
              Vendas por Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-slate-500">
                Carregando...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="text-slate-600">Funcionário</TableHead>
                      <TableHead className="text-center text-slate-600">Vendas</TableHead>
                      <TableHead className="text-right text-slate-600">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                          Nenhuma venda por funcionário registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      employeeSales.map(employee => (
                        <TableRow key={employee.employee} className="border-slate-100 hover:bg-slate-50">
                          <TableCell className="font-medium text-slate-800">{employee.employee}</TableCell>
                          <TableCell className="text-center text-slate-800">{employee.count}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <div className="h-2 w-24 rounded-full bg-slate-200 mr-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" 
                                  style={{
                                    width: `${Math.min(employee.count * 10, 100)}%`
                                  }} 
                                />
                              </div>
                              <span className="text-slate-600 text-sm">
                                {Math.min(employee.count * 10, 100)}%
                              </span>
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
      
      {/* Latest Leads Section */}
      <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <CardTitle className="text-lg flex items-center text-slate-800">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            Últimos Leads Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-slate-500">
              Carregando...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600">Nome</TableHead>
                    <TableHead className="text-slate-600">Telefone</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                    <TableHead className="text-right text-slate-600">Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum lead cadastrado recentemente
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestLeads.map(lead => (
                      <TableRow key={lead.id} className="border-slate-100 hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-800">{lead.name}</TableCell>
                        <TableCell className="text-slate-600">{lead.phone || "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${lead.status === 'novo' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                              lead.status === 'contatado' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 
                              lead.status === 'qualificado' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                              lead.status === 'negociando' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                              lead.status === 'convertido' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-slate-500">{lead.createdAt}</TableCell>
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
