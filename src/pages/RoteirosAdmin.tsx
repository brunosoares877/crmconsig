import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, X, Save, FileText, Video, Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRoteiros, Roteiro, Categoria, Documento } from "@/hooks/useRoteiros";

// Template vazio de edição
const roteiroVazio = (): Omit<Roteiro, "user_id"> => ({
    id: "",
    nome: "",
    logo_url: null,
    categorias: [],
    ordem: 0,
});

export default function RoteirosAdmin() {
    const navigate = useNavigate();
    const { roteiros, loading, salvarRoteiro, deletarRoteiro, uploadLogo } = useRoteiros();

    const [editingRoteiro, setEditingRoteiro] = useState<Omit<Roteiro, "user_id"> | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [novaCategoria, setNovaCategoria] = useState("");
    const [activeTab, setActiveTab] = useState("info");
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Estados para documentos
    const [categoriaAtual, setCategoriaAtual] = useState("");
    const [novoDocNome, setNovoDocNome] = useState("");
    const [novoDocTipo, setNovoDocTipo] = useState<"pdf" | "video">("pdf");
    const [novoDocUrl, setNovoDocUrl] = useState("");

    const handleNovo = () => {
        setEditingRoteiro(roteiroVazio());
        setLogoPreview(null);
        setLogoFile(null);
        setIsDialogOpen(true);
        setActiveTab("info");
        setCategoriaAtual("");
    };

    const handleEditar = (roteiro: Roteiro) => {
        setEditingRoteiro(JSON.parse(JSON.stringify(roteiro)));
        setLogoPreview(roteiro.logo_url || null);
        setLogoFile(null);
        setIsDialogOpen(true);
        setActiveTab("info");
        setCategoriaAtual("");
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingRoteiro) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, selecione uma imagem");
            return;
        }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSalvar = async () => {
        if (!editingRoteiro) return;
        if (!editingRoteiro.nome.trim()) {
            toast.error("Nome do banco é obrigatório");
            return;
        }
        setSaving(true);
        try {
            let logoUrl = editingRoteiro.logo_url;

            // Se tem arquivo novo de logo, faz upload primeiro
            if (logoFile && editingRoteiro.id) {
                const url = await uploadLogo(logoFile, editingRoteiro.id);
                if (url) logoUrl = url;
            } else if (logoFile && !editingRoteiro.id) {
                // Para novo banco, salva primeiro sem logo, depois faz upload e atualiza
                const ok = await salvarRoteiro({ ...editingRoteiro, logo_url: null });
                if (!ok) { setSaving(false); return; }
                // Precisamos buscar o ID recém-criado
                // O hook já fez fetchRoteiros, então buscamos pelo nome
                // (simplificação — em produção usaríamos o ID retornado)
                toast.success("Banco adicionado! Faça upload da logo pela edição.");
                setIsDialogOpen(false);
                setEditingRoteiro(null);
                setSaving(false);
                return;
            }

            const ok = await salvarRoteiro({ ...editingRoteiro, logo_url: logoUrl });
            if (ok) {
                toast.success(editingRoteiro.id ? "Banco atualizado!" : "Banco adicionado!");
                setIsDialogOpen(false);
                setEditingRoteiro(null);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeletar = async (id: string) => {
        const ok = await deletarRoteiro(id);
        if (ok) {
            toast.success("Banco removido com sucesso!");
            setDeleteConfirm(null);
        }
    };

    const handleAdicionarCategoria = () => {
        if (!editingRoteiro || !novaCategoria.trim()) return;
        if (editingRoteiro.categorias.some(c => c.nome === novaCategoria.trim())) {
            toast.error("Esta categoria já existe");
            return;
        }
        setEditingRoteiro({
            ...editingRoteiro,
            categorias: [...editingRoteiro.categorias, { nome: novaCategoria.trim(), documentos: [] }],
        });
        setNovaCategoria("");
    };

    const handleRemoverCategoria = (nome: string) => {
        if (!editingRoteiro) return;
        setEditingRoteiro({
            ...editingRoteiro,
            categorias: editingRoteiro.categorias.filter(c => c.nome !== nome),
        });
    };

    const handleAdicionarDocumento = () => {
        if (!editingRoteiro || !categoriaAtual || !novoDocNome.trim()) {
            toast.error("Preencha todos os campos");
            return;
        }
        const novoDoc: Documento = {
            id: Date.now(),
            nome: novoDocNome.trim(),
            tipo: novoDocTipo,
            url: novoDocUrl.trim(),
        };
        setEditingRoteiro({
            ...editingRoteiro,
            categorias: editingRoteiro.categorias.map(cat =>
                cat.nome === categoriaAtual
                    ? { ...cat, documentos: [...cat.documentos, novoDoc] }
                    : cat
            ),
        });
        setNovoDocNome("");
        setNovoDocUrl("");
        toast.success("Documento adicionado!");
    };

    const handleRemoverDocumento = (catNome: string, docId: number) => {
        if (!editingRoteiro) return;
        setEditingRoteiro({
            ...editingRoteiro,
            categorias: editingRoteiro.categorias.map(cat =>
                cat.nome === catNome
                    ? { ...cat, documentos: cat.documentos.filter(d => d.id !== docId) }
                    : cat
            ),
        });
    };

    return (
        <PageLayout title="Gerenciar Roteiros">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Bancos e Convênios</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Adicione, edite ou remova bancos, convênios e documentos
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate("/roteiros")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Ver Roteiros
                        </Button>
                        <Button onClick={handleNovo}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Banco
                        </Button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                        <span className="ml-3 text-gray-500">Carregando...</span>
                    </div>
                )}

                {/* Grid de bancos */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roteiros.map((roteiro) => (
                            <Card key={roteiro.id} className="relative hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg truncate pr-2">{roteiro.nome}</CardTitle>
                                        <div className="flex gap-1 shrink-0">
                                            <Button size="sm" variant="ghost" onClick={() => handleEditar(roteiro)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(roteiro.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 p-4 rounded-lg mb-3 flex items-center justify-center h-20">
                                        {roteiro.logo_url ? (
                                            <img
                                                src={roteiro.logo_url}
                                                alt={roteiro.nome}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-sm italic">Sem logo</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">
                                            Convênios ({roteiro.categorias.length})
                                        </p>
                                        {roteiro.categorias.map((cat, idx) => (
                                            <div key={idx} className="text-xs text-gray-700 py-1 px-2 bg-gray-100 rounded flex justify-between items-center">
                                                <span>{cat.nome}</span>
                                                <span className="text-gray-500">({cat.documentos.length} docs)</span>
                                            </div>
                                        ))}
                                        {roteiro.categorias.length === 0 && (
                                            <p className="text-xs text-gray-400 italic">Nenhum convênio</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {roteiros.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                Nenhum banco cadastrado ainda. Clique em "Novo Banco" para começar.
                            </div>
                        )}
                    </div>
                )}

                {/* Dialog de Edição */}
                <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) { setIsDialogOpen(false); setEditingRoteiro(null); } }}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingRoteiro?.id ? `Editar: ${editingRoteiro.nome}` : "Novo Banco"}
                            </DialogTitle>
                            <DialogDescription>
                                Configure o banco, convênios e documentos operacionais
                            </DialogDescription>
                        </DialogHeader>

                        {editingRoteiro && (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                                    <TabsTrigger value="documentos">Vídeos e Documentos</TabsTrigger>
                                </TabsList>

                                {/* Tab: Informações Básicas */}
                                <TabsContent value="info" className="space-y-5 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome-banco">Nome do Banco / Convênio</Label>
                                        <Input
                                            id="nome-banco"
                                            value={editingRoteiro.nome}
                                            onChange={(e) => setEditingRoteiro({ ...editingRoteiro, nome: e.target.value })}
                                            placeholder="Ex: Banco do Brasil"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Logo do Banco</Label>
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                {/* URL direta */}
                                                <Input
                                                    value={editingRoteiro.logo_url || ""}
                                                    onChange={(e) => {
                                                        setEditingRoteiro({ ...editingRoteiro, logo_url: e.target.value });
                                                        setLogoPreview(e.target.value || null);
                                                    }}
                                                    placeholder="Cole a URL da logo (ou faça upload abaixo)"
                                                />
                                                <p className="text-xs text-gray-400">— ou —</p>
                                                {/* Upload de arquivo */}
                                                <div
                                                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-colors"
                                                    onClick={() => logoInputRef.current?.click()}
                                                >
                                                    <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                                                    <p className="text-sm text-gray-500">Clique para fazer upload da imagem</p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG</p>
                                                </div>
                                                <input
                                                    ref={logoInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleLogoChange}
                                                />
                                                {logoFile && (
                                                    <p className="text-xs text-green-600">✓ Arquivo selecionado: {logoFile.name}</p>
                                                )}
                                            </div>

                                            {/* Preview */}
                                            <div className="w-28 h-20 bg-gray-50 rounded-lg border flex items-center justify-center p-2 shrink-0">
                                                {logoPreview ? (
                                                    <img
                                                        src={logoPreview}
                                                        alt="Preview"
                                                        className="max-w-full max-h-full object-contain"
                                                        onError={() => setLogoPreview(null)}
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400 text-center">Prévia</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Convênios / Modalidades</Label>
                                        <div className="space-y-2 mb-3">
                                            {editingRoteiro.categorias.map((cat, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg">
                                                    <span className="text-sm font-medium">{cat.nome}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500">{cat.documentos.length} doc(s)</span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoverCategoria(cat.nome)}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {editingRoteiro.categorias.length === 0 && (
                                                <p className="text-sm text-gray-400 italic py-2">Nenhum convênio adicionado</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={novaCategoria}
                                                onChange={(e) => setNovaCategoria(e.target.value)}
                                                placeholder="Ex: INSS, FGTS, Governos..."
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") { e.preventDefault(); handleAdicionarCategoria(); }
                                                }}
                                            />
                                            <Button type="button" onClick={handleAdicionarCategoria} variant="outline">
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Tab: Vídeos e Documentos */}
                                <TabsContent value="documentos" className="space-y-6 py-4">
                                    {editingRoteiro.categorias.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400">
                                            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p>Adicione convênios primeiro na aba "Informações Básicas"</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Formulário de adição de documento */}
                                            <Card className="bg-blue-50 border-blue-200">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base">Adicionar Documento / Vídeo</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label>Convênio</Label>
                                                            <Select value={categoriaAtual} onValueChange={setCategoriaAtual}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {editingRoteiro.categorias.map((cat) => (
                                                                        <SelectItem key={cat.nome} value={cat.nome}>
                                                                            {cat.nome}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label>Tipo</Label>
                                                            <Select value={novoDocTipo} onValueChange={(v: "pdf" | "video") => setNovoDocTipo(v)}>
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pdf">📄 PDF / Documento</SelectItem>
                                                                    <SelectItem value="video">🎬 Vídeo</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Nome do Arquivo</Label>
                                                        <Input
                                                            value={novoDocNome}
                                                            onChange={(e) => setNovoDocNome(e.target.value)}
                                                            placeholder="Ex: Manual Operacional 2024"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>URL do Arquivo</Label>
                                                        <Input
                                                            value={novoDocUrl}
                                                            onChange={(e) => setNovoDocUrl(e.target.value)}
                                                            placeholder="https://drive.google.com/... ou https://youtube.com/..."
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Cole o link do Google Drive, YouTube, Dropbox, etc.
                                                        </p>
                                                    </div>
                                                    <Button onClick={handleAdicionarDocumento} className="w-full">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Adicionar
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* Lista de documentos por convênio */}
                                            <div className="space-y-4">
                                                {editingRoteiro.categorias.map((cat) => (
                                                    <Card key={cat.nome}>
                                                        <CardHeader className="pb-2">
                                                            <CardTitle className="text-base">{cat.nome}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {cat.documentos.length === 0 ? (
                                                                <p className="text-sm text-gray-400 italic text-center py-3">
                                                                    Nenhum documento neste convênio
                                                                </p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {cat.documentos.map((doc) => (
                                                                        <div
                                                                            key={doc.id}
                                                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                                                        >
                                                                            <div className="flex items-center gap-3 min-w-0">
                                                                                {doc.tipo === "pdf" ? (
                                                                                    <FileText className="h-5 w-5 text-red-500 shrink-0" />
                                                                                ) : (
                                                                                    <Video className="h-5 w-5 text-blue-500 shrink-0" />
                                                                                )}
                                                                                <div className="min-w-0">
                                                                                    <p className="text-sm font-medium truncate">{doc.nome}</p>
                                                                                    <p className="text-xs text-gray-500 truncate max-w-xs">{doc.url}</p>
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => handleRemoverDocumento(cat.nome, doc.id)}
                                                                                className="shrink-0"
                                                                            >
                                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}

                        {/* Ações do Dialog */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => { setIsDialogOpen(false); setEditingRoteiro(null); }}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSalvar} disabled={saving}>
                                {saving ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                Salvar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Confirmação de exclusão */}
                <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir este banco? Todos os convênios e documentos serão perdidos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteConfirm && handleDeletar(deleteConfirm)}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </PageLayout>
    );
}
