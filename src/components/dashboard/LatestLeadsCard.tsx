
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";

interface LatestLeadsCardProps {
  latestLeads: any[];
  isLoading: boolean;
}

const LatestLeadsCard = ({ latestLeads, isLoading }: LatestLeadsCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'novo': { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Novo' },
      'contatado': { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Contatado' },
      'qualificado': { bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Qualificado' },
      'negociando': { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Negociando' },
      'convertido': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Convertido' },
      'perdido': { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Perdido' }
    };
    
    const config = statusConfig[status] || statusConfig['novo'];
    return <Badge variant="secondary" className={`${config.bg} border font-medium`}>{config.label}</Badge>;
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            Últimos Leads
          </CardTitle>
          <p className="text-sm text-slate-600">
            Leads cadastrados recentemente
          </p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200">
                  <TableHead className="text-slate-600 font-medium">Nome</TableHead>
                  <TableHead className="text-slate-600 font-medium hidden sm:table-cell">Telefone</TableHead>
                  <TableHead className="text-slate-600 font-medium">Status</TableHead>
                  <TableHead className="text-right text-slate-600 font-medium">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>Nenhum lead cadastrado recentemente</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  latestLeads.map(lead => (
                    <TableRow key={lead.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
                      <TableCell className="text-slate-600 hidden sm:table-cell">{lead.phone || "—"}</TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-sm">{lead.createdAt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestLeadsCard;
