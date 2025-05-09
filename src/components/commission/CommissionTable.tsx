
import React from "react";
import { Badge } from "@/components/ui/badge";
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
import { Commission } from "@/types/models";

interface CommissionTableProps {
  loading: boolean;
  commissions: Commission[];
  filteredCommissions: Commission[];
  employeeTotals: {
    pending: number;
    approved: number;
    paid: number;
  };
}

const CommissionTable = ({
  loading,
  commissions,
  filteredCommissions,
  employeeTotals
}: CommissionTableProps) => {

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

export default CommissionTable;
