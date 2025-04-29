
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CommissionRate, CommissionTier } from "@/types/models";
import { Switch } from "@/components/ui/switch";
import { Percent } from "lucide-react";

const productOptions = [{
  id: "portabilidade",
  label: "Portabilidade"
}, {
  id: "refinanciamento",
  label: "Refinanciamento"
}, {
  id: "crefaz",
  label: "Crefaz"
}, {
  id: "novo",
  label: "Novo"
}, {
  id: "clt",
  label: "CLT"
}, {
  id: "fgts",
  label: "FGTS"
}];

const CommissionSettings = () => {
  const [commissionRates, setCommissionRates] = useState<CommissionRate[]>([]);
  const [commissionTiers, setCommissionTiers] = useState<CommissionTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rates");
  const [selectedProduct, setSelectedProduct] = useState<string>("fgts");
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTier, setNewTier] = useState({
    min_amount: "",
    max_amount: "",
    percentage: "",
    name: ""
  });

  useEffect(() => {
    fetchCommissionRates();
    fetchCommissionTiers();
  }, []);

  const fetchCommissionRates = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("commission_rates").select("*").order("product");
      if (error) throw error;
      
      console.log("Commission rates data:", data);
      
      if (data && data.length > 0) {
        const typedData: CommissionRate[] = data.map(rate => ({
          id: rate.id,
          product: rate.product,
          percentage: rate.percentage,
          active: rate.active,
          created_at: rate.created_at || '',
          updated_at: rate.updated_at || '',
          user_id: rate.user_id || '',
          name: rate.name || null
        }));
        setCommissionRates(typedData);
      } else {
        const defaultRates = productOptions.map(product => ({
          id: product.id,
          product: product.id,
          percentage: 0,
          active: true,
          created_at: '',
          updated_at: '',
          user_id: '',
          name: null
        }));
        setCommissionRates(defaultRates);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar taxas de comissão: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommissionTiers = async () => {
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("commission_tiers").select("*").order("product").order("min_amount");
      if (error) throw error;
      
      console.log("Commission tiers data:", data);
      
      if (data && data.length > 0) {
        const typedData: CommissionTier[] = data.map(tier => ({
          id: tier.id,
          product: tier.product,
          min_amount: tier.min_amount,
          max_amount: tier.max_amount,
          percentage: tier.percentage,
          active: tier.active,
          created_at: tier.created_at || '',
          updated_at: tier.updated_at || '',
          user_id: tier.user_id || '',
          name: tier.name || null
        }));
        setCommissionTiers(typedData);
      }
    } catch (error: any) {
      toast.error(`Erro ao carregar faixas de comissão: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateChange = (index: number, field: string, value: any) => {
    const updatedRates = [...commissionRates];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: value
    };
    setCommissionRates(updatedRates);
  };

  const handleToggleActive = (index: number) => {
    const updatedRates = [...commissionRates];
    updatedRates[index].active = !updatedRates[index].active;
    setCommissionRates(updatedRates);
  };

  const handleTierChange = (id: string, field: string, value: any) => {
    const updatedTiers = commissionTiers.map(tier => {
      if (tier.id === id) {
        return {
          ...tier,
          [field]: value
        };
      }
      return tier;
    });
    setCommissionTiers(updatedTiers);
  };

  const handleToggleTierActive = (id: string) => {
    const updatedTiers = commissionTiers.map(tier => {
      if (tier.id === id) {
        return {
          ...tier,
          active: !tier.active
        };
      }
      return tier;
    });
    setCommissionTiers(updatedTiers);
  };

  const saveCommissionRates = async () => {
    try {
      console.log("Saving commission rates:", commissionRates);
      for (const rate of commissionRates) {
        const {
          error
        } = await supabase.from("commission_rates").upsert({
          id: rate.id,
          product: rate.product,
          percentage: rate.percentage,
          active: rate.active,
          name: rate.name || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "id"
        });
        if (error) throw error;
      }
      toast.success("Taxas de comissão atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao salvar taxas: ${error.message}`);
    }
  };

  const saveCommissionTiers = async () => {
    try {
      console.log("Saving commission tiers:", commissionTiers);
      for (const tier of commissionTiers) {
        const {
          error
        } = await supabase.from("commission_tiers").upsert({
          id: tier.id,
          product: tier.product,
          min_amount: tier.min_amount,
          max_amount: tier.max_amount,
          percentage: tier.percentage,
          active: tier.active,
          name: tier.name || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "id"
        });
        if (error) throw error;
      }
      toast.success("Faixas de comissão atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao salvar faixas de comissão: ${error.message}`);
    }
  };

  const addNewTier = async () => {
    try {
      if (!newTier.percentage) {
        toast.error("Porcentagem é obrigatória");
        return;
      }
      const minAmount = newTier.min_amount ? parseFloat(newTier.min_amount) : 0;
      const maxAmount = newTier.max_amount ? parseFloat(newTier.max_amount) : null;
      const percentage = parseFloat(newTier.percentage);
      
      if (percentage < 0 || minAmount < 0 || maxAmount !== null && maxAmount <= minAmount) {
        toast.error("Valores inválidos. Verifique se o valor máximo é maior que o mínimo");
        return;
      }
      
      console.log("Adding new tier with data:", {
        product: selectedProduct,
        min_amount: minAmount,
        max_amount: maxAmount,
        percentage: percentage,
        active: true,
        name: newTier.name || null
      });
      
      const {
        data,
        error
      } = await supabase.from("commission_tiers").insert({
        product: selectedProduct as CommissionTier["product"],
        min_amount: minAmount,
        max_amount: maxAmount,
        percentage: percentage,
        active: true,
        name: newTier.name || null
      }).select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (data) {
        console.log("New tier created:", data);
        setCommissionTiers([...commissionTiers, data[0] as CommissionTier]);
        setNewTier({
          min_amount: "",
          max_amount: "",
          percentage: "",
          name: ""
        });
        setShowAddTier(false);
        toast.success("Nova faixa de comissão adicionada");
      }
    } catch (error: any) {
      console.error("Error adding tier:", error);
      toast.error(`Erro ao adicionar faixa: ${error.message}`);
    }
  };

  const deleteTier = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from("commission_tiers").delete().eq("id", id);
      if (error) throw error;
      setCommissionTiers(commissionTiers.filter(tier => tier.id !== id));
      toast.success("Faixa de comissão removida com sucesso");
    } catch (error: any) {
      toast.error(`Erro ao remover faixa: ${error.message}`);
    }
  };

  const filteredTiers = commissionTiers.filter(tier => tier.product === selectedProduct);
  const sortedTiers = [...filteredTiers].sort((a, b) => a.min_amount - b.min_amount);

  return <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Configuração de Comissões</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rates">Comissões Fixas</TabsTrigger>
              <TabsTrigger value="tiers">Tabelas</TabsTrigger>
              <TabsTrigger value="periods">Períodos de Pagamento</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rates" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Porcentagens de Comissão por Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? <div className="flex justify-center">
                      <p>Carregando...</p>
                    </div> : <>
                      <div className="space-y-4">
                        {commissionRates.map((rate, index) => {
                      const product = productOptions.find(p => p.id === rate.product);
                      return <div key={rate.id} className="flex items-center justify-between space-x-4">
                              <div className="flex-1">
                                <label className="text-sm font-medium">{product?.label || rate.product}</label>
                              </div>
                              <div className="w-48">
                                <Input placeholder="Nome/Descrição" value={rate.name || ""} onChange={e => handleRateChange(index, "name", e.target.value)} disabled={!rate.active} className="text-left" />
                              </div>
                              <div className="w-20">
                                <Input type="number" min="0" max="100" step="0.5" value={rate.percentage || 0} onChange={e => handleRateChange(index, "percentage", parseFloat(e.target.value))} disabled={!rate.active} className="text-right" />
                              </div>
                              <div className="w-10 text-center">%</div>
                              <div>
                                <Switch checked={rate.active} onCheckedChange={() => handleToggleActive(index)} />
                              </div>
                            </div>;
                    })}
                      </div>
                      <div className="mt-6">
                        <Button onClick={saveCommissionRates}>Salvar Configurações</Button>
                      </div>
                    </>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tiers" className="py-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Faixas de Comissão por Valor</CardTitle>
                  <div className="flex space-x-2">
                    <select className="border rounded px-2 py-1 bg-background" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                      {productOptions.map(option => <option key={option.id} value={option.id}>
                          {option.label}
                        </option>)}
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? <div className="flex justify-center">
                      <p>Carregando...</p>
                    </div> : <>
                      <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-9 gap-4 font-medium text-sm border-b pb-2">
                          <div className="col-span-2">Descrição</div>
                          <div className="col-span-1">Valor Mínimo (R$)</div>
                          <div className="col-span-1">Valor Máximo (R$)</div>
                          <div className="col-span-1">Comissão (%)</div>
                          <div className="col-span-1">Status</div>
                          <div className="col-span-2">Ações</div>
                        </div>

                        {commissionTiers.filter(tier => tier.product === selectedProduct).length > 0 ? commissionTiers.filter(tier => tier.product === selectedProduct).sort((a, b) => a.min_amount - b.min_amount).map(tier => <div key={tier.id} className="grid grid-cols-9 gap-4 items-center">
                                <div className="col-span-2">
                                  <Input type="text" placeholder="Descrição" value={tier.name || ""} onChange={e => handleTierChange(tier.id, "name", e.target.value)} disabled={!tier.active} />
                                </div>
                                <div className="col-span-1">
                                  <Input type="number" value={tier.min_amount} onChange={e => handleTierChange(tier.id, "min_amount", parseFloat(e.target.value))} disabled={!tier.active} min="0" />
                                </div>
                                <div className="col-span-1">
                                  <Input type="number" value={tier.max_amount || ""} onChange={e => {
                          const value = e.target.value ? parseFloat(e.target.value) : null;
                          handleTierChange(tier.id, "max_amount", value);
                        }} disabled={!tier.active} min={tier.min_amount} placeholder="Sem limite" />
                                </div>
                                <div className="col-span-1 flex items-center">
                                  <Input type="number" placeholder="%" min="0" max="100" step="0.5" value={tier.percentage} onChange={e => handleTierChange(tier.id, "percentage", parseFloat(e.target.value))} disabled={!tier.active} className="w-16" />
                                  <Percent className="h-4 w-4 ml-1" />
                                </div>
                                <div className="col-span-1">
                                  <Switch checked={tier.active} onCheckedChange={() => handleToggleTierActive(tier.id)} />
                                </div>
                                <div className="col-span-2 flex space-x-2">
                                  <Button variant="destructive" size="sm" onClick={() => deleteTier(tier.id)}>
                                    Excluir
                                  </Button>
                                </div>
                              </div>) : <div className="text-center py-4 text-muted-foreground">
                            Nenhuma faixa definida para este produto
                          </div>}

                        {showAddTier ? <div className="grid grid-cols-9 gap-4 items-center mt-4 pt-4 border-t">
                            <div className="col-span-2">
                              <Input type="text" placeholder="Descrição" value={newTier.name} onChange={e => setNewTier({
                          ...newTier,
                          name: e.target.value
                        })} />
                            </div>
                            <div className="col-span-1">
                              <Input type="number" placeholder="Valor Mínimo" value={newTier.min_amount} onChange={e => setNewTier({
                          ...newTier,
                          min_amount: e.target.value
                        })} min="0" />
                            </div>
                            <div className="col-span-1">
                              <Input type="number" placeholder="Valor Máximo (opcional)" value={newTier.max_amount} onChange={e => setNewTier({
                          ...newTier,
                          max_amount: e.target.value
                        })} min={newTier.min_amount} />
                            </div>
                            <div className="col-span-1 flex items-center">
                              <Input type="number" placeholder="%" min="0" max="100" step="0.5" value={newTier.percentage} onChange={e => setNewTier({
                          ...newTier,
                          percentage: e.target.value
                        })} className="w-16" />
                              <Percent className="h-4 w-4 ml-1" />
                            </div>
                            <div className="col-span-4 flex space-x-2">
                              <Button variant="default" size="sm" onClick={addNewTier}>
                                Salvar
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                          setShowAddTier(false);
                          setNewTier({
                            min_amount: "",
                            max_amount: "",
                            percentage: "",
                            name: ""
                          });
                        }}>
                                Cancelar
                              </Button>
                            </div>
                          </div> : <Button onClick={() => setShowAddTier(true)} className="mt-4">
                            Adicionar Nova Faixa
                          </Button>}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button onClick={saveCommissionTiers}>
                          Salvar Todas as Faixas
                        </Button>
                      </div>
                    </>}
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
    </div>;
};

export default CommissionSettings;
