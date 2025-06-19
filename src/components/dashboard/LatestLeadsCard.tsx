
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight, Sparkles } from "lucide-react";

interface LatestLeadsCardProps {
  latestLeads: any[];
  isLoading: boolean;
}

const LatestLeadsCard = ({ latestLeads, isLoading }: LatestLeadsCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'novo': { 
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-blue-100', 
        label: 'Novo',
        icon: '🔵'
      },
      'contatado': { 
        bg: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200 shadow-purple-100', 
        label: 'Contatado',
        icon: '📞'
      },
      'qualificado': { 
        bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200 shadow-yellow-100', 
        label: 'Qualificado',
        icon: '⭐'
      },
      'negociando': { 
        bg: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200 shadow-orange-100', 
        label: 'Negociando',
        icon: '🤝'
      },
      'convertido': { 
        bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200 shadow-emerald-100', 
        label: 'Convertido',
        icon: '✅'
      },
      'perdido': { 
        bg: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200 shadow-red-100', 
        label: 'Perdido',
        icon: '❌'
      }
    };
    
    const config = statusConfig[status] || statusConfig['novo'];
    return (
      <Badge variant="secondary" className={`${config.bg} border font-semibold shadow-sm px-3 py-1 rounded-full`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-slate-50/30 to-gray-50/20 hover:shadow-xl transition-all duration-500 group overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-slate-100/50 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
      
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <div className="w-2 h-2 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full animate-pulse"></div>
            Últimos Leads
            <Sparkles className="h-4 w-4 text-slate-500 group-hover:animate-bounce" />
          </CardTitle>
          <p className="text-sm text-slate-600">
            Leads cadastrados recentemente
          </p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 hover:bg-slate-50 border-slate-300 rounded-xl">
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-600 border-t-transparent"></div>
              <span className="text-sm font-medium">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200/60 bg-slate-50/80">
                  <TableHead className="text-slate-700 font-semibold text-sm py-4">Nome</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-sm hidden sm:table-cell">Telefone</TableHead>
                  <TableHead className="text-slate-700 font-semibold text-sm">Status</TableHead>
                  <TableHead className="text-right text-slate-700 font-semibold text-sm">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                        <Clock className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="font-medium">Nenhum lead cadastrado recentemente</p>
                      <p className="text-xs text-slate-400 mt-1">Novos leads aparecerão aqui</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  latestLeads.map((lead, index) => (
                    <TableRow key={lead.id} className="border-slate-100/60 hover:bg-slate-50/50 transition-colors group/row">
                      <TableCell className="font-semibold text-slate-900 py-4 group-hover/row:text-blue-700 transition-colors">
                        {lead.name}
                      </TableCell>
                      <TableCell className="text-slate-600 hidden sm:table-cell">
                        {lead.phone || "—"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-sm font-medium">
                        {lead.createdAt}
                      </TableCell>
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
