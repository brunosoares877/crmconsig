import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, File, FileText, Image, Loader2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { hasAdminPassword } from "@/utils/adminPassword";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";

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
  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [hasAdminPwd, setHasAdminPwd] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Manter o modal principal aberto enquanto o dialog de senha estiver ativo
  useEffect(() => {
    if (showAdminPasswordDialog && !isDocumentsDialogOpen) {
      setIsDocumentsDialogOpen(true);
    }
  }, [showAdminPasswordDialog, isDocumentsDialogOpen]);
  
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
    hasAdminPassword().then(setHasAdminPwd);
  }, [leadId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      const userId = userData.user.id;
      const totalFiles = files.length;
      let successCount = 0;
      let errorCount = 0;
      
      // Processar todos os arquivos
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileProgress = Math.round(((i + 1) / totalFiles) * 100);
        setProgress(fileProgress);
        
        try {
          const filePath = `${userId}/${leadId}/${Date.now()}_${i}_${file.name}`;
      
          const { error: uploadError } = await supabase.storage
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
      
          successCount++;
        } catch (fileError: any) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          errorCount++;
        }
      }
      
      // Mostrar mensagem de sucesso/erro
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} ${successCount === 1 ? 'documento enviado' : 'documentos enviados'} com sucesso!`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} ${successCount === 1 ? 'documento enviado' : 'documentos enviados'}, ${errorCount} ${errorCount === 1 ? 'erro' : 'erros'}`);
      } else {
        toast.error(`Erro ao enviar ${totalFiles === 1 ? 'documento' : 'documentos'}`);
      }
      
      await fetchDocuments();
      setProgress(100);
    } catch (error: any) {
      console.error("Error uploading documents:", error);
      toast.error(`Erro ao enviar documentos: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
      e.target.value = "";
    }
  };

  const handleDeleteClick = (document: Document, e?: React.MouseEvent) => {
    // Prevenir propagação de eventos
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Se tiver senha administrativa configurada, pedir confirmação
    if (hasAdminPwd) {
      setDocumentToDelete(document);
      setShowAdminPasswordDialog(true);
      setIsDocumentsDialogOpen(true); // garantir que o modal principal permanece aberto
      return;
    }
    
    // Se não tiver senha configurada, deletar diretamente
    executeDelete(document);
  };

  const confirmDeleteDocument = async () => {
    const docToDelete = documentToDelete;
    if (docToDelete) {
      await executeDelete(docToDelete);
      setDocumentToDelete(null);
    }
  };

  const executeDelete = async (document: Document) => {
    try {
      if (!document || !document.id || !document.file_path) {
        throw new Error('Dados do documento inválidos');
      }

      const { error: storageError } = await supabase.storage
        .from("lead-documents")
        .remove([document.file_path]);
        
      if (storageError) {
        console.error('Erro ao remover do storage:', storageError);
        throw storageError;
      }
      
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);
        
      if (dbError) {
        console.error('Erro ao deletar do banco:', dbError);
        throw dbError;
      }
      
      // Atualizar lista de documentos
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== document.id));
      
      // Remover URL da imagem se existir
      if (imageUrls[document.id]) {
        setImageUrls(prevUrls => {
          const newUrls = { ...prevUrls };
          delete newUrls[document.id];
          return newUrls;
        });
      }
      
      toast.success("Documento excluído com sucesso!");
      
      // Recarregar documentos para garantir sincronização
      await fetchDocuments();
      
    } catch (error: any) {
      console.error("Error deleting document:", error);
      const errorMessage = error?.message || 'Erro desconhecido ao excluir documento';
      toast.error(`Erro ao excluir documento: ${errorMessage}`);
      throw error; // Re-throw para que o chamador possa tratar
    }
  };

  const getDocumentIcon = (type: string, size: "small" | "large" = "small") => {
    const sizeClass = size === "large" ? "h-16 w-16" : "h-5 w-5";
    if (type.startsWith("image/")) {
      return <Image className={`${sizeClass} text-blue-500`} />;
    } else if (type.includes("pdf")) {
      return <FileText className={`${sizeClass} text-red-500`} />;
    } else {
      return <File className={`${sizeClass} text-gray-500`} />;
    }
  };

  const getFileUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from("lead-documents")
      .createSignedUrl(path, 60);
      
    return data?.signedUrl;
  };

  // Carregar URLs das imagens para preview
  useEffect(() => {
    const loadImageUrls = async () => {
      const imageDocs = documents.filter(doc => doc.file_type.startsWith("image/"));
      if (imageDocs.length === 0) return;

      const urls: Record<string, string> = {};
      const loading: Record<string, boolean> = {};

      for (const doc of imageDocs) {
        loading[doc.id] = true;
        setLoadingImages(prev => ({ ...prev, [doc.id]: true }));
        try {
          const url = await getFileUrl(doc.file_path);
          if (url) {
            urls[doc.id] = url;
          }
        } catch (error) {
          console.error(`Error loading image for ${doc.id}:`, error);
        }
        loading[doc.id] = false;
        setLoadingImages(prev => ({ ...prev, [doc.id]: false }));
      }

      setImageUrls(prev => ({ ...prev, ...urls }));
    };

    if (documents.length > 0) {
      loadImageUrls();
    }
  }, [documents]);

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
            multiple
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
            {isUploading ? `Enviando... ${progress}%` : "Anexar documentos"}
          </Button>
        </div>
      </div>

      <Dialog
        open={isDocumentsDialogOpen || showAdminPasswordDialog}
        onOpenChange={(open) => {
          // Não permitir fechar enquanto o dialog de senha estiver aberto
          if (!open && showAdminPasswordDialog) {
            return;
          }
          setIsDocumentsDialogOpen(open);
          if (!open) {
            setShowAdminPasswordDialog(false);
            setDocumentToDelete(null);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => {
            if (showAdminPasswordDialog) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (showAdminPasswordDialog) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (showAdminPasswordDialog) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Documentos Anexados</DialogTitle>
            <DialogDescription>
              Visualize e gerencie os documentos anexados a este lead
            </DialogDescription>
          </DialogHeader>


          <div className="space-y-4 mt-4">
            {documents.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((document) => {
                  const isImage = document.file_type.startsWith("image/");
                  const imageUrl = imageUrls[document.id];
                  const isLoading = loadingImages[document.id];

                  return (
                  <div 
                    key={document.id} 
                      className="relative group bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
                      onClick={(e) => {
                        // Prevenir clique no card se estiver clicando no botão de deletar
                        const target = e.target as HTMLElement;
                        const button = target.closest('button');
                        if (button && button.type === 'button' && button.classList.contains('bg-red-500')) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                      }}
                    >
                      {/* Preview de imagem ou ícone */}
                    <div 
                        className="w-full aspect-square bg-white flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={() => handleDocumentClick(document)}
                    >
                        {isImage ? (
                          isLoading ? (
                            <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                          ) : imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={document.file_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="h-12 w-12 text-gray-400" />
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 h-full">
                            {getDocumentIcon(document.file_type, "large")}
                            <span className="mt-3 text-xs text-gray-600 text-center px-2 line-clamp-2 font-medium">
                              {document.file_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Overlay com informações e botão de deletar */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-white text-xs font-medium text-center px-2 line-clamp-2">
                        {document.file_name}
                      </span>
                          <span className="text-white/80 text-xs">
                            {new Date(document.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                      </div>

                      {/* Botão de deletar */}
                    <Button
                      variant="ghost"
                      size="sm"
                        type="button"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            if (e.nativeEvent && typeof (e.nativeEvent as any).stopImmediatePropagation === 'function') {
                              (e.nativeEvent as any).stopImmediatePropagation();
                            }
                          } catch (err) {
                            // Ignorar
                          }
                          handleDeleteClick(document, e);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  );
                })}
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

      {/* Dialog de confirmação com senha administrativa - Renderizado FORA do dialog principal */}
      {hasAdminPwd && (
        <AdminPasswordDialog
          open={showAdminPasswordDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowAdminPasswordDialog(false);
              setDocumentToDelete(null);
            }
            if (open) {
              setShowAdminPasswordDialog(true);
            }
          }}
          onConfirm={async () => {
            if (documentToDelete) {
              await confirmDeleteDocument();
              setShowAdminPasswordDialog(false);
            }
          }}
          title="Confirmar Exclusão de Documento"
          description="Esta ação é irreversível. Digite sua senha administrativa para confirmar a exclusão."
          itemName={documentToDelete?.file_name}
        />
      )}
    </>
  );
};

export default DocumentUpload;
