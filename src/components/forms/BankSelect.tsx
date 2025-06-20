import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useBanks } from "@/hooks/useBanks";
import { Loader2 } from "lucide-react";

interface BankSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  showNoneOption?: boolean;
}

export const BankSelect: React.FC<BankSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione um banco",
  label,
  className,
  required = false,
  showNoneOption = true
}) => {
  const { banks, isLoading, error } = useBanks();

  if (error) {
    console.error("Erro ao carregar bancos:", error);
  }

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-11">
          <SelectValue placeholder={
            isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando bancos...
              </div>
            ) : placeholder
          } />
        </SelectTrigger>
        <SelectContent>
          {showNoneOption && (
            <SelectItem value="none">Nenhum banco</SelectItem>
          )}
          
          {isLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            </SelectItem>
          ) : banks.length > 0 ? (
            banks.map((bank) => (
              <SelectItem key={bank.code} value={bank.code}>
                {bank.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-banks" disabled>
              Nenhum banco encontrado nos leads
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
