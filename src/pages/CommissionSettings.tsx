
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CommissionRate } from "@/types/models";

const productOptions = [
  { id: "portabilidade", label: "Portabilidade" },
  { id: "refinanciamento", label: "Refinanciamento" },
  { id: "crefaz", label: "Crefaz" },
  { id: "novo", label: "Novo" },
  { id: "clt", label: "CLT" },
  { id: "fgts", label: "FGTS" },
];

const CommissionSettings = () => {
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rates");

  useEffect(() => {
    fetchCommissionRates();
  }, []);

  const fetchCommissionRates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("commission_rates")
        .select("*")
        .order("product");

      if (error) throw error;

      if (data && data.length > 0) {
        setCommissionRates(data as CommissionRate[]);
      } else {
        // Inicializar taxas padrão se não houver nenhuma
        const defaultRates = productOptions.map((product) => ({
          id: product.id,
          product: product.id as CommissionRate["product"],
          percentage: 0,
          active: true,
        }));
        setCommissionRates(defaultRates);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar taxas de comissão: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateChange = (index: number, value: number) => {
    const updatedRates = [...commissionRates];
    updatedRates[index].percentage = value;
    setCommissionRates(updatedRates);
  };

  const handleToggleActive = (index: number) => {
    const updatedRates = [...commissionRates];
    updatedRates[index].active = !updatedRates[index].active;
    setCommissionRates(updatedRates);
  };

  const saveCommissionRates = async () => {
    try {
      // Para cada taxa, inserir ou atualizar no banco de dados
      for (const rate of commissionRates) {
        const { error } = await supabase
          .from("commission_rates")
          .upsert(
            {
              id: rate.id,
              product: rate.product,
              percentage: rate.percentage,
              active: rate.active,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (error) throw error;
      }
      toast.success("Taxas de comissão atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao salvar taxas: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Configuração de Comissões</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rates">Taxas por Produto</TabsTrigger>
              <TabsTrigger value="periods">Períodos de Pagamento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rates" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Porcentagens de Comissão por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center">
                      <p>Carregando...</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {commissionRates.map((rate, index) => {
                          const product = productOptions.find(p => p.id === rate.product);
                          return (
                            <div key={rate.product} className="flex items-center justify-between space-x-4">
                              <div className="flex-1">
                                <label className="text-sm font-medium">{product?.label || rate.product}</label>
                              </div>
                              <div className="w-20">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={rate.percentage || 0}
                                  onChange={(e) => handleRateChange(index, parseFloat(e.target.value))}
                                  disabled={!rate.active}
                                  className="text-right"
                                />
                              </div>
                              <div className="w-10 text-center">%</div>
                              <div>
                                <Button
                                  variant={rate.active ? "default" : "outline"}
                                  onClick={() => handleToggleActive(index)}
                                  size="sm"
                                >
                                  {rate.active ? "Ativo" : "Inativo"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-6">
                        <Button onClick={saveCommissionRates}>Salvar Configurações</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="periods" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Períodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <h3 className="text-lg font-medium mb-2">Semanal</h3>
                        <p className="text-sm text-gray-500 mb-4">Pagamento de comissões a cada semana.</p>
                        <p className="text-sm">Processado toda segunda-feira</p>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="text-lg font-medium mb-2">Quinzenal</h3>
                        <p className="text-sm text-gray-500 mb-4">Pagamento de comissões a cada duas semanas.</p>
                        <p className="text-sm">Processado nos dias 15 e 30 de cada mês</p>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="text-lg font-medium mb-2">Mensal</h3>
                        <p className="text-sm text-gray-500 mb-4">Pagamento de comissões uma vez por mês.</p>
                        <p className="text-sm">Processado no último dia do mês</p>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default CommissionSettings;
