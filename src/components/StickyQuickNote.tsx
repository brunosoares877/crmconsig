import React, { useEffect, useState, useCallback, useRef } from "react";
import { StickyNote, Minimize2, Plus, Save, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORAGE_NOTES_KEY = "quickNotesDataV1";
const EDGE_PADDING = 0; // encostar o máximo na direita
const NOTE_WIDTH = 320;
const MIN_WIDTH = 240;
const MAX_WIDTH = 520;
const DEFAULT_HEIGHT = 260;
const MIN_HEIGHT = 180;
const MAX_HEIGHT = 600;
const STACK_GAP = 32;
const STICKY_TABLE = "sticky_notes";

type QuickNote = {
  id: string;
  content: string;
  right?: number; // distância até a borda direita (preferencial)
  x?: number; // legado
  y: number;
  height?: number;
  width?: number;
  minimized: boolean;
};

/**
 * Notas rápidas ao estilo "sticky note", fixadas na lateral direita,
 * com opção de minimizar e múltiplos blocos. Conteúdo salvo em localStorage
 * e opção de salvar uma nota no bloco principal (Supabase).
 */
const StickyQuickNote: React.FC = () => {
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUser, setHasUser] = useState<boolean | null>(null);
  const dragStart = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const resizeStart = useRef<{ id: string; startX: number; startY: number; startHeight: number; startWidth: number } | null>(null);

  const createDefaultNote = useCallback((): QuickNote => {
    if (typeof window === "undefined") {
      return { id: `note-${Date.now()}`, content: "", minimized: false, right: EDGE_PADDING, y: 16, height: DEFAULT_HEIGHT, width: NOTE_WIDTH };
    }
    const noteHeight = DEFAULT_HEIGHT;
    return {
      id: `note-${Date.now()}`,
      content: "",
      minimized: false,
      right: Math.max(EDGE_PADDING, EDGE_PADDING),
      y: Math.max(window.innerHeight - noteHeight - EDGE_PADDING, EDGE_PADDING),
      height: DEFAULT_HEIGHT,
      width: NOTE_WIDTH,
    };
  }, []);

  // Carregar estado salvo
  // Detectar usuário logado; só renderizar quando logado
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setHasUser(!!data?.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasUser(!!session?.user);
    });
    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasUser) return; // só carrega para usuários logados
    const load = async () => {
      try {
        // Tenta carregar do Supabase (sincronizado entre dispositivos)
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data, error } = await supabase
            .from(STICKY_TABLE)
            .select("id, content, right, y, width, height, minimized")
            .eq("user_id", userData.user.id)
            .order("created_at", { ascending: true });

          if (!error && data && data.length > 0) {
            const hydrated = data.map((n: any) => ({
              id: n.id,
              content: n.content || "",
              right: typeof n.right === "number" ? n.right : EDGE_PADDING,
              y: typeof n.y === "number" ? n.y : EDGE_PADDING,
              width: typeof n.width === "number" ? n.width : NOTE_WIDTH,
              height: typeof n.height === "number" ? n.height : DEFAULT_HEIGHT,
              minimized: !!n.minimized,
            }));
            setNotes(hydrated);
            setIsLoaded(true);
            return;
          }
        }

        // Fallback: carregar do localStorage
        const saved = localStorage.getItem(STORAGE_NOTES_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as QuickNote[];
          if (parsed.length > 0) {
            const hydrated = parsed.map((n) => {
              if (typeof n.right === "number") {
                return { ...n, width: n.width ?? NOTE_WIDTH, height: n.height ?? DEFAULT_HEIGHT };
              }
              if (typeof window !== "undefined") {
                const width = n.width ?? NOTE_WIDTH;
                const left = typeof n.x === "number" ? n.x : window.innerWidth - width - EDGE_PADDING;
                const right = Math.max(EDGE_PADDING, window.innerWidth - width - left);
                return { ...n, right, height: n.height ?? DEFAULT_HEIGHT, width };
              }
              return { ...n, right: EDGE_PADDING, height: n.height ?? DEFAULT_HEIGHT, width: n.width ?? NOTE_WIDTH };
            });
            setNotes(hydrated);
            setIsLoaded(true);
            return;
          }
        }

        // Estado inicial: uma nota no canto inferior direito
        setNotes([createDefaultNote()]);
        setIsLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar nota rápida:", error);
        setNotes([createDefaultNote()]);
        setIsLoaded(true);
      }
    };

    load();
  }, [createDefaultNote, hasUser]);

  // Persistir estado
  // Salvar em localStorage e Supabase (quando possível)
  useEffect(() => {
    if (!isLoaded || !hasUser) return;
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Erro ao salvar nota rápida local:", error);
    }

    const saveCloud = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;

        const payload = notes.map((n) => ({
          id: n.id,
          user_id: userData.user.id,
          content: n.content ?? "",
          right: n.right ?? EDGE_PADDING,
          y: n.y,
          width: n.width ?? NOTE_WIDTH,
          height: n.height ?? DEFAULT_HEIGHT,
          minimized: n.minimized ?? false,
        }));

        const { error } = await supabase.from(STICKY_TABLE).upsert(payload);
        if (error) {
          console.warn("Falha ao salvar notas rápidas no Supabase:", error.message);
        }
      } catch (error: any) {
        console.warn("Erro ao salvar notas rápidas no Supabase:", error?.message || error);
      }
    };

    saveCloud();
  }, [notes, isLoaded, hasUser]);

  const clampHeight = useCallback(
    (height: number) => Math.min(Math.max(height, MIN_HEIGHT), MAX_HEIGHT),
    []
  );

  const clampWidth = useCallback((width: number) => {
    if (typeof window === "undefined") return Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
    const maxAllowed = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - 40));
    return Math.min(Math.max(width, MIN_WIDTH), maxAllowed);
  }, []);

  const clampPos = useCallback(
    (right: number, y: number, minimized: boolean, height?: number, width?: number) => {
      if (typeof window === "undefined") return { right, y };
      const noteHeight = minimized ? 44 : (height ?? DEFAULT_HEIGHT);
      const noteWidth = clampWidth(width ?? NOTE_WIDTH);
      const maxY = Math.max(window.innerHeight - noteHeight - EDGE_PADDING, EDGE_PADDING);
      const maxRight = Math.max(window.innerWidth - noteWidth - EDGE_PADDING, EDGE_PADDING);
      return {
        right: Math.min(Math.max(right, EDGE_PADDING), maxRight),
        y: Math.min(Math.max(y, EDGE_PADDING), maxY),
      };
    },
    [clampWidth]
  );

  const startDrag = (id: string, clientX: number, clientY: number) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    if (typeof window === "undefined") return;
    const width = clampWidth(note.width ?? NOTE_WIDTH);
    const currentRight = note.right ?? EDGE_PADDING;
    const currentLeft = window.innerWidth - width - currentRight;
    dragStart.current = {
      id,
      offsetX: clientX - currentLeft,
      offsetY: clientY - note.y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStart.current) return;
    if (typeof window === "undefined") return;
    const nextLeft = e.clientX - dragStart.current.offsetX;
    const nextY = e.clientY - dragStart.current.offsetY;
    const movingNote = notes.find((n) => n.id === dragStart.current?.id);
    const width = clampWidth(movingNote?.width ?? NOTE_WIDTH);
    const nextRight = window.innerWidth - width - nextLeft;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== dragStart.current?.id) return n;
        const clamped = clampPos(nextRight, nextY, n.minimized, n.height, n.width);
        return { ...n, ...clamped };
      })
    );
  }, [clampPos]);

  const handleMouseUp = useCallback(() => {
    dragStart.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const startResize = (id: string, clientX: number, clientY: number) => {
    const note = notes.find((n) => n.id === id);
    if (!note || note.minimized) return;
    resizeStart.current = {
      id,
      startX: clientX,
      startY: clientY,
      startHeight: note.height ?? DEFAULT_HEIGHT,
      startWidth: clampWidth(note.width ?? NOTE_WIDTH),
    };
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);
  };

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!resizeStart.current) return;
      const deltaY = e.clientY - resizeStart.current.startY;
      const deltaX = e.clientX - resizeStart.current.startX;
      const newHeight = clampHeight(resizeStart.current.startHeight + deltaY);
      const newWidth = clampWidth(resizeStart.current.startWidth - deltaX); // arrastar para esquerda aumenta
      setNotes((prev) =>
        prev.map((n) =>
          n.id === resizeStart.current?.id ? { ...n, height: newHeight, width: newWidth } : n
        )
      );
    },
    [clampHeight, clampWidth]
  );

  const stopResize = useCallback(() => {
    resizeStart.current = null;
    window.removeEventListener("mousemove", handleResize);
    window.removeEventListener("mouseup", stopResize);
  }, [handleResize]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [handleMouseMove, handleMouseUp, handleResize, stopResize]);

  const addNote = () => {
    setNotes((prev) => {
      const baseRight =
        prev.length && typeof prev[prev.length - 1].right === "number"
          ? prev[prev.length - 1].right!
          : createDefaultNote().right ?? EDGE_PADDING;

      const maxBottom = prev.length
        ? Math.max(
            ...prev.map((n) => {
              const h = n.minimized ? 44 : n.height ?? DEFAULT_HEIGHT;
              return (n.y ?? EDGE_PADDING) + h;
            })
          )
        : createDefaultNote().y + (createDefaultNote().height ?? DEFAULT_HEIGHT);

      const nextY = maxBottom + STACK_GAP;

      const next = {
        id: `note-${Date.now()}`,
        content: "",
        minimized: false,
        height: DEFAULT_HEIGHT,
        width: NOTE_WIDTH,
        ...clampPos(baseRight, nextY, false, DEFAULT_HEIGHT, NOTE_WIDTH),
      };
      return [...prev, next];
    });
  };

  const updateContent = (id: string, value: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content: value } : n)));
  };

  const toggleMinimize = (id: string, minimized: boolean) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              minimized,
              ...clampPos(
                n.right ?? EDGE_PADDING,
                n.y,
                minimized,
                n.height,
                n.width
              ),
            }
          : n
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      if (remaining.length === 0) {
        return [createDefaultNote()];
      }
      return remaining;
    });

    // Tentar remover do Supabase (best-effort)
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return;
      supabase.from(STICKY_TABLE).delete().eq("id", id).eq("user_id", data.user.id);
    }).catch(() => {});
  };

  const saveToNotes = async (note: QuickNote) => {
    if (!note.content.trim()) {
      toast.error("Escreva algo antes de salvar nas notas.");
      return;
    }
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) throw new Error("Usuário não autenticado");

      const title = note.content.trim().slice(0, 40) || "Nota rápida";
      const { error } = await supabase.from("notes").insert({
        title,
        content: note.content.trim(),
        user_id: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Salvo em Notas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar em Notas:", error);
      toast.error(error.message || "Erro ao salvar em Notas");
    }
  };

  // Minimizar ao clicar fora de qualquer bloco
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-sticky-note]")) return;
      if (target.closest("[data-sticky-trigger]")) return;
      setNotes((prev) => prev.map((n) => ({ ...n, minimized: true })));
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <>
      {!hasUser ? null : (
    <>
      <button
        className="fixed right-3 bottom-3 z-50 bg-amber-400 text-amber-900 shadow-lg rounded-full p-2 hover:bg-amber-300 transition-colors border border-amber-500"
        onClick={() => {
          if (!notes.length) {
            setNotes([createDefaultNote()]);
            return;
          }
          addNote();
        }}
        title="Novo bloco rápido"
        data-sticky-trigger
      >
        <Plus className="h-5 w-5" />
      </button>

      {notes.map((note) =>
        note.minimized ? (
          <button
            key={note.id}
            aria-label="Abrir nota rápida"
            onClick={() => toggleMinimize(note.id, false)}
            onMouseDown={(e) => {
              startDrag(note.id, e.clientX, e.clientY);
              e.stopPropagation();
            }}
            style={{ right: note.right ?? EDGE_PADDING, top: note.y }}
            className="fixed z-50 bg-amber-100 text-amber-800 border border-amber-200 shadow-lg rounded-full px-3 py-2 hover:bg-amber-50 transition-colors cursor-move flex items-center gap-2 text-sm font-medium"
            data-sticky-note
          >
            <StickyNote className="h-4 w-4" />
            Nota rápida
          </button>
        ) : (
          <div
            key={note.id}
            className="fixed z-50 bg-amber-50 border border-amber-200 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-amber-200/60 cursor-move"
            style={{ right: note.right ?? EDGE_PADDING, top: note.y, width: clampWidth(note.width ?? NOTE_WIDTH) }}
            onMouseDown={(e) => {
              startDrag(note.id, e.clientX, e.clientY);
              e.stopPropagation();
            }}
            data-sticky-note
          >
            <div className="flex items-center justify-between px-4 py-3 bg-amber-100 border-b border-amber-200">
              <div className="flex items-center gap-2 text-amber-900">
                <div className="p-2 bg-amber-200 rounded-lg">
                  <StickyNote className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm">Nota rápida</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-800 hover:bg-amber-200/60 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  title="Excluir bloco"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-800 hover:bg-amber-200/60 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveToNotes(note);
                  }}
                  title="Salvar em Notas"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-amber-800 hover:bg-amber-200/60 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMinimize(note.id, true);
                  }}
                  title="Minimizar"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <Textarea
                value={note.content}
                onChange={(e) => updateContent(note.id, e.target.value)}
                rows={8}
                className="bg-white/80 border-amber-200 focus-visible:ring-amber-300 text-amber-900 placeholder:text-amber-500 resize-none cursor-text"
                placeholder="Escreva aqui... (salva automaticamente)"
                onMouseDown={(e) => e.stopPropagation()}
                style={{ minHeight: 120, height: Math.max(120, (note.height ?? DEFAULT_HEIGHT) - 100) }}
              />
              <div
                className="mt-2 w-full flex justify-end"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startResize(note.id, e.clientX, e.clientY);
                }}
                onMouseUp={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="h-4 w-8 cursor-nwse-resize text-amber-700 text-sm select-none flex items-center justify-center"
                  title="Arraste para redimensionar largura/altura"
                >
                  ↔↕
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </>
      )}
    </>
  );
};

export default StickyQuickNote;

