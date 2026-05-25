import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_BENEFIT_TYPES = [
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

export interface BenefitType {
  id: number;
  code: string;
  description: string;
}

function getRemovedIds(key: string): string[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function getEditedItems<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export const useBenefits = () => {
  const [benefits, setBenefits] = useState<BenefitType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBenefits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const removedBenefitIds = getRemovedIds('removedBenefits');
      const editedBenefits = getEditedItems<BenefitType>('editedBenefits');
      
      let dbBenefits: BenefitType[] = [];
      try {
        const { data, error: benefitError } = await supabase
          .from('benefit_types')
          .select('*')
          .order('description');
        if (!benefitError && data) {
          dbBenefits = data as BenefitType[];
        }
      } catch (err) {
        console.warn("Could not fetch benefits from Supabase", err);
      }
      
      const allBenefits: BenefitType[] = [];
      
      DEFAULT_BENEFIT_TYPES.forEach((benefit, index) => {
        const id = 1000 + index;
        if (removedBenefitIds.includes(id.toString())) return;
        const edited = editedBenefits.find(b => b.id === id);
        if (edited) {
          allBenefits.push(edited);
        } else {
          allBenefits.push({ id, description: benefit.description, code: benefit.code });
        }
      });
      
      dbBenefits.forEach((dbBenefit) => {
        if (removedBenefitIds.includes(dbBenefit.id.toString())) return;
        const exists = allBenefits.find(benefit => benefit.code === dbBenefit.code || benefit.description === dbBenefit.description);
        if (!exists) {
          allBenefits.push(dbBenefit);
        }
      });

      allBenefits.sort((a, b) => a.description.localeCompare(b.description));
      setBenefits(allBenefits);
    } catch (err: any) {
      console.error('Erro ao buscar beneficios das configurações:', err);
      setError(err.message || 'Erro ao carregar beneficios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'removedBenefits' || e.key === 'editedBenefits') {
        fetchBenefits();
      }
    };

    const handleCustomStorageChange = () => {
      fetchBenefits();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('configDataChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('configDataChanged', handleCustomStorageChange);
    };
  }, []);

  return {
    benefits,
    isLoading,
    error,
    refetch: fetchBenefits
  };
};
