import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, File, FileText, Image, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentUploadProps {
  leadId: string;
}

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  created_at: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ leadId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("lead_id", leadId);
        
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(`Erro ao buscar documentos: ${error.message}`);
    }
  };
  
  useEffect(() => {
    if (leadId) {
      fetchDocuments();
    }
  }, [leadId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const userId = userData.user.id;
      const filePath = `${userId}/${leadId}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("lead-documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { error: dbError } = await supabase.from("documents").insert({
        lead_id: leadId,
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
      });
      
      if (dbError) throw dbError;
      
      toast.success("Documento enviado com sucesso!");
      await fetchDocuments();
      setProgress(100);
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(`Erro ao enviar documento: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
      e.target.value = "";
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("lead-documents")
        .remove([document.file_path]);
        
      if (storageError) throw storageError;
      
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);
        
      if (dbError) throw dbError;
      
      toast.success("Documento excluído com sucesso!");
      setDocuments(documents.filter(doc => doc.id !== document.id));
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(`Erro ao excluir documento: ${error.message}`);
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (type.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("lead-documents")
      .createSignedUrl(path, 60);
      
    return data?.signedUrl;
  };

  const handleDocumentClick = async (document: Document) => {
    try {
      const url = await getFileUrl(document.file_path);
      if (url) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  const hasDocuments = documents.length > 0;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Documentos</h3>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className={`p-1 h-8 w-8 ${hasDocuments ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
            onClick={() => setIsDocumentsDialogOpen(true)}
            title={hasDocuments ? "Ver documentos anexados" : "Nenhum documento anexado"}
          >
            <Eye className={`h-5 w-5 ${hasDocuments ? "text-green-600" : "text-gray-400"}`} />
          </Button>
        </div>
        <div>
          <Input
            type="file"
            id="document-upload"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            className={`flex items-center ${isUploading ? "opacity-50" : ""}`}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {isUploading ? `Enviando... ${progress}%` : "Anexar documento"}
          </Button>
        </div>
      </div>

      <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documentos Anexados</DialogTitle>
            <DialogDescription>
              Visualize e gerencie os documentos anexados a este lead
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((document) => (
                  <div 
                    key={document.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200"
                  >
                    <div 
                      className="flex items-center flex-1 cursor-pointer"
                      onClick={() => handleDocumentClick(document)}
                    >
                      {getDocumentIcon(document.file_type)}
                      <span className="ml-3 text-sm font-medium truncate">
                        {document.file_name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({new Date(document.created_at).toLocaleDateString('pt-BR')})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        handleDelete(document);
                        if (documents.length === 1) {
                          setIsDocumentsDialogOpen(false);
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500">
                  Nenhum documento anexado ainda.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentUpload;
