import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Phone, Mail, DollarSign, Building, User, Edit, Trash2, Calendar, FileText, Tag, CheckCircle, Clock, AlertTriangle, X, Building2, Copy, Calculator } from "lucide-react";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LeadForm from "./LeadForm";
import ClientVisits from "./leads/ClientVisits";
import DocumentUpload from "./leads/DocumentUpload";
import WhatsAppButton from "./WhatsAppButton";
import { cn } from "@/lib/utils";
import { getBankName } from "@/utils/bankUtils";
import { formatLeadDate } from "@/utils/dateUtils";

interface LeadTag {
  tag_id: string;
  lead_tags: {
    id: string;
    name: string;
    color: string;
  };
}

interface LeadCardProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-yellow-100 text-yellow-800",
  qualificado: "bg-purple-100 text-purple-800",
  pendente: "bg-amber-100 text-amber-800",
  negociando: "bg-orange-100 text-orange-800",
  concluido: "bg-green-100 text-green-800",
  sold: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800"
};

const statusLabels = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  pendente: "Pendente",
  negociando: "Em Andamento",
  concluido: "Concluído",
  sold: "Concluído",
  cancelado: "Cancelado"
};

const bankLabels = {
  caixa: "Caixa",
  bb: "Banco do Brasil",
  itau: "Itaú",
  bradesco: "Bradesco",
  santander: "Santander",
  c6: "C6 Bank",
  brb: "BRB",
  bmg: "BMG",
  pan: "Banco Pan",
  ole: "Banco Olé",
  daycoval: "Daycoval",
  mercantil: "Mercantil",
  cetelem: "Cetelem",
  safra: "Safra",
  inter: "Inter",
  original: "Original",
  facta: "Facta",
  bonsucesso: "Bonsucesso",
  banrisul: "Banrisul",
  sicoob: "Sicoob",
  outro: "Outro"
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, onUpdate, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false);
  const [calculatedCommission, setCalculatedCommission] = useState<{
    value: number;
    percentage: number;
    amount: number;
  } | null>(null);

  useEffect(() => {
    // Buscar as tags atribuídas ao lead
    const fetchTags = async () => {
      setTagsLoading(true);
      try {
        // A query pode retornar um erro de relação caso não haja join, vamos filtrar corretamente
        const { data, error } = await supabase
          .from("lead_tag_assignments")
          .select("tag_id, lead_tags(id, name, color)")
          .eq("lead_id", lead.id);

        if (error) throw error;

        // Novamente: filtrar apenas onde lead_tags é um objeto válido, não erro.
        const validTags = (Array.isArray(data) ? data : []).filter(
          (t: any) =>
            t.lead_tags &&
            typeof t.lead_tags === "object" &&
            typeof t.lead_tags.id === "string" &&
            typeof t.lead_tags.name === "string" &&
            typeof t.lead_tags.color === "string"
        ).map((t: any) => ({
          tag_id: t.tag_id,
          lead_tags: {
            id: t.lead_tags.id,
            name: t.lead_tags.name,
            color: t.lead_tags.color,
          }
        }));

        setTags(validTags);
      } catch (error) {
        setTags([]);
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, [lead.id]);

  const handleUpdateLead = async (values: any) => {
    setIsUpdating(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Separate selectedTags from lead data
      const { selectedTags, ...leadData } = values;

      console.log("Updating lead with data:", leadData);
      console.log("Date field in update:", leadData.date);
      console.log("Selected tags:", selectedTags);

      // Update the lead data (without selectedTags)
      const { data, error } = await supabase
        .from("leads")
        .update(leadData)
        .eq("id", lead.id)
        .select()
        .single();

      if (error) {
        console.error("Database update error:", error);
        throw error;
      }

      console.log("Lead updated successfully:", data);

      // Handle tag assignments separately
      if (selectedTags) {
        // First, delete existing tag assignments for this lead
        await (supabase as any)
          .from('lead_tag_assignments')
          .delete()
          .eq('lead_id', lead.id);

        // Then, create new tag assignments if any tags were selected
        if (selectedTags.length > 0) {
          const tagAssignments = selectedTags.map((tagId: string) => ({
            lead_id: lead.id,
            tag_id: tagId,
            user_id: userData.user.id,
          }));

          const { error: tagError } = await (supabase as any)
            .from('lead_tag_assignments')
            .insert(tagAssignments);

          if (tagError) {
            console.error('Error updating tag assignments:', tagError);
            toast.error('Lead atualizado, mas erro ao aplicar etiquetas');
          }
        }
      }

      const updatedLead = {
        ...data,
        createdAt: (data as any).date ? formatLeadDate((data as any).date) : formatLeadDate(data.created_at)
      } as Lead;

      onUpdate(updatedLead);
      toast.success("Lead atualizado com sucesso!");
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLead = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Convert Lead to JSON-compatible format
      const leadData = {
        id: lead.id,
        user_id: lead.user_id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        phone2: lead.phone2,
        phone3: lead.phone3,
        cpf: lead.cpf,
        status: lead.status,
        source: lead.source,
        notes: lead.notes,
        amount: lead.amount,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        scheduledAt: lead.scheduledAt,
        product: lead.product,
        employee: lead.employee,
        created_at: lead.created_at
      };

      // Calculate expiration date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Move lead to trash instead of deleting permanently
      const { error: trashError } = await supabase
        .from("deleted_leads")
        .insert({
          original_lead_id: lead.id,
          user_id: userData.user.id,
          original_lead_data: leadData,
          deleted_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      if (trashError) throw trashError;

      // Remove from active leads
      const { error: deleteError } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id);

      if (deleteError) throw deleteError;

      onDelete(lead.id);
      toast.success("Lead movido para a lixeira com sucesso!");
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error moving lead to trash:", error);
      toast.error(`Erro ao mover lead para lixeira: ${error.message}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Se o status for "concluido" e o lead tiver valor, mostrar modal de comissão
    if (newStatus === 'concluido' && lead.amount) {
      // Mapear "concluido" para "sold" no banco de dados
      await calculateAndShowCommission('sold');
      return;
    }

    // Para outros status, atualizar normalmente
    await updateLeadStatus(newStatus);
  };

  const calculateAndShowCommission = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Verificar se já existe comissão para este lead
      const { data: existingCommission } = await supabase
        .from("commissions")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("user_id", userData.user.id)
        .single();

      if (existingCommission) {
        // Se já existe comissão, apenas atualizar o status sem mostrar modal
        await updateLeadStatus(newStatus);
        toast.info("Lead já possui comissão gerada anteriormente.");
        return;
      }

      // Buscar taxa de comissão configurada para o produto
      const { data: commissionRates } = await supabase
        .from("commission_rates")
        .select("percentage")
        .eq("product", lead.product)
        .eq("active", true)
        .single();

      // Converter valor corretamente removendo caracteres não numéricos
      const cleanAmount = lead.amount.replace(/[^\d,]/g, '').replace(',', '.');
      const leadAmount = parseFloat(cleanAmount) || 0;
      
      let commissionValue = 0;
      let percentage = 5; // Padrão

      if (commissionRates?.percentage) {
        percentage = commissionRates.percentage;
        commissionValue = (leadAmount * percentage) / 100;
      } else {
        // Taxa padrão de 5%
        commissionValue = (leadAmount * 5) / 100;
      }

      setCalculatedCommission({
        value: commissionValue,
        percentage: percentage,
        amount: leadAmount
      });

      // Primeiro atualizar o status do lead
      await updateLeadStatus(newStatus);
      
      // Depois mostrar o modal de comissão
      setIsCommissionDialogOpen(true);

    } catch (error: any) {
      console.error("Error calculating commission:", error);
      toast.error(`Erro ao calcular comissão: ${error.message}`);
      // Em caso de erro, atualizar o status mesmo assim
      await updateLeadStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateLeadStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", lead.id)
        .select()
        .single();

      if (error) throw error;

      const updatedLead = {
        ...data,
        createdAt: (data as any).date ? formatLeadDate((data as any).date) : formatLeadDate(data.created_at)
      } as Lead;

      onUpdate(updatedLead);
      const statusLabel = statusLabels[newStatus as keyof typeof statusLabels] || newStatus;
      toast.success(`Lead marcado como ${statusLabel}!`);
    } catch (error: any) {
      console.error("Error updating lead status:", error);
      toast.error(`Erro ao atualizar status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateCommission = async () => {
    if (!calculatedCommission) return;

    setIsUpdating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Inserir apenas campos básicos enquanto cache do Supabase atualiza
      const { error } = await supabase
        .from("commissions")
        .insert({
          user_id: userData.user.id,
          lead_id: lead.id,
          amount: calculatedCommission.amount,
          product: lead.product,
          status: 'in_progress',
          payment_period: 'monthly'
        });

      if (error) throw error;

      toast.success(`Comissão de R$ ${calculatedCommission.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} gerada com sucesso!`);
      setIsCommissionDialogOpen(false);
      setCalculatedCommission(null);

    } catch (error: any) {
      console.error("Error creating commission:", error);
      toast.error(`Erro ao gerar comissão: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return "Não informado";
    const numericValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
    if (isNaN(numericValue)) return value;
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "";
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado para a área de transferência!`);
    }).catch(() => {
      toast.error(`Erro ao copiar ${label}`);
    });
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg leading-none">
                  {lead.name}
                </CardTitle>
                {/* Exibe as etiquetas ao lado do nome */}
                {!tagsLoading && tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {tags.map(
                      (tag) =>
                        tag.lead_tags && (
                          <Badge
                            key={tag.lead_tags.id}
                            variant="outline"
                            className="px-2 py-0.5 text-xs border-0"
                            style={{
                              backgroundColor: tag.lead_tags.color,
                              color: "#fff"
                            }}
                          >
                            {tag.lead_tags.name}
                          </Badge>
                        )
                    )}
                  </div>
                )}
              </div>
              <CardDescription className="text-sm">
                Cadastrado em {lead.createdAt}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[lead.status]}>
                {statusLabels[lead.status]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {lead.amount && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('negociando')}
                        disabled={isUpdating}
                        className="text-blue-600"
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Marcar como Em Andamento
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('pendente')}
                        disabled={isUpdating}
                        className="text-yellow-600"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Marcar como Pendente
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('concluido')}
                        disabled={isUpdating}
                        className="text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Marcar como Concluído
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('cancelado')}
                        disabled={isUpdating}
                        className="text-red-600"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Marcar como Cancelado
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Mover para Lixeira
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            {lead.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Telefone:</span>
                  <span>{formatPhone(lead.phone)}</span>
                </div>
                <WhatsAppButton 
                  phoneNumber={lead.phone}
                  message={`Olá ${lead.name}, sou da equipe LeadConsig. Como posso ajudá-lo?`}
                  variant="regular"
                  label="WhatsApp"
                  className="h-8 text-xs px-2"
                />
              </div>
            )}

            {lead.cpf && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">CPF:</span>
                  <span className="font-mono text-sm">{formatCPF(lead.cpf)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(lead.cpf, "CPF")}
                  className="h-7 text-xs px-2 flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar
                </Button>
              </div>
            )}
            
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="font-medium">E-mail:</span>
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            
            {(lead as any).bank && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{getBankName((lead as any).bank)}</span>
              </div>
            )}
            
            {lead.amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Valor:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(lead.amount)}
                </span>
              </div>
            )}
            
            {lead.employee && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Responsável:</span>
                <span>{lead.employee}</span>
              </div>
            )}
          </div>

          {/* Observação do Lead */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">Observação:</span>
            </div>
            <div className="text-gray-700 text-sm italic min-h-[20px]">
              {lead.notes && lead.notes.trim() !== "" ? lead.notes : "Nenhuma observação."}
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">Histórico de Visitas:</span>
            </div>
            <ClientVisits leadId={lead.id} leadName={lead.name} />
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">Documentos:</span>
            </div>
            <DocumentUpload leadId={lead.id} />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Atualize as informações do lead abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center text-center w-full">
            <h2 className="text-xl font-bold mb-2">Detalhes do Lead</h2>
            {/* Responsável em destaque */}
            <div className="flex flex-col items-center mb-4">
              <span className="text-base font-semibold text-blue-800">Responsável</span>
              <span className="text-2xl font-bold text-blue-900 bg-blue-100 rounded-full px-4 py-1 mt-1">
                {lead.employee || 'Não informado'}
              </span>
              {/* Badge 100% deste responsável */}
              {lead.employee && (
                <span className="mt-2 inline-block bg-green-100 text-green-800 text-xs font-bold rounded-full px-3 py-0.5">100% deste responsável</span>
              )}
            </div>
            <LeadForm
              initialData={lead}
              onSubmit={handleUpdateLead}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isUpdating}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover para Lixeira</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover o lead "{lead.name}" para a lixeira? O lead ficará disponível por 30 dias na lixeira antes de ser excluído automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} className="bg-red-600 hover:bg-red-700">
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Geração de Comissão */}
      <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Gerar Comissão?
            </DialogTitle>
            <DialogDescription>
              O lead foi marcado como <strong>Concluído</strong>. Deseja gerar a comissão automaticamente?
            </DialogDescription>
          </DialogHeader>
          
          {calculatedCommission && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Cliente:</span>
                  <span className="font-semibold">{lead.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Produto:</span>
                  <span>{lead.product}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Valor da Venda:</span>
                  <span className="font-semibold text-green-600">
                    {calculatedCommission.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Percentual:</span>
                  <span className="font-semibold text-blue-600">{calculatedCommission.percentage}%</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Comissão:</span>
                    <span className="text-lg font-bold text-green-600">
                      {calculatedCommission.value.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCommissionDialogOpen(false);
                setCalculatedCommission(null);
              }}
              disabled={isUpdating}
            >
              Agora Não
            </Button>
            <Button 
              onClick={handleCreateCommission}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Gerando..." : "✓ Gerar Comissão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default React.memo(LeadCard);
