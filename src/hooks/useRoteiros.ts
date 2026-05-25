import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Documento {
  id: number;
  nome: string;
  tipo: "pdf" | "video";
  url: string;
}

export interface Categoria {
  nome: string;
  documentos: Documento[];
}

export interface Roteiro {
  id: string;
  user_id: string;
  nome: string;
  logo_url: string | null;
  categorias: Categoria[];
  ordem: number;
}

export function useRoteiros() {
  const { user } = useAuth();
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoteiros = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("roteiros")
        .select("*")
        .eq("user_id", user.id)
        .order("ordem", { ascending: true });

      if (error) throw error;

      const parsed = (data || []).map((r: any) => ({
        ...r,
        categorias: Array.isArray(r.categorias) ? r.categorias : [],
      })) as Roteiro[];

      setRoteiros(parsed);
    } catch (err: any) {
      console.error("Erro ao buscar roteiros:", err);
      toast.error("Erro ao carregar roteiros");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRoteiros();
  }, [fetchRoteiros]);

  const salvarRoteiro = async (roteiro: Partial<Roteiro> & { id?: string }): Promise<boolean> => {
    if (!user) return false;
    try {
      if (roteiro.id) {
        const { error } = await supabase
          .from("roteiros")
          .update({
            nome: roteiro.nome,
            logo_url: roteiro.logo_url,
            categorias: roteiro.categorias as any,
            ordem: roteiro.ordem,
          })
          .eq("id", roteiro.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const maxOrdem = roteiros.length > 0 ? Math.max(...roteiros.map(r => r.ordem)) + 1 : 1;
        const { error } = await supabase
          .from("roteiros")
          .insert({
            user_id: user.id,
            nome: roteiro.nome!,
            logo_url: roteiro.logo_url ?? null,
            categorias: (roteiro.categorias ?? []) as any,
            ordem: roteiro.ordem ?? maxOrdem,
          });
        if (error) throw error;
      }
      await fetchRoteiros();
      return true;
    } catch (err: any) {
      console.error("Erro ao salvar roteiro:", err);
      toast.error("Erro ao salvar roteiro: " + err.message);
      return false;
    }
  };

  const deletarRoteiro = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from("roteiros")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      await fetchRoteiros();
      return true;
    } catch (err: any) {
      console.error("Erro ao deletar roteiro:", err);
      toast.error("Erro ao deletar roteiro: " + err.message);
      return false;
    }
  };

  const uploadLogo = async (file: File, roteiroId: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const ext = file.name.split(".").pop();
      const path = `roteiros/${user.id}/${roteiroId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("lead-documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("lead-documents").getPublicUrl(path);
      return data.publicUrl;
    } catch (err: any) {
      console.error("Erro ao fazer upload do logo:", err);
      toast.error("Erro ao enviar imagem: " + err.message);
      return null;
    }
  };

  return { roteiros, loading, fetchRoteiros, salvarRoteiro, deletarRoteiro, uploadLogo };
}
