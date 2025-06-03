
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PhoneCall, CalendarCheck, TrendingUp, TrendingDown, User, Search, BarChart3, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfToday, endOfToday, startOfMonth, endOfMonth, differenceInMinutes } from "date-fns";
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
    monthlyProduction: 0
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

        // Get monthly production (all converted leads this month)
        const {
          data: monthlyConvertedLeads,
          error: monthlyError
        } = await supabase.from('leads').select('amount').eq('status', 'convertido').gte('updated_at', monthStart).lte('updated_at', monthEnd);
        
        if (monthlyError) {
          console.error('Error fetching monthly production:', monthlyError);
        }

        // Calculate total monthly production
        const monthlyProduction = monthlyConvertedLeads ? monthlyConvertedLeads.reduce((total, lead) => {
          const amount = parseFloat(lead.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0");
          return isNaN(amount) ? total : total + amount;
        }, 0) : 0;

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
          averageTimeBetweenLeads: averageTimeBetweenLeads,
          monthlyProduction: monthlyProduction
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
    title: "Produção Mensal",
    value: `R$ ${metrics.monthlyProduction.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    change: calculateChange(metrics.monthlyProduction, metrics.monthlyProduction - 5000),
    subtitle: `Total vendido no mês`,
    positive: true,
    icon: <DollarSign className="h-4 w-4 lg:h-5 lg:w-5" />,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600"
  }, {
    title: "Conversão",
    value: "12%",
    change: {
      value: "+2.1%",
      positive: true
    },
    subtitle: `Taxa de conversão`,
    positive: true,
    icon: <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5" />,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600"
  }];

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {metricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
      <LatestLeadsCard 
        latestLeads={latestLeads}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
