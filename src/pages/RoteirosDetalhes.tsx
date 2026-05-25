import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Video, ExternalLink, Loader2, Settings } from "lucide-react";
import { useRoteiros } from "@/hooks/useRoteiros";
import DocumentViewer from "@/components/roteiros/DocumentViewer";
import VideoPlayer from "@/components/roteiros/VideoPlayer";

export default function RoteirosDetalhes() {
    const { banco } = useParams<{ banco: string }>();
    const navigate = useNavigate();
    const { roteiros, loading } = useRoteiros();
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const roteiro = roteiros.find(r => r.id === banco);

    if (loading) {
        return (
            <PageLayout title="Roteiros">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    <span className="ml-3 text-gray-500">Carregando...</span>
                </div>
            </PageLayout>
        );
    }

    if (!roteiro) {
        return (
            <PageLayout title="Banco não encontrado">
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">Banco não encontrado</p>
                    <Button onClick={() => navigate("/roteiros")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>
            </PageLayout>
        );
    }

    const totalDocs = roteiro.categorias.reduce((acc, cat) => acc + cat.documentos.length, 0);

    return (
        <PageLayout title={`Roteiros - ${roteiro.nome}`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/roteiros")}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>
                        <div className="flex items-center gap-4">
                            {roteiro.logo_url && (
                                <img
                                    src={roteiro.logo_url}
                                    alt={roteiro.nome}
                                    className="h-12 object-contain"
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{roteiro.nome}</h2>
                                <p className="text-sm text-gray-500">{roteiro.categorias.length} convênio(s) · {totalDocs} documento(s)</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/roteiros/admin")}
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>

                {/* Sem conteúdo */}
                {roteiro.categorias.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-16">
                            <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">Nenhum documento cadastrado</p>
                            <p className="text-gray-400 text-sm mb-6">
                                Adicione convênios e documentos para este banco na área de gerenciamento.
                            </p>
                            <Button onClick={() => navigate("/roteiros/admin")}>
                                <Settings className="h-4 w-4 mr-2" />
                                Gerenciar Roteiros
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {roteiro.categorias.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de categorias e documentos */}
                        <div className="lg:col-span-1 space-y-4">
                            {roteiro.categorias.map((categoria, catIndex) => (
                                <Card key={catIndex}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">{categoria.nome}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {categoria.documentos.length === 0 ? (
                                            <p className="text-sm text-gray-400 italic text-center py-2">
                                                Nenhum documento
                                            </p>
                                        ) : (
                                            categoria.documentos.map((doc) => (
                                                <Button
                                                    key={doc.id}
                                                    variant={selectedDoc?.id === doc.id ? "default" : "outline"}
                                                    className="w-full justify-start gap-2"
                                                    onClick={() => setSelectedDoc(doc)}
                                                >
                                                    {doc.tipo === "pdf" ? (
                                                        <FileText className="h-4 w-4 shrink-0" />
                                                    ) : (
                                                        <Video className="h-4 w-4 shrink-0" />
                                                    )}
                                                    <span className="truncate text-left">{doc.nome}</span>
                                                </Button>
                                            ))
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Visualizador */}
                        <div className="lg:col-span-2">
                            {selectedDoc ? (
                                <Card className="h-full">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                {selectedDoc.tipo === "pdf" ? (
                                                    <FileText className="h-5 w-5" />
                                                ) : (
                                                    <Video className="h-5 w-5" />
                                                )}
                                                <span className="truncate">{selectedDoc.nome}</span>
                                            </CardTitle>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(selectedDoc.url, "_blank")}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Abrir
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedDoc.tipo === "pdf" ? (
                                            <DocumentViewer url={selectedDoc.url} />
                                        ) : (
                                            <VideoPlayer url={selectedDoc.url} />
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="h-full flex items-center justify-center min-h-64">
                                    <CardContent className="text-center py-12">
                                        <FileText className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 text-lg">
                                            Selecione um documento ou vídeo para visualizar
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
