export const getBankName = (bankCode: string | null | undefined) => {
  if (!bankCode) return "Banco não especificado";
  
  // Códigos de texto usados no sistema
  const textBanks: Record<string, string> = {
    "caixa": "Caixa Econômica Federal",
    "bb": "Banco do Brasil",
    "itau": "Itaú Unibanco",
    "bradesco": "Bradesco",
    "santander": "Santander",
    "c6": "C6 Bank",
    "brb": "BRB - Banco de Brasília",
    "bmg": "Banco BMG",
    "pan": "Banco Pan",
    "ole": "Banco Olé",
    "daycoval": "Banco Daycoval",
    "mercantil": "Banco Mercantil do Brasil",
    "cetelem": "Cetelem",
    "safra": "Banco Safra",
    "inter": "Banco Inter",
    "original": "Banco Original",
    "facta": "Facta",
    "bonsucesso": "Bonsucesso",
    "banrisul": "Banrisul",
    "sicoob": "Sicoob",
    "outro": "Outro banco"
  };

  // Primeiro tenta buscar pelos códigos de texto
  if (textBanks[bankCode.toLowerCase()]) {
    return textBanks[bankCode.toLowerCase()];
  }

  // Códigos numéricos (para compatibilidade)
  const numericBanks: Record<string, string> = {
    "001": "Banco do Brasil",
    "003": "Banco da Amazônia",
    "004": "Banco do Nordeste",
    "021": "Banestes (Banco do Estado do Espírito Santo)",
    "025": "Banco Alfa",
    "033": "Santander",
    "041": "Banrisul",
    "070": "BRB (Banco de Brasília)",
    "077": "Banco Inter",
    "104": "Caixa Econômica Federal",
    "118": "Banco Itaú BBA",
    "121": "Agibank",
    "212": "Banco Original",
    "237": "Bradesco",
    "260": "Nu Pagamentos (Nubank)",
    "318": "Banco BMG",
    "320": "CCB Brasil (China Construction Bank)",
    "336": "C6 Bank",
    "341": "Itaú Unibanco",
    "371": "Banco Bari",
    "389": "Banco Mercantil do Brasil",
    "422": "Banco Safra",
    "604": "Banco Industrial",
    "623": "Banco PAN",
    "640": "Banco Inbursa",
    "654": "Banco A.J. Renner (Parati Financeira)",
    "655": "Banco Votorantim (BV Financeira)",
    "707": "Banco Daycoval",
    "739": "Cetelem (BNP Paribas)",
    "743": "Banco Semear",
    "748": "Sicredi",
    "756": "Sicoob",
    "777": "Banco JP Morgan (atua em nichos)"
  };

  // Busca pelos códigos numéricos
  if (numericBanks[bankCode]) {
    return numericBanks[bankCode];
  }

  // Mapeamentos específicos fora do padrão Febraban
  const customBanks: Record<string, string> = {
    "8788": "Presença Bank"
  };
  if (customBanks[bankCode]) {
    return customBanks[bankCode];
  }

  // Heurística para códigos atípicos numéricos com mais de 3 dígitos (ex.: "8887"): 
  // tenta casar pelos 3 primeiros ou 3 últimos dígitos.
  let onlyDigits = bankCode.replace(/\D/g, "");
  if (onlyDigits.length < 3 && onlyDigits.length > 0) {
    const padded = onlyDigits.padStart(3, "0");
    if (numericBanks[padded]) return numericBanks[padded];
  }
  if (onlyDigits.length >= 3) {
    const first3 = onlyDigits.slice(0, 3);
    if (numericBanks[first3]) return numericBanks[first3];
    const last3 = onlyDigits.slice(-3);
    if (numericBanks[last3]) return numericBanks[last3];
  }

  // Se não encontrou, retorna o código original
  return bankCode;
}; 