import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2, Palette } from "lucide-react";
import { toast } from "sonner";

interface Tag {
    id: string;
    name: string;
    color: string;
    user_id: string;
}

export const TagManager = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3b82f6');

    // Cores pré-definidas populares
    const presetColors = [
        '#ef4444', // red
        '#f97316', // orange
        '#f59e0b', // amber
        '#eab308', // yellow
        '#84cc16', // lime
        '#22c55e', // green
        '#10b981', // emerald
        '#14b8a6', // teal
        '#06b6d4', // cyan
        '#0ea5e9', // sky
        '#3b82f6', // blue
        '#6366f1', // indigo
        '#8b5cf6', // violet
        '#a855f7', // purple
        '#d946ef', // fuchsia
        '#ec4899', // pink
    ];

    const fetchTags = async () => {
        try {
            const { data, error } = await supabase
                .from('lead_tags')
                .select('*')
                .order('name');

            if (error) throw error;
            setTags(data || []);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTags();
        }
    }, [isOpen]);

    const handleCreateTag = async () => {
        if (!newTagName.trim()) {
            toast.error('Digite um nome para a tag');
            return;
        }

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('User not found');

            const { error } = await supabase
                .from('lead_tags')
                .insert([{
                    name: newTagName.trim(),
                    color: newTagColor,
                    user_id: user.id
                }]);

            if (error) throw error;

            toast.success('Tag criada com sucesso!');
            setNewTagName('');
            setNewTagColor('#3b82f6');
            fetchTags();
        } catch (error) {
            console.error('Error creating tag:', error);
            toast.error('Erro ao criar tag');
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!confirm('Tem certeza que deseja deletar esta tag?')) return;

        try {
            const { error } = await supabase
                .from('lead_tags')
                .delete()
                .eq('id', tagId);

            if (error) throw error;

            toast.success('Tag deletada com sucesso!');
            fetchTags();
        } catch (error) {
            console.error('Error deleting tag:', error);
            toast.error('Erro ao deletar tag');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600"
                >
                    <Settings className="h-3 w-3 mr-1" />
                    Gerenciar
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Palette className="h-5 w-5 text-blue-600" />
                        Gerenciar Etiquetas
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Criar nova tag */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Criar Nova Etiqueta
                        </h3>

                        <div className="grid gap-4">
                            <div>
                                <Label className="text-xs font-semibold mb-2">Nome da Etiqueta</Label>
                                <Input
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Ex: Cliente VIP, Urgente, Follow-up..."
                                    className="h-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold mb-2">Cor da Etiqueta</Label>
                                <div className="space-y-3">
                                    {/* Color picker nativo */}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={newTagColor}
                                            onChange={(e) => setNewTagColor(e.target.value)}
                                            className="h-10 w-20 rounded cursor-pointer border-2 border-gray-200"
                                        />
                                        <Input
                                            value={newTagColor}
                                            onChange={(e) => setNewTagColor(e.target.value)}
                                            placeholder="#3b82f6"
                                            className="h-10 flex-1 font-mono text-xs"
                                        />
                                        <div
                                            className="h-10 w-10 rounded border-2 border-gray-200"
                                            style={{ backgroundColor: newTagColor }}
                                        />
                                    </div>

                                    {/* Preset colors */}
                                    <div className="grid grid-cols-8 gap-2">
                                        {presetColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewTagColor(color)}
                                                className={`h-8 w-8 rounded border-2 transition-all hover:scale-110 ${newTagColor === color ? 'border-gray-900 ring-2 ring-offset-2' : 'border-gray-200'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateTag}
                                className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Etiqueta
                            </Button>
                        </div>
                    </div>

                    {/* Lista de tags existentes */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-700">
                            Etiquetas Existentes ({tags.length})
                        </h3>
                        <div className="grid gap-2">
                            {tags.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">
                                    Nenhuma etiqueta criada ainda
                                </p>
                            ) : (
                                tags.map(tag => (
                                    <div
                                        key={tag.id}
                                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-gray-300 transition-all"
                                    >
                                        <Badge
                                            style={{
                                                backgroundColor: tag.color + '20',
                                                color: tag.color,
                                                border: `2px solid ${tag.color}60`
                                            }}
                                            className="text-xs px-3 py-1.5 font-bold flex items-center gap-2"
                                        >
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                                            {tag.name}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteTag(tag.id)}
                                            className="hover:bg-red-50 hover:text-red-600 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
