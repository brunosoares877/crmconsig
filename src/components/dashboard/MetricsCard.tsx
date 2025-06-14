
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
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white via-white to-blue-50/30 hover:shadow-xl transition-all duration-500 group hover:scale-[1.02]">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent opacity-50 rounded-full transform translate-x-8 -translate-y-8"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-slate-600 truncate">
          {title}
        </CardTitle>
        <div className={`p-2.5 ${iconBg} rounded-xl ${iconColor} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-none tracking-tight">
          {value}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            change.positive 
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
              : 'text-red-700 bg-red-50 border border-red-200'
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
      
      {/* Hover effect gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Card>
  );
};

export default MetricsCard;
