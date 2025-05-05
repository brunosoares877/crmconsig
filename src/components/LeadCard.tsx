import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MoreVertical, Edit, Trash2, FileText } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LeadForm from "./LeadForm";
import DocumentUpload from "./leads/DocumentUpload";
import { Lead } from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Status color map
const statusColorMap = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-purple-100 text-purple-800",
  qualificado: "bg-amber-100 text-amber-800",
  negociando: "bg-emerald-100 text-emerald-800",
  convertido: "bg-green-100 text-green-800",
  perdido: "bg-gray-100 text-gray-800"
};

interface LeadCardProps {
  lead: Lead;
  onUpdate?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onUpdate, onDelete }) => {
  const [isOpenSheet, setIsOpenSheet] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLeadUpdate = async (values: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .update(values)
        .eq("id", lead.id)
        .select();
        
      if (error) throw error;
      
      const updatedLead = { ...lead, ...values };
      if (onUpdate) {
        onUpdate(updatedLead);
      }
      toast.success("Lead atualizado com sucesso!");
      setIsOpenSheet(false);
    } catch (error: any) {
      console.error("Error updating lead:", error);
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", lead.id);
        
      if (error) throw error;
      
      toast.success("Lead excluído com sucesso!");
      if (onDelete) {
        onDelete(lead.id);
      }
    } catch (error: any) {
      console.error("Error deleting lead:", error);
      toast.error(`Erro ao excluir lead: ${error.message}`);
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    // Remove any non-digit characters from phone number
    const formattedNumber = phoneNumber.replace(/\D/g, "");
    
    // Check if the number starts with country code, if not add Brazil's code
    const numberWithCountryCode = formattedNumber.startsWith("55") 
      ? formattedNumber 
      : `55${formattedNumber}`;
    
    // Use the default WhatsApp number if the lead's phone is not available
    const finalPhoneNumber = phoneNumber ? numberWithCountryCode : "5584991850149";
    
    // Open WhatsApp web with the phone number
    window.open(`https://wa.me/${finalPhoneNumber}`, "_blank");
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{lead.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-1 h-3.5 w-3.5" />
              <span>{lead.cpf || "CPF não cadastrado"}</span>
            </div>
            <div className="flex flex-col gap-1">
              {lead.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1 h-3.5 w-3.5" />
                  <span className="mr-2">{lead.phone}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => openWhatsApp(lead.phone || "")}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
                      <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.94L4 20l4.06-1.17A7.93 7.93 0 0 0 20 12.05a7.83 7.83 0 0 0-2.4-5.73Zm-5.55 12.2a6.6 6.6 0 0 1-3.36-.92l-.24-.15-2.5.72.74-2.5-.14-.24a6.6 6.6 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.6-6.59c1.76 0 3.42.69 4.67 1.94a6.59 6.59 0 0 1 1.94 4.67 6.59 6.59 0 0 1-6.59 6.56Zm3.63-4.94c-.2-.1-1.17-.58-1.36-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05a5.44 5.44 0 0 1-2.7-2.33c-.2-.35.21-.33.58-1.08a.36.36 0 0 0-.03-.34c-.05-.1-.45-1.07-.62-1.47-.16-.38-.32-.33-.45-.34h-.38c-.13 0-.35.05-.53.25-.18.2-.7.7-.7 1.69 0 1 .72 1.95.81 2.08.1.13 1.37 2.08 3.3 2.92.46.2.82.32 1.1.4.46.15.88.13 1.21.08.37-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z"/>
                    </svg>
                  </Button>
                </div>
              )}
              {lead.phone2 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1 h-3.5 w-3.5" />
                  <span className="mr-2">{lead.phone2}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => openWhatsApp(lead.phone2 || "")}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
                      <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.94L4 20l4.06-1.17A7.93 7.93 0 0 0 20 12.05a7.83 7.83 0 0 0-2.4-5.73Zm-5.55 12.2a6.6 6.6 0 0 1-3.36-.92l-.24-.15-2.5.72.74-2.5-.14-.24a6.6 6.6 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.6-6.59c1.76 0 3.42.69 4.67 1.94a6.59 6.59 0 0 1 1.94 4.67 6.59 6.59 0 0 1-6.59 6.56Zm3.63-4.94c-.2-.1-1.17-.58-1.36-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05a5.44 5.44 0 0 1-2.7-2.33c-.2-.35.21-.33.58-1.08a.36.36 0 0 0-.03-.34c-.05-.1-.45-1.07-.62-1.47-.16-.38-.32-.33-.45-.34h-.38c-.13 0-.35.05-.53.25-.18.2-.7.7-.7 1.69 0 1 .72 1.95.81 2.08.1.13 1.37 2.08 3.3 2.92.46.2.82.32 1.1.4.46.15.88.13 1.21.08.37-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z"/>
                    </svg>
                  </Button>
                </div>
              )}
              {lead.phone3 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1 h-3.5 w-3.5" />
                  <span className="mr-2">{lead.phone3}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => openWhatsApp(lead.phone3 || "")}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
                      <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.88 11.94L4 20l4.06-1.17A7.93 7.93 0 0 0 20 12.05a7.83 7.83 0 0 0-2.4-5.73Zm-5.55 12.2a6.6 6.6 0 0 1-3.36-.92l-.24-.15-2.5.72.74-2.5-.14-.24a6.6 6.6 0 0 1-1.01-3.49 6.59 6.59 0 0 1 6.6-6.59c1.76 0 3.42.69 4.67 1.94a6.59 6.59 0 0 1 1.94 4.67 6.59 6.59 0 0 1-6.59 6.56Zm3.63-4.94c-.2-.1-1.17-.58-1.36-.64-.18-.07-.32-.1-.45.1-.13.2-.5.64-.62.77-.11.13-.23.15-.43.05a5.44 5.44 0 0 1-2.7-2.33c-.2-.35.21-.33.58-1.08a.36.36 0 0 0-.03-.34c-.05-.1-.45-1.07-.62-1.47-.16-.38-.32-.33-.45-.34h-.38c-.13 0-.35.05-.53.25-.18.2-.7.7-.7 1.69 0 1 .72 1.95.81 2.08.1.13 1.37 2.08 3.3 2.92.46.2.82.32 1.1.4.46.15.88.13 1.21.08.37-.06 1.17-.48 1.33-.94.16-.46.16-.86.11-.94-.05-.08-.18-.13-.38-.23Z"/>
                    </svg>
                  </Button>
                </div>
              )}
            </div>
            {lead.amount && (
              <div className="text-sm font-medium">
                Valor: <span className="text-green-600">{lead.amount}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge
              variant="outline"
              className={`${statusColorMap[lead.status]}`}
            >
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>

            {lead.source && (
              <span className="text-xs text-muted-foreground">
                Via {lead.source}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between bg-muted/30 px-4 py-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3.5 w-3.5" />
          <span>Adicionado em {lead.createdAt}</span>
        </div>
        
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Lead</DialogTitle>
                <DialogDescription>
                  Atualize os dados do lead no formulário abaixo.
                </DialogDescription>
              </DialogHeader>
              <LeadForm 
                initialData={lead}
                onSubmit={handleLeadUpdate}
                onCancel={() => {}}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>

          <Sheet open={isDocumentsOpen} onOpenChange={setIsDocumentsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <FileText className="h-3.5 w-3.5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[400px]">
              <SheetHeader className="mb-4">
                <SheetTitle>Documentos do Lead</SheetTitle>
                <SheetDescription>
                  Gerencie os documentos deste lead.
                </SheetDescription>
              </SheetHeader>
              <DocumentUpload leadId={lead.id} />
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Lead
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isto excluirá permanentemente o lead e todos os seus dados associados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;
