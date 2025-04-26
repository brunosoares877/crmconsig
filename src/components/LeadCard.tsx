
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
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-1 h-3.5 w-3.5" />
                <span>{lead.phone}</span>
              </div>
              {lead.phone2 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1 h-3.5 w-3.5" />
                  <span>{lead.phone2}</span>
                </div>
              )}
              {lead.phone3 && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-1 h-3.5 w-3.5" />
                  <span>{lead.phone3}</span>
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
          <Button variant="secondary" size="sm">
            <Phone className="mr-1 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ligar</span>
          </Button>

          <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Editar Lead</SheetTitle>
                <SheetDescription>
                  Atualize os dados do lead no formulário abaixo.
                </SheetDescription>
              </SheetHeader>
              <LeadForm 
                initialData={lead}
                onSubmit={handleLeadUpdate}
                onCancel={() => setIsOpenSheet(false)}
                isLoading={isLoading}
              />
            </SheetContent>
          </Sheet>

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
