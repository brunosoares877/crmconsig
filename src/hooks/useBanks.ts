import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Default banks from LeadsConfig
const DEFAULT_BANKS = [
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

export interface Bank {
  code: string;
  name: string;
}

interface ConfigBank {
  id: string;
  name: string;
  code: string;
}

// Utility functions from LeadsConfig
function getRemovedIds(key: string): string[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function getEditedItems<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export const useBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get configured banks from localStorage (same logic as LeadsConfig)
      const savedBanks = localStorage.getItem('configBanks');
      const configuredBanks = savedBanks ? JSON.parse(savedBanks) : [];
      const removedBankIds = getRemovedIds('removedBanks');
      const editedBanks = getEditedItems<ConfigBank>('editedBanks');
      const allBanks: Bank[] = [];

      // Tenta carregar bancos do Supabase (persistência multi-dispositivo)
      let supabaseBanks: Bank[] = [];
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data, error } = await supabase
            .from('banks')
            .select('name, code')
            .eq('user_id', userData.user.id)
            .order('name');
          if (error) throw error;
          supabaseBanks = (data || []).map((b: any) => ({
            name: b.name,
            code: b.code || "",
          }));
        }
      } catch (err: any) {
        console.warn('Falha ao carregar bancos do Supabase (usando localStorage):', err?.message || err);
      }
      
      // Add default banks with generated IDs
      DEFAULT_BANKS.forEach(bank => {
        const id = `default-${bank.code}`;
        // Se foi removido, não adiciona
        if (removedBankIds.includes(id)) return;
        // Se foi editado, adiciona editado
        const edited = editedBanks.find(b => b.id === id);
        if (edited) {
          allBanks.push({ code: edited.code, name: edited.name });
        } else {
          allBanks.push({ code: bank.code, name: bank.name });
        }
      });
      
      // Add configured banks (user-added)
      configuredBanks.forEach((configBank: ConfigBank) => {
        const exists = allBanks.find(bank => bank.code === configBank.code || bank.name === configBank.name);
        if (!exists) {
          allBanks.push({ code: configBank.code, name: configBank.name });
        }
      });

      // Add bancos do Supabase
      supabaseBanks.forEach((sb) => {
        const exists = allBanks.find(bank => bank.code === sb.code || bank.name === sb.name);
        if (!exists) {
          allBanks.push(sb);
        }
      });

      // Sort alphabetically by name
      allBanks.sort((a, b) => a.name.localeCompare(b.name));

      setBanks(allBanks);
    } catch (err: any) {
      console.error('Erro ao buscar bancos das configurações:', err);
      setError(err.message || 'Erro ao carregar bancos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();

    // Listen for changes in localStorage (from LeadsConfig)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'configBanks' || e.key === 'removedBanks' || e.key === 'editedBanks') {
        fetchBanks();
      }
    };

    // Listen for custom event from LeadsConfig
    const handleCustomStorageChange = () => {
      fetchBanks();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('configDataChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('configDataChanged', handleCustomStorageChange);
    };
  }, []);

  return {
    banks,
    isLoading,
    error,
    refetch: fetchBanks
  };
}; 