
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Bank {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
}

interface BenefitType {
  id: number;
  description: string;
  code: string;
}

const LeadsConfig = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newBankName, setNewBankName] = useState("");
  const [newBankCode, setNewBankCode] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductCode, setNewProductCode] = useState("");
  const [newBenefitName, setNewBenefitName] = useState("");
  const [newBenefitCode, setNewBenefitCode] = useState("");
  
  // Edit states
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Load banks from localStorage
      const savedBanks = localStorage.getItem('configBanks');
      if (savedBanks) {
        setBanks(JSON.parse(savedBanks));
      } else {
        // Default banks
        const defaultBanks = [
          { id: "1", name: "Banco do Brasil", code: "001" },
          { id: "2", name: "Caixa Econômica Federal", code: "104" },
          { id: "3", name: "Itaú", code: "341" },
          { id: "4", name: "Bradesco", code: "237" },
          { id: "5", name: "Santander", code: "033" }
        ];
        setBanks(defaultBanks);
        localStorage.setItem('configBanks', JSON.stringify(defaultBanks));
      }

      // Load products from localStorage
      const savedProducts = localStorage.getItem('configProducts');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        // Default products
        const defaultProducts = [
          { id: "1", name: "Empréstimo Novo", code: "novo" },
          { id: "2", name: "Portabilidade", code: "portabilidade" },
          { id: "3", name: "Refinanciamento", code: "refinanciamento" },
          { id: "4", name: "FGTS", code: "fgts" },
          { id: "5", name: "Cartão de Crédito", code: "cartao" }
        ];
        setProducts(defaultProducts);
        localStorage.setItem('configProducts', JSON.stringify(defaultProducts));
      }

      // Fetch benefit types from Supabase
      const { data: benefitData, error: benefitError } = await supabase
        .from('benefit_types')
        .select('*')
        .order('description');

      if (benefitError) throw benefitError;
      setBenefitTypes(benefitData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const addBenefit = async () => {
    if (!newBenefitName.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('benefit_types')
        .insert({
          description: newBenefitName.trim(),
          code: newBenefitCode.trim() || ""
        })
        .select()
        .single();

      if (error) throw error;

      setBenefitTypes([...benefitTypes, data]);
      setNewBenefitName("");
      setNewBenefitCode("");
      toast.success("Tipo de benefício adicionado com sucesso!");
    } catch (error: any) {
      console.error('Error adding benefit:', error);
      toast.error(`Erro ao adicionar tipo de benefício: ${error.message}`);
    }
  };

  const deleteBenefit = async (id: number) => {
    try {
      const { error } = await supabase
        .from('benefit_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBenefitTypes(benefitTypes.filter(b => b.id !== id));
      toast.success("Tipo de benefício removido com sucesso!");
    } catch (error: any) {
      console.error('Error deleting benefit:', error);
      toast.error(`Erro ao remover tipo de benefício: ${error.message}`);
    }
  };

  const addBank = () => {
    if (!newBankName.trim()) {
      toast.error("Nome do banco é obrigatório");
      return;
    }

    const newBank = {
      id: Date.now().toString(),
      name: newBankName.trim(),
      code: newBankCode.trim() || ""
    };

    const updatedBanks = [...banks, newBank];
    setBanks(updatedBanks);
    localStorage.setItem('configBanks', JSON.stringify(updatedBanks));
    setNewBankName("");
    setNewBankCode("");
    toast.success("Banco adicionado com sucesso!");
  };

  const deleteBank = (id: string) => {
    const updatedBanks = banks.filter(b => b.id !== id);
    setBanks(updatedBanks);
    localStorage.setItem('configBanks', JSON.stringify(updatedBanks));
    toast.success("Banco removido com sucesso!");
  };

  const addProduct = () => {
    if (!newProductName.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: newProductName.trim(),
      code: newProductCode.trim() || ""
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('configProducts', JSON.stringify(updatedProducts));
    setNewProductName("");
    setNewProductCode("");
    toast.success("Produto adicionado com sucesso!");
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('configProducts', JSON.stringify(updatedProducts));
    toast.success("Produto removido com sucesso!");
  };

  if (loading) {
    return (
      <PageLayout title="Configurações de Leads" subtitle="Gerencie bancos, produtos e tipos de benefícios">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Configurações de Leads" 
      subtitle="Gerencie bancos, produtos e tipos de benefícios para seus leads"
    >
      <Tabs defaultValue="banks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="banks">Bancos</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="benefits">Tipos de Benefícios</TabsTrigger>
        </TabsList>

        <TabsContent value="banks">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Bancos</CardTitle>
              <CardDescription>
                Adicione ou remova bancos disponíveis para seleção nos leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="bankName">Nome do Banco *</Label>
                  <Input
                    id="bankName"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="Ex: Banco Central"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="bankCode">Código (opcional)</Label>
                  <Input
                    id="bankCode"
                    value={newBankCode}
                    onChange={(e) => setNewBankCode(e.target.value)}
                    placeholder="Ex: 001"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addBank}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {banks.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {bank.code || "Não informado"}
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteBank(bank.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Produtos</CardTitle>
              <CardDescription>
                Adicione ou remova produtos disponíveis para seleção nos leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="productName">Nome do Produto *</Label>
                  <Input
                    id="productName"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ex: Empréstimo Pessoal"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="productCode">Código (opcional)</Label>
                  <Input
                    id="productCode"
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    placeholder="Ex: pessoal"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {product.code || "Não informado"}
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Tipos de Benefícios</CardTitle>
              <CardDescription>
                Adicione ou remova tipos de benefícios disponíveis para seleção nos leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="benefitName">Descrição do Benefício *</Label>
                  <Input
                    id="benefitName"
                    value={newBenefitName}
                    onChange={(e) => setNewBenefitName(e.target.value)}
                    placeholder="Ex: Aposentadoria por Invalidez"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="benefitCode">Código (opcional)</Label>
                  <Input
                    id="benefitCode"
                    value={newBenefitCode}
                    onChange={(e) => setNewBenefitCode(e.target.value)}
                    placeholder="Ex: 32"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addBenefit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {benefitTypes.map((benefit) => (
                  <div key={benefit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{benefit.description}</div>
                      <div className="text-sm text-muted-foreground">
                        Código: {benefit.code || "Não informado"}
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteBenefit(benefit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default LeadsConfig;
