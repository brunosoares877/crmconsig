
/**
 * Creates and triggers download of a CSV template file for lead import
 */
export const downloadCsvTemplate = () => {
  // CSV header and example rows
  const csvContent = 
    "Nome,Telefone,Banco,Produto,Valor\n" +
    "João Silva,(11)99999-9999,Banco do Brasil,Portabilidade,50000\n" +
    "Maria Souza,(21)88888-8888,Caixa,Novo,30000";
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  
  // Create a download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "modelo_importacao_leads.csv";
  
  // Append to the document, trigger click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
