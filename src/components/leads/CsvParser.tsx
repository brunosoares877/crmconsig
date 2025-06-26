
import { toast } from "sonner";

export interface CsvLead {
  name: string;
  cpf: string;
  phone: string;
  bank: string;
  product: string;
  date: string;
  amount: string;
  employee: string;
}

export interface CsvParseResult {
  leads: CsvLead[];
  errors: string[];
  totalRows: number;
}

/**
 * Advanced CSV parser that handles both comma and semicolon separated values properly
 */
export class CsvParser {
  private static detectSeparator(line: string): string {
    // Count semicolons and commas to determine the most likely separator
    const semicolonCount = (line.match(/;/g) || []).length;
    const commaCount = (line.match(/,/g) || []).length;
    
    // If we have more semicolons, use semicolon, otherwise use comma
    return semicolonCount > commaCount ? ';' : ',';
  }

  private static parseCSVLine(line: string, separator: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes ("")
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === separator && !inQuotes) {
        // End of field
        values.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Don't forget the last value
    values.push(current.trim());
    return values;
  }

  private static findColumnIndices(headers: string[]): Record<string, number> {
    const headerLower = headers.map(h => h.toLowerCase().trim().replace(/"/g, ''));
    
    return {
      name: headerLower.findIndex(h => h.includes('nome')),
      cpf: headerLower.findIndex(h => h.includes('cpf')),
      phone: headerLower.findIndex(h => h.includes('telefone')),
      bank: headerLower.findIndex(h => h.includes('banco')),
      product: headerLower.findIndex(h => h.includes('produto')),
      date: headerLower.findIndex(h => h.includes('data')),
      amount: headerLower.findIndex(h => h.includes('valor')),
      employee: headerLower.findIndex(h => h.includes('funcionario') || h.includes('funcionário'))
    };
  }

  private static validateRequiredColumns(indices: Record<string, number>): string[] {
    const errors: string[] = [];
    // Não há colunas obrigatórias - permite importar qualquer arquivo CSV
    // O sistema vai preencher automaticamente os campos que faltarem
    
    return errors;
  }

  private static mapBankValue(bankValue: string): string {
    const bank = bankValue.toLowerCase().trim();
    if (bank.includes('caixa')) return 'caixa';
    if (bank.includes('brasil') || bank.includes('bb')) return 'bb';
    if (bank.includes('itau') || bank.includes('itaú')) return 'itau';
    if (bank.includes('bradesco')) return 'bradesco';
    if (bank.includes('santander')) return 'santander';
    return 'outro';
  }

  private static mapProductValue(productValue: string): string {
    const product = productValue.toLowerCase().trim();
    if (product.includes('novo')) return 'novo';
    if (product.includes('porta')) return 'portabilidade';
    if (product.includes('refin')) return 'refinanciamento';
    if (product.includes('fgts')) return 'fgts';
    if (product.includes('cart')) return 'cartao';
    return 'outro';
  }

  private static validateLeadData(lead: CsvLead, rowNumber: number): string[] {
    const errors: string[] = [];

    // Removido todas as validações - aceita qualquer dado
    // O sistema vai corrigir automaticamente os dados inválidos

    return errors;
  }

  public static parseFile(fileContent: string): CsvParseResult {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const leads: CsvLead[] = [];

    if (lines.length < 2) {
      return {
        leads: [],
        errors: ['Arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados'],
        totalRows: 0
      };
    }

    // Detect separator from the first line
    const separator = this.detectSeparator(lines[0]);
    console.log(`Detected CSV separator: ${separator}`);

    // Parse header
    const headerValues = this.parseCSVLine(lines[0], separator);
    const indices = this.findColumnIndices(headerValues);
    
    // Validate required columns
    const columnErrors = this.validateRequiredColumns(indices);
    if (columnErrors.length > 0) {
      return {
        leads: [],
        errors: columnErrors,
        totalRows: lines.length - 1
      };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line, separator);
      
      // Aceita qualquer linha que tenha pelo menos 1 campo preenchido
      if (values.length === 0 || values.every(v => !v || v.trim() === '')) {
        console.log(`Linha ${i + 1} completamente vazia, pulando...`);
        continue;
      }

      const leadData: CsvLead = {
        name: (values[indices.name] || '').trim(),
        cpf: indices.cpf !== -1 ? (values[indices.cpf] || '').trim() : '',
        phone: (values[indices.phone] || '').trim(),
        bank: (values[indices.bank] || '').trim(),
        product: (values[indices.product] || '').trim(),
        date: indices.date !== -1 ? (values[indices.date] || '').trim() : '',
        amount: (values[indices.amount] || '').trim(),
        employee: indices.employee !== -1 ? (values[indices.employee] || '').trim() : ''
      };

      // Sem validação - aceita todos os dados
      const leadErrors = this.validateLeadData(leadData, i + 1);
      if (leadErrors.length > 0) {
        errors.push(...leadErrors);
        continue;
      }

      // Preencher campos vazios ou inválidos com valores padrão
      if (!leadData.name || leadData.name.length === 0) {
        leadData.name = `Cliente ${i + 1}`;
      }

      if (!leadData.phone || leadData.phone.length === 0) {
        leadData.phone = `(00) 00000-0000`;
      }

      if (!leadData.bank) {
        leadData.bank = 'outro';
      } else {
        leadData.bank = this.mapBankValue(leadData.bank);
      }

      if (!leadData.product) {
        leadData.product = 'outro';
      } else {
        leadData.product = this.mapProductValue(leadData.product);
      }

      if (!leadData.amount) {
        leadData.amount = '0';
      }

      if (!leadData.employee) {
        leadData.employee = 'Não informado';
      }

      if (!leadData.date) {
        // Se não tem data, usar data atual
        const today = new Date();
        leadData.date = today.toLocaleDateString('pt-BR');
      }

      leads.push(leadData);
    }

    return {
      leads,
      errors,
      totalRows: lines.length - 1
    };
  }
}
