
import React from "react";
import Header from "@/components/Header";
import PageLayout from "@/components/PageLayout";
import ImportLeads from "@/components/leads/ImportLeads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadCsvTemplate } from "@/utils/csvTemplate";

const LeadImport = () => {
  const handleLeadsImported = () => {
    window.location.href = "/leads";
  };

  return (
    <PageLayout
      title="Importar Leads"
      subtitle="Importe leads em massa através de um arquivo CSV"
    >
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
    </PageLayout>
  );
};

export default LeadImport;

