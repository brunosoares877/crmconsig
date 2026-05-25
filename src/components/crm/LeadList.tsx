import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, List, Kanban, Filter } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PipelineStageManager } from './PipelineStageManager';
import { QuickAddContact } from './QuickAddContact';
import { KanbanBoard } from './KanbanBoard';

interface Lead {
    id: string;
    name: string;
    phone: string;
    pipeline_stage?: string;
    status: string;
    avatar_url?: string;
    tags?: Array<{ id: string; name: string; color: string }>;
}

interface LeadListProps {
    leads: Lead[];
    selectedLeadId?: string;
    onSelectLead: (lead: Lead) => void;
    onLeadMove: (leadId: string, newStage: string) => void;
    onAddContact: () => void;
    onViewModeChange?: (mode: 'list' | 'kanban') => void;
}

export const LeadList: React.FC<LeadListProps> = ({
    leads,
    selectedLeadId,
    onSelectLead,
    onLeadMove,
    onAddContact,
    onViewModeChange
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [searchTerm, setSearchTerm] = useState('');

    const handleViewModeChange = (mode: 'list' | 'kanban') => {
        setViewMode(mode);
        onViewModeChange?.(mode);
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm)
    );

    return (
        <div className={`flex flex-col h-full bg-white border-r ${viewMode === 'kanban' ? 'w-full' : 'w-96'} transition-all duration-300 relative z-10`}>
            {/* Header */}
            <div className="p-4 border-b bg-gray-50/50 relative z-20">
                {/* Title and Quick Add */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-800">Contatos</h2>
                    <QuickAddContact onContactAdded={onAddContact} />
                </div>

                {/* View Mode Toggles and Settings */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                            onClick={() => handleViewModeChange('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${viewMode === 'kanban' ? 'bg-white shadow-sm' : ''}`}
                            onClick={() => handleViewModeChange('kanban')}
                        >
                            <Kanban className="h-4 w-4" />
                        </Button>
                    </div>
                    <PipelineStageManager />
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-0 relative">
                {viewMode === 'list' ? (
                    <ScrollArea className="h-full">
                        <div className="divide-y">
                            {filteredLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    onClick={() => onSelectLead(lead)}
                                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors flex items-center gap-3
                                        ${selectedLeadId === lead.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''}
                                    `}
                                >
                                    <Avatar>
                                        {lead.avatar_url && (
                                            <img
                                                src={lead.avatar_url}
                                                alt={lead.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    // Hide image if it fails to load
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {lead.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-sm truncate text-gray-900">{lead.name}</h3>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">
                                                {lead.pipeline_stage || 'novo'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
                                        {lead.tags && lead.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {lead.tags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag.id}
                                                        className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1"
                                                        style={{
                                                            backgroundColor: tag.color + '20',
                                                            color: tag.color,
                                                            border: `1px solid ${tag.color}40`
                                                        }}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                                                        {tag.name}
                                                    </span>
                                                ))}
                                                {lead.tags.length > 2 && (
                                                    <span className="text-[9px] text-gray-400 font-semibold">+{lead.tags.length - 2}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="h-full bg-gray-50/30">
                        <KanbanBoard leads={filteredLeads} onLeadMove={onLeadMove} onSelectLead={onSelectLead} />
                    </div>
                )}
            </div>
        </div>
    );
};
