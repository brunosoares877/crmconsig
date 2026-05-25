import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { useBenefits } from "@/hooks/useBenefits";

interface BenefitTypeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const BenefitTypeSelect: React.FC<BenefitTypeSelectProps> = ({ value, onValueChange, defaultValue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { benefits, isLoading, error } = useBenefits();

  if (error) {
    console.error("Erro ao carregar benefícios:", error);
  }

  const filteredBenefits = useMemo(() => {
    if (!searchTerm) return benefits;
    
    const search = searchTerm.toLowerCase();
    return benefits.filter(benefit => 
      benefit.code.includes(search) || 
      benefit.description.toLowerCase().includes(search)
    );
  }, [searchTerm, benefits]);

  return (
    <div>
      <Label htmlFor="benefit_type">Tipo de Benefício</Label>
      <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue}>
        <SelectTrigger disabled={isLoading}>
          <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione o tipo"} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            <SelectItem value="none">Não informado</SelectItem>
            {isLoading ? (
              <div className="p-4 flex justify-center items-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredBenefits.length > 0 ? (
              filteredBenefits.map((benefit) => (
                <SelectItem key={benefit.id} value={benefit.code}>
                  {benefit.code} - {benefit.description}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nenhum benefício encontrado
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BenefitTypeSelect;
