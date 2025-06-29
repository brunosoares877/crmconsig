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
        return 'bg-gradient-to-br from-blue-50/80 via-blue-100/60 to-blue-200/40';
      case 'bg-yellow-400':
        return 'bg-gradient-to-br from-yellow-50/80 via-yellow-100/60 to-orange-200/40';
      case 'bg-green-500':
        return 'bg-gradient-to-br from-green-50/80 via-green-100/60 to-emerald-200/40';
      case 'bg-red-500':
        return 'bg-gradient-to-br from-red-50/80 via-red-100/60 to-pink-200/40';
      case 'bg-blue-100':
        return 'bg-gradient-to-br from-white via-blue-50/60 to-blue-100/30';
      case 'bg-green-100':
        return 'bg-gradient-to-br from-white via-green-50/60 to-green-100/30';
      case 'bg-orange-100':
        return 'bg-gradient-to-br from-white via-orange-50/60 to-orange-100/30';
      default:
        return 'bg-gradient-to-br from-white via-slate-50/60 to-slate-100/30';
    }
  };

  const isStatusCard = ['bg-yellow-400', 'bg-blue-500', 'bg-green-500', 'bg-red-500'].includes(iconBg);
  const cardBg = getCardStyle();
  const textColor = 'text-gray-800';
  const subtitleColor = 'text-gray-600';
  const valueColor = 'text-gray-900';

  const handleCardClick = () => {
    if (clickable && statusFilter) {
      navigate(`/leads?status=${statusFilter}`);
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
        clickable ? 'cursor-pointer' : ''
      } ${cardBg}`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 p-6">
        <div className="space-y-1">
          <CardTitle className={`text-sm font-medium ${textColor}`}>
            {title}
          </CardTitle>
          <div className={`text-2xl font-bold ${valueColor}`}>
            {typeof valueTotal === 'number' ? (
              <div className="space-y-1">
                <div>
                  {valueTotal.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  })}
                </div>
                <div className="text-sm text-gray-500 font-normal">
                  {value} {value === '1' ? 'contrato' : 'contratos'}
                </div>
              </div>
            ) : (
              value
            )}
          </div>
        </div>
        <div className={`p-3 ${iconBg} rounded-lg ${iconColor} shadow-sm`}>
          {icon}
        </div>
      </CardHeader>
      
      {/* Click indicator para cards clicáveis */}
      {clickable && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
      )}
    </Card>
  );
};

export default MetricsCard;
