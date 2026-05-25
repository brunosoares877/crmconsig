// Mapeamento de produtos dos leads para produtos das configurações de comissão
export const PRODUCT_MAPPING: Record<string, string> = {
  // FGTS
  'SAQUE ANIVERSARIO': 'CREDITO FGTS',
  'ANTECIPAÇÃO DO SAQUE ANIVERSÁRIO - FGTS': 'CREDITO FGTS',
  'fgts': 'CREDITO FGTS',
  'FGTS': 'CREDITO FGTS',
  
  // CLT
  'EMPRESTIMO CONSIGNADO': 'CREDITO CLT',
  'CRÉDITO CLT': 'CREDITO CLT',
  'clt': 'CREDITO CLT',
  'CLT': 'CREDITO CLT',
  'MARGEM LIVRE': 'CREDITO CLT',
  
  // INSS
  'NOVO': 'CREDITO INSS',
  'novo': 'CREDITO INSS',
  'BOLSA FAMÍLIA': 'CREDITO INSS',
  
  // PIX/CARTÃO
  'CARTAO CONSIGNADO': 'CREDITO PIX/CARTAO',
  'CARTÃO CONSIGNADO': 'CREDITO PIX/CARTAO',
  'CRÉDITO NA CONTA DE ENERGIA': 'CREDITO PIX/CARTAO',
  
  // PORTABILIDADE
  'portabilidade': 'PORTABILIDADE INSS',
  'PORTABILIDADE': 'PORTABILIDADE INSS',
  
  // REFINANCIAMENTO
  'refinanciamento': 'CREDITO CLT',
  'REFINANCIAMENTO': 'CREDITO CLT',
  'crefaz': 'CREDITO CLT',
};

/**
 * Mapeia um produto do lead para o produto da configuração de comissão
 * @param leadProduct - Produto do lead
 * @returns Produto mapeado para configuração ou o produto original se não encontrado
 */
export const mapProductToCommissionConfig = (leadProduct: string): string => {
  if (!leadProduct) return leadProduct;
  
  // Tentar encontrar mapeamento exato
  const mapped = PRODUCT_MAPPING[leadProduct];
  if (mapped) return mapped;
  
  // Tentar encontrar mapeamento por similaridade (case insensitive)
  const upperProduct = leadProduct.toUpperCase();
  for (const [key, value] of Object.entries(PRODUCT_MAPPING)) {
    if (key.toUpperCase() === upperProduct) {
      return value;
    }
  }
  
  // Se não encontrou mapeamento, retorna o produto original
  return leadProduct;
};

/**
 * Lista todos os produtos mapeados
 */
export const getAllMappedProducts = (): string[] => {
  return [...new Set(Object.values(PRODUCT_MAPPING))];
};

/**
 * Verifica se um produto tem mapeamento
 */
export const hasProductMapping = (leadProduct: string): boolean => {
  return mapProductToCommissionConfig(leadProduct) !== leadProduct;
}; 