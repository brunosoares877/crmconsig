
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { downloadCsvTemplate } from "@/utils/csvTemplate";
import { CsvParser, CsvLead, CsvParseResult } from "./CsvParser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

const ImportLeads = ({
  onLeadsImported
}: {
  onLeadsImported: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState<CsvParseResult | null>(null);
  const [countInCurrentMonth, setCountInCurrentMonth] = useState(true);

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
      
      try {
        const result = CsvParser.parseFile(text);
        setParseResult(result);
        
        if (result.errors.length > 0) {
          console.warn("CSV parsing warnings:", result.errors);
        }
        
        if (result.leads.length === 0) {
          toast.error("Nenhum lead válido encontrado no arquivo", {
            action: {
              label: "Baixar Modelo",
              onClick: downloadCsvTemplate
            }
          });
        } else {
          toast.success(`${result.leads.length} leads prontos para importação`);
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        toast.error("Erro ao processar arquivo CSV");
        setParseResult(null);
      }
    };
    
    reader.onerror = () => {
      console.error("Error reading file");
      toast.error("Erro ao ler o arquivo");
      setParseResult(null);
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = async () => {
    if (!file || !parseResult || parseResult.leads.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Define a data de criação baseada na opção escolhida
      const createdAt = countInCurrentMonth 
        ? new Date().toISOString()
        : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString();

      const leadsToInsert = parseResult.leads.map(lead => ({
        name: lead.name,
        cpf: lead.cpf,
        phone: lead.phone,
        bank: lead.bank,
        product: lead.product,
        amount: lead.amount,
        employee: lead.employee,
        status: "novo",
        user_id: session.user.id,
        created_at: createdAt,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from("leads")
        .insert(leadsToInsert);

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Erro ao salvar leads: ${error.message}`);
      }

      const monthText = countInCurrentMonth ? "no mês atual" : "no mês anterior";
      toast.success(`${parseResult.leads.length} leads importados com sucesso ${monthText}!`);
      setOpen(false);
      setFile(null);
      setParseResult(null);
      setCountInCurrentMonth(true); // Reset to default
      onLeadsImported();
      
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setParseResult(null);
    setCountInCurrentMonth(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Importar Leads
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
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

            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
              <Checkbox 
                id="count-current-month" 
                checked={countInCurrentMonth}
                onCheckedChange={(checked) => setCountInCurrentMonth(checked as boolean)}
              />
              <label 
                htmlFor="count-current-month" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Contabilizar valores no mês atual
              </label>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {countInCurrentMonth 
                ? "Os leads importados serão contabilizados no mês atual para relatórios e métricas."
                : "Os leads importados serão contabilizados no mês anterior."
              }
            </p>

            {parseResult && (
              <div className="space-y-3">
                {parseResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-1">Problemas encontrados:</div>
                      <ul className="text-sm space-y-1">
                        {parseResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {parseResult.errors.length > 5 && (
                          <li>• ... e mais {parseResult.errors.length - 5} erros</li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {parseResult.leads.length > 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{parseResult.leads.length}</strong> leads válidos encontrados de <strong>{parseResult.totalRows}</strong> linhas processadas
                    </AlertDescription>
                  </Alert>
                )}

                {parseResult.leads.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Pré-visualização (primeiros 5 leads)</h3>
                    <div className="border rounded-md overflow-x-auto max-h-64">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium">Nome</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">CPF</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Telefone</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Banco</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Produto</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Valor</th>
                            <th className="px-3 py-2 text-left text-xs font-medium">Funcionário</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseResult.leads.slice(0, 5).map((lead, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2 text-xs">{lead.name}</td>
                              <td className="px-3 py-2 text-xs">{lead.cpf}</td>
                              <td className="px-3 py-2 text-xs">{lead.phone}</td>
                              <td className="px-3 py-2 text-xs">{lead.bank}</td>
                              <td className="px-3 py-2 text-xs">{lead.product}</td>
                              <td className="px-3 py-2 text-xs">{lead.amount}</td>
                              <td className="px-3 py-2 text-xs">{lead.employee}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {parseResult.leads.length > 5 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Mostrando apenas 5 primeiros registros
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!parseResult || parseResult.leads.length === 0 || isUploading}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? 'Importando...' : `Importar ${parseResult?.leads.length || 0} Leads`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportLeads;
