
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
  Lead,
  type Commission as CommissionType
} from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Commission = () => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Partial<Lead>[]>([]);
  const [commissions, setCommissions] = useState<CommissionType[]>([]);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [employees, setEmployees] = useState<string[]>([]);
  const [totalCommissionsPending, setTotalCommissionsPending] = useState(0);
  const [totalCommissionsApproved, setTotalCommissionsApproved] = useState(0);
  const [totalCommissionsPaid, setTotalCommissionsPaid] = useState(0);

  useEffect(() => {
    fetchCommissions();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("employee")
        .not("employee", "is", null)
        .order("employee");

      if (error) throw error;

      if (data) {
        // Get unique employee names and filter out any null or empty values
        const uniqueEmployees = [...new Set(data.map(item => item.employee).filter(Boolean))];
        setEmployees(uniqueEmployees);
      }
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
      
      const { data, error } = await supabase
        .from("commissions")
        .select(`
          *,
          lead:lead_id (
            id, name, product, amount, status, employee
          )
        `)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Ensure commission_value exists in all commissions
        const processedCommissions = data.map(commission => ({
          ...commission,
          commission_value: commission.commission_value || (commission.amount * (commission.percentage || 0) / 100)
        })) as CommissionType[];
        
        setCommissions(processedCommissions);
        
        // Calculate totals
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
    
    // Filter by employee if an employee filter is selected
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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Comissões</h1>

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <div>
          <Input
            type="text"
            placeholder="Pesquisar comissões..."
            value={search}
            onChange={handleSearch}
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
                <SelectItem key={employee} value={employee || "unknown"}>
                  {employee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderCommissionTable()}
    </div>
  );
};

export default Commission;
