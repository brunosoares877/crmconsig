
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { downloadCsvTemplate } from "@/utils/csvTemplate";

interface CsvLead {
  name: string;
  cpf: string;
  phone: string;
  bank: string;
  product: string;
  date: string;
  amount: string;
  employee: string;
}

const ImportLeads = ({
  onLeadsImported
}: {
  onLeadsImported: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<CsvLead[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("Arquivo CSV deve conter pelo menos uma linha de cabeçalho e uma linha de dados");
        setFile(null);
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

      // Find indices for required columns
      const nameIndex = headers.findIndex(h => h.includes("nome"));
      const cpfIndex = headers.findIndex(h => h.includes("cpf"));
      const phoneIndex = headers.findIndex(h => h.includes("telefone"));
      const bankIndex = headers.findIndex(h => h.includes("banco"));
      const productIndex = headers.findIndex(h => h.includes("produto"));
      const dateIndex = headers.findIndex(h => h.includes("data"));
      const amountIndex = headers.findIndex(h => h.includes("valor"));
      const employeeIndex = headers.findIndex(h => h.includes("funcionario") || h.includes("funcionário"));

      if (nameIndex === -1 || phoneIndex === -1 || bankIndex === -1 || productIndex === -1 || amountIndex === -1) {
        toast.error("Formato CSV inválido. Os cabeçalhos devem incluir: Nome, Telefone, Banco, Produto, Valor", {
          action: {
            label: "Baixar Modelo",
            onClick: downloadCsvTemplate
          }
        });
        setFile(null);
        return;
      }

      const parsedLeads: CsvLead[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(",").map(val => val.trim().replace(/"/g, ''));
        
        parsedLeads.push({
          name: values[nameIndex] || "",
          cpf: cpfIndex !== -1 ? values[cpfIndex] || "" : "",
          phone: values[phoneIndex] || "",
          bank: values[bankIndex] || "",
          product: values[productIndex] || "",
          date: dateIndex !== -1 ? values[dateIndex] || "" : "",
          amount: values[amountIndex] || "",
          employee: employeeIndex !== -1 ? values[employeeIndex] || "" : ""
        });
        
        if (parsedLeads.length >= 5) break; // Only show first 5 in preview
      }
      
      setPreview(parsedLeads);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Check authentication first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Erro de autenticação. Faça login novamente.");
      }

      if (!session || !session.user) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      console.log("User authenticated, proceeding with import");

      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error("Arquivo CSV deve conter pelo menos uma linha de dados");
          }

          const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

          // Find indices for required columns
          const nameIndex = headers.findIndex(h => h.includes("nome"));
          const cpfIndex = headers.findIndex(h => h.includes("cpf"));
          const phoneIndex = headers.findIndex(h => h.includes("telefone"));
          const bankIndex = headers.findIndex(h => h.includes("banco"));
          const productIndex = headers.findIndex(h => h.includes("produto"));
          const dateIndex = headers.findIndex(h => h.includes("data"));
          const amountIndex = headers.findIndex(h => h.includes("valor"));
          const employeeIndex = headers.findIndex(h => h.includes("funcionario") || h.includes("funcionário"));

          if (nameIndex === -1 || phoneIndex === -1 || bankIndex === -1 || productIndex === -1 || amountIndex === -1) {
            throw new Error("Formato CSV inválido");
          }

          const leads = [];
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(",").map(val => val.trim().replace(/"/g, ''));

            // Skip empty rows
            if (!values[nameIndex] || !values[phoneIndex]) continue;

            // Map bank values to our system values
            let bankValue = values[bankIndex].toLowerCase();
            if (bankValue.includes("caixa")) bankValue = "caixa";
            else if (bankValue.includes("brasil") || bankValue.includes("bb")) bankValue = "bb";
            else if (bankValue.includes("itau")) bankValue = "itau";
            else if (bankValue.includes("bradesco")) bankValue = "bradesco";
            else if (bankValue.includes("santander")) bankValue = "santander";
            else bankValue = "outro";

            // Map product values to our system values
            let productValue = values[productIndex].toLowerCase();
            if (productValue.includes("novo")) productValue = "novo";
            else if (productValue.includes("porta")) productValue = "portabilidade";
            else if (productValue.includes("refin")) productValue = "refinanciamento";
            else if (productValue.includes("fgts")) productValue = "fgts";
            else if (productValue.includes("cart")) productValue = "cartao";
            else productValue = "outro";

            const leadData: any = {
              name: values[nameIndex],
              cpf: cpfIndex !== -1 ? values[cpfIndex] : "",
              phone: values[phoneIndex],
              bank: bankValue,
              product: productValue,
              amount: values[amountIndex],
              employee: employeeIndex !== -1 ? values[employeeIndex] : "",
              status: "novo",
              user_id: session.user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            leads.push(leadData);
          }

          if (leads.length === 0) {
            throw new Error("Nenhum lead válido encontrado no arquivo");
          }

          console.log("Importing leads:", leads);

          // Insert leads into the database
          const { error } = await supabase
            .from("leads")
            .insert(leads);

          if (error) {
            console.error("Database error:", error);
            throw new Error(`Erro ao salvar leads: ${error.message}`);
          }

          toast.success(`${leads.length} leads importados com sucesso!`);
          setOpen(false);
          setFile(null);
          setPreview([]);
          onLeadsImported();
          
        } catch (error: any) {
          console.error("Import error:", error);
          toast.error(`Erro ao importar leads: ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.readAsText(file);
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Leads
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Leads via CSV</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo CSV com os leads. O arquivo deve conter as colunas: Nome, CPF, Telefone, Banco, Produto, Data, Valor, Funcionário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                disabled={isUploading} 
              />
              <p className="text-xs text-muted-foreground">
                Formato: CSV com colunas Nome, CPF, Telefone, Banco, Produto, Data, Valor, Funcionário
              </p>
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Pré-visualização ({preview.length} leads)</h3>
                <div className="border rounded-md overflow-x-auto max-h-64">
                  <table className="min-w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm">Nome</th>
                        <th className="px-4 py-2 text-left text-sm">CPF</th>
                        <th className="px-4 py-2 text-left text-sm">Telefone</th>
                        <th className="px-4 py-2 text-left text-sm">Banco</th>
                        <th className="px-4 py-2 text-left text-sm">Produto</th>
                        <th className="px-4 py-2 text-left text-sm">Data</th>
                        <th className="px-4 py-2 text-left text-sm">Valor</th>
                        <th className="px-4 py-2 text-left text-sm">Funcionário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((lead, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 text-sm">{lead.name}</td>
                          <td className="px-4 py-2 text-sm">{lead.cpf}</td>
                          <td className="px-4 py-2 text-sm">{lead.phone}</td>
                          <td className="px-4 py-2 text-sm">{lead.bank}</td>
                          <td className="px-4 py-2 text-sm">{lead.product}</td>
                          <td className="px-4 py-2 text-sm">{lead.date}</td>
                          <td className="px-4 py-2 text-sm">{lead.amount}</td>
                          <td className="px-4 py-2 text-sm">{lead.employee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length >= 5 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mostrando apenas 5 primeiros registros
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!file || isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Importando...' : 'Importar Leads'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportLeads;
