
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    positive: boolean;
  };
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const MetricsCard = ({ title, value, change, subtitle, icon, iconBg, iconColor }: MetricsCardProps) => {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-medium text-slate-600 truncate">
          {title}
        </CardTitle>
        <div className={`p-1.5 md:p-2 ${iconBg} rounded-lg ${iconColor} shrink-0`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 leading-none">
          {value}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${
            change.positive 
              ? 'text-emerald-700 bg-emerald-50' 
              : 'text-red-700 bg-red-50'
          }`}>
            {change.value}
            {change.positive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
          </span>
          <span className="text-slate-500 text-xs truncate">{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
