import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneCall, CalendarCheck, TrendingUp, TrendingDown, User, Search, BarChart3, DollarSign, Calendar, FileText, CheckCircle } from "lucide-react";
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

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    leadsToday: 0,
    leadsThisMonth: 0,
    averageLeadsPerDay: 0,
    averageTimeBetweenLeads: "0min",
    monthlyProduction: 0,
    weeklyConversionRate: 0,
    proposalsDigitated: 0,
    conversionsValue: 0
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

        // Get week's date range
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString(); // Monday as start
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }).toISOString();

        console.log("Fetching dashboard metrics...");

        // Get leads created today
        const {
          count: leadsToday
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).gte('created_at', todayStart).lte('created_at', todayEnd);

        console.log("Leads today:", leadsToday);

        // Get leads created this month
        const {
          count: leadsThisMonth
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).gte('created_at', monthStart).lte('created_at', monthEnd);

        console.log("Leads this month:", leadsThisMonth);

        // Get proposals digitadas (leads que tem amount preenchido) do mês
        const {
          count: proposalsDigitated
        } = await supabase.from('leads')
          .select('*', { count: 'exact', head: true })
          .not('amount', 'is', null)
          .neq('amount', '')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

        console.log("Proposals digitadas this month:", proposalsDigitated);

        // Get conversões (leads convertidos) com valores do mês
        const {
          data: conversionsData,
          error: conversionsError
        } = await supabase.from('leads')
          .select('amount')
          .eq('status', 'convertido')
          .not('amount', 'is', null)
          .neq('amount', '')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

        if (conversionsError) {
          console.error('Error fetching conversions:', conversionsError);
        }

        // Calculate total conversions value
        const conversionsValue = conversionsData ? conversionsData.reduce((total, lead) => {
          const cleanAmount = lead.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0";
          const amount = parseFloat(cleanAmount);
          return isNaN(amount) ? total : total + amount;
        }, 0) : 0;

        console.log("Conversions value this month:", conversionsValue);

        // Get average time between leads (in minutes)
        const {
          data: monthLeads,
          error: monthLeadsError
        } = await supabase.from('leads').select('created_at').gte('created_at', monthStart).lte('created_at', monthEnd).order('created_at', {
          ascending: true
        });
        if (monthLeadsError) {
          console.error('Error fetching month leads:', monthLeadsError);
        }

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

        // Get monthly production (all leads with amount this month, regardless of status)
        const {
          data: monthlyLeadsWithAmount,
          error: monthlyError
        } = await supabase.from('leads')
          .select('amount')
          .not('amount', 'is', null)
          .neq('amount', '')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);
        
        if (monthlyError) {
          console.error('Error fetching monthly production:', monthlyError);
        }

        // Calculate total monthly production from all leads with amounts
        const monthlyProduction = monthlyLeadsWithAmount ? monthlyLeadsWithAmount.reduce((total, lead) => {
          const cleanAmount = lead.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0";
          const amount = parseFloat(cleanAmount);
          return isNaN(amount) ? total : total + amount;
        }, 0) : 0;

        console.log("Monthly production:", monthlyProduction);

        // Calculate weekly conversion rate
        const {
          count: weeklyLeadsCount
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).gte('created_at', weekStart).lte('created_at', weekEnd);

        const {
          count: weeklyConvertedCount
        } = await supabase.from('leads').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'convertido').gte('created_at', weekStart).lte('created_at', weekEnd);

        const weeklyConversionRate = weeklyLeadsCount && weeklyLeadsCount > 0 ? 
          ((weeklyConvertedCount || 0) / weeklyLeadsCount * 100) : 0;

        console.log("Weekly conversion rate:", weeklyConversionRate);

        // Fetch daily production data (all leads with amounts today, regardless of status)
        const {
          data: dailyData,
          error: dailyError
        } = await supabase.from('leads')
          .select('*')
          .not('amount', 'is', null)
          .neq('amount', '')
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd);
        if (dailyError) {
          console.error('Error fetching daily production:', dailyError);
          toast.error("Erro ao carregar produção diária");
        } else {
          console.log("Daily production data:", dailyData);
          setDailyProduction(dailyData || []);
        }

        // Fetch employee performance data (all leads with amounts and employees)
        const {
          data: employeeData,
          error: employeeError
        } = await supabase.from('leads')
          .select('employee, amount, status')
          .not('employee', 'is', null)
          .not('amount', 'is', null)
          .neq('amount', '')
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);
        
        if (employeeError) {
          console.error('Error fetching employee sales:', employeeError);
          toast.error("Erro ao carregar vendas por funcionário");
        } else {
          console.log("Employee data:", employeeData);
          // Process employee data to count total leads with amounts and converted sales per employee
          const employeeSalesMap = {};

          // Count all leads with amounts and converted sales per employee
          employeeData?.forEach(lead => {
            if (lead.employee && lead.amount) {
              if (!employeeSalesMap[lead.employee]) {
                employeeSalesMap[lead.employee] = {
                  totalLeadsWithAmount: 0,
                  convertedSales: 0,
                  totalValue: 0
                };
              }
              
              // Parse amount value
              const cleanAmount = lead.amount.replace(/[^\d,]/g, '').replace(',', '.') || "0";
              const amount = parseFloat(cleanAmount);
              
              if (!isNaN(amount)) {
                employeeSalesMap[lead.employee].totalLeadsWithAmount += 1;
                employeeSalesMap[lead.employee].totalValue += amount;
                
                if (lead.status === 'convertido') {
                  employeeSalesMap[lead.employee].convertedSales += 1;
                }
              }
            }
          });

          // Convert to array format for display
          const employeeSalesArray = Object.entries(employeeSalesMap).map(([employee, data]) => ({
            employee,
            count: (data as { totalLeadsWithAmount: number; convertedSales: number; totalValue: number }).totalLeadsWithAmount,
            convertedSales: (data as { totalLeadsWithAmount: number; convertedSales: number; totalValue: number }).convertedSales,
            totalValue: (data as { totalLeadsWithAmount: number; convertedSales: number; totalValue: number }).totalValue
          }));

          // Sort by total value (highest first)
          employeeSalesArray.sort((a, b) => b.totalValue - a.totalValue);
          console.log("Employee sales array:", employeeSalesArray);
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
          console.log("Latest leads:", formattedLatestLeads);
          setLatestLeads(formattedLatestLeads);
        }

        // Update metrics
        setMetrics({
          leadsToday: leadsToday || 0,
          leadsThisMonth: leadsThisMonth || 0,
          averageLeadsPerDay: averageLeadsPerDay,
          averageTimeBetweenLeads: averageTimeBetweenLeads,
          monthlyProduction: monthlyProduction,
          weeklyConversionRate: weeklyConversionRate,
          proposalsDigitated: proposalsDigitated || 0,
          conversionsValue: conversionsValue
        });

        console.log("Updated metrics:", {
          leadsToday: leadsToday || 0,
          leadsThisMonth: leadsThisMonth || 0,
          averageLeadsPerDay: averageLeadsPerDay,
          averageTimeBetweenLeads: averageTimeBetweenLeads,
          monthlyProduction: monthlyProduction,
          weeklyConversionRate: weeklyConversionRate,
          proposalsDigitated: proposalsDigitated || 0,
          conversionsValue: conversionsValue
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
      change: calculateChange(metrics.leadsToday, metrics.leadsToday - 2),
      subtitle: `Comparado com ontem`,
      positive: true,
      icon: <Users className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600"
    }, {
      title: "Total de Leads",
      value: metrics.leadsThisMonth.toString(),
      change: calculateChange(metrics.leadsThisMonth, metrics.leadsThisMonth - 5),
      subtitle: `Leads do mês atual`,
      positive: true,
      icon: <PhoneCall className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600"
    }, {
      title: "Propostas Digitadas",
      value: metrics.proposalsDigitated.toString(),
      change: calculateChange(metrics.proposalsDigitated, metrics.proposalsDigitated - 3),
      subtitle: `Clientes com propostas no mês`,
      positive: true,
      icon: <FileText className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600"
    }, {
      title: "Conversões",
      value: `R$ ${metrics.conversionsValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: calculateChange(metrics.conversionsValue, metrics.conversionsValue - 1000),
      subtitle: `Valor convertido no mês`,
      positive: true,
      icon: <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600"
    }, {
      title: "Produção Mensal",
      value: `R$ ${metrics.monthlyProduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: calculateChange(metrics.monthlyProduction, metrics.monthlyProduction - 5000),
      subtitle: `Total vendido no mês`,
      positive: true,
      icon: <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <div className="w-full px-0 md:px-0 lg:px-0 space-y-6">
      {/* Metrics Cards Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
        {metricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProductionCard 
          dailyProduction={dailyProduction}
          isLoading={isLoading}
        />
        
        <EmployeePerformanceCard 
          employeeSales={employeeSales}
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
