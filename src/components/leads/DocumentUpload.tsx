import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, File, FileText, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Documentos</h3>
        <div className="relative">
          <Input
            type="file"
            id="document-upload"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center ${isUploading ? "opacity-50" : ""}`}
            disabled={isUploading}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {isUploading ? `Enviando... ${progress}%` : "Anexar documento"}
          </Button>
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((document) => (
            <div 
              key={document.id} 
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <div 
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => handleDocumentClick(document)}
              >
                {getDocumentIcon(document.file_type)}
                <span className="ml-2 text-sm font-medium truncate">
                  {document.file_name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(document)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Nenhum documento anexado ainda.
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
