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
  
  // Definir gradientes modernos baseados no iconBg
  const getCardStyle = () => {
    switch (iconBg) {
      case 'bg-blue-500':
        return 'bg-gradient-to-br from-blue-500/90 via-blue-600/80 to-indigo-700/90';
      case 'bg-yellow-400':
        return 'bg-gradient-to-br from-yellow-400/90 via-orange-500/80 to-red-500/90';
      case 'bg-green-500':
        return 'bg-gradient-to-br from-green-500/90 via-emerald-600/80 to-teal-700/90';
      case 'bg-red-500':
        return 'bg-gradient-to-br from-red-500/90 via-pink-600/80 to-rose-700/90';
      case 'bg-blue-100':
        return 'bg-gradient-to-br from-white via-blue-50/80 to-indigo-100/60';
      case 'bg-green-100':
        return 'bg-gradient-to-br from-white via-green-50/80 to-emerald-100/60';
      case 'bg-orange-100':
        return 'bg-gradient-to-br from-white via-orange-50/80 to-yellow-100/60';
      default:
        return 'bg-gradient-to-br from-white via-blue-50/80 to-indigo-100/60';
    }
  };

  const isStatusCard = ['bg-yellow-400', 'bg-blue-500', 'bg-green-500', 'bg-red-500'].includes(iconBg);
  const cardBg = getCardStyle();
  const textColor = isStatusCard ? 'text-white' : 'text-gray-900';
  const subtitleColor = isStatusCard ? 'text-white/80' : 'text-gray-600';
  const valueColor = isStatusCard ? 'text-white' : 'text-gray-900';

  const handleCardClick = () => {
    if (clickable && statusFilter) {
      navigate(`/leads?status=${statusFilter}`);
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 ${
        clickable ? 'cursor-pointer' : ''
      } ${cardBg}`}
      onClick={handleCardClick}
    >
      {/* Background decorativo com padrões */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full bg-repeat" 
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", 
            backgroundSize: "20px 20px"
          }} 
        />
      </div>
      
      {/* Elementos decorativos flutuantes */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className={`text-sm sm:text-base font-semibold ${textColor} leading-tight`}>
          {title}
        </CardTitle>
        <div className={`p-2 sm:p-3 ${iconBg} rounded-xl ${iconColor} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 backdrop-blur-sm border border-white/20`}>
          {icon}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-4 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
          {/* Valor principal */}
          {typeof valueTotal === 'number' && (
            <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${valueColor} leading-tight tracking-tight`}>
              {valueTotal.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </div>
          )}
          
          {/* Quantidade de contratos */}
          <div className="flex items-center gap-2">
            <span className={`text-lg sm:text-xl font-bold ${valueColor}`}>
              {value}
            </span>
            <span className={`text-xs sm:text-sm font-medium ${subtitleColor} px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm`}>
              contratos
            </span>
          </div>
          
          {/* Indicador de mudança e subtítulo */}
          <div className="flex items-center justify-between mt-3 sm:mt-4">
            {change && (
              <div className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm border ${
                change.positive 
                  ? 'bg-emerald-500/20 text-emerald-100 border-emerald-300/30' 
                  : 'bg-red-500/20 text-red-100 border-red-300/30'
              }`}>
                {change.value}
                {change.positive ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </div>
            )}
            
            {subtitle && (
              <span className={`text-xs sm:text-sm ${subtitleColor} font-medium`}>
                {subtitle}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      {/* Click indicator para cards clicáveis */}
      {clickable && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
        </div>
      )}
    </Card>
  );
};

export default MetricsCard;
