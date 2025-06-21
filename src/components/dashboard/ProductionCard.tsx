
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddMockLeads } from "@/hooks/useAddMockLeads";

interface ProductionCardProps {
  dailyProduction: any[];
  isLoading: boolean;
}

const ProductionCard = ({ dailyProduction, isLoading }: ProductionCardProps) => {
  const { addProductionLeads } = useAddMockLeads();

  const calculateDailyTotal = () => {
    return dailyProduction.reduce((total, lead) => {
      const cleanAmount = lead.amount?.replace(/[^\d,]/g, '').replace(',', '.') || "0";
      const amount = parseFloat(cleanAmount);
      return isNaN(amount) ? total : total + amount;
    }, 0).toFixed(2);
  };

  const handleAddProduction = async () => {
    await addProductionLeads();
    // Recarregar página para ver os novos valores
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-emerald-50/30 to-green-50/20 hover:shadow-xl transition-all duration-500 group overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
      
      <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-pulse"></div>
            Produção Diária
            <Sparkles className="h-4 w-4 text-emerald-500 group-hover:animate-spin" />
          </CardTitle>
          <p className="text-sm text-slate-600">
            Leads com valores hoje
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            R$ {calculateDailyTotal()}
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span className="font-medium">Total hoje</span>
          </div>
          {/* Botão temporário para adicionar produção */}
          <Button
            onClick={handleAddProduction}
            size="sm"
            variant="outline"
            className="mt-2 bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600"
          >
            <Plus className="h-3 w-3 mr-1" />
            Aumentar Produção
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent"></div>
              <span className="text-sm font-medium">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {dailyProduction.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="font-medium">Nenhum lead com valor registrado hoje</p>
                <p className="text-xs text-slate-400 mt-1">Os leads com valores aparecerão aqui</p>
              </div>
            ) : (
              dailyProduction.slice(0, 5).map((lead, index) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-emerald-100/50 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover/item:text-emerald-700 transition-colors">{lead.name}</p>
                      <p className="text-sm text-slate-600 truncate">{lead.product || "—"}</p>
                      <p className="text-xs text-slate-500">Status: {lead.status}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-emerald-700 text-lg">
                      {lead.amount ? `R$ ${lead.amount}` : "—"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionCard;
