import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPasswordDialog } from "@/components/AdminPasswordDialog";
import { Paperclip, X, File, FileText, Image, Loader2, Eye, ArrowLeft, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { verifyAdminPassword, hasAdminPassword } from "@/utils/adminPassword";

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

// Modal 100% customizado sem Radix UI para evitar conflitos de foco
const CustomModal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
        onClick={onClose}
      />
      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          width: "90vw",
          maxWidth: "900px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DocumentUpload: React.FC<DocumentUploadProps> = ({ leadId }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [hasAdminPwd, setHasAdminPwd] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [hasDocumentsFlag, setHasDocumentsFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline password confirmation state
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const fetchDocumentCount = async () => {
    try {
      const { count, error } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("lead_id", leadId);
      if (error) throw error;
      setHasDocumentsFlag(!!count && count > 0);
    } catch (error: any) {
      console.error("Error counting documents:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("lead_id", leadId);
      if (error) throw error;
      const docs = data || [];
      setDocuments(docs);
      setHasDocumentsFlag(docs.length > 0);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(`Erro ao buscar documentos: ${error.message}`);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchDocumentCount();
      fetchDocuments();
    }
    hasAdminPassword().then(setHasAdminPwd);
  }, [leadId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (documents.length + files.length > 5) {
      toast.error(`Limite excedido! Máximo 5 documentos por lead. Você já tem ${documents.length}.`);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      if (!user) throw new Error("Usuário não autenticado");
      const userId = user.id;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(Math.round(((i + 1) / files.length) * 100));
        try {
          const filePath = `${userId}/${leadId}/${Date.now()}_${i}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("lead-documents")
            .upload(filePath, file, { cacheControl: "3600", upsert: false });
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
        } catch {
          errorCount++;
        }
      }

      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} documento(s) enviado(s) com sucesso!`);
      } else if (errorCount > 0) {
        toast.warning(`${successCount} enviados, ${errorCount} com erro`);
      }

      await fetchDocuments();
      setHasDocumentsFlag(true);
    } catch (error: any) {
      toast.error(`Erro ao enviar: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1000);
      e.target.value = "";
    }
  };

  const openModal = async () => {
    await fetchDocuments();
    setShowPasswordConfirm(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (showPasswordConfirm) {
      // Se estiver na tela de senha, só volta para lista
      setShowPasswordConfirm(false);
      setDocumentToDelete(null);
      return;
    }
    setIsModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    if (hasAdminPwd) {
      setShowPasswordConfirm(true);
    } else {
      executeDelete(doc);
    }
  };

  const executeDelete = async (doc: Document) => {
    try {
      const { error: storageError } = await supabase.storage.from("lead-documents").remove([doc.file_path]);
      if (storageError) {
        console.error("Storage delete error:", storageError);
        throw new Error(`Erro no storage: ${storageError.message}`);
      }

      const { error: dbError } = await supabase.from("documents").delete().eq("id", doc.id);
      if (dbError) {
        console.error("DB delete error:", dbError);
        throw new Error(`Erro no banco: ${dbError.message}`);
      }

      const deletedId = doc.id;
      setDocuments(prev => prev.filter(d => d.id !== deletedId));
      setHasDocumentsFlag(prev => {
        return prev;
      });
      setImageUrls(prev => {
        const n = { ...prev };
        delete n[deletedId];
        return n;
      });
      toast.success("Documento excluído com sucesso!");
    } catch (error: any) {
      console.error("Failed to delete document:", error);
      toast.error(`Erro ao excluir: ${error.message}`);
    }
  };

  const getDocumentIcon = (type: string, large = false) => {
    const sz = large ? "h-16 w-16" : "h-5 w-5";
    if (type.startsWith("image/")) return <Image className={`${sz} text-blue-500`} />;
    if (type.includes("pdf")) return <FileText className={`${sz} text-red-500`} />;
    return <File className={`${sz} text-gray-500`} />;
  };

  const getFileUrl = async (path: string) => {
    const { data } = await supabase.storage.from("lead-documents").createSignedUrl(path, 60);
    return data?.signedUrl;
  };

  // Sincronizar hasDocumentsFlag com documents
  useEffect(() => {
    setHasDocumentsFlag(documents.length > 0);
  }, [documents]);

  useEffect(() => {
    const loadImageUrls = async () => {
      // Só carrega imagens que ainda não foram carregadas
      const imageDocs = documents.filter(
        d => d.file_type.startsWith("image/") && !imageUrls[d.id]
      );
      if (!imageDocs.length) return;
      const urls: Record<string, string> = {};
      for (const doc of imageDocs) {
        setLoadingImages(p => ({ ...p, [doc.id]: true }));
        try {
          const url = await getFileUrl(doc.file_path);
          if (url) urls[doc.id] = url;
        } catch {}
        setLoadingImages(p => ({ ...p, [doc.id]: false }));
      }
      if (Object.keys(urls).length > 0) {
        setImageUrls(p => ({ ...p, ...urls }));
      }
    };
    if (documents.length > 0) loadImageUrls();
  }, [documents]);

  const hasDocuments = hasDocumentsFlag || documents.length > 0;

  return (
    <>
      {/* Controles inline no card */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Documentos</h3>
          <button
            type="button"
            className={`p-1 h-8 w-8 rounded flex items-center justify-center transition-colors ${hasDocuments ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}
            onClick={openModal}
            title={hasDocuments ? "Ver documentos anexados" : "Nenhum documento"}
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
            multiple
          />
          <button
            type="button"
            className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
            {isUploading ? `Enviando... ${progress}%` : "Anexar documentos"}
          </button>
        </div>
      </div>

      {/* Modal customizado sem Radix UI */}
      <CustomModal open={isModalOpen} onClose={closeModal}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              Documentos Anexados
            </h2>
            <p className="text-sm text-gray-500">
              Visualize e gerencie os documentos deste lead
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lista de documentos */}
        <div className="space-y-4">
            {documents.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc) => {
                  const isImage = doc.file_type.startsWith("image/");
                  const imageUrl = imageUrls[doc.id];
                  const isLoading = loadingImages[doc.id];

                  return (
                    <div
                      key={doc.id}
                      className="relative group bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
                    >
                      <div
                        className="w-full aspect-square bg-white flex items-center justify-center cursor-pointer overflow-hidden"
                        onClick={async () => {
                          const url = await getFileUrl(doc.file_path);
                          if (url) window.open(url, "_blank");
                        }}
                      >
                        {isImage ? (
                          isLoading ? (
                            <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
                          ) : imageUrl ? (
                            <img src={imageUrl} alt={doc.file_name} className="w-full h-full object-cover" />
                          ) : (
                            <Image className="h-12 w-12 text-gray-400" />
                          )
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 h-full">
                            {getDocumentIcon(doc.file_type, true)}
                            <span className="mt-3 text-xs text-gray-600 text-center px-2 line-clamp-2 font-medium">
                              {doc.file_name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-white text-xs font-medium text-center px-2 line-clamp-2">{doc.file_name}</span>
                          <span className="text-white/80 text-xs">{new Date(doc.created_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Botão excluir */}
                      <button
                        type="button"
                        className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(doc);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">Nenhum documento anexado ainda.</p>
              </div>
            )}
          </div>
        </CustomModal>

        {/* Confirmação de senha usando AdminPasswordDialog fora do corpo do modal */}
        <AdminPasswordDialog
          open={showPasswordConfirm}
          onOpenChange={setShowPasswordConfirm}
          onConfirm={() => {
            setShowPasswordConfirm(false);
            if (documentToDelete) executeDelete(documentToDelete);
          }}
          itemName={documentToDelete?.file_name || "o documento"}
        />
    </>
  );
};

export default DocumentUpload;
