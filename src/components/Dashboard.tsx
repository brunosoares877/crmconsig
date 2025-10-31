import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneCall, CalendarCheck, TrendingUp, TrendingDown, User, Search, BarChart3, DollarSign, Calendar, FileText, Clock, AlertTriangle, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday, startOfMonth, endOfMonth, differenceInMinutes, startOfWeek, endOfWeek } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MetricsCard from "@/components/dashboard/MetricsCard";
import ProductionCard from "@/components/dashboard/ProductionCard";
import EmployeePerformanceCard from "@/components/dashboard/EmployeePerformanceCard";
import LatestLeadsCard from "@/components/dashboard/LatestLeadsCard";
import { formatLeadDate } from "@/utils/dateUtils";
import { getEmployees, Employee } from "@/utils/employees";

function isUUID(str) {
  // Regex para UUID v4 padrão
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    leadsToday: 0,
    leadsThisMonth: 0,
    averageLeadsPerDay: 0,
    averageTimeBetweenLeads: "0min",
    monthlyProduction: 0,
    weeklyConversionRate: 0,
    proposalsDigitatedToday: 0,
    emAndamento: 0,
    emAndamentoValue: 0,
    pendente: 0,
    pendenteValue: 0,
    pago: 0,
    pagoValue: 0,
    cancelado: 0,
    canceladoValue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailyProduction, setDailyProduction] = useState([]);
  const [employeeSales, setEmployeeSales] = useState([]);
  const [latestLeads, setLatestLeads] = useState([]);
  const [employeeMap, setEmployeeMap] = useState<{ [id: string]: string }>({});
  const [employeeMapLoaded, setEmployeeMapLoaded] = useState(false);
  const [employeeSalesMap, setEmployeeSalesMap] = useState({});

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Get date ranges
        const today = new Date();
        const todayStart = startOfToday().toISOString();
        const todayEnd = endOfToday().toISOString();
        const monthStart = startOfMonth(today).toISOString();
        const monthEnd = endOfMonth(today).toISOString();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }).toISOString();

        // Get user ID once
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // Fetching metrics with optimized parallel queries

        // Execute all independent queries in parallel using Promise.all
        const [
          leadsTodayResult,
          leadsThisMonthResult,
          proposalsTodayResult,
          emAndamentoResult,
          pendenteResult,
          pagoResult,
          canceladoResult,
          monthLeadsResult,
          monthlyProductionResult,
          weeklyLeadsResult,
          weeklyConvertedResult,
          dailyDataResult,
          employeeDataResult,
          latestLeadsResult,
          statusLeadsResult
        ] = await Promise.all([
          // Count queries
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart).lte('created_at', todayEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .not('amount', 'is', null).neq('amount', '')
            .gte('created_at', todayStart).lte('created_at', todayEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('status', 'negociando').not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('status', 'pendente').not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('status', 'concluido').not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('status', 'cancelado').not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          // Data queries
          supabase.from('leads').select('created_at')
            .gte('created_at', monthStart).lte('created_at', monthEnd)
            .order('created_at', { ascending: true }),
          supabase.from('leads').select('amount')
            .not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .gte('created_at', weekStart).lte('created_at', weekEnd),
          supabase.from('leads').select('*', { count: 'exact', head: true })
            .eq('status', 'concluido')
            .gte('created_at', weekStart).lte('created_at', weekEnd),
          supabase.from('leads').select('*')
            .not('amount', 'is', null).neq('amount', '')
            .gte('created_at', todayStart).lte('created_at', todayEnd),
          supabase.from('leads').select('employee, amount, status, created_at')
            .eq('user_id', userId)
            .not('employee', 'is', null).not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd),
          supabase.from('leads').select('*')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(6),
          supabase.from('leads').select('status, amount')
            .not('amount', 'is', null).neq('amount', '')
            .gte('created_at', monthStart).lte('created_at', monthEnd)
        ]);

        // Extract results
        const leadsToday = leadsTodayResult.count || 0;
        const leadsThisMonth = leadsThisMonthResult.count || 0;
        const proposalsDigitatedToday = proposalsTodayResult.count || 0;
        const emAndamento = emAndamentoResult.count || 0;
        const pendente = pendenteResult.count || 0;
        const pago = pagoResult.count || 0;
        const cancelado = canceladoResult.count || 0;
        const monthLeads = monthLeadsResult.data || [];
        const monthlyLeadsWithAmount = monthlyProductionResult.data || [];
        const weeklyLeadsCount = weeklyLeadsResult.count || 0;
        const weeklyConvertedCount = weeklyConvertedResult.count || 0;
        const dailyData = dailyDataResult.data || [];
        const employeeData = employeeDataResult.data || [];
        const latestLeadsData = latestLeadsResult.data || [];
        const statusLeads = statusLeadsResult.data || [];

        // Calculate average time between leads
        let averageTimeBetweenLeads = "0min";
        if (monthLeads.length > 1) {
          let totalMinutesDiff = 0;
          let diffCount = 0;
          for (let i = 1; i < monthLeads.length; i++) {
            const prevDate = new Date(monthLeads[i - 1].created_at);
            const currentDate = new Date(monthLeads[i].created_at);
            const diffMinutes = differenceInMinutes(currentDate, prevDate);
            if (diffMinutes > 0 && diffMinutes < 1440) {
              totalMinutesDiff += diffMinutes;
              diffCount += 1;
            }
          }
          const avgMinutes = diffCount > 0 ? Math.round(totalMinutesDiff / diffCount) : 0;
          averageTimeBetweenLeads = `${avgMinutes}min`;
        }

        // Calculate average leads per day
        const daysPassed = Math.max(1, new Date().getDate());
        const averageLeadsPerDay = leadsThisMonth ? parseFloat((leadsThisMonth / daysPassed).toFixed(1)) : 0;

        // Calculate monthly production
        const monthlyProduction = monthlyLeadsWithAmount.reduce((total, lead) => {
          const cleanAmount = lead.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0";
          const amount = parseFloat(cleanAmount);
          return isNaN(amount) ? total : total + amount;
        }, 0);

        // Calculate weekly conversion rate
        const weeklyConversionRate = weeklyLeadsCount > 0 ? 
          ((weeklyConvertedCount || 0) / weeklyLeadsCount * 100) : 0;

        // Process employee data
        const employeeSalesMap: { [key: string]: { totalLeadsWithAmount: number; convertedSales: number; totalValue: number } } = {};
        employeeData.forEach(lead => {
          if (lead.employee && lead.amount) {
            if (!employeeSalesMap[lead.employee]) {
              employeeSalesMap[lead.employee] = {
                totalLeadsWithAmount: 0,
                convertedSales: 0,
                totalValue: 0
              };
            }
            const cleanAmount = lead.amount.replace(/[^\d,]/g, '').replace(',', '.') || "0";
            const amount = parseFloat(cleanAmount);
            if (!isNaN(amount)) {
              employeeSalesMap[lead.employee].totalLeadsWithAmount += 1;
              employeeSalesMap[lead.employee].totalValue += amount;
              if (lead.status === 'concluido') {
                employeeSalesMap[lead.employee].convertedSales += 1;
              }
            }
          }
        });

        // Calculate status sums
        const statusSums = {
          emAndamentoValue: 0,
          pendenteValue: 0,
          pagoValue: 0,
          canceladoValue: 0
        };
        statusLeads.forEach(lead => {
          const cleanAmount = lead.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0";
          const amount = parseFloat(cleanAmount);
          if (isNaN(amount)) return;
          if (lead.status === 'negociando') statusSums.emAndamentoValue += amount;
          if (lead.status === 'pendente') statusSums.pendenteValue += amount;
          if (lead.status === 'concluido') statusSums.pagoValue += amount;
          if (lead.status === 'cancelado') statusSums.canceladoValue += amount;
        });

        // Set state
        setDailyProduction(dailyData);
        setEmployeeSalesMap(employeeSalesMap);
        const formattedLatestLeads = latestLeadsData.map(lead => ({
          ...lead,
          createdAt: formatLeadDate((lead as any).date ? (lead as any).date : lead.created_at)
        }));
        setLatestLeads(formattedLatestLeads);

        // Update metrics
        setMetrics({
          leadsToday: leadsToday || 0,
          leadsThisMonth: leadsThisMonth || 0,
          averageLeadsPerDay: averageLeadsPerDay,
          averageTimeBetweenLeads: averageTimeBetweenLeads,
          monthlyProduction: monthlyProduction,
          weeklyConversionRate: weeklyConversionRate,
          proposalsDigitatedToday: proposalsDigitatedToday || 0,
          emAndamento: emAndamento || 0,
          emAndamentoValue: statusSums.emAndamentoValue,
          pendente: pendente || 0,
          pendenteValue: statusSums.pendenteValue,
          pago: pago || 0,
          pagoValue: statusSums.pagoValue,
          cancelado: cancelado || 0,
          canceladoValue: statusSums.canceladoValue
        });

        console.log("Updated metrics:", {
          leadsToday: leadsToday || 0,
          leadsThisMonth: leadsThisMonth || 0,
          averageLeadsPerDay: averageLeadsPerDay,
          averageTimeBetweenLeads: averageTimeBetweenLeads,
          monthlyProduction: monthlyProduction,
          weeklyConversionRate: weeklyConversionRate,
          proposalsDigitatedToday: proposalsDigitatedToday || 0,
          emAndamento: emAndamento || 0,
          emAndamentoValue: statusSums.emAndamentoValue,
          pendente: pendente || 0,
          pendenteValue: statusSums.pendenteValue,
          pago: pago || 0,
          pagoValue: statusSums.pagoValue,
          cancelado: cancelado || 0,
          canceladoValue: statusSums.canceladoValue
        });

      } catch (error) {
        console.error('Error fetching metrics:', error);
        toast.error("Erro ao carregar métricas do dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
    
    // Refresh metrics every 30 seconds for real-time updates
    const interval = setInterval(fetchMetrics, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Buscar funcionários ativos e montar o mapa id -> nome
    getEmployees().then((list: Employee[]) => {
      const map: { [id: string]: string } = {};
      list.forEach(emp => { map[emp.id] = emp.name; });
      setEmployeeMap(map);
      setEmployeeMapLoaded(true);
      console.log('Mapa de funcionários carregado:', map);
    });
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
      title: "Leads Hoje",
      value: metrics.leadsToday.toString(),
      subtitle: "",
      positive: true,
      icon: <Users className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700"
    }, {
      title: "Total de Leads",
      value: metrics.leadsThisMonth.toString(),
      subtitle: "",
      positive: true,
      icon: <PhoneCall className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-green-100",
      iconColor: "text-green-700"
    }, {
      title: "Propostas Digitadas",
      value: metrics.proposalsDigitatedToday.toString(),
      subtitle: "",
      positive: true,
      icon: <FileText className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-700"
    }, {
      title: "Em Andamento",
      value: metrics.emAndamento.toString(),
      valueTotal: metrics.emAndamentoValue,
      subtitle: "",
      positive: true,
      icon: <Clock className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-blue-500",
      iconColor: "text-white",
      statusFilter: "negociando",
      clickable: true
    }, {
      title: "Pendente",
      value: metrics.pendente.toString(),
      valueTotal: metrics.pendenteValue,
      subtitle: "",
      positive: true,
      icon: <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-yellow-400",
      iconColor: "text-white",
      statusFilter: "pendente",
      clickable: true
    }, {
      title: "Pago",
      value: metrics.pago.toString(),
      valueTotal: metrics.pagoValue,
      subtitle: "",
      positive: true,
      icon: <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-green-500",
      iconColor: "text-white",
      statusFilter: "concluido",
      clickable: true
    }, {
      title: "Cancelado",
      value: metrics.cancelado.toString(),
      valueTotal: metrics.canceladoValue,
      subtitle: "",
      positive: false,
      icon: <X className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-red-500",
      iconColor: "text-white",
      statusFilter: "cancelado",
      clickable: true
    }
  ];

  // Separe os três primeiros cards de métricas
  const mainMetrics = metricsData.slice(0, 3);
  const otherMetrics = metricsData.slice(3);

  const employeeSalesArray = useMemo(() => {
    return Object.entries(employeeSalesMap).map(([employeeId, data]) => {
      const d = data as any;
      // Buscar o nome do funcionário no mapa, ou usar o ID como fallback
      const employeeName = employeeMap[employeeId] || employeeId;
      return {
        employee: employeeName, // Exibe o nome do funcionário
        id: employeeId,
        count: d.totalLeadsWithAmount,
        convertedSales: d.convertedSales,
        totalValue: d.totalValue
      };
    });
  }, [employeeSalesMap, employeeMap]);

  // Sort by total value (highest first)
  employeeSalesArray.sort((a, b) => b.totalValue - a.totalValue);
  console.log("Employee sales array final:", employeeSalesArray);

  return (
    <div className="w-full px-2 sm:px-4 md:px-0 lg:px-0 space-y-4 sm:space-y-6">
      {/* Metrics Cards Grid (status cards no topo) */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {otherMetrics.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          <ProductionCard 
            dailyProduction={dailyProduction}
            isLoading={isLoading}
          />
          
          {/* Três principais cards de métricas abaixo do ProductionCard */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {mainMetrics.map((metric, index) => (
              <MetricsCard key={index} {...metric} />
            ))}
          </div>
        </div>
        
        <EmployeePerformanceCard 
          employeeSales={employeeSalesArray}
          isLoading={isLoading}
        />
      </div>
      
      {/* Latest Leads Full Width */}
      <div className="w-full">
        <LatestLeadsCard 
          latestLeads={latestLeads}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
