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
import { Calendar } from "@/components/ui/calendar";
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
            id, name, product, amount, status, employee
          )
        `)
        .eq("user_id", userData.user.id);

      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDate.toISOString());
      }

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const processedCommissions = data.map(item => {
          const commission = item as any;
          
          const amount = typeof commission.amount === 'number' ? commission.amount : 0;
          
          let commissionValue = 0;
          let percentageValue = 0;
          
          if ('commission_value' in commission) {
            commissionValue = Number(commission.commission_value) || 0;
          } else {
            if ('percentage' in commission) {
              percentageValue = Number(commission.percentage) || 0;
              commissionValue = amount * (percentageValue / 100);
            }
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
            lead: leadData
          } as CommissionType;
        });
        
        setCommissions(processedCommissions);
        
        const pendingTotal = processedCommissions
          .filter(c => c.status === "pending")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const approvedTotal = processedCommissions
          .filter(c => c.status === "approved")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const paidTotal = processedCommissions
          .filter(c => c.status === "paid")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
        setTotalCommissionsPending(pendingTotal);
        setTotalCommissionsApproved(approvedTotal);
        setTotalCommissionsPaid(paidTotal);
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
    
    const matchesEmployee = employeeFilter === "" || employeeFilter === "all" || 
      commission.employee === employeeFilter || 
      commission.lead?.employee === employeeFilter;
    
    return matchesSearch && matchesEmployee;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Aprovado</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Pago</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateEmployeeTotals = () => {
    if (employeeFilter && employeeFilter !== "all") {
      const filteredByEmployee = commissions.filter(
        commission => commission.employee === employeeFilter || commission.lead?.employee === employeeFilter
      );
      
      const pending = filteredByEmployee
        .filter(c => c.status === "pending")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const approved = filteredByEmployee
        .filter(c => c.status === "approved")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const paid = filteredByEmployee
        .filter(c => c.status === "paid")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
      
      return { pending, approved, paid };
    }
    
    return { 
      pending: totalCommissionsPending,
      approved: totalCommissionsApproved,
      paid: totalCommissionsPaid
    };
  };

  const employeeTotals = calculateEmployeeTotals();

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
              <TableCell colSpan={7} className="text-center py-8">
                Nenhuma comissão encontrada com os filtros aplicados.
              </TableCell>
            </TableRow>
          ) : (
            filteredCommissions.map((commission) => (
              <TableRow key={commission.id}>
                <TableCell>{commission.lead?.name}</TableCell>
                <TableCell>{commission.product}</TableCell>
                <TableCell>R$ {commission.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>R$ {commission.commission_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{commission.payment_period}</TableCell>
                <TableCell>{getStatusBadge(commission.status!)}</TableCell>
                <TableCell>{commission.employee || commission.lead?.employee || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>
              <div className="font-bold">Total Pendente: R$ {employeeTotals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Total Aprovado: R$ {employeeTotals.approved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Total Pago: R$ {employeeTotals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
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
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
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
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Data Inicial</label>
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
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Data Final</label>
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
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
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
