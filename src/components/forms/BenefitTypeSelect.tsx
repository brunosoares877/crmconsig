
import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const BENEFIT_TYPES = [
  { code: "01", description: "Pensão por morte – trabalhador rural" },
  { code: "02", description: "Pensão por morte acidentária" },
  { code: "03", description: "Pensão por morte – empregador rural" },
  { code: "04", description: "Aposentadoria por invalidez – trabalhador rural" },
  { code: "05", description: "Aposentadoria por invalidez acidentária – trabalhador rural" },
  { code: "06", description: "Aposentadoria por invalidez – empregador rural" },
  { code: "07", description: "Aposentadoria por velhice – trabalhador rural" },
  { code: "08", description: "Aposentadoria por idade – empregador rural" },
  { code: "11", description: "Amparo previdenciário por invalidez – trabalhador rural" },
  { code: "12", description: "Amparo previdenciário por idade – trabalhador rural" },
  { code: "18", description: "Auxílio-inclusão" },
  { code: "19", description: "Pensão de estudante" },
  { code: "20", description: "Pensão por morte de ex-diplomata" },
  { code: "21", description: "Pensão por morte previdenciária" },
  { code: "22", description: "Pensão por morte estatutária" },
  { code: "23", description: "Pensão por morte de ex-combatente" },
  { code: "24", description: "Pensão especial – ato institucional" },
  { code: "26", description: "Pensão por morte especial" },
  { code: "27", description: "Pensão por morte de servidor público federal" },
  { code: "28", description: "Pensão por morte – Regime Geral" },
  { code: "29", description: "Pensão por morte de ex-combatente marítimo" },
  { code: "30", description: "Renda mensal vitalícia por incapacidade" },
  { code: "32", description: "Aposentadoria por invalidez previdenciária" },
  { code: "33", description: "Aposentadoria por invalidez de aeronauta" },
  { code: "34", description: "Aposentadoria por invalidez de ex-combatente marítimo" },
  { code: "37", description: "Aposentadoria de extranumerário da CAPIN" },
  { code: "38", description: "Aposentadoria de extranumerário – funcionários públicos" },
  { code: "40", description: "Renda mensal vitalícia por idade" },
  { code: "41", description: "Aposentadoria por idade" },
  { code: "42", description: "Aposentadoria por tempo de contribuição" },
  { code: "43", description: "Aposentadoria por tempo de contribuição de ex-combatente" },
  { code: "44", description: "Aposentadoria especial de aeronauta" },
  { code: "45", description: "Aposentadoria por tempo de serviço – jornalista" },
  { code: "46", description: "Aposentadoria especial" },
  { code: "49", description: "Aposentadoria ordinária" },
  { code: "51", description: "Aposentadoria por invalidez – extinto plano básico" },
  { code: "52", description: "Aposentadoria por idade – extinto plano básico" },
  { code: "54", description: "Pensão indenizatória a cargo da União" },
  { code: "55", description: "Pensão por morte – extinto plano básico" },
  { code: "56", description: "Pensão mensal vitalícia – síndrome da talidomida" },
  { code: "57", description: "Aposentadoria por tempo de serviço de professores" },
  { code: "58", description: "Aposentadoria de anistiados" },
  { code: "59", description: "Pensão por morte de anistiados" },
  { code: "60", description: "Benefício indenizatório a cargo da União" },
  { code: "72", description: "Aposentadoria por tempo de serviço" },
  { code: "78", description: "Aposentadoria por idade (ex-combatente marítimo)" },
  { code: "81", description: "Aposentadoria compulsória (ex‑SASSE)" },
  { code: "82", description: "Aposentadoria por tempo de serviço (ex‑SASSE)" },
  { code: "83", description: "Aposentadoria por invalidez (ex‑SASSE)" },
  { code: "84", description: "Pensão por morte (ex‑SASSE)" },
  { code: "87", description: "Amparo assistencial à pessoa com deficiência" },
  { code: "88", description: "Amparo assistencial à pessoa idosa" },
  { code: "89", description: "Pensão especial – vítimas de hemodiálise" },
  { code: "92", description: "Aposentadoria por invalidez por acidente de trabalho" },
  { code: "93", description: "Pensão por morte por acidente de trabalho" },
  { code: "96", description: "Pensão especial – hanseníase" }
];

interface BenefitTypeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const BenefitTypeSelect: React.FC<BenefitTypeSelectProps> = ({ value, onValueChange, defaultValue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredBenefits = useMemo(() => {
    if (!searchTerm) return BENEFIT_TYPES;
    
    const search = searchTerm.toLowerCase();
    return BENEFIT_TYPES.filter(benefit => 
      benefit.code.includes(search) || 
      benefit.description.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  return (
    <div>
      <Label htmlFor="benefit_type">Tipo de Benefício</Label>
      <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue} onOpenChange={setIsOpen}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo" />
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
            {filteredBenefits.length > 0 ? (
              filteredBenefits.map((benefit) => (
                <SelectItem key={benefit.code} value={benefit.code}>
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
