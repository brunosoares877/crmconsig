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
import { PostgrestError } from "@/types/database.types";
import logger from "@/utils/logger";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Default data from other components
const DEFAULT_BANKS = [
  { code: "001", name: "Banco do Brasil" },
  { code: "003", name: "Banco da Amazônia" },
  { code: "004", name: "Banco do Nordeste" },
  { code: "021", name: "Banestes (Banco do Estado do Espírito Santo)" },
  { code: "025", name: "Banco Alfa" },
  { code: "033", name: "Santander" },
  { code: "041", name: "Banrisul" },
  { code: "070", name: "BRB (Banco de Brasília)" },
  { code: "077", name: "Banco Inter" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "121", name: "Agibank" },
  { code: "212", name: "Banco Original" },
  { code: "237", name: "Bradesco" },
  { code: "318", name: "Banco BMG" },
  { code: "320", name: "CCB Brasil (China Construction Bank)" },
  { code: "336", name: "C6 Bank" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "371", name: "Banco Bari" },
  { code: "389", name: "Banco Mercantil do Brasil" },
  { code: "422", name: "Banco Safra" },
  { code: "604", name: "Banco Industrial" },
  { code: "623", name: "Banco PAN" },
  { code: "640", name: "Banco Inbursa" },
  { code: "654", name: "Banco A.J. Renner (Parati Financeira)" },
  { code: "655", name: "Banco Votorantim (BV Financeira)" },
  { code: "707", name: "Banco Daycoval" },
  { code: "739", name: "Cetelem (BNP Paribas)" },
  { code: "743", name: "Banco Semear" },
  { code: "777", name: "Banco JP Morgan (atua em nichos)" }
];

// DEFAULT_PRODUCTS removidos - funcionalidade de produtos desabilitada

const DEFAULT_BENEFIT_TYPES = [
  { code: "01", description: "Pensão por morte – trabalhador rural" },
  { code: "02", description: "Pensão por morte acidentária" },
  { code: "03", description: "Pensão por morte – empregador rural" },
  { code: "04", description: "Aposentadoria por invalidez – trabalhador rural" },
  { code: "05", description: "Aposentadoria por invalidez acidentária – trabalhador rural" },
  { code: "06", description: "Aposentadoria por invalidez – empregador rural" },
  { code: "07", description: "Aposentadoria por velhice – trabalhador rural" },
  { code: "08", description: "Aposentadoria por idade – empregador rural" },
  { code: "11", description: "Amparo previdenciário por invalidez – trabalhador rural" },
  { code: "12", description: "Amparo previdenciário por idade – trabalhador rural" },
  { code: "18", description: "Auxílio-inclusão" },
  { code: "19", description: "Pensão de estudante" },
  { code: "20", description: "Pensão por morte de ex-diplomata" },
  { code: "21", description: "Pensão por morte previdenciária" },
  { code: "22", description: "Pensão por morte estatutária" },
  { code: "23", description: "Pensão por morte de ex-combatente" },
  { code: "24", description: "Pensão especial – ato institucional" },
  { code: "26", description: "Pensão por morte especial" },
  { code: "27", description: "Pensão por morte de servidor público federal" },
  { code: "28", description: "Pensão por morte – Regime Geral" },
  { code: "29", description: "Pensão por morte de ex-combatente marítimo" },
  { code: "30", description: "Renda mensal vitalícia por incapacidade" },
  { code: "32", description: "Aposentadoria por invalidez previdenciária" },
  { code: "33", description: "Aposentadoria por invalidez de aeronauta" },
  { code: "34", description: "Aposentadoria por invalidez de ex-combatente marítimo" },
  { code: "37", description: "Aposentadoria de extranumerário da CAPIN" },
  { code: "38", description: "Aposentadoria de extranumerário – funcionários públicos" },
  { code: "40", description: "Renda mensal vitalícia por idade" },
  { code: "41", description: "Aposentadoria por idade" },
  { code: "42", description: "Aposentadoria por tempo de contribuição" },
  { code: "43", description: "Aposentadoria por tempo de contribuição de ex-combatente" },
  { code: "44", description: "Aposentadoria especial de aeronauta" },
  { code: "45", description: "Aposentadoria por tempo de serviço – jornalista" },
  { code: "46", description: "Aposentadoria especial" },
  { code: "49", description: "Aposentadoria ordinária" },
  { code: "51", description: "Aposentadoria por invalidez – extinto plano básico" },
  { code: "52", description: "Aposentadoria por idade – extinto plano básico" },
  { code: "54", description: "Pensão indenizatória a cargo da União" },
  { code: "55", description: "Pensão por morte – extinto plano básico" },
  { code: "56", description: "Pensão mensal vitalícia – síndrome da talidomida" },
  { code: "57", description: "Aposentadoria por tempo de serviço de professores" },
  { code: "58", description: "Aposentadoria de anistiados" },
  { code: "59", description: "Pensão por morte de anistiados" },
  { code: "60", description: "Benefício indenizatório a cargo da União" },
  { code: "72", description: "Aposentadoria por tempo de serviço" },
  { code: "78", description: "Aposentadoria por idade (ex-combatente marítimo)" },
  { code: "81", description: "Aposentadoria compulsória (ex‑SASSE)" },
  { code: "82", description: "Aposentadoria por tempo de serviço (ex‑SASSE)" },
  { code: "83", description: "Aposentadoria por invalidez (ex‑SASSE)" },
  { code: "84", description: "Pensão por morte (ex‑SASSE)" },
  { code: "87", description: "Amparo assistencial à pessoa com deficiência" },
  { code: "88", description: "Amparo assistencial à pessoa idosa" },
  { code: "89", description: "Pensão especial – vítimas de hemodiálise" },
  { code: "92", description: "Aposentadoria por invalidez por acidente de trabalho" },
  { code: "93", description: "Pensão por morte por acidente de trabalho" },
  { code: "96", description: "Pensão especial – hanseníase" }
];

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

// 1. Funções utilitárias para persistência
function getRemovedIds(key: string): string[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setRemovedIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}
function getEditedItems<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function setEditedItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

const LeadsConfig = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newBankName, setNewBankName] = useState("");
  const [newBankCode, setNewBankCode] = useState("");
  const [newBenefitName, setNewBenefitName] = useState("");
  const [newBenefitCode, setNewBenefitCode] = useState("");

  // Edit states
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<number | null>(null);

  // Persistência em Supabase (fallback se tabela não existir)
  const persistBanksSupabase = async (banksToPersist: Bank[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      // limpa bancos existentes do usuário e insere os novos
      const { error: delErr } = await (supabase.from('banks' as any)).delete().eq('user_id', userData.user.id);
      if (delErr) throw delErr;
      if (banksToPersist.length > 0) {
        const payload = banksToPersist.map((b) => ({
          id: b.id.startsWith('user-') ? b.id : undefined,
          name: b.name,
          code: b.code || "",
          user_id: userData.user.id,
        }));
        const { error: insErr } = await (supabase.from('banks' as any)).insert(payload);
        if (insErr) throw insErr;
      }
    } catch (err) {
      const error = err as PostgrestError | Error;
      // se tabela não existir ou der erro, não quebra fluxo
      logger.warn("Persistência de bancos no Supabase falhou (usando apenas localStorage):", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // --- BANCOS ---
      const savedBanks = localStorage.getItem('configBanks');
      const configuredBanks = savedBanks ? JSON.parse(savedBanks) : [];
      logger.debug('Bancos carregados do localStorage:', configuredBanks);
      const removedBankIds = getRemovedIds('removedBanks');
      const editedBanks = getEditedItems<Bank>('editedBanks');
      const allBanks: Bank[] = [];

      // Buscar bancos do Supabase (se tabela existir)
      let supabaseBanks: Bank[] = [];
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data, error } = await (supabase.from('banks' as any))
            .select('id, name, code')
            .eq('user_id', userData.user.id)
            .order('name');
          if (error) throw error;
          supabaseBanks = (data || []).map((b) => ({
            id: b.id,
            name: b.name,
            code: b.code || "",
          }));
        }
      } catch (err) {
        const error = err as PostgrestError | Error;
        logger.warn("Falha ao carregar bancos do Supabase (usando localStorage):", error.message);
      }

      // Add default banks with generated IDs
      DEFAULT_BANKS.forEach(bank => {
        const id = `default-${bank.code}`;
        // Se foi removido, não adiciona
        if (removedBankIds.includes(id)) return;
        // Se foi editado, adiciona editado
        const edited = editedBanks.find(b => b.id === id);
        if (edited) {
          allBanks.push(edited);
        } else {
          allBanks.push({ id, name: bank.name, code: bank.code });
        }
      });

      // Add configured banks (user-added banks)
      configuredBanks.forEach((configBank: Bank) => {
        // Verificar se não existe duplicado
        // Se ambos têm código, compara código; se não, compara apenas nome
        const exists = allBanks.find(bank => {
          // Se ambos têm código, verifica código OU nome
          if (configBank.code && bank.code) {
            return bank.code.toLowerCase() === configBank.code.toLowerCase() ||
              bank.name.toLowerCase() === configBank.name.toLowerCase();
          }
          // Se algum não tem código, compara apenas nome
          return bank.name.toLowerCase() === configBank.name.toLowerCase();
        });

        if (!exists) {
          allBanks.push(configBank);
        }
      });

      // Add bancos do Supabase (se existirem e não duplicados)
      supabaseBanks.forEach(sb => {
        const exists = allBanks.find(bank => {
          if (sb.code && bank.code) {
            return bank.code.toLowerCase() === sb.code.toLowerCase() ||
              bank.name.toLowerCase() === sb.name.toLowerCase();
          }
          return bank.name.toLowerCase() === sb.name.toLowerCase();
        });
        if (!exists) {
          allBanks.push(sb);
        }
      });

      // Ordenar bancos por nome
      allBanks.sort((a, b) => a.name.localeCompare(b.name));

      setBanks(allBanks);

      // --- PRODUTOS REMOVIDOS ---
      // Funcionalidade de produtos foi desabilitada

      // --- BENEFÍCIOS ---
      const removedBenefitIds = getRemovedIds('removedBenefits');
      const editedBenefits = getEditedItems<BenefitType>('editedBenefits');
      const { data: benefitData, error: benefitError } = await supabase
        .from('benefit_types')
        .select('*')
        .order('description');
      if (benefitError) throw benefitError;
      const dbBenefits = benefitData || [];
      const allBenefits: BenefitType[] = [];
      DEFAULT_BENEFIT_TYPES.forEach((benefit, index) => {
        const id = 1000 + index;
        if (removedBenefitIds.includes(id.toString())) return;
        const edited = editedBenefits.find(b => b.id === id);
        if (edited) {
          allBenefits.push(edited);
        } else {
          allBenefits.push({ id, description: benefit.description, code: benefit.code });
        }
      });
      dbBenefits.forEach((dbBenefit: BenefitType) => {
        if (removedBenefitIds.includes(dbBenefit.id.toString())) return;
        const exists = allBenefits.find(benefit => benefit.code === dbBenefit.code || benefit.description === dbBenefit.description);
        if (!exists) {
          allBenefits.push(dbBenefit);
        }
      });
      setBenefitTypes(allBenefits);

    } catch (error) {
      logger.error('Error fetching data:', error);
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
    } catch (error) {
      const err = error as PostgrestError | Error;
      logger.error('Error adding benefit:', err);
      toast.error(`Erro ao adicionar tipo de benefício: ${err.message}`);
    }
  };

  const deleteBenefit = async (id: number) => {
    try {
      if (id >= 1000) {
        setBenefitTypes(benefitTypes.filter(b => b.id !== id));
        const removed = getRemovedIds('removedBenefits');
        if (!removed.includes(id.toString())) {
          removed.push(id.toString());
          setRemovedIds('removedBenefits', removed);
        }
        toast.success("Tipo de benefício removido com sucesso!");
      } else {
        const { error } = await supabase
          .from('benefit_types')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setBenefitTypes(benefitTypes.filter(b => b.id !== id));
        const removed = getRemovedIds('removedBenefits');
        if (!removed.includes(id.toString())) {
          removed.push(id.toString());
          setRemovedIds('removedBenefits', removed);
        }
        toast.success("Tipo de benefício removido com sucesso!");
      }
    } catch (error) {
      const err = error as PostgrestError | Error;
      logger.error('Error deleting benefit:', err);
      toast.error(`Erro ao remover tipo de benefício: ${err.message}`);
    }
  };

  const addBank = async () => {
    if (!newBankName.trim()) {
      toast.error("Nome do banco é obrigatório");
      return;
    }

    const bankCode = newBankCode.trim();
    const bankName = newBankName.trim();

    // Verificar se já existe banco com mesmo código (se informado) ou nome
    const exists = banks.some(bank => {
      // Se tem código, verifica código E nome
      if (bankCode) {
        return (bank.code.toLowerCase() === bankCode.toLowerCase()) ||
          (bank.name.toLowerCase() === bankName.toLowerCase());
      }
      // Se não tem código, verifica apenas nome
      return bank.name.toLowerCase() === bankName.toLowerCase();
    });

    if (exists) {
      toast.error("Já existe um banco com este código ou nome");
      return;
    }

    const newBank: Bank = {
      id: `user-${Date.now()}`,
      name: bankName,
      code: bankCode || "" // Permite código vazio
    };

    const updatedBanks = [...banks, newBank];
    setBanks(updatedBanks);

    // Save only user-added banks to localStorage (todos os que começam com 'user-')
    const userBanks = updatedBanks.filter(bank => bank.id.startsWith('user-'));

    // Garantir que está salvando corretamente
    try {
      localStorage.setItem('configBanks', JSON.stringify(userBanks));
      logger.debug('Bancos salvos no localStorage:', userBanks);
      await persistBanksSupabase(userBanks);
    } catch (error) {
      logger.error('Erro ao salvar no localStorage/Supabase:', error);
      toast.error('Erro ao salvar banco. Tente novamente.');
      return;
    }

    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('configDataChanged'));

    setNewBankName("");
    setNewBankCode("");
    toast.success("Banco adicionado com sucesso!");
  };

  const deleteBank = async (id: string) => {
    const updatedBanks = banks.filter(b => b.id !== id);
    setBanks(updatedBanks);

    // Se for padrão, salva id em removedBanks
    if (id.startsWith('default-')) {
      const removed = getRemovedIds('removedBanks');
      if (!removed.includes(id)) {
        removed.push(id);
        setRemovedIds('removedBanks', removed);
      }
    } else {
      // Save only user-added banks to localStorage (todos os que começam com 'user-')
      const userBanks = updatedBanks.filter(bank => bank.id.startsWith('user-'));
      try {
        localStorage.setItem('configBanks', JSON.stringify(userBanks));
        logger.debug('Bancos salvos após deletar:', userBanks);
        await persistBanksSupabase(userBanks);
      } catch (error) {
        logger.error('Erro ao salvar no localStorage/Supabase:', error);
        toast.error('Erro ao remover banco. Tente novamente.');
        return;
      }
    }

    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('configDataChanged'));

    toast.success("Banco removido com sucesso!");
  };

  // Funções de produtos removidas - funcionalidade desabilitada

  const editBank = async (id: string, newName: string, newCode: string) => {
    const updatedBanks = banks.map(bank =>
      bank.id === id ? { ...bank, name: newName, code: newCode } : bank
    );
    setBanks(updatedBanks);
    if (id.startsWith('default-')) {
      // Salva edição no localStorage
      const edited = getEditedItems<Bank>('editedBanks');
      const idx = edited.findIndex(b => b.id === id);
      if (idx !== -1) {
        edited[idx] = { id, name: newName, code: newCode };
      } else {
        edited.push({ id, name: newName, code: newCode });
      }
      setEditedItems('editedBanks', edited);
    } else {
      // Save only user-added banks (todos os que começam com 'user-')
      const userBanks = updatedBanks.filter(bank => bank.id.startsWith('user-'));
      try {
        localStorage.setItem('configBanks', JSON.stringify(userBanks));
        logger.debug('Bancos salvos após editar:', userBanks);
        await persistBanksSupabase(userBanks);
      } catch (error) {
        logger.error('Erro ao salvar no localStorage/Supabase:', error);
        toast.error('Erro ao editar banco. Tente novamente.');
        return;
      }
    }

    // Disparar evento para notificar outros componentes
    window.dispatchEvent(new CustomEvent('configDataChanged'));

    toast.success('Banco editado com sucesso!');
  };

  // editProduct removido - funcionalidade desabilitada

  const editBenefit = async (id: number, newDescription: string, newCode: string) => {
    const updatedBenefits = benefitTypes.map(benefit =>
      benefit.id === id ? { ...benefit, description: newDescription, code: newCode } : benefit
    );
    setBenefitTypes(updatedBenefits);
    if (id >= 1000) {
      const edited = getEditedItems<BenefitType>('editedBenefits');
      const idx = edited.findIndex(b => b.id === id);
      if (idx !== -1) {
        edited[idx] = { id, description: newDescription, code: newCode };
      } else {
        edited.push({ id, description: newDescription, code: newCode });
      }
      setEditedItems('editedBenefits', edited);
      toast.success('Tipo de benefício editado com sucesso!');
    } else {
      try {
        const { error } = await supabase
          .from('benefit_types')
          .update({ description: newDescription, code: newCode })
          .eq('id', id);
        if (error) throw error;
        const edited = getEditedItems<BenefitType>('editedBenefits');
        const idx = edited.findIndex(b => b.id === id);
        if (idx !== -1) {
          edited[idx] = { id, description: newDescription, code: newCode };
        } else {
          edited.push({ id, description: newDescription, code: newCode });
        }
        setEditedItems('editedBenefits', edited);
        toast.success('Tipo de benefício editado com sucesso!');
        setEditedItems('editedBenefits', edited);
        toast.success('Tipo de benefício editado com sucesso!');
      } catch (error) {
        const err = error as PostgrestError | Error;
        toast.error('Erro ao editar tipo de benefício: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <PageLayout title="Configurações de Leads" subtitle="Gerencie bancos e tipos de benefícios">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Configurações de Leads"
      subtitle="Gerencie bancos e tipos de benefícios para seus leads"
    >
      <Tabs defaultValue="banks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="banks">Bancos</TabsTrigger>
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
                  <div key={bank.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 hover:shadow-sm transition-colors duration-200 cursor-pointer">
                    {editingBank === bank.id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <Input
                          value={newBankName}
                          onChange={e => setNewBankName(e.target.value)}
                          className="w-1/2"
                        />
                        <Input
                          value={newBankCode}
                          onChange={e => setNewBankCode(e.target.value)}
                          className="w-1/3"
                        />
                        <Button size="sm" onClick={() => { editBank(bank.id, newBankName, newBankCode); setEditingBank(null); setNewBankName(""); setNewBankCode(""); }}>Salvar</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditingBank(null); setNewBankName(""); setNewBankCode(""); }}>Cancelar</Button>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{bank.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Código: {bank.code || "Não informado"}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {editingBank !== bank.id && (
                        <Button size="sm" variant="outline" onClick={() => { setEditingBank(bank.id); setNewBankName(bank.name); setNewBankCode(bank.code); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o banco "{bank.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteBank(bank.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seção de produtos removida - funcionalidade desabilitada */}

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
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover o tipo de benefício "{benefit.description}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteBenefit(benefit.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
