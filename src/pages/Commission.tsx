import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Lead,
  type Commission as CommissionType
} from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { getEmployees, Employee } from "@/utils/employees";

const Commission = () => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Partial<Lead>[]>([]);
  const [commissions, setCommissions] = useState<CommissionType[]>([]);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employees, setEmployees] = useState<string[]>([]);
  const [totalCommissionsPending, setTotalCommissionsPending] = useState(0);
  const [totalCommissionsApproved, setTotalCommissionsApproved] = useState(0);
  const [totalCommissionsPaid, setTotalCommissionsPaid] = useState(0);
  const { isPrivilegedUser } = useAuth();

  useEffect(() => {
    fetchCommissions();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isPrivilegedUser) {
      toast.success("Bem-vindo! Você tem acesso completo e vitalício ao sistema.", {
        duration: 5000,
      });
    }
  }, [isPrivilegedUser]);

  const fetchEmployees = async () => {
    try {
      const employeeList = await getEmployees();
      setEmployees(employeeList.map(employee => employee.name));
    } catch (error: any) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      let query = supabase
        .from("commissions")
        .select(`
          *,
          lead:lead_id (
            id, name, product, amount, status, employee, date, created_at
          )
        `)
        .eq("user_id", userData.user.id);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        let processedCommissions = data.map(item => {
          const commission = item as any;
          
          const amount = typeof commission.amount === 'number' ? commission.amount : 0;
          
          let commissionValue = 0;
          let percentageValue = 0;
          
          // Se existir commission_value na base, usar ele
          if (commission.commission_value !== undefined && commission.commission_value !== null) {
            commissionValue = Number(commission.commission_value) || 0;
          } else {
            // Calcular comissão padrão (5% se não tiver configuração específica)
            commissionValue = amount * 0.05; // 5% padrão
          }
          
          // Se existir percentage na base, usar ele
          if (commission.percentage !== undefined && commission.percentage !== null) {
            percentageValue = Number(commission.percentage) || 0;
          } else {
            percentageValue = 5; // 5% padrão
          }
          
          let leadData = commission.lead;
          if (leadData && typeof leadData.status === 'string') {
            leadData = {
              ...leadData,
              status: leadData.status as any
            };
          }
          
          return {
            ...commission,
            commission_value: commissionValue,
            percentage: percentageValue,
            lead: leadData,
            employee: commission.employee || leadData?.employee || 'Não informado'
          } as CommissionType;
        });

        // Filtrar por data do lead (não da comissão)
        if (dateFrom || dateTo) {
          processedCommissions = processedCommissions.filter(commission => {
            if (!commission.lead) return false;
            
            // Usar a data personalizada do lead, ou created_at como fallback
            const leadDateStr = commission.lead.date || commission.lead.created_at;
            if (!leadDateStr) return false;
            
            // Converter para data local sem problemas de timezone
            let leadDate;
            if (commission.lead.date) {
              // Se é uma data personalizada (formato YYYY-MM-DD), fazer parse manual
              const [year, month, day] = commission.lead.date.split('-');
              leadDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
              // Se é created_at, usar Date normal
              leadDate = new Date(leadDateStr);
            }
            
            if (dateFrom && leadDate < dateFrom) {
              return false;
            }
            
            if (dateTo) {
              const endDate = new Date(dateTo);
              endDate.setHours(23, 59, 59, 999);
              if (leadDate > endDate) {
                return false;
              }
            }
            
            return true;
          });
        }
        
        setCommissions(processedCommissions);
        
        const inProgressTotal = processedCommissions
          .filter(c => c.status === "in_progress")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);

        const pendingTotal = processedCommissions
          .filter(c => c.status === "pending")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const completedTotal = processedCommissions
          .filter(c => c.status === "completed" || c.status === "approved" || c.status === "paid")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const cancelledTotal = processedCommissions
          .filter(c => c.status === "cancelled")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
        setTotalCommissionsPending(pendingTotal);
        setTotalCommissionsApproved(completedTotal);
        setTotalCommissionsPaid(inProgressTotal);
      }
    } catch (error: any) {
      console.error("Error fetching commissions:", error);
      toast.error(`Erro ao carregar comissões: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchClick = () => {
    fetchCommissions();
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setEmployeeFilter("");
    setStatusFilter("");
    setSearch("");
  };

  const filteredCommissions = commissions.filter((commission) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      commission.lead?.name?.toLowerCase().includes(searchTerm) ||
      commission.product?.toLowerCase().includes(searchTerm) ||
      commission.status?.toLowerCase().includes(searchTerm) ||
      commission.payment_period?.toLowerCase().includes(searchTerm) ||
      commission.employee?.toLowerCase().includes(searchTerm) ||
      commission.lead?.employee?.toLowerCase().includes(searchTerm) ||
      String(commission.amount).toLowerCase().includes(searchTerm) ||
      String(commission.commission_value).toLowerCase().includes(searchTerm);
    
    // Filtro por funcionário/responsável
    const matchesEmployee = employeeFilter === "" || employeeFilter === "all" || 
      (commission.employee && commission.employee === employeeFilter) || 
      (commission.lead?.employee && commission.lead.employee === employeeFilter);
    
    // Filtro por status já é aplicado na query do banco
    
    return matchesSearch && matchesEmployee;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Em Andamento</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
      // Manter compatibilidade com status antigos
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateEmployeeTotals = () => {
    if (employeeFilter && employeeFilter !== "all") {
      const filteredByEmployee = commissions.filter(
        commission => commission.employee === employeeFilter || commission.lead?.employee === employeeFilter
      );
      
      const inProgress = filteredByEmployee
        .filter(c => c.status === "in_progress")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);

      const pending = filteredByEmployee
        .filter(c => c.status === "pending")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const completed = filteredByEmployee
        .filter(c => c.status === "completed" || c.status === "approved" || c.status === "paid")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const cancelled = filteredByEmployee
        .filter(c => c.status === "cancelled")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
      
      return { inProgress, pending, completed, cancelled };
    }
    
    return { 
      inProgress: totalCommissionsPaid, // reutilizando a variável existente
      pending: totalCommissionsPending,
      completed: totalCommissionsApproved, // reutilizando a variável existente
      cancelled: 0
    };
  };

  const employeeTotals = calculateEmployeeTotals();

  const generateCommissionsForLeads = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar todos os leads do usuário
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("status", "sold"); // Apenas leads vendidos

      if (leadsError) {
        throw leadsError;
      }

      if (!leadsData || leadsData.length === 0) {
        toast.info("Nenhum lead vendido encontrado para gerar comissões.");
        return;
      }

      // Buscar comissões existentes
      const { data: existingCommissions, error: commissionsError } = await supabase
        .from("commissions")
        .select("lead_id")
        .eq("user_id", userData.user.id);

      if (commissionsError) {
        throw commissionsError;
      }

      const existingLeadIds = new Set(existingCommissions?.map(c => c.lead_id) || []);

      // Filtrar leads que não possuem comissões
      const leadsWithoutCommissions = leadsData.filter(lead => !existingLeadIds.has(lead.id));

      if (leadsWithoutCommissions.length === 0) {
        toast.info("Todos os leads vendidos já possuem comissões.");
        return;
      }

      // Buscar taxas de comissão padrão
      const { data: commissionRates, error: ratesError } = await supabase
        .from("commission_rates")
        .select("*")
        .eq("active", true);

      if (ratesError) {
        throw ratesError;
      }

      // Criar comissões para os leads
      const commissionsToCreate = [];

              for (const lead of leadsWithoutCommissions) {
        // Buscar taxa de comissão para o produto do lead
        const rate = commissionRates?.find(r => r.product === lead.product);
        
        // Converter valor corretamente removendo caracteres não numéricos
        const cleanAmount = String(lead.amount).replace(/[^\d,]/g, '').replace(',', '.');
        const leadAmount = parseFloat(cleanAmount) || 0;
        
        let commissionValue = 0;
        let percentage = 0;

        if (rate && rate.percentage) {
          percentage = rate.percentage;
          commissionValue = (leadAmount * rate.percentage) / 100;
        } else {
          // Taxa padrão de 5% se não encontrar configuração específica
          percentage = 5;
          commissionValue = (leadAmount * 5) / 100;
        }

        commissionsToCreate.push({
          user_id: userData.user.id,
          lead_id: lead.id,
          amount: leadAmount,
          product: lead.product,
          status: 'in_progress',
          payment_period: 'monthly'
        });
      }

      if (commissionsToCreate.length > 0) {
        const { data: createdCommissions, error: createError } = await supabase
          .from("commissions")
          .insert(commissionsToCreate);

        if (createError) {
          throw createError;
        }

        toast.success(`${commissionsToCreate.length} comissões geradas com sucesso!`);
        
        // Recarregar dados
        fetchCommissions();
      }

    } catch (error: any) {
      console.error("Error generating commissions:", error);
      toast.error(`Erro ao gerar comissões: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestCommissions = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Criar algumas comissões de teste com diferentes status
      const testCommissions = [
        {
          user_id: userData.user.id,
          lead_id: null, // Comissão sem lead vinculado
          amount: 10000,
          product: 'Crédito Consignado',
          status: 'in_progress',
          payment_period: 'monthly'
        },
        {
          user_id: userData.user.id,
          lead_id: null,
          amount: 15000,
          product: 'Cartão Consignado',
          status: 'pending',
          payment_period: 'monthly'
        },
        {
          user_id: userData.user.id,
          lead_id: null,
          amount: 20000,
          product: 'Crédito Pessoal',
          status: 'completed',
          payment_period: 'monthly'
        },
        {
          user_id: userData.user.id,
          lead_id: null,
          amount: 8000,
          product: 'Refinanciamento',
          status: 'cancelled',
          payment_period: 'monthly'
        }
      ];

      const { data: createdCommissions, error: createError } = await supabase
        .from("commissions")
        .insert(testCommissions);

      if (createError) {
        throw createError;
      }

      toast.success("4 comissões de teste criadas com diferentes status!");
      fetchCommissions();

    } catch (error: any) {
      console.error("Error creating test commissions:", error);
      toast.error(`Erro ao criar comissões de teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderCommissionTable = () => {
    if (loading) {
      return <div className="text-center py-8">Carregando comissões...</div>;
    }

    if (commissions.length === 0) {
      return <div className="text-center py-8">Nenhuma comissão encontrada.</div>;
    }

    return (
      <Table>
        <TableCaption>Suas comissões e informações detalhadas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Data do Lead</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Valor da Venda</TableHead>
            <TableHead>Comissão</TableHead>
            <TableHead>Período de Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Funcionário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCommissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                Nenhuma comissão encontrada com os filtros aplicados.
              </TableCell>
            </TableRow>
          ) : (
            filteredCommissions.map((commission) => {
              // Formatear a data do lead
              const leadDateStr = commission.lead?.date || commission.lead?.created_at;
              const leadDateFormatted = leadDateStr ? 
                new Date(leadDateStr).toLocaleDateString('pt-BR') : '-';
              
              return (
                <TableRow key={commission.id}>
                  <TableCell>{commission.lead?.name}</TableCell>
                  <TableCell>{leadDateFormatted}</TableCell>
                  <TableCell>{commission.product}</TableCell>
                  <TableCell>R$ {commission.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>R$ {commission.commission_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{commission.payment_period}</TableCell>
                  <TableCell>{getStatusBadge(commission.status!)}</TableCell>
                  <TableCell>{commission.employee || commission.lead?.employee || "-"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8}>
              <div className="font-bold">Total Em Andamento: R$ {employeeTotals.inProgress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Total Pendente: R$ {employeeTotals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Total Concluído: R$ {employeeTotals.completed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Total Cancelado: R$ {employeeTotals.cancelled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };

  return (
    <PageLayout
      title="Comissões"
      subtitle="Acompanhe e gerencie as comissões do time"
    >
      <div className="space-y-8">
        <div className="mb-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
              <Input
                type="text"
                placeholder="Buscar comissões..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por funcionário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funcionários</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleSearchClick} variant="default" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            <div>
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateCommissionsForLeads} 
              variant="default" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Gerando..." : "🎯 Gerar Comissões dos Leads"}
            </Button>
            
            <Button 
              onClick={createTestCommissions} 
              variant="outline" 
              disabled={loading}
              className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              🧪 Criar Comissões de Teste
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Inicial do Lead
                <span className="text-xs text-gray-500 block">Filtra pela data do lead, não da comissão</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    size="sm"
                    className="p-4"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Final do Lead
                <span className="text-xs text-gray-500 block">Filtra pela data do lead, não da comissão</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={dateTo}
                    onSelect={setDateTo}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    size="sm"
                    className="p-4"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {renderCommissionTable()}
      </div>
    </PageLayout>
  );
};

export default Commission;
