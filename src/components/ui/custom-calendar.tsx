import React from "react";
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  highlightedDates?: Date[];
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({
  selected,
  onSelect,
  currentMonth,
  onMonthChange,
  highlightedDates = [],
  className,
  size = "md"
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = new Date();
  
  // Calcular quantos dias tem no mês
  const daysInMonth = getDaysInMonth(currentMonth);
  
  // Calcular o primeiro dia da semana do mês (0 = domingo, 1 = segunda, etc.)
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  
  // Array com os nomes dos dias da semana
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Criar array com todos os dias para renderizar
  const days = [];
  
  // Adicionar espaços vazios antes do primeiro dia
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Adicionar todos os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  // Função para verificar se um dia está destacado
  const isHighlighted = (day: number) => {
    const date = new Date(year, month, day);
    return highlightedDates.some(highlightedDate => 
      isSameDay(startOfDay(date), startOfDay(highlightedDate))
    );
  };
  
  // Função para verificar se é o dia selecionado
  const isSelected = (day: number) => {
    if (!selected) return false;
    const date = new Date(year, month, day);
    return isSameDay(date, selected);
  };
  
  // Função para verificar se é hoje
  const isToday = (day: number) => {
    const date = new Date(year, month, day);
    return isSameDay(date, today);
  };
  
  // Função para selecionar um dia
  const selectDay = (day: number) => {
    const date = new Date(year, month, day);
    onSelect?.(date);
  };
  
  // Tamanhos responsivos baseados na prop size
  const sizes = {
    sm: {
      daySize: "h-8 w-8 text-xs",
      gap: "gap-1",
      headerText: "text-sm",
      dayNameText: "text-xs"
    },
    md: {
      daySize: "h-10 w-10 text-sm",
      gap: "gap-2", 
      headerText: "text-lg",
      dayNameText: "text-sm"
    },
    lg: {
      daySize: "h-12 w-12 text-base",
      gap: "gap-3",
      headerText: "text-xl", 
      dayNameText: "text-base"
    }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Navegação do mês */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className={cn("font-semibold", currentSize.headerText)}>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        
        <Button
          variant="outline" 
          size="sm"
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Grade do calendário */}
      <div className={cn("grid grid-cols-7 text-center", currentSize.gap)}>
        {/* Cabeçalho dos dias da semana */}
        {dayNames.map(dayName => (
          <div key={dayName} className={cn("font-bold text-gray-600 py-2", currentSize.dayNameText)}>
            {dayName}
          </div>
        ))}
        
        {/* Dias do mês */}
        {days.map((day, index) => {
          if (day === null) {
            // Espaço vazio
            return <div key={`empty-${index}`} className={currentSize.daySize}></div>;
          }
          
          return (
            <div
              key={day}
              className={cn(
                "flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 font-medium mx-auto",
                "hover:scale-110 hover:shadow-md",
                currentSize.daySize,
                // Dia selecionado
                isSelected(day) && "bg-blue-600 text-white shadow-lg ring-2 ring-blue-300",
                // Hoje
                !isSelected(day) && isToday(day) && "bg-orange-500 text-white shadow-md",
                // Dia destacado (com dados/eventos)
                !isSelected(day) && !isToday(day) && isHighlighted(day) && "bg-purple-500 text-white shadow-md",
                // Dia normal
                !isSelected(day) && !isToday(day) && !isHighlighted(day) && "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
              )}
              onClick={() => selectDay(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 