
import { supabase } from "@/integrations/supabase/client";

export const createDefaultCommissions = async (userId: string) => {
  try {
    // CRÉDITO FGTS - Níveis por faixa de valor
    const fgtsCommissions = [
      {
        user_id: userId,
        product: "CREDITO FGTS",
        name: "Até R$ 250,00",
        min_amount: 0,
        max_amount: 250,
        percentage: 15,
        active: true
      },
      {
        user_id: userId,
        product: "CREDITO FGTS",
        name: "R$ 250,01 até R$ 500,00",
        min_amount: 250.01,
        max_amount: 500,
        percentage: 12,
        active: true
      },
      {
        user_id: userId,
        product: "CREDITO FGTS",
        name: "R$ 500,01 até R$ 1.000,00",
        min_amount: 500.01,
        max_amount: 1000,
        percentage: 10,
        active: true
      },
      {
        user_id: userId,
        product: "CREDITO FGTS",
        name: "Acima de R$ 1.000,01",
        min_amount: 1000.01,
        max_amount: null,
        percentage: 8,
        active: true
      }
    ];

    // CRÉDITO CLT - Taxas fixas
    const cltCommissions = [
      {
        user_id: userId,
        product: "CREDITO CLT",
        name: "8x a 12x",
        percentage: 1,
        active: true
      },
      {
        user_id: userId,
        product: "CREDITO CLT",
        name: "Até 24x",
        percentage: 1.5,
        active: true
      },
      {
        user_id: userId,
        product: "CREDITO CLT",
        name: "36x",
        percentage: 2,
        active: true
      }
    ];

    // CRÉDITO PIX/CARTÃO - Taxa fixa
    const pixCartaoCommissions = [
      {
        user_id: userId,
        product: "CREDITO PIX/CARTAO",
        name: "PIX/Cartão",
        percentage: 1.5,
        active: true
      }
    ];

    // CRÉDITO INSS - Taxas fixas
    const inssCommissions = [
      {
        user_id: userId,
        product: "CREDITO INSS",
        name: "Novo BPC/LOAS",
        percentage: 2.5,
        active: true
      },
      {
        user_id: userId,
        product: "CREDITO INSS",
        name: "Novo Normal",
        percentage: 3,
        active: true
      }
    ];

    // PORTABILIDADE INSS - Taxa fixa
    const portabilidadeCommissions = [
      {
        user_id: userId,
        product: "PORTABILIDADE INSS",
        name: "Normal",
        percentage: 1.5,
        active: true
      }
    ];

    // Inserir níveis por faixa de valor (CRÉDITO FGTS)
    const { error: tiersError } = await supabase
      .from('commission_tiers')
      .insert(fgtsCommissions);

    if (tiersError) throw tiersError;

    // Inserir taxas fixas (todos os outros)
    const allRates = [
      ...cltCommissions,
      ...pixCartaoCommissions,
      ...inssCommissions,
      ...portabilidadeCommissions
    ];

    const { error: ratesError } = await supabase
      .from('commission_rates')
      .insert(allRates);

    if (ratesError) throw ratesError;

    return { success: true };
  } catch (error) {
    console.error("Error creating default commissions:", error);
    return { success: false, error };
  }
};
