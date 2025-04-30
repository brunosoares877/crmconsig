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
  Lead,
  Commission
} from "@/types/models";

const Commission = () => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Partial<Lead>[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [search, setSearch] = useState("");
  const [totalCommissionsPending, setTotalCommissionsPending] = useState(0);
  const [totalCommissionsApproved, setTotalCommissionsApproved] = useState(0);
  const [totalCommissionsPaid, setTotalCommissionsPaid] = useState(0);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for leads
      const leadsData: Partial<Lead>[] = [
        {
          id: "1",
          name: "João Silva",
          product: "Empréstimo Consignado",
          amount: "5000",
          status: "convertido",
          employee: "Maria Santos"
        },
        {
          id: "2",
          name: "Ana Oliveira",
          product: "Cartão de Crédito",
          amount: "1000",
          status: "convertido", 
          employee: "Carlos Mendes"
        },
        {
          id: "3",
          name: "Pedro Costa",
          product: "Empréstimo Pessoal",
          amount: "3000",
          status: "convertido",
          employee: "Fernanda Lima"
        }
      ];
      
      setLeads(leadsData);
      
      // Mock data for commissions
      const commissionsData: Commission[] = [
        {
          id: "1",
          lead_id: "1",
          user_id: "user1",
          amount: 5000,
          percentage: 2.5,
          commission_value: 125,
          product: "Empréstimo Consignado",
          payment_period: "Abril 2025",
          status: "pending",
          created_at: "2025-04-15T10:00:00Z",
          updated_at: "2025-04-15T10:00:00Z",
          lead: {
            id: "1",
            name: "João Silva",
            product: "Empréstimo Consignado",
            amount: "5000",
            status: "convertido",
            employee: "Maria Santos"
          }
        },
        {
          id: "2",
          lead_id: "2",
          user_id: "user1",
          amount: 1000,
          percentage: 3,
          commission_value: 30,
          product: "Cartão de Crédito",
          payment_period: "Março 2025",
          status: "approved",
          created_at: "2025-03-20T14:30:00Z",
          updated_at: "2025-03-22T09:15:00Z",
          lead: {
            id: "2",
            name: "Ana Oliveira",
            product: "Cartão de Crédito",
            amount: "1000",
            status: "convertido",
            employee: "Carlos Mendes"
          }
        },
        {
          id: "3",
          lead_id: "3",
          user_id: "user1",
          amount: 3000,
          percentage: 2,
          commission_value: 60,
          product: "Empréstimo Pessoal",
          payment_period: "Fevereiro 2025",
          status: "paid",
          payment_date: "2025-02-28T00:00:00Z",
          created_at: "2025-02-10T11:20:00Z",
          updated_at: "2025-02-28T16:45:00Z",
          lead: {
            id: "3",
            name: "Pedro Costa",
            product: "Empréstimo Pessoal",
            amount: "3000",
            status: "convertido",
            employee: "Fernanda Lima"
          }
        }
      ];
      
      setCommissions(commissionsData);
      
      // Calculate totals
      const pendingTotal = commissionsData
        .filter(c => c.status === "pending")
        .reduce((acc, curr) => acc + curr.commission_value, 0);
        
      const approvedTotal = commissionsData
        .filter(c => c.status === "approved")
        .reduce((acc, curr) => acc + curr.commission_value, 0);
        
      const paidTotal = commissionsData
        .filter(c => c.status === "paid")
        .reduce((acc, curr) => acc + curr.commission_value, 0);
      
      setTotalCommissionsPending(pendingTotal);
      setTotalCommissionsApproved(approvedTotal);
      setTotalCommissionsPaid(paidTotal);
      
    } catch (error) {
      console.error("Error fetching commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredCommissions = commissions.filter((commission) => {
    const searchTerm = search.toLowerCase();
    return (
      commission.lead?.name?.toLowerCase().includes(searchTerm) ||
      commission.product?.toLowerCase().includes(searchTerm) ||
      commission.status?.toLowerCase().includes(searchTerm) ||
      commission.payment_period?.toLowerCase().includes(searchTerm) ||
      commission.lead?.employee?.toLowerCase().includes(searchTerm) ||
      String(commission.amount).toLowerCase().includes(searchTerm) ||
      String(commission.commission_value).toLowerCase().includes(searchTerm)
    );
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

  const renderCommissionTable = () => {
    if (loading) {
      return <div>Carregando comissões...</div>;
    }

    if (commissions.length === 0) {
      return <div>Nenhuma comissão encontrada.</div>;
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
            <TableHead>Vendedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCommissions.map((commission) => (
            <TableRow key={commission.id}>
              <TableCell>{commission.lead?.name}</TableCell>
              <TableCell>{commission.product}</TableCell>
              <TableCell>R$ {commission.amount}</TableCell>
              <TableCell>R$ {commission.commission_value}</TableCell>
              <TableCell>{commission.payment_period}</TableCell>
              <TableCell>{getStatusBadge(commission.status!)}</TableCell>
              <TableCell>{commission.lead?.employee}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              <div className="font-bold">Total Pendente: R$ {totalCommissionsPending}</div>
              <div className="font-bold">Total Aprovado: R$ {totalCommissionsApproved}</div>
              <div className="font-bold">Total Pago: R$ {totalCommissionsPaid}</div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Comissões</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Pesquisar comissões..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {renderCommissionTable()}
    </div>
  );
};

export default Commission;
