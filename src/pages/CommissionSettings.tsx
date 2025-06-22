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
import PageLayout from "@/components/PageLayout";
import FixedRateForm from "@/components/commission/FixedRateForm";
import VariableRateForm from "@/components/commission/VariableRateForm";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";

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
        <TableCaption>Lista de taxas de comissão fixas por produto.</TableCaption>
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
              <TableCell colSpan={6} className="text-center py-8">Carregando taxas de comissão...</TableCell>
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
                    ? `${rate.percentage}%`
                    : `R$ ${rate.fixed_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`
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
        <TableCaption>Lista de taxas de comissão variáveis por produto e valor.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Produto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Valor Mínimo</TableHead>
            <TableHead>Valor Máximo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">Carregando taxas de comissão...</TableCell>
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
                <TableCell>R$ {tier.min_amount.toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  {tier.max_amount 
                    ? `R$ ${tier.max_amount.toLocaleString('pt-BR')}` 
                    : "Sem limite"}
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
                    ? `${tier.percentage}%`
                    : `R$ ${tier.fixed_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`
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
    <PageLayout
      title="Configurações de Comissões"
      subtitle="Gerencie as regras e faixas de comissão do sistema"
    >
      <div className="space-y-8">
        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="rates">Taxas Fixas</TabsTrigger>
            <TabsTrigger value="tiers">Taxas Variáveis (Por Faixa de Valor)</TabsTrigger>
          </TabsList>
          <TabsContent value="rates">
            {renderRatesTable()}
          </TabsContent>
          <TabsContent value="tiers">
            {renderTiersTable()}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CommissionSettings;
