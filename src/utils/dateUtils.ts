/**
 * Utilitários para formatação de datas sem problemas de timezone
 */

/**
 * Formata uma data para exibição em português brasileiro
 * Evita problemas de timezone ao fazer parse manual de datas YYYY-MM-DD
 */
export const formatLeadDate = (dateString: string): string => {
  try {
    if (!dateString) return '';
    
    // Se a data é apenas YYYY-MM-DD (formato ISO sem hora), parse manual para evitar timezone
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month - 1 porque Date() usa 0-based months
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    
    // Para outras strings de data, usar parsing normal
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Converte uma data em formato string para Date, evitando problemas de timezone
 */
export const parseLeadDate = (dateString: string): Date => {
  try {
    if (!dateString) return new Date();
    
    // Se a data é apenas YYYY-MM-DD, parse manual para evitar timezone
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
}; 