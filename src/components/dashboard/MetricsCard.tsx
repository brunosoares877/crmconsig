import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MetricsCardProps {
  title: string;
  value: string;
  valueTotal?: number;
  change?: {
    value: string;
    positive: boolean;
  };
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  statusFilter?: string;
  clickable?: boolean;
}

const MetricsCard = ({ 
  title, 
  value, 
  valueTotal, 
  change, 
  subtitle, 
  icon, 
  iconBg, 
  iconColor,
  statusFilter,
  clickable = false
}: MetricsCardProps) => {
  const navigate = useNavigate();
  
  // Definir cor de fundo especial para status (tons mais vivos)
  const statusBg = [
    'bg-yellow-400', // pendente
    'bg-blue-500',  // em andamento
    'bg-green-500', // pago
    'bg-red-500'    // cancelado
  ];
  // Se o iconBg for uma dessas, aplica no card
  const cardBg = statusBg.includes(iconBg) ? iconBg : 'bg-gradient-to-br from-white via-white to-blue-50/30';

  const handleCardClick = () => {
    if (clickable && statusFilter) {
      navigate(`/leads?status=${statusFilter}`);
    }
  };

  return (
    <Card 
      className={`metrics-card relative overflow-hidden border-0 shadow-lg ${cardBg} hover:shadow-xl transition-all duration-500 group hover:scale-[1.02] ${
        clickable ? 'cursor-pointer' : ''
      } min-h-[120px] sm:min-h-[140px] md:min-h-[160px]`}
      onClick={handleCardClick}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent opacity-50 rounded-full transform translate-x-8 -translate-y-8"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 truncate pr-2">
          {title}
        </CardTitle>
        <div className={`p-1.5 sm:p-2 md:p-2.5 ${iconBg} rounded-xl text-white shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
        <div className="flex flex-col items-start w-full">
          {typeof valueTotal === 'number' && (
            <span className="metrics-value text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-extrabold text-slate-900 leading-none tracking-tight break-all word-break-all overflow-wrap-anywhere">
              {valueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          )}
          <span className="text-xs sm:text-sm md:text-base font-semibold text-slate-700 mt-1">
            {value}
            <span className="ml-1 text-xs font-normal text-slate-500">contratos</span>
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-wrap">
          {change && (
            <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
              change.positive 
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                : 'text-red-700 bg-red-50 border border-red-200'
            }`}>
              {change.value}
              {change.positive ? (
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              )}
            </span>
          )}
          <span className="text-slate-500 text-xs truncate flex-1 min-w-0">{subtitle}</span>
        </div>
      </CardContent>
      
      {/* Hover effect gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Card>
  );
};

export default MetricsCard;
