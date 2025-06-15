
/**
 * Creates and triggers download of a CSV template file for lead import
 */
export const downloadCsvTemplate = () => {
  // CSV header and example rows with all required fields - using semicolon for better Excel compatibility
  const csvContent = 
    "Nome;CPF;Telefone;Banco;Produto;Data;Valor;Funcionario\n" +
    "João Silva;123.456.789-00;(11) 99999-9999;Banco do Brasil;Portabilidade;15/01/2024;R$ 50.000,00;Maria Santos\n" +
    "Maria Souza;987.654.321-00;(21) 88888-8888;Caixa Econômica Federal;Empréstimo Novo;16/01/2024;R$ 30.000,00;João Costa\n" +
    "Pedro Santos;456.789.123-00;(31) 77777-7777;Itaú;Refinanciamento;17/01/2024;R$ 75.000,00;Ana Silva\n" +
    "Carlos Oliveira;789.123.456-00;(41) 66666-6666;Bradesco;FGTS;18/01/2024;R$ 25.000,00;Roberto Lima\n" +
    "Ana Costa;321.654.987-00;(51) 55555-5555;Santander;Cartão de Crédito;19/01/2024;R$ 10.000,00;Lucia Ferreira";
  
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
