
import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const BANKS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "003", name: "Banco da Amazônia" },
  { code: "004", name: "Banco do Nordeste" },
  { code: "021", name: "Banestes (Banco do Estado do Espírito Santo)" },
  { code: "025", name: "Banco Alfa" },
  { code: "033", name: "Santander" },
  { code: "041", name: "Banrisul" },
  { code: "070", name: "BRB (Banco de Brasília)" },
  { code: "077", name: "Banco Inter" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "121", name: "Agibank" },
  { code: "212", name: "Banco Original" },
  { code: "237", name: "Bradesco" },
  { code: "318", name: "Banco BMG" },
  { code: "320", name: "CCB Brasil (China Construction Bank)" },
  { code: "336", name: "C6 Bank" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "371", name: "Banco Bari" },
  { code: "389", name: "Banco Mercantil do Brasil" },
  { code: "422", name: "Banco Safra" },
  { code: "604", name: "Banco Industrial" },
  { code: "623", name: "Banco PAN" },
  { code: "640", name: "Banco Inbursa" },
  { code: "654", name: "Banco A.J. Renner (Parati Financeira)" },
  { code: "655", name: "Banco Votorantim (BV Financeira)" },
  { code: "707", name: "Banco Daycoval" },
  { code: "739", name: "Cetelem (BNP Paribas)" },
  { code: "743", name: "Banco Semear" },
  { code: "777", name: "Banco JP Morgan (atua em nichos)" }
];

interface BankSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const BankSelect: React.FC<BankSelectProps> = ({ value, onValueChange, defaultValue }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBanks = useMemo(() => {
    if (!searchTerm) return BANKS;
    
    const search = searchTerm.toLowerCase();
    return BANKS.filter(bank => 
      bank.code.includes(search) || 
      bank.name.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  return (
    <div>
      <Label htmlFor="bank">Banco</Label>
      <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o banco" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <SelectItem key={bank.code} value={bank.code}>
                  {bank.code} - {bank.name}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nenhum banco encontrado
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BankSelect;
