
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Award, Crown, Medal, Trophy } from "lucide-react";

interface EmployeePerformanceCardProps {
  employeeSales: any[];
  isLoading: boolean;
}

const EmployeePerformanceCard = ({ employeeSales, isLoading }: EmployeePerformanceCardProps) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-4 w-4" />;
      case 1: return <Trophy className="h-4 w-4" />;
      case 2: return <Medal className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getRankColors = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 shadow-yellow-200';
      case 1: return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-gray-200';
      case 2: return 'bg-gradient-to-br from-orange-400 to-orange-500 text-orange-900 shadow-orange-200';
      default: return 'bg-gradient-to-br from-blue-400 to-blue-500 text-blue-900 shadow-blue-200';
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 hover:shadow-xl transition-all duration-500 group overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full transform translate-x-12 -translate-y-12"></div>
      
      <CardHeader className="relative z-10">
        <div className="space-y-2">
          <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-3">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            Performance dos Funcionários
          </CardTitle>
          <p className="text-sm text-slate-600">
            Ranking por valor total de leads (vendas/convertidos)
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm font-medium">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {employeeSales.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-sm">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-medium">Nenhum lead com valor por funcionário registrado</p>
                <p className="text-xs text-slate-400 mt-1">O ranking aparecerá aqui</p>
              </div>
            ) : (
              employeeSales.slice(0, 5).map((employee, index) => (
                <div key={employee.employee} className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 hover:bg-white hover:shadow-md transition-all duration-300 group/item">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${getRankColors(index)}`}>
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover/item:text-blue-700 transition-colors">{employee.employee}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">#{index + 1} colocado</span>
                        {index < 3 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {index === 0 ? 'Ouro' : index === 1 ? 'Prata' : 'Bronze'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-blue-700 text-lg">R$ {employee.totalValue?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {employee.count || 0} leads / {employee.convertedSales || 0} vendas
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

export default EmployeePerformanceCard;
