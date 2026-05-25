
/**
 * Creates and triggers download of a CSV template file for lead import
 */
export const downloadCsvTemplate = () => {
  // CSV header and example rows - Nome e Telefone são obrigatórios, outros campos podem estar em branco
  const csvContent = 
    "Nome;CPF;Telefone;Banco;Produto;Data;Valor;Funcionario\n" +
    "João Silva;123.456.789-00;(11) 99999-9999;Banco do Brasil;Portabilidade;15/01/2024;R$ 50.000,00;Maria Santos\n" +
    "Maria Souza;;(21) 88888-8888;Caixa Econômica Federal;Empréstimo Novo;16/01/2024;R$ 30.000,00;João Costa\n" +
    "Pedro Santos;456.789.123-00;(31) 77777-7777;;Refinanciamento;17/01/2024;R$ 75.000,00;Ana Silva\n" +
    "Carlos Oliveira;789.123.456-00;(41) 66666-6666;Bradesco;;;Roberto Lima\n" +
    "Ana Costa;321.654.987-00;(51) 55555-5555;;;;;Lucia Ferreira\n" +
    "Roberto Lima;;(85) 44444-4444;;;;\n" +
    "Exemplo Cliente;999.999.999-99;(11) 12345-6789;;;;;;Exemplo de lead apenas com nome e telefone";
  
  // Create a Blob with the CSV content using UTF-8 BOM for proper Excel encoding
  const blob = new Blob(['\ufeff' + csvContent], { type: "text/csv;charset=utf-8" });
  
  // Create a download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "modelo_importacao_leads.csv";
  
  // Append to the document, trigger click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
