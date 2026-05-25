import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Plus, Trash2, ArrowUp, ArrowDown, Columns } from "lucide-react";
import { toast } from "sonner";

interface PipelineStage {
    id: string;
    name: string;
    slug: string;
    color: string;
    order_index: number;
    user_id: string;
}

export const PipelineStageManager = () => {
    const [stages, setStages] = useState<PipelineStage[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState('#6366f1');
    const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

    // Cores pré-definidas
    const presetColors = [
        '#ef4444', '#f97316', '#f59e0b', '#eab308',
        '#84cc16', '#22c55e', '#10b981', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
    ];

    const fetchStages = async () => {
        try {
            const { data, error } = await supabase
                .from('pipeline_stages')
                .select('*')
                .order('order_index');

            if (error) throw error;
            setStages(data || []);
        } catch (error) {
            console.error('Error fetching stages:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStages();
        }
    }, [isOpen]);

    const createSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_|_$/g, '');
    };

    const handleCreateStage = async () => {
        if (!newStageName.trim()) {
            toast.error('Digite um nome para o estágio');
            return;
        }

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('User not found');

            const slug = createSlug(newStageName);
            const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order_index)) : 0;

            const { error } = await supabase
                .from('pipeline_stages')
                .insert([{
                    name: newStageName.trim(),
                    slug: slug,
                    color: newStageColor,
                    order_index: maxOrder + 1,
                    user_id: user.id
                }]);

            if (error) throw error;

            toast.success('Estágio criado com sucesso!');
            setNewStageName('');
            setNewStageColor('#6366f1');
            fetchStages();
        } catch (error: any) {
            console.error('Error creating stage:', error);
            if (error.code === '23505') {
                toast.error('Já existe um estágio com este nome');
            } else {
                toast.error('Erro ao criar estágio');
            }
        }
    };

    const handleUpdateStage = async (stage: PipelineStage) => {
        try {
            const { error } = await supabase
                .from('pipeline_stages')
                .update({
                    name: stage.name,
                    color: stage.color
                })
                .eq('id', stage.id);

            if (error) throw error;

            toast.success('Estágio atualizado!');
            setEditingStage(null);
            fetchStages();
        } catch (error) {
            console.error('Error updating stage:', error);
            toast.error('Erro ao atualizar estágio');
        }
    };

    const handleDeleteStage = async (stageId: string) => {
        if (!confirm('Tem certeza que deseja deletar este estágio?')) return;

        try {
            const { error } = await supabase
                .from('pipeline_stages')
                .delete()
                .eq('id', stageId);

            if (error) throw error;

            toast.success('Estágio deletado!');
            fetchStages();
        } catch (error) {
            console.error('Error deleting stage:', error);
            toast.error('Erro ao deletar estágio');
        }
    };

    const handleReorder = async (stageId: string, direction: 'up' | 'down') => {
        const stageIndex = stages.findIndex(s => s.id === stageId);
        if (stageIndex === -1) return;
        if (direction === 'up' && stageIndex === 0) return;
        if (direction === 'down' && stageIndex === stages.length - 1) return;

        const newStages = [...stages];
        const swapIndex = direction === 'up' ? stageIndex - 1 : stageIndex + 1;

        [newStages[stageIndex], newStages[swapIndex]] = [newStages[swapIndex], newStages[stageIndex]];

        try {
            // Update order indexes
            const updates = newStages.map((stage, index) =>
                supabase
                    .from('pipeline_stages')
                    .update({ order_index: index + 1 })
                    .eq('id', stage.id)
            );

            await Promise.all(updates);
            fetchStages();
            toast.success('Ordem atualizada!');
        } catch (error) {
            console.error('Error reordering:', error);
            toast.error('Erro ao reordenar');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 hover:bg-blue-50"
                    title="Gerenciar Estágios"
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Columns className="h-5 w-5 text-blue-600" />
                        Gerenciar Estágios do Pipeline
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Criar novo estágio */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Criar Novo Estágio
                        </h3>

                        <div className="grid gap-4">
                            <div>
                                <Label className="text-xs font-semibold mb-2">Nome do Estágio</Label>
                                <Input
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    placeholder="Ex: Em Análise, Aguardando Resposta..."
                                    className="h-10"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateStage()}
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold mb-2">Cor do Estágio</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={newStageColor}
                                            onChange={(e) => setNewStageColor(e.target.value)}
                                            className="h-10 w-20 rounded cursor-pointer border-2 border-gray-200"
                                        />
                                        <Input
                                            value={newStageColor}
                                            onChange={(e) => setNewStageColor(e.target.value)}
                                            className="h-10 flex-1 font-mono text-xs"
                                        />
                                        <div
                                            className="h-10 w-10 rounded border-2 border-gray-200"
                                            style={{ backgroundColor: newStageColor }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-8 gap-2">
                                        {presetColors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewStageColor(color)}
                                                className={`h-8 w-8 rounded border-2 transition-all hover:scale-110 ${newStageColor === color ? 'border-gray-900 ring-2 ring-offset-2' : 'border-gray-200'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateStage}
                                className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Criar Estágio
                            </Button>
                        </div>
                    </div>

                    {/* Lista de estágios */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-700">
                            Estágios Atuais ({stages.length})
                        </h3>
                        <div className="space-y-2">
                            {stages.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-8">
                                    Nenhum estágio criado ainda
                                </p>
                            ) : (
                                stages.map((stage, index) => (
                                    <div
                                        key={stage.id}
                                        className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-gray-300 transition-all"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReorder(stage.id, 'up')}
                                                disabled={index === 0}
                                                className="h-5 w-5 p-0"
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReorder(stage.id, 'down')}
                                                disabled={index === stages.length - 1}
                                                className="h-5 w-5 p-0"
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {editingStage?.id === stage.id ? (
                                            <div className="flex-1 flex items-center gap-2">
                                                <Input
                                                    value={editingStage.name}
                                                    onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                                                    className="h-8 text-sm"
                                                />
                                                <input
                                                    type="color"
                                                    value={editingStage.color}
                                                    onChange={(e) => setEditingStage({ ...editingStage, color: e.target.value })}
                                                    className="h-8 w-16 rounded cursor-pointer"
                                                />
                                                <Button size="sm" onClick={() => handleUpdateStage(editingStage)} className="h-8">
                                                    Salvar
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingStage(null)} className="h-8">
                                                    Cancelar
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Badge
                                                    style={{
                                                        backgroundColor: stage.color + '20',
                                                        color: stage.color,
                                                        border: `2px solid ${stage.color}60`
                                                    }}
                                                    className="text-xs px-3 py-1.5 font-bold flex items-center gap-2 flex-1"
                                                >
                                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }}></span>
                                                    {stage.name}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingStage(stage)}
                                                    className="hover:bg-blue-50"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteStage(stage.id)}
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
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
