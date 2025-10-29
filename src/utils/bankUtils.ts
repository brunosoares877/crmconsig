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
    "021": "Banestes",
    "025": "Banco Alfa",
    "033": "Santander",
    "041": "Banrisul",
    "070": "BRB",
    "077": "Banco Inter",
    "104": "Caixa Econômica Federal",
    "121": "Agibank",
    "212": "Banco Original",
    "237": "Bradesco",
    "318": "Banco BMG",
    "320": "CCB Brasil",
    "336": "C6 Bank",
    "341": "Itaú Unibanco",
    "371": "Banco Bari",
    "389": "Banco Mercantil do Brasil",
    "422": "Banco Safra",
    "604": "Banco Industrial",
    "623": "Banco PAN",
    "640": "Banco Inbursa",
    "654": "Banco A.J. Renner",
    "655": "Banco Votorantim",
    "707": "Banco Daycoval",
    "739": "Cetelem",
    "743": "Banco Semear",
    "777": "Banco JP Morgan"
  };

  // Busca pelos códigos numéricos
  if (numericBanks[bankCode]) {
    return numericBanks[bankCode];
  }

  // Se não encontrou, retorna o código original
  return bankCode;
}; 