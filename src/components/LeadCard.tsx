import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Phone, Mail, DollarSign, Building, User, Edit, Trash2, Calendar, FileText, Tag, Plus, X } from "lucide-react";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LeadForm from "./LeadForm";
import ClientVisits from "./leads/ClientVisits";
import DocumentUpload from "./leads/DocumentUpload";
import WhatsAppButton from "./WhatsAppButton";

interface LeadCardProps {
  lead: Lead;
  onUpdate: (updatedLead: Lead) => void;
  onDelete: (id: string) => void;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-yellow-100 text-yellow-800",
  qualificado: "bg-purple-100 text-purple-800",
  negociando: "bg-orange-100 text-orange-800",
  convertido: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800"
};

const statusLabels = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  negociando: "Em andamento",
  convertido: "Aprovado",
  perdido: "Recusado"
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [leadTags, setLeadTags] = useState<Tag[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchLeadTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await (supabase as any)
        .from('lead_tags')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchLeadTags = async () => {
    try {
      const { data: assignments, error } = await (supabase as any)
        .from('lead_tag_assignments')
        .select(`
          tag_id,
          lead_tags (
            id,
            name,
            color
          )
        `)
        .eq('lead_id', lead.id);

      if (error) throw error;

      const leadTagsData = assignments?.map((assignment: any) => assignment.lead_tags) || [];
      setLeadTags(leadTagsData);
    } catch (error) {
      console.error('Error fetching lead tags:', error);
    }
  };

  const toggleTag = async (tagId: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const isTagAssigned = leadTags.some(tag => tag.id === tagId);

      if (isTagAssigned) {
        // Remove tag
        await (supabase as any)
          .from('lead_tag_assignments')
          .delete()
          .eq('lead_id', lead.id)
          .eq('tag_id', tagId);
      } else {
        // Add tag
        await (supabase as any)
          .from('lead_tag_assignments')
          .insert({
            lead_id: lead.id,
            tag_id: tagId,
            user_id: userData.user.id
          });
      }

      fetchLeadTags();
    } catch (error: any) {
      console.error('Error toggling tag:', error);
      toast.error(`Erro ao atualizar etiqueta: ${error.message}`);
    }
  };

  const handleUpdateLead = async (values: any) => {
    setIsUpdating(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Separate selectedTags from lead data
      const { selectedTags, ...leadData } = values;

      console.log("Updating lead with data:", leadData);
      console.log("Selected tags:", selectedTags);

      // Update the lead data (without selectedTags)
      const { data, error } = await supabase
        .from("leads")
        .update(leadData)
        .eq("id", lead.id)
        .select()
        .single();

      if (error) throw error;

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
        createdAt: new Date(data.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      } as Lead;

      onUpdate(updatedLead);
      toast.success("Lead atualizado com sucesso!");
      setIsEditDialogOpen(false);
      fetchLeadTags();
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

      // Move lead to trash instead of deleting permanently
      const { error: trashError } = await supabase
        .from("deleted_leads")
        .insert({
          original_lead_id: lead.id,
          user_id: userData.user.id,
          original_lead_data: leadData
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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg leading-none">{lead.name}</CardTitle>
              <CardDescription className="text-sm">
                Cadastrado em {lead.createdAt}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu open={isTagDropdownOpen} onOpenChange={setIsTagDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1">
                    <Tag className="h-3 w-3" />
                    <span className="text-xs">Etiquetas</span>
                    <Plus className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {tags.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                      </div>
                      {leadTags.some(leadTag => leadTag.id === tag.id) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  {tags.length === 0 && (
                    <DropdownMenuItem disabled>
                      Nenhuma etiqueta disponível
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
          
          {/* Display assigned tags */}
          {leadTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {leadTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs h-6"
                  style={{ 
                    backgroundColor: tag.color + '20',
                    borderColor: tag.color,
                    color: tag.color
                  }}
                >
                  {tag.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 ml-1 hover:bg-transparent"
                    onClick={() => toggleTag(tag.id)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
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
            
            {lead.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-green-500" />
                <span className="font-medium">E-mail:</span>
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            
            {(lead as any).bank && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Banco:</span>
                <span>{bankLabels[(lead as any).bank as keyof typeof bankLabels] || (lead as any).bank}</span>
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

            <div className="flex items-center gap-2">
              <Badge className={statusColors[lead.status]}>
                {statusLabels[lead.status]}
              </Badge>
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
          <LeadForm
            initialData={lead}
            onSubmit={handleUpdateLead}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover para Lixeira</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja mover o lead "{lead.name}" para a lixeira? O lead ficará disponível por 30 dias na lixeira antes de ser excluído permanentemente.
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
    </>
  );
};

export default LeadCard;
