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
    // Example previous value
    positive: true,
    icon: <Users className="h-5 w-5 text-blue-500" />
  }, {
    title: "Leads do Mês",
    value: metrics.leadsThisMonth.toString(),
    change: calculateChange(metrics.leadsThisMonth, metrics.leadsThisMonth - 5),
    // Example previous value
    positive: true,
    icon: <PhoneCall className="h-5 w-5 text-green-500" />
  }, {
    title: "Média por Dia",
    value: metrics.averageLeadsPerDay.toString(),
    change: calculateChange(metrics.averageLeadsPerDay, metrics.averageLeadsPerDay - 0.2),
    // Example previous value
    positive: true,
    icon: <CalendarCheck className="h-5 w-5 text-purple-500" />
  }, {
    title: "Intervalo entre Leads",
    value: metrics.averageTimeBetweenLeads,
    change: {
      value: "-3min",
      positive: true
    },
    positive: true,
    icon: <Clock className="h-5 w-5 text-amber-500" />
  }];

  // Function to calculate daily production total
  const calculateDailyTotal = () => {
    return dailyProduction.reduce((total, lead) => {
      const amount = parseFloat(lead.amount || "0");
      return isNaN(amount) ? total : total + amount;
    }, 0).toFixed(2);
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Última atualização: {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric, index) => <Card key={index} className="dashboard-card animate-fade-in overflow-hidden" style={{
        animationDelay: `${index * 0.1}s`
      }}>
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
                {metric.positive ? <TrendingUp className="ml-1 h-4 w-4" /> : <TrendingDown className="ml-1 h-4 w-4" />}
                <span className="ml-1 text-muted-foreground">desde ontem</span>
              </p>
            </CardContent>
          </Card>)}
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
            {isLoading ? <div className="flex items-center justify-center h-32 text-muted-foreground">
                Carregando...
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyProduction.length === 0 ? <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda registrada hoje
                        </TableCell>
                      </TableRow> : dailyProduction.map(lead => <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.product || "—"}</TableCell>
                          <TableCell className="text-right">
                            {lead.amount ? `R$ ${lead.amount}` : "—"}
                          </TableCell>
                        </TableRow>)}
                  </TableBody>
                </Table>
              </div>}
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
            {isLoading ? <div className="flex items-center justify-center h-32 text-muted-foreground">
                Carregando...
              </div> : <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionário</TableHead>
                      <TableHead className="text-center">Vendas</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeSales.length === 0 ? <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda por funcionário registrada
                        </TableCell>
                      </TableRow> : employeeSales.map(employee => <TableRow key={employee.employee}>
                          <TableCell className="font-medium">{employee.employee}</TableCell>
                          <TableCell className="text-center">{employee.count}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              <div className={`h-2 w-24 rounded-full bg-gray-200 mr-2 overflow-hidden`}>
                                <div className="h-full bg-green-500" style={{
                          width: `${Math.min(employee.count * 10, 100)}%`
                        }} />
                              </div>
                              {Math.min(employee.count * 10, 100)}%
                            </div>
                          </TableCell>
                        </TableRow>)}
                  </TableBody>
                </Table>
              </div>}
          </CardContent>
        </Card>
      </div>
      
      {/* Latest Leads Section */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-amber-500" />
            Últimos Leads Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex items-center justify-center h-32 text-muted-foreground">
              Carregando...
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestLeads.length === 0 ? <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum lead cadastrado recentemente
                      </TableCell>
                    </TableRow> : latestLeads.map(lead => <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.phone || "—"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                            ${lead.status === 'novo' ? 'bg-blue-100 text-blue-800' : lead.status === 'contatado' ? 'bg-purple-100 text-purple-800' : lead.status === 'qualificado' ? 'bg-amber-100 text-amber-800' : lead.status === 'negociando' ? 'bg-emerald-100 text-emerald-800' : lead.status === 'convertido' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{lead.createdAt}</TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>
    </div>;
};
export default Dashboard;