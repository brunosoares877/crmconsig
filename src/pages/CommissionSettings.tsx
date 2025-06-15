
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
import CommissionRateForm from "@/components/commission/CommissionRateForm";
import CommissionTierForm from "@/components/commission/CommissionTierForm";
import DefaultCommissionsButton from "@/components/commission/DefaultCommissionsButton";
import Sidebar from "@/components/Sidebar";
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
      
      setRates(ratesData || []);
      setTiers(tiersData || []);
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
            <CommissionRateForm 
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
        <div className="mb-4 flex justify-between items-center">
          <DefaultCommissionsButton onSuccess={fetchCommissionData} />
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
            <TableHead>Percentagem</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">Carregando taxas de comissão...</TableCell>
            </TableRow>
          ) : rates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">Nenhuma taxa de comissão encontrada.</TableCell>
            </TableRow>
          ) : (
            rates.map((rate) => (
              <TableRow key={rate.id} className={!rate.active ? "opacity-60" : ""}>
                <TableCell className="font-medium">{rate.product}</TableCell>
                <TableCell>{rate.name || "-"}</TableCell>
                <TableCell>{rate.percentage}%</TableCell>
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
            <CommissionTierForm 
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
            <TableHead>Percentagem</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">Carregando taxas de comissão...</TableCell>
            </TableRow>
          ) : tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">Nenhuma taxa de comissão encontrada.</TableCell>
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
                <TableCell>{tier.percentage}%</TableCell>
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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurações de Comissões</h1>

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
        </main>
      </div>
    </div>
  );
};

export default CommissionSettings;
