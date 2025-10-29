import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CommissionRate, CommissionTier } from "@/types/models";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FixedRateForm from "@/components/commission/FixedRateForm";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import VariableRateForm from "@/components/commission/VariableRateForm";

const CommissionSettings = () => {
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewRateForm, setShowNewRateForm] = useState(false);
  const [showNewTierForm, setShowNewTierForm] = useState(false);
  const [editingRate, setEditingRate] = useState<CommissionRate | null>(null);
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null);

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      
      const { data: ratesData, error: ratesError } = await supabase
        .from('commission_rates')
        .select('*')
        .order('product', { ascending: true });
      
      if (ratesError) throw ratesError;
      
      const { data: tiersData, error: tiersError } = await supabase
        .from('commission_tiers')
        .select('*')
        .order('product', { ascending: true })
        .order('min_amount', { ascending: true });
      
      if (tiersError) throw tiersError;
      
      // Add default values for backward compatibility
      const processedRates = (ratesData || []).map((rate: any) => ({
        ...rate,
        commission_type: rate.commission_type || 'percentage',
        fixed_value: rate.fixed_value || null
      })) as CommissionRate[];

      const processedTiers = (tiersData || []).map((tier: any) => ({
        ...tier,
        commission_type: tier.commission_type || 'percentage',
        fixed_value: tier.fixed_value || null
      })) as CommissionTier[];
      
      setRates(processedRates);
      setTiers(processedTiers);
    } catch (error: any) {
      console.error("Error fetching commission data:", error);
      toast.error("Erro ao carregar dados de comissões");
    } finally {
      setLoading(false);
    }
  };

  const handleRateActivation = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('commission_rates')
        .update({ active: !active })
        .eq('id', id);
      
      if (error) throw error;
      
      setRates(rates.map(rate =>
        rate.id === id ? { ...rate, active: !active } : rate
      ));
      
      toast.success(`Taxa ${!active ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error: any) {
      console.error("Error updating rate status:", error);
      toast.error("Erro ao atualizar status da taxa");
    }
  };

  const handleTierActivation = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('commission_tiers')
        .update({ active: !active })
        .eq('id', id);
      
      if (error) throw error;
      
      setTiers(tiers.map(tier =>
        tier.id === id ? { ...tier, active: !active } : tier
      ));
      
      toast.success(`Nível ${!active ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error: any) {
      console.error("Error updating tier status:", error);
      toast.error("Erro ao atualizar status do nível");
    }
  };

  const handleDeleteRate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('commission_rates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setRates(rates.filter(rate => rate.id !== id));
      toast.success("Taxa de comissão excluída com sucesso");
    } catch (error: any) {
      console.error("Error deleting rate:", error);
      toast.error("Erro ao excluir taxa de comissão");
    }
  };

  const handleDeleteTier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('commission_tiers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTiers(tiers.filter(tier => tier.id !== id));
      toast.success("Nível de comissão excluído com sucesso");
    } catch (error: any) {
      console.error("Error deleting tier:", error);
      toast.error("Erro ao excluir nível de comissão");
    }
  };

  const onRateSave = () => {
    fetchCommissionData();
    setShowNewRateForm(false);
    setEditingRate(null);
  };

  const onTierSave = () => {
    fetchCommissionData();
    setShowNewTierForm(false);
    setEditingTier(null);
  };

  const renderRatesTable = () => (
    <>
      {showNewRateForm || editingRate ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{editingRate ? "Editar Taxa Fixa" : "Nova Taxa Fixa"}</CardTitle>
          </CardHeader>
          <CardContent>
            <FixedRateForm 
              onCancel={() => {
                setShowNewRateForm(false);
                setEditingRate(null);
              }}
              onSave={onRateSave}
              initialData={editingRate}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowNewRateForm(true)} className="flex items-center gap-1">
            <PlusCircle className="h-5 w-5" /> Adicionar Taxa Fixa
          </Button>
        </div>
      )}

      <Table>
                        <TableCaption>Lista de comissões fixas por produto.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Produto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
                                  <TableCell colSpan={6} className="text-center py-8">Carregando comissões...</TableCell>
            </TableRow>
          ) : rates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">Nenhuma taxa de comissão encontrada.</TableCell>
            </TableRow>
          ) : (
            rates.map((rate) => (
              <TableRow key={rate.id} className={!rate.active ? "opacity-60" : ""}>
                <TableCell className="font-medium">{rate.product}</TableCell>
                <TableCell>{rate.name || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {rate.commission_type === 'percentage' ? (
                      <>
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-medium text-blue-600">Percentual</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">💰</span>
                        <span className="text-sm font-medium text-green-600">Valor Fixo</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {rate.commission_type === 'percentage' 
                    ? <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">{rate.percentage}%</span>
                    : <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">R$ {rate.fixed_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
                  }
                </TableCell>
                <TableCell>
                  <Switch
                    id={`rate-active-${rate.id}`}
                    checked={rate.active}
                    onCheckedChange={() => handleRateActivation(rate.id, rate.active)}
                  />
                  <Label
                    htmlFor={`rate-active-${rate.id}`}
                    className="sr-only"
                  >
                    Ativo
                  </Label>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingRate(rate)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600" 
                      onClick={() => handleDeleteRate(rate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );

  const renderTiersTable = () => (
    <>
      {showNewTierForm || editingTier ? (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{editingTier ? "Editar Taxa Variável" : "Nova Taxa Variável"}</CardTitle>
          </CardHeader>
          <CardContent>
            <VariableRateForm 
              onCancel={() => {
                setShowNewTierForm(false);
                setEditingTier(null);
              }}
              onSave={onTierSave}
              initialData={editingTier}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowNewTierForm(true)} className="flex items-center gap-1">
            <PlusCircle className="h-5 w-5" /> Adicionar Taxa Variável
          </Button>
        </div>
      )}

      <Table>
                        <TableCaption>Lista de comissões variáveis por produto, valor ou prazo.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Produto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Faixa</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Máximo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
                                  <TableCell colSpan={8} className="text-center py-8">Carregando comissões...</TableCell>
            </TableRow>
          ) : tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">Nenhuma taxa de comissão encontrada.</TableCell>
            </TableRow>
          ) : (
            tiers.map((tier) => (
              <TableRow key={tier.id} className={!tier.active ? "opacity-60" : ""}>
                <TableCell className="font-medium">{tier.product}</TableCell>
                <TableCell>{tier.name || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(tier.tier_type || 'value') === 'value' ? (
                      <>
                        <span className="text-lg">💰</span>
                        <span className="text-sm font-medium text-green-600">Valor</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">📅</span>
                        <span className="text-sm font-medium text-purple-600">Prazo</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {(tier.tier_type || 'value') === 'value' 
                    ? <span className="font-medium text-slate-700">R$ {tier.min_amount.toLocaleString('pt-BR')}</span>
                    : <span className="font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">{tier.min_period || 0}x</span>
                  }
                </TableCell>
                <TableCell>
                  {(tier.tier_type || 'value') === 'value' 
                    ? (tier.max_amount ? <span className="font-medium text-slate-700">R$ {tier.max_amount.toLocaleString('pt-BR')}</span> : <span className="text-gray-500 italic">Sem limite</span>)
                    : (tier.max_period ? <span className="font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded">{tier.max_period}x</span> : <span className="text-gray-500 italic">Sem limite</span>)
                  }
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {tier.commission_type === 'percentage' ? (
                      <>
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-medium text-blue-600">Percentual</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">💰</span>
                        <span className="text-sm font-medium text-green-600">Valor Fixo</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {tier.commission_type === 'percentage' 
                    ? <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">{tier.percentage}%</span>
                    : <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">R$ {tier.fixed_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
                  }
                </TableCell>
                <TableCell>
                  <Switch
                    id={`tier-active-${tier.id}`}
                    checked={tier.active}
                    onCheckedChange={() => handleTierActivation(tier.id, tier.active)}
                  />
                  <Label
                    htmlFor={`tier-active-${tier.id}`}
                    className="sr-only"
                  >
                    Ativo
                  </Label>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingTier(tier)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600" 
                      onClick={() => handleDeleteTier(tier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 w-full flex">
        <AppSidebar />
        <div className="flex-1 w-full overflow-hidden min-w-0">
          <Header />
          <main className="w-full h-full">
            <div className="p-6 space-y-6">
              {/* Header moderno customizado */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl mb-8 shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Configurações de Comissões</h1>
                <p className="text-blue-100 text-lg mt-1">Gerencie as regras e faixas de comissão do sistema</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Total de Configurações</div>
                <div className="text-2xl font-bold">
                  {rates.length + tiers.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="rates">Comissões Fixas</TabsTrigger>
            <TabsTrigger value="tiers">Comissões Variáveis (Por Faixa de Valor ou Prazo)</TabsTrigger>
          </TabsList>
          <TabsContent value="rates">
            {renderRatesTable()}
          </TabsContent>
          <TabsContent value="tiers">
            {renderTiersTable()}
          </TabsContent>
        </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CommissionSettings;
