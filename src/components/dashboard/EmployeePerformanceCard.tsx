
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Award } from "lucide-react";

interface EmployeePerformanceCardProps {
  employeeSales: any[];
  isLoading: boolean;
}

const EmployeePerformanceCard = ({ employeeSales, isLoading }: EmployeePerformanceCardProps) => {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Performance dos Funcionários
          </CardTitle>
          <p className="text-sm text-slate-600">
            Vendas por funcionário
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {employeeSales.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-400" />
                </div>
                <p>Nenhuma venda por funcionário registrada</p>
              </div>
            ) : (
              employeeSales.slice(0, 5).map((employee, index) => (
                <div key={employee.employee} className="flex items-center justify-between p-3 bg-white/80 rounded-xl border border-blue-100 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {index < 3 ? <Award className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{employee.employee}</p>
                      <p className="text-xs text-slate-500">#{index + 1} colocado</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-blue-700">{employee.count}</p>
                    <p className="text-xs text-slate-500">vendas</p>
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
