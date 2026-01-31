import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, X, Save, FileText, Video, Upload } from "lucide-react";
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

interface Documento {
    id: number;
    nome: string;
    tipo: "pdf" | "video";
    url: string;
}

interface Categoria {
    nome: string;
    documentos: Documento[];
}

interface Banco {
    id: string;
    nome: string;
    logo: string;
    categorias: Categoria[];
}

// Dados iniciais
const bancosIniciais: Banco[] = [
    {
        id: "amigoz",
        nome: "Amigoz",
        logo: "/logos/amigoz.png",
        categorias: [
            {
                nome: "Governos",
                documentos: [
                    { id: 1, nome: "Manual Operacional - Governos", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 2, nome: "Tutorial Completo", tipo: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
                ]
            },
            {
                nome: "INSS",
                documentos: [
                    { id: 3, nome: "Roteiro INSS 2024", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    {
        id: "banrisul",
        nome: "Banrisul",
        logo: "/logos/banrisul.png",
        categorias: [
            {
                nome: "FGTS",
                documentos: [
                    { id: 6, nome: "Manual FGTS Banrisul", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    }
];

export default function RoteirosAdmin() {
    const navigate = useNavigate();
    const [bancos, setBancos] = useState<Banco[]>(bancosIniciais);
    const [editingBanco, setEditingBanco] = useState<Banco | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [novaCategoria, setNovaCategoria] = useState("");
    const [activeTab, setActiveTab] = useState("info");

    // Estados para documentos
    const [categoriaAtual, setCategoriaAtual] = useState<string>("");
    const [novoDocNome, setNovoDocNome] = useState("");
    const [novoDocTipo, setNovoDocTipo] = useState<"pdf" | "video">("pdf");
    const [novoDocUrl, setNovoDocUrl] = useState("");

    const handleNovoBanco = () => {
        const novoBanco: Banco = {
            id: `banco-${Date.now()}`,
            nome: "",
            logo: "",
            categorias: []
        };
        setEditingBanco(novoBanco);
        setIsDialogOpen(true);
        setActiveTab("info");
    };

    const handleEditarBanco = (banco: Banco) => {
        setEditingBanco(JSON.parse(JSON.stringify(banco))); // Deep copy
        setIsDialogOpen(true);
        setActiveTab("info");
    };

    const handleSalvarBanco = () => {
        if (!editingBanco) return;

        if (!editingBanco.nome.trim()) {
            toast.error("Nome do banco é obrigatório");
            return;
        }

        const bancoExistente = bancos.find(b => b.id === editingBanco.id);

        if (bancoExistente) {
            setBancos(bancos.map(b => b.id === editingBanco.id ? editingBanco : b));
            toast.success("Banco atualizado com sucesso!");
        } else {
            setBancos([...bancos, editingBanco]);
            toast.success("Banco adicionado com sucesso!");
        }

        setIsDialogOpen(false);
        setEditingBanco(null);
    };

    const handleDeletarBanco = (id: string) => {
        setBancos(bancos.filter(b => b.id !== id));
        setDeleteConfirm(null);
        toast.success("Banco removido com sucesso!");
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingBanco) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Por favor, selecione uma imagem");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setEditingBanco({
                ...editingBanco,
                logo: event.target?.result as string
            });
        };
        reader.readAsDataURL(file);
    };

    const handleAdicionarCategoria = () => {
        if (!editingBanco || !novaCategoria.trim()) return;

        if (editingBanco.categorias.some(c => c.nome === novaCategoria.trim())) {
            toast.error("Esta categoria já existe");
            return;
        }

        setEditingBanco({
            ...editingBanco,
            categorias: [...editingBanco.categorias, { nome: novaCategoria.trim(), documentos: [] }]
        });
        setNovaCategoria("");
    };

    const handleRemoverCategoria = (categoriaNome: string) => {
        if (!editingBanco) return;

        setEditingBanco({
            ...editingBanco,
            categorias: editingBanco.categorias.filter(c => c.nome !== categoriaNome)
        });
    };

    // Gerenciamento de documentos
    const handleAdicionarDocumento = () => {
        if (!editingBanco || !categoriaAtual || !novoDocNome.trim()) {
            toast.error("Preencha todos os campos");
            return;
        }

        const novoDoc: Documento = {
            id: Date.now(),
            nome: novoDocNome.trim(),
            tipo: novoDocTipo,
            url: novoDocUrl.trim() || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        };

        setEditingBanco({
            ...editingBanco,
            categorias: editingBanco.categorias.map(cat =>
                cat.nome === categoriaAtual
                    ? { ...cat, documentos: [...cat.documentos, novoDoc] }
                    : cat
            )
        });

        setNovoDocNome("");
        setNovoDocUrl("");
        toast.success("Documento adicionado!");
    };

    const handleRemoverDocumento = (categoriaNome: string, docId: number) => {
        if (!editingBanco) return;

        setEditingBanco({
            ...editingBanco,
            categorias: editingBanco.categorias.map(cat =>
                cat.nome === categoriaNome
                    ? { ...cat, documentos: cat.documentos.filter(d => d.id !== docId) }
                    : cat
            )
        });
        toast.success("Documento removido!");
    };

    return (
        <PageLayout title="Administração de Roteiros">
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
                        <Button
                            variant="outline"
                            onClick={() => navigate("/roteiros")}
                        >
                            Ver Roteiros
                        </Button>
                        <Button onClick={handleNovoBanco}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Banco
                        </Button>
                    </div>
                </div>

                {/* Lista de bancos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bancos.map((banco) => (
                        <Card key={banco.id} className="relative">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{banco.nome}</CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleEditarBanco(banco)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setDeleteConfirm(banco.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-4 rounded-lg mb-3 flex items-center justify-center h-20">
                                    {banco.logo ? (
                                        <img
                                            src={banco.logo}
                                            alt={banco.nome}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sem logo</span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-600 mb-2">
                                        Convênios ({banco.categorias.length})
                                    </p>
                                    {banco.categorias.map((cat, idx) => (
                                        <div key={idx} className="text-xs text-gray-700 py-1 px-2 bg-gray-100 rounded flex justify-between items-center">
                                            <span>{cat.nome}</span>
                                            <span className="text-gray-500">({cat.documentos.length} docs)</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Dialog de Edição */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBanco?.nome ? `Editar ${editingBanco.nome}` : "Novo Banco"}
                            </DialogTitle>
                            <DialogDescription>
                                Configure o banco, convênios e documentos
                            </DialogDescription>
                        </DialogHeader>

                        {editingBanco && (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                                    <TabsTrigger value="documentos">Vídeos e Documentos</TabsTrigger>
                                </TabsList>

                                {/* Tab: Informações Básicas */}
                                <TabsContent value="info" className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome do Banco</Label>
                                        <Input
                                            id="nome"
                                            value={editingBanco.nome}
                                            onChange={(e) => setEditingBanco({ ...editingBanco, nome: e.target.value })}
                                            placeholder="Ex: Banco do Brasil"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Logo do Banco</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="cursor-pointer"
                                                />
                                            </div>
                                            {editingBanco.logo && (
                                                <div className="w-24 h-16 bg-gray-50 rounded border flex items-center justify-center p-2">
                                                    <img
                                                        src={editingBanco.logo}
                                                        alt="Preview"
                                                        className="max-w-full max-h-full object-contain"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Convênios</Label>
                                        <div className="space-y-2 mb-3">
                                            {editingBanco.categorias.map((cat, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                                >
                                                    <span className="text-sm">{cat.nome} ({cat.documentos.length} documentos)</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRemoverCategoria(cat.nome)}
                                                    >
                                                        <X className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                value={novaCategoria}
                                                onChange={(e) => setNovaCategoria(e.target.value)}
                                                placeholder="Ex: INSS, FGTS, Governos..."
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAdicionarCategoria();
                                                    }
                                                }}
                                            />
                                            <Button onClick={handleAdicionarCategoria}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Tab: Vídeos e Documentos */}
                                <TabsContent value="documentos" className="space-y-6 py-4">
                                    {editingBanco.categorias.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p>Adicione convênios primeiro na aba "Informações Básicas"</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Adicionar novo documento */}
                                            <Card className="bg-blue-50 border-blue-200">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base">Adicionar Novo Documento</CardTitle>
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
                                                                    {editingBanco.categorias.map((cat) => (
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
                                                                    <SelectItem value="pdf">PDF</SelectItem>
                                                                    <SelectItem value="video">Vídeo</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Nome do Documento</Label>
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
                                                            placeholder="https://exemplo.com/arquivo.pdf"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Cole a URL do arquivo hospedado ou deixe em branco para usar exemplo
                                                        </p>
                                                    </div>
                                                    <Button onClick={handleAdicionarDocumento} className="w-full">
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Adicionar Documento
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* Lista de documentos por categoria */}
                                            <div className="space-y-4">
                                                {editingBanco.categorias.map((cat) => (
                                                    <Card key={cat.nome}>
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base">{cat.nome}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {cat.documentos.length === 0 ? (
                                                                <p className="text-sm text-gray-500 text-center py-4">
                                                                    Nenhum documento adicionado
                                                                </p>
                                                            ) : (
                                                                <div className="space-y-2">
                                                                    {cat.documentos.map((doc) => (
                                                                        <div
                                                                            key={doc.id}
                                                                            className="flex items-center justify-between bg-gray-50 p-3 rounded"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                {doc.tipo === "pdf" ? (
                                                                                    <FileText className="h-5 w-5 text-red-500" />
                                                                                ) : (
                                                                                    <Video className="h-5 w-5 text-blue-500" />
                                                                                )}
                                                                                <div>
                                                                                    <p className="text-sm font-medium">{doc.nome}</p>
                                                                                    <p className="text-xs text-gray-500 truncate max-w-md">
                                                                                        {doc.url}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                onClick={() => handleRemoverDocumento(cat.nome, doc.id)}
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

                        {/* Botões de ação */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingBanco(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSalvarBanco}>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Confirmação de Exclusão */}
                <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir este banco? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => deleteConfirm && handleDeletarBanco(deleteConfirm)}
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
