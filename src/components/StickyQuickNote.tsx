import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { StickyNote, ChevronUp, ChevronDown, Plus, Save, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_NOTES_KEY = "quickNotesDataV1";
const EDGE_PADDING = 10;
const NOTE_WIDTH = 320;
const MIN_NOTE_WIDTH = 240;
const MAX_NOTE_WIDTH = 600;
const DEFAULT_HEIGHT = 260;
const MIN_NOTE_HEIGHT = 180;
const MAX_NOTE_HEIGHT = 600;
const STICKY_TABLE = "sticky_notes";

type QuickNote = {
  id: string;
  content: string;
  x: number;
  y: number;
  height: number;
  width: number;
  minimized: boolean;
};

const StickyQuickNote: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const userId = user?.id || null;
  const hasUser = !!user;

  const generateId = useCallback(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }, []);

  const ensureUuid = useCallback((id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Just a basic check, keep original if it's already a uuid
    return id.length > 20 ? id : generateId();
  }, [generateId]);

  const clampWidth = useCallback((width: number) => {
    if (typeof window === "undefined") return Math.min(Math.max(width, MIN_NOTE_WIDTH), MAX_NOTE_WIDTH);
    const maxAllowed = Math.min(MAX_NOTE_WIDTH, window.innerWidth - 40);
    return Math.min(Math.max(width, MIN_NOTE_WIDTH), maxAllowed);
  }, []);

  const clampHeight = useCallback((height: number) => {
    return Math.min(Math.max(height, MIN_NOTE_HEIGHT), MAX_NOTE_HEIGHT);
  }, []);

  const clampPos = useCallback((x: number, y: number, width: number, height: number, minimized: boolean) => {
    if (typeof window === "undefined") return { x, y };
    const w = width;

    const maxX = window.innerWidth - 60;
    const minX = -w + 60;
    const maxY = window.innerHeight - 40;
    const minY = 0;

    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }, []);

  const normalizeNote = useCallback((note: any): QuickNote => {
    const width = clampWidth(note.width ?? NOTE_WIDTH);
    const height = clampHeight(note.height ?? DEFAULT_HEIGHT);

    let x = note.x;
    if (typeof x === "undefined" && typeof note.right === "number") {
      x = window.innerWidth - width - note.right;
    }
    if (typeof x === "undefined") x = window.innerWidth - width - EDGE_PADDING;

    const pos = clampPos(x, note.y ?? 100, width, height, !!note.minimized);

    return {
      id: note.id || generateId(),
      content: note.content || "",
      x: pos.x,
      y: pos.y,
      width,
      height,
      minimized: !!note.minimized,
    };
  }, [clampWidth, clampHeight, clampPos, generateId]);

  const createDefaultNote = useCallback((): QuickNote => {
    const width = NOTE_WIDTH;
    const height = DEFAULT_HEIGHT;
    const x = typeof window !== "undefined" ? window.innerWidth - width - 20 : 0;
    const y = typeof window !== "undefined" ? window.innerHeight - height - 80 : 20;
    return {
      id: generateId(),
      content: "",
      minimized: false,
      x,
      y,
      width,
      height,
    };
  }, [generateId]);

  // Auth state is now managed by useAuth

  // Fetch remote notes
  const fetchRemoteNotes = useCallback(async (uid: string) => {
    const { data, error } = await (supabase as any)
      .from(STICKY_TABLE)
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data.map((n: any) => normalizeNote(n));
    }
    return null;
  }, [normalizeNote]);

  // Load effect
  useEffect(() => {
    if (!hasUser || !userId) return;
    const load = async () => {
      const remote = await fetchRemoteNotes(userId);
      if (remote) {
        setNotes(remote);
      } else {
        const saved = localStorage.getItem(STORAGE_NOTES_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setNotes(parsed.map((n: any) => normalizeNote(n)));
          } catch (e) {
            setNotes([createDefaultNote()]);
          }
        } else {
          setNotes([createDefaultNote()]);
        }
      }
      setIsLoaded(true);
    };
    load();
  }, [hasUser, userId, fetchRemoteNotes, normalizeNote, createDefaultNote]);

  // Save effect
  useEffect(() => {
    if (!isLoaded || !hasUser || !userId) return;

    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));

    const saveCloud = async () => {
      const payload = notes.map((n) => ({
        id: n.id,
        user_id: userId,
        content: n.content,
        x: n.x,
        y: n.y,
        width: n.width,
        height: n.height,
        minimized: n.minimized,
        right: window.innerWidth - n.width - n.x,
      }));

      await (supabase as any).from(STICKY_TABLE).upsert(payload);
    };

    const timeout = setTimeout(saveCloud, 1000);
    return () => clearTimeout(timeout);
  }, [notes, isLoaded, hasUser, userId]);

  // Interaction logic
  const [dragInfo, setDragInfo] = useState<{ id: string; startX: number; startY: number; noteX: number; noteY: number } | null>(null);
  const [resizeInfo, setResizeInfo] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const bringToFront = (id: string) => {
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note) return prev;
      return [...prev.filter(n => n.id !== id), note];
    });
  };

  const onMouseDownDrag = (e: React.MouseEvent, note: QuickNote) => {
    setDragInfo({ id: note.id, startX: e.clientX, startY: e.clientY, noteX: note.x, noteY: note.y });
    bringToFront(note.id);
  };

  const onMouseDownResize = (e: React.MouseEvent, note: QuickNote) => {
    e.stopPropagation();
    setResizeInfo({ id: note.id, startX: e.clientX, startY: e.clientY, startW: note.width, startH: note.height });
    bringToFront(note.id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragInfo) {
        const dx = e.clientX - dragInfo.startX;
        const dy = e.clientY - dragInfo.startY;
        setNotes(prev => prev.map(n => {
          if (n.id !== dragInfo.id) return n;
          const pos = clampPos(dragInfo.noteX + dx, dragInfo.noteY + dy, n.width, n.height, n.minimized);
          return { ...n, x: pos.x, y: pos.y };
        }));
      } else if (resizeInfo) {
        const dx = e.clientX - resizeInfo.startX;
        const dy = e.clientY - resizeInfo.startY;
        setNotes(prev => prev.map(n => {
          if (n.id !== resizeInfo.id) return n;
          return {
            ...n,
            width: clampWidth(resizeInfo.startW + dx),
            height: clampHeight(resizeInfo.startH + dy)
          };
        }));
      }
    };

    const handleMouseUp = () => {
      setDragInfo(null);
      setResizeInfo(null);
    };

    if (dragInfo || resizeInfo) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragInfo, resizeInfo, clampPos, clampWidth, clampHeight]);

  const addNote = () => {
    const lastNote = notes[notes.length - 1];
    const baseNote = lastNote || createDefaultNote();
    const newNote = {
      ...createDefaultNote(),
      x: baseNote.x + 20,
      y: baseNote.y + 20,
    };
    setNotes(prev => [...prev, newNote]);
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await (supabase as any).from(STICKY_TABLE).delete().eq("id", id);
  };

  const saveToNotes = async (note: QuickNote) => {
    if (!note.content.trim()) return;
    const { error } = await (supabase as any).from("notes").insert({
      title: note.content.slice(0, 40) || "Nota rápida",
      content: note.content,
      user_id: userId,
    });
    if (!error) toast.success("Salvo em Notas!");
  };

  if (!hasUser) return null;

  const body = (
    <>
      <button
        className="fixed right-3 bottom-3 z-[10000] bg-amber-400 text-amber-900 shadow-xl rounded-full p-3 hover:bg-amber-300 transition-all hover:scale-110 border-2 border-amber-500"
        onClick={addNote}
        title="Nova nota rápida"
        data-sticky-trigger
      >
        <Plus className="h-6 w-6" />
      </button>

      {notes.map((note) => (
        <div
          key={note.id}
          className="fixed z-[9999] bg-amber-50 border border-amber-200 shadow-2xl rounded-xl overflow-hidden flex flex-col"
          onMouseDown={() => bringToFront(note.id)}
          style={{
            left: note.x,
            top: note.y,
            width: note.minimized ? 200 : note.width,
            height: note.minimized ? "auto" : note.height,
            transition: dragInfo?.id === note.id || resizeInfo?.id === note.id ? "none" : "all 0.15s ease-out"
          }}
          data-sticky-note
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2 bg-amber-100 border-b border-amber-200 cursor-move select-none"
            onMouseDown={(e) => onMouseDownDrag(e, note)}
          >
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider truncate mr-1">
              <StickyNote className="h-4 w-4 shrink-0" />
              <span className="truncate">{note.minimized ? "Nota" : "Nota Rápida"}</span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {!note.minimized && (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-800 hover:bg-amber-200" onClick={(e) => { e.stopPropagation(); saveToNotes(note); }}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-800 hover:bg-amber-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setNotes(prev => prev.map(n => n.id === note.id ? { ...n, minimized: !n.minimized } : n));
                  bringToFront(note.id);
                }}
              >
                {note.minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Content */}
          {!note.minimized && (
            <div className="flex-1 flex flex-col p-3 relative bg-white/40">
              <Textarea
                value={note.content}
                onChange={(e) => setNotes(prev => prev.map(n => n.id === note.id ? { ...n, content: e.target.value } : n))}
                className="flex-1 bg-white/80 border-amber-200 focus-visible:ring-amber-300 resize-none text-sm"
                placeholder="Escreva algo aqui..."
                onMouseDown={(e) => e.stopPropagation()}
              />
              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1 group"
                onMouseDown={(e) => onMouseDownResize(e, note)}
              >
                <div className="w-2 h-2 border-r-2 border-b-2 border-amber-400 group-hover:border-amber-600 transition-colors" />
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );

  return typeof document !== "undefined" ? createPortal(body, document.body) : null;
};

export default StickyQuickNote;
