
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ProductionCardProps {
  dailyProduction: any[];
  isLoading: boolean;
}

const ProductionCard = ({ dailyProduction, isLoading }: ProductionCardProps) => {
  const calculateDailyTotal = () => {
    return dailyProduction.reduce((total, lead) => {
      const amount = parseFloat(lead.amount || "0");
      return isNaN(amount) ? total : total + amount;
    }, 0).toFixed(2);
  };

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Produção Diária
          </CardTitle>
          <p className="text-sm text-slate-600">
            Vendas realizadas hoje
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl lg:text-3xl font-bold text-emerald-600">
            R$ {calculateDailyTotal()}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            <span>Total hoje</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {dailyProduction.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-slate-400" />
                </div>
                <p>Nenhuma venda registrada hoje</p>
              </div>
            ) : (
              dailyProduction.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-emerald-100 hover:bg-white transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{lead.name}</p>
                    <p className="text-sm text-slate-600 truncate">{lead.product || "—"}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-emerald-700">
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
