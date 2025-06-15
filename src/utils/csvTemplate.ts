
/**
 * Creates and triggers download of a CSV template file for lead import
 */
export const downloadCsvTemplate = () => {
  // CSV header and example rows with all required fields - using semicolon for better Excel compatibility
  const csvContent = 
    "Nome;CPF;Telefone;Banco;Produto;Data;Valor;Funcionario\n" +
    "João Silva;123.456.789-00;(11)99999-9999;Banco do Brasil;Portabilidade;2024-01-15;50000;Maria Santos\n" +
    "Maria Souza;987.654.321-00;(21)88888-8888;Caixa;Novo;2024-01-16;30000;João Costa\n" +
    "Pedro Santos;456.789.123-00;(31)77777-7777;Itaú;Refinanciamento;2024-01-17;75000;Ana Silva";
  
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
