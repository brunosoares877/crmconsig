import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Calendar as CalendarIcon,
    Save,
    User as UserIcon,
    Wallet,
    Tag as TagIcon,
    FileText,
    Plus,
    Trash2,
    Download,
    Paperclip,
    Phone,
    Check,
    ChevronsUpDown,
    Search,
    Pencil
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TagManager } from './TagManager';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Lead {
    id: string;
    name: string;
    phone: string;
    phone2?: string;
    phone3?: string;
    cpf?: string;
    amount?: string;
    bank?: string;
    notes?: string;
    benefit_type?: string;
    employee?: string;
    tags?: any[];
}

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface Document {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
}

interface LeadDetailsProps {
    lead: Lead | null;
    onUpdate: (updatedLead: Lead) => void;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ lead, onUpdate }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Lead>>({});
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [leadTags, setLeadTags] = useState<Tag[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Listas para sugestões
    const [registeredEmployees, setRegisteredEmployees] = useState<string[]>([]);
    const [registeredBenefitTypes, setRegisteredBenefitTypes] = useState<string[]>([]);

    // Estados dos Popovers
    const [openEmployee, setOpenEmployee] = useState(false);
    const [openBenefit, setOpenBenefit] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name || '',
                cpf: lead.cpf || '',
                bank: lead.bank || '',
                amount: lead.amount || '',
                notes: lead.notes || '',
                benefit_type: lead.benefit_type || '',
                employee: lead.employee || '',
                phone: lead.phone || '',
                phone2: lead.phone2 || '',
                phone3: lead.phone3 || '',
            });
            fetchLeadData();
        }
    }, [lead?.id]);

    const fetchLeadData = async () => {
        if (!lead) return;

        // Fetch Lead Tags
        const { data: assignments } = await supabase
            .from('lead_tag_assignments')
            .select('tag_id, lead_tags(id, name, color)')
            .eq('lead_id', lead.id);

        if (assignments) {
            const tags = assignments.map((a: any) => a.lead_tags);
            setLeadTags(tags);
        }

        // Fetch All Available Tags
        const { data: tags } = await supabase
            .from('lead_tags')
            .select('*');
        if (tags) setAllTags(tags);

        // Fetch Documents
        const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .eq('lead_id', lead.id);
        if (docs) setDocuments(docs);

        // BUSCAR FUNCIONÁRIOS E TIPOS DE BENEFÍCIO CADASTRADOS
        try {
            // 1. Das tabelas dedicadas
            const { data: employeesData } = await supabase.from('employees').select('name');
            const { data: benefitTypesData } = await supabase.from('benefit_types').select('code, description');

            // 2. Dos leads existentes
            const { data: leadsData } = await supabase.from('leads').select('employee, benefit_type');

            const employeeSet = new Set<string>();
            const benefitSet = new Set<string>();

            // Mapa para normalização de benefícios (Código -> Label, Descrição -> Label)
            const benefitNormalizationMap = new Map<string, string>();

            benefitTypesData?.forEach(b => {
                const label = `${b.code} - ${b.description}`;
                benefitSet.add(label);
                benefitNormalizationMap.set(b.code.toLowerCase(), label);
                benefitNormalizationMap.set(b.description.toLowerCase(), label);
                benefitNormalizationMap.set(label.toLowerCase(), label);
            });

            // Adicionar das tabelas dedicadas de funcionários
            employeesData?.forEach(e => e.name && employeeSet.add(e.name));

            // Regex para identificar UUIDs
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            // Adicionar do que já tem nos leads com filtros
            leadsData?.forEach(l => {
                // Funcionário: ignorar UUIDs e nulos
                if (l.employee && !uuidRegex.test(l.employee.trim())) {
                    employeeSet.add(l.employee.trim());
                }

                // Benefício: normalizar para o formato "Código - Descrição" se possível
                if (l.benefit_type) {
                    const val = l.benefit_type.trim();
                    const lowVal = val.toLowerCase();

                    if (benefitNormalizationMap.has(lowVal)) {
                        benefitSet.add(benefitNormalizationMap.get(lowVal)!);
                    } else if (val && !uuidRegex.test(val)) {
                        benefitSet.add(val);
                    }
                }
            });

            setRegisteredEmployees(Array.from(employeeSet).sort());
            setRegisteredBenefitTypes(Array.from(benefitSet).sort());
        } catch (error) {
            console.error("Erro ao buscar listas fixas:", error);
        }
    };

    const handleSave = async () => {
        if (!lead) return;
        setLoading(true);
        try {
            const dbData: any = {
                name: formData.name,
                cpf: formData.cpf,
                notes: formData.notes,
                benefit_type: formData.benefit_type,
                employee: formData.employee,
                phone: formData.phone,
                phone2: formData.phone2,
                phone3: formData.phone3
            };

            const { error } = await supabase
                .from('leads')
                .update(dbData)
                .eq('id', lead.id);

            if (error) throw error;

            toast.success("Dados salvos com sucesso!");
            onUpdate({ ...lead, ...formData } as Lead);
        } catch (error: any) {
            console.error('Error saving lead details:', error);
            toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (tagId: string) => {
        if (!lead) return;
        if (leadTags.some(t => t.id === tagId)) return;

        try {
            const { error } = await supabase
                .from('lead_tag_assignments')
                .insert([{ lead_id: lead.id, tag_id: tagId, user_id: (await supabase.auth.getUser()).data.user?.id }]);

            if (error) throw error;
            fetchLeadData();
            toast.success("Etiqueta adicionada");
        } catch (error) {
            toast.error("Erro ao adicionar etiqueta");
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        if (!lead) return;
        try {
            const { error } = await supabase
                .from('lead_tag_assignments')
                .delete()
                .eq('lead_id', lead.id)
                .eq('tag_id', tagId);

            if (error) throw error;
            fetchLeadData();
            toast.success("Etiqueta removida");
        } catch (error) {
            toast.error("Erro ao remover etiqueta");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !lead) return;

        if (!user) {
            console.error("No authenticated user found for upload");
            toast.error("Erro de autenticação: Por favor, faça login novamente.");
            return;
        }

        setIsUploading(true);
        console.log(`Iniciando upload para Lead ${lead.id} como Usuário ${user.id}`);

        try {
            for (const file of Array.from(files)) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(7)}_${Date.now()}.${fileExt}`;
                const filePath = `${lead.id}/${fileName}`;

                console.log(`Enviando arquivo: ${file.name} -> ${filePath}`);

                const { error: uploadError } = await supabase.storage
                    .from('lead-documents')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    throw uploadError;
                }

                const docData = {
                    lead_id: lead.id,
                    file_name: file.name,
                    file_path: filePath,
                    file_type: file.type,
                    user_id: user.id
                };

                console.table(docData);
                console.log("Current Auth UID (Frontend):", user.id);
                console.log("Attempting insert into 'documents'...");

                const { data: insertData, error: dbError } = await supabase
                    .from('documents')
                    .insert([docData])
                    .select();

                if (dbError) {
                    console.error("❌ DATABASE INSERT ERROR:", dbError);
                    console.error("Error Code:", dbError.code);
                    console.error("Error Message:", dbError.message);
                    console.error("Error Details:", dbError.details);
                    console.error("Error Hint:", dbError.hint);

                    if (dbError.code === '42501') {
                        throw new Error(`Permissão negada (RLS). O banco de dados recusou o registro para o usuário ${user.id}. Detalhes: ${dbError.message}`);
                    }
                    throw dbError;
                }

                console.log("✅ Insert successful:", insertData);
            }

            toast.success(files.length > 1 ? `${files.length} arquivos enviados!` : "Arquivo enviado com sucesso!");
            fetchLeadData();
        } catch (error: any) {
            console.error("Upload process error handle:", error);
            toast.error(`Erro ao enviar: ${error.message || 'Erro no servidor'}`);
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const handleViewDocument = async (doc: Document) => {
        const { data } = supabase.storage
            .from('lead-documents')
            .getPublicUrl(doc.file_path);

        if (data?.publicUrl) {
            window.open(data.publicUrl, '_blank');
        } else {
            toast.error("Não foi possível abrir o documento");
        }
    };

    if (!lead) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400 p-8 text-center bg-gray-50 border-l animate-pulse">
                <div className="flex flex-col items-center max-w-xs text-center">
                    <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="h-10 w-10 opacity-20" />
                    </div>
                    <h3 className="text-gray-600 font-bold mb-1">Início Rápido</h3>
                    <p className="text-sm">Selecione um contato na lista à esquerda para gerenciar seus dados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-96 border-l bg-white flex flex-col h-full overflow-y-auto overflow-x-hidden shadow-2xl transition-all duration-300">
            <div className="p-4 border-b bg-gray-50/50 space-y-4 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-2xl ring-4 ring-blue-50/50 transform hover:scale-105 transition-transform">
                        {lead.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                        <h2 className="font-black text-gray-900 leading-tight text-xl px-2">{lead.name}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <Badge variant="secondary" className="bg-blue-600 text-white hover:bg-blue-700 border-none px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">Lead VIP</Badge>
                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {lead.phone || 'Sem telefone'}
                            </span>
                        </div>
                    </div >
                </div >

                {/* Etiquetas */}
                < div className="pt-2 space-y-3" >
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <TagIcon className="h-3.5 w-3.5 text-indigo-500" /> Etiquetas do Perfil
                            </Label>
                            <TagManager />
                        </div>

                        <select
                            className="w-full text-[10px] bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 text-blue-600 font-black cursor-pointer uppercase tracking-widest px-3 py-1.5 rounded-xl hover:border-blue-200 transition-all"
                            onChange={(e) => {
                                if (e.target.value) handleAddTag(e.target.value);
                                e.target.value = "";
                            }}
                        >
                            <option value="">+ Vincular Etiqueta</option>
                            {allTags.filter(at => !leadTags.some(lt => lt.id === at.id)).map(tag => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {leadTags.length === 0 && <span className="text-[10px] text-gray-400 font-medium italic py-2">Nenhuma etiqueta vinculada</span>}
                        {leadTags.map(tag => (
                            <Badge
                                key={tag.id}
                                style={{ backgroundColor: tag.color + '15', color: tag.color, border: `1px solid ${tag.color}40` }}
                                className="text-[10px] px-3 py-1.5 group flex items-center gap-2 font-black rounded-xl shadow-sm hover:shadow-md transition-all border-none"
                            >
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                                {tag.name}
                                <button onClick={() => handleRemoveTag(tag.id)} className="hover:bg-red-500 hover:text-white transition-all ml-1 p-0.5 rounded-full">
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div >
            </div >

            <div className="p-8 space-y-12 flex-1 max-w-2xl mx-auto w-full">
                {/* Dados do Lead */}
                <div className="space-y-8">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                        <div className="h-px bg-blue-100 flex-1"></div>
                        Cadastro do Cliente
                        <div className="h-px bg-blue-100 flex-1"></div>
                    </h3>
                    <div className="grid gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Nome Completo</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 focus:ring-2 focus:ring-blue-500 bg-white border-2 border-gray-50 rounded-2xl px-4 font-semibold text-gray-700 shadow-sm"
                                placeholder="Digite o nome completo..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-xs text-gray-500 font-black uppercase tracking-widest ml-1">CPF / Documento</Label>
                                <Input
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                    className="h-12 focus:ring-2 focus:ring-blue-500 bg-white border-2 border-gray-50 rounded-2xl px-4 font-semibold text-gray-700 shadow-sm"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Consultor Responsável</Label>
                                <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openEmployee}
                                            className="w-full h-12 justify-between text-xs font-black bg-white border-2 border-gray-50 hover:bg-gray-50 rounded-2xl px-4 shadow-sm"
                                        >
                                            <span className="truncate">{formData.employee || "Vendedor..."}</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 shadow-2xl border-blue-100 rounded-2xl overflow-hidden">
                                        <Command>
                                            <CommandInput placeholder="Pesquisar..." className="h-12 text-xs border-none" />
                                            <CommandList>
                                                <CommandEmpty className="py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-3 text-center">Nenhum consultor encontrado</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        onSelect={() => {
                                                            setFormData({ ...formData, employee: "" });
                                                            setOpenEmployee(false);
                                                        }}
                                                        className="text-xs p-3 rounded-xl hover:bg-blue-50"
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4 text-blue-500", formData.employee === "" ? "opacity-100" : "opacity-0")} />
                                                        Remover Atribuição
                                                    </CommandItem>
                                                    {registeredEmployees.map((emp) => (
                                                        <CommandItem
                                                            key={emp}
                                                            value={emp}
                                                            onSelect={(currentValue) => {
                                                                setFormData({ ...formData, employee: currentValue });
                                                                setOpenEmployee(false);
                                                            }}
                                                            className="text-xs p-3 rounded-xl hover:bg-blue-50"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4 text-blue-500",
                                                                    formData.employee === emp ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {emp}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-xs text-gray-500 font-black uppercase tracking-widest ml-1">Tipo de Convênio / Benefício</Label>
                            <Popover open={openBenefit} onOpenChange={setOpenBenefit}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openBenefit}
                                        className="w-full h-12 justify-between text-xs font-black bg-white border-2 border-gray-50 hover:bg-gray-50 text-left rounded-2xl px-4 shadow-sm"
                                    >
                                        <span className="truncate">{formData.benefit_type || "Selecione o convênio para este lead..."}</span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 shadow-2xl border-blue-100 rounded-2xl overflow-hidden">
                                    <Command>
                                        <CommandInput placeholder="Pesquisar benefício..." className="h-12 text-xs border-none" />
                                        <CommandList>
                                            <CommandEmpty className="py-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest px-3 text-center">Nenhum benefício encontrado</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    onSelect={() => {
                                                        setFormData({ ...formData, benefit_type: "" });
                                                        setOpenBenefit(false);
                                                    }}
                                                    className="text-xs p-3 rounded-xl hover:bg-blue-50"
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4 text-blue-500", formData.benefit_type === "" ? "opacity-100" : "opacity-0")} />
                                                    Não informado
                                                </CommandItem>
                                                {registeredBenefitTypes.map((type) => (
                                                    <CommandItem
                                                        key={type}
                                                        value={type}
                                                        onSelect={(currentValue) => {
                                                            setFormData({ ...formData, benefit_type: currentValue });
                                                            setOpenBenefit(false);
                                                        }}
                                                        className="text-xs p-3 rounded-xl hover:bg-blue-50 uppercase font-bold text-gray-600"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4 text-blue-500",
                                                                formData.benefit_type === type ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {type}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="pt-6 space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                                <div className="h-px bg-indigo-100 flex-1"></div>
                                Contatos e WhatsApp
                                <div className="h-px bg-indigo-100 flex-1"></div>
                            </h3>
                            <div className="grid gap-5">
                                <div className="p-6 bg-indigo-50/20 rounded-3xl border-2 border-indigo-100/50 space-y-6 shadow-sm">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-black uppercase tracking-widest ml-1">
                                            <Phone className="h-3 w-3 text-indigo-500" /> WhatsApp Principal
                                        </div>
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="h-12 focus:ring-2 focus:ring-indigo-500 bg-white border-2 border-white rounded-2xl px-4 font-bold text-indigo-900 shadow-sm"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">
                                                Telefone Alternativo 2
                                            </div>
                                            <Input
                                                value={formData.phone2}
                                                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                                                className="h-12 focus:ring-2 focus:ring-indigo-500 bg-white border-2 border-white rounded-2xl px-4 font-semibold text-gray-600"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">
                                                Telefone Alternativo 3
                                            </div>
                                            <Input
                                                value={formData.phone3}
                                                onChange={(e) => setFormData({ ...formData, phone3: e.target.value })}
                                                className="h-12 focus:ring-2 focus:ring-indigo-500 bg-white border-2 border-white rounded-2xl px-4 font-semibold text-gray-600"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Observações */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3 text-center">
                        <div className="h-px bg-amber-100 flex-1"></div>
                        Bloco de Notas Internas
                        <div className="h-px bg-amber-100 flex-1"></div>
                    </h3>
                    <Textarea
                        placeholder="Clique para adicionar notas confidenciais sobre a negociação deste cliente..."
                        className="min-h-[160px] text-sm resize-none focus:ring-2 focus:ring-amber-500 bg-amber-50/10 border-2 border-amber-100/50 rounded-3xl p-5 shadow-inner font-medium text-amber-900 leading-relaxed"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>

                {/* Documentos */}
                <div className="space-y-6 pb-12">
                    <h3 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                        <div className="h-px bg-purple-100 flex-1"></div>
                        Documentos e Imagens
                        <div className="h-px bg-purple-100 flex-1"></div>
                    </h3>

                    <div className="flex items-center justify-center">
                        <div className="relative group w-full max-w-sm">
                            <input
                                type="file"
                                multiple
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <Button
                                variant="outline"
                                className="w-full h-16 text-sm text-purple-600 border-2 border-dashed border-purple-200 bg-purple-50/50 hover:bg-purple-50 hover:border-purple-300 rounded-3xl gap-4 transition-all group-hover:shadow-lg flex flex-col items-center justify-center py-10"
                            >
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-500">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="font-black uppercase tracking-widest text-[10px]">
                                    {isUploading ? "PROCESSANDO ARQUIVOS..." : "ENVIAR NOVOS DOCUMENTOS"}
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-300">
                                <Paperclip className="h-12 w-12 mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum anexo encontrado para este lead</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {documents.map(doc => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleViewDocument(doc)}
                                        className="flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-gray-50 hover:bg-white hover:border-purple-100 group transition-all cursor-pointer hover:shadow-xl"
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="p-3 bg-white rounded-2xl text-purple-500 shadow-sm group-hover:scale-110 transition-transform">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm text-gray-800 truncate font-bold">{doc.file_name}</span>
                                                <span className="text-[10px] text-purple-400 uppercase font-black tracking-widest mt-0.5">Clique para visualizar</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 pt-10 pb-12 bg-white/95 backdrop-blur-xl border-t -mx-8 px-8 mt-auto space-y-5 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-2xl shadow-blue-500/30 h-16 rounded-[2rem] text-sm font-black tracking-[0.1em] uppercase gap-3 transition-all active:scale-95 flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : <Save className="h-6 w-6" />}
                        {loading ? 'SINCRONIZANDO...' : 'ATUALIZAR DADOS DO LEAD'}
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-red-500 hover:text-white hover:bg-red-600 h-12 text-[10px] uppercase tracking-[0.3em] font-black rounded-2xl transition-all border-2 border-transparent hover:border-red-600"
                        onClick={async () => {
                            if (window.confirm(`⚠️ AVISO CRÍTICO DE EXCLUSÃO\n\nDeseja realmente remover o lead "${lead.name}" permanentemente do banco de dados? Esta ação não pode ser desfeita.`)) {
                                try {
                                    const { error } = await supabase.from('leads').delete().eq('id', lead.id);
                                    if (error) throw error;
                                    toast.success("Lead removido com sucesso");
                                    window.location.reload();
                                } catch (e) {
                                    toast.error("Erro ao excluir lead");
                                }
                            }
                        }}
                    >
                        Remover Lead Definitivamente
                    </Button>
                </div>
            </div>
        </div >
    );
};
