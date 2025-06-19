import React from "react";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImportLeads from "@/components/leads/ImportLeads";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsvTemplate } from "@/utils/csvTemplate";

const LeadImport = () => {
  const navigate = useNavigate();

  const handleLeadsImported = () => {
    navigate("/leads");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto space-y-6 p-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Importar Leads</h1>
              <p className="text-muted-foreground mt-1">Importe leads em massa através de um arquivo CSV</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Importação de Leads</CardTitle>
              <CardDescription>
                Faça o upload de um arquivo CSV contendo seus leads. O arquivo deve conter as colunas: Nome, CPF, Telefone, Banco, Produto, Data, Valor e Funcionário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para importar leads, escolha um arquivo CSV formatado corretamente com as informações dos seus leads, incluindo o funcionário responsável.
                </p>
                
                <div className="p-6 border border-dashed rounded-lg bg-muted/30 flex flex-col items-center justify-center">
                  <div className="mb-4 text-center">
                    <p className="text-sm font-medium">Clique para importar leads</p>
                    <p className="text-xs text-muted-foreground">Suporta arquivos CSV</p>
                  </div>
                  
                  <ImportLeads onLeadsImported={handleLeadsImported} />
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Modelo do arquivo CSV:</h3>
                  <div className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-xs">Baixe o modelo de planilha para importação de leads</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Inclui campos: Nome, CPF, Telefone, Banco, Produto, Data, Valor, Funcionário
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadCsvTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Modelo CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default LeadImport;
