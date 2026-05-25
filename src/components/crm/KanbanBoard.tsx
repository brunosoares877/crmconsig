import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { GripVertical } from "lucide-react";

interface Lead {
    id: string;
    name: string;
    phone: string;
    pipeline_stage?: string;
    last_message_time?: string;
    avatar_url?: string;
}

interface PipelineStage {
    id: string;
    name: string;
    slug: string;
    color: string;
    order_index: number;
}

interface KanbanBoardProps {
    leads: Lead[];
    onLeadMove: (leadId: string, newStage: string) => void;
    onSelectLead: (lead: Lead) => void;
}

const DraggableCard = ({ lead, onClick }: { lead: Lead; onClick: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: { lead }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 100 : undefined,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-3 bg-white rounded-lg border shadow-sm cursor-grab active:cursor-grabbing mb-2 ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : 'hover:border-blue-300'}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    {lead.avatar_url && <AvatarImage src={lead.avatar_url} alt={lead.name} />}
                    <AvatarFallback className="text-xs bg-gray-100">{lead.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <h4 className="text-sm font-medium truncate">{lead.name}</h4>
                    <span className="text-[10px] text-gray-400">{lead.phone}</span>
                </div>
            </div>
        </div>
    );
};

// Sortable column that can be dragged to reorder
const SortableColumn = ({
    id,
    title,
    color,
    leads,
    onSelectLead
}: {
    id: string;
    title: string;
    color: string;
    leads: Lead[];
    onSelectLead: (lead: Lead) => void;
}) => {
    const { setNodeRef: setDropRef } = useDroppable({ id });
    const {
        attributes,
        listeners,
        setNodeRef: setSortRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: `column-${id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={(node) => {
                setDropRef(node);
                setSortRef(node);
            }}
            style={style}
            className="flex flex-col flex-1 min-w-[200px] bg-gray-50 rounded-lg"
        >
            <div
                className="p-3 rounded-t-lg font-semibold text-white text-sm flex items-center justify-between cursor-grab active:cursor-grabbing"
                style={{ backgroundColor: color }}
                {...attributes}
                {...listeners}
            >
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 opacity-70" />
                    <span>{title}</span>
                </div>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {leads.length}
                </span>
            </div>
            <div className="flex-1 p-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                {leads.map(lead => (
                    <DraggableCard key={lead.id} lead={lead} onClick={() => onSelectLead(lead)} />
                ))}
            </div>
        </div>
    );
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onLeadMove, onSelectLead }) => {
    const [columns, setColumns] = useState<PipelineStage[]>([]);

    useEffect(() => {
        fetchStages();
    }, []);

    const fetchStages = async () => {
        try {
            const { data, error } = await supabase
                .from('pipeline_stages')
                .select('*')
                .order('order_index');

            if (error) throw error;

            if (data && data.length > 0) {
                setColumns(data);
            } else {
                // Fallback para colunas padrão - usando slugs comuns
                setColumns([
                    { id: '1', name: 'Novos', slug: 'novo', color: '#22c55e', order_index: 1 },
                    { id: '2', name: 'Em Análise', slug: 'em_analise', color: '#3b82f6', order_index: 2 },
                    { id: '3', name: 'Aprovados', slug: 'aprovado', color: '#8b5cf6', order_index: 3 },
                ]);
            }
        } catch (error) {
            console.error('[Kanban] Error fetching stages:', error);
            // Fallback em caso de erro
            setColumns([
                { id: '1', name: 'Novos', slug: 'novo', color: '#22c55e', order_index: 1 },
                { id: '2', name: 'Em Análise', slug: 'em_analise', color: '#3b82f6', order_index: 2 },
                { id: '3', name: 'Aprovados', slug: 'aprovado', color: '#8b5cf6', order_index: 3 },
            ]);
        }
    };

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Check if we're dragging a column (starts with "column-")
        if (activeId.startsWith('column-')) {
            const activeSlug = activeId.replace('column-', '');
            const overSlug = overId.replace('column-', '');

            const oldIndex = columns.findIndex(c => c.slug === activeSlug);
            const newIndex = columns.findIndex(c => c.slug === overSlug);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const newColumns = [...columns];
                const [movedColumn] = newColumns.splice(oldIndex, 1);
                newColumns.splice(newIndex, 0, movedColumn);

                // Update order in database
                try {
                    const updates = newColumns.map((col, index) =>
                        supabase
                            .from('pipeline_stages' as any)
                            .update({ order_index: index + 1 })
                            .eq('id', col.id)
                    );
                    await Promise.all(updates);
                    setColumns(newColumns);
                } catch (error) {
                    console.error('Error reordering columns:', error);
                }
            }
        } else {
            // Moving a lead card
            if (columns.some(c => c.slug === overId)) {
                onLeadMove(activeId, overId);
            }
        }
    };

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={columns.map(c => `column-${c.slug}`)} strategy={horizontalListSortingStrategy}>
                <div className="flex gap-4 h-full overflow-x-auto overflow-y-hidden pb-2 flex-nowrap">
                    {columns.map(col => {
                        const columnLeads = leads.filter(l => (l.pipeline_stage || 'novo') === col.slug);

                        return (
                            <SortableColumn
                                key={col.id}
                                id={col.slug}
                                title={col.name}
                                color={col.color}
                                leads={columnLeads}
                                onSelectLead={onSelectLead}
                            />
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );
};
