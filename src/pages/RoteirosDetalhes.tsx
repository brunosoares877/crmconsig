import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Video, ExternalLink } from "lucide-react";
import DocumentViewer from "@/components/roteiros/DocumentViewer";
import VideoPlayer from "@/components/roteiros/VideoPlayer";

// Dados mockados (em produção viriam do banco de dados)
const bancosData: Record<string, any> = {
    amigoz: {
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
                    { id: 3, nome: "Roteiro INSS 2024", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 4, nome: "Passo a Passo INSS", tipo: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
                ]
            }
        ]
    },
    banrisul: {
        nome: "Banrisul",
        logo: "/logos/banrisul.png",
        categorias: [
            {
                nome: "FGTS",
                documentos: [
                    { id: 6, nome: "Manual FGTS Banrisul", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
                    { id: 7, nome: "Como operar FGTS", tipo: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" }
                ]
            }
        ]
    },
    bmg: {
        nome: "BMG",
        logo: "/logos/bmg.png",
        categorias: [
            {
                nome: "CLT",
                documentos: [
                    { id: 8, nome: "Roteiro CLT BMG", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    brb: {
        nome: "Financeira BRB",
        logo: "/logos/brb.png",
        categorias: [
            {
                nome: "FGTS",
                documentos: [
                    { id: 9, nome: "Manual BRB FGTS", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    c6: {
        nome: "C6 Consig",
        logo: "/logos/c6.png",
        categorias: [
            {
                nome: "CLT",
                documentos: [
                    { id: 10, nome: "Roteiro CLT C6", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    bradesco: {
        nome: "Bradesco",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/bradesco-logo-1.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 11, nome: "Manual INSS Bradesco", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    itau: {
        nome: "Itaú",
        logo: "https://logodownload.org/wp-content/uploads/2015/02/itau-logo-0.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 12, nome: "Manual INSS Itaú", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    santander: {
        nome: "Santander",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/santander-logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 13, nome: "Manual INSS Santander", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    caixa: {
        nome: "Caixa Econômica",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/caixa-economica-federal-logo.png",
        categorias: [
            {
                nome: "FGTS",
                documentos: [
                    { id: 14, nome: "Manual FGTS Caixa", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    "banco-do-brasil": {
        nome: "Banco do Brasil",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 15, nome: "Manual INSS BB", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    safra: {
        nome: "Safra",
        logo: "https://logodownload.org/wp-content/uploads/2020/04/banco-safra-logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 16, nome: "Manual INSS Safra", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    pan: {
        nome: "Banco Pan",
        logo: "https://logodownload.org/wp-content/uploads/2019/11/banco-pan-logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 17, nome: "Manual INSS Pan", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    mercantil: {
        nome: "Mercantil do Brasil",
        logo: "https://logodownload.org/wp-content/uploads/2020/04/banco-mercantil-logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 18, nome: "Manual INSS Mercantil", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    daycoval: {
        nome: "Daycoval",
        logo: "https://logodownload.org/wp-content/uploads/2020/04/banco-daycoval-logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 19, nome: "Manual INSS Daycoval", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    ole: {
        nome: "Olé Consignado",
        logo: "https://www.oleconsignado.com.br/wp-content/uploads/2021/03/logo-ole.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 20, nome: "Manual INSS Olé", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    facta: {
        nome: "Facta",
        logo: "https://www.factafinanceira.com.br/wp-content/themes/facta/assets/img/logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 21, nome: "Manual INSS Facta", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    master: {
        nome: "Master",
        logo: "https://www.bancomaster.com.br/Content/img/logo.png",
        categorias: [
            {
                nome: "INSS",
                documentos: [
                    { id: 22, nome: "Manual INSS Master", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    },
    cetelem: {
        nome: "Cetelem",
        logo: "https://www.cetelem.com.br/content/dam/bnpparibas/br/cetelem/logo-cetelem.png",
        categorias: [
            {
                nome: "CLT",
                documentos: [
                    { id: 23, nome: "Manual CLT Cetelem", tipo: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
                ]
            }
        ]
    }
};

export default function RoteirosDetalhes() {
    const { banco } = useParams<{ banco: string }>();
    const navigate = useNavigate();
    const [selectedDoc, setSelectedDoc] = useState<any>(null);

    const bancoData = banco ? bancosData[banco] : null;

    if (!bancoData) {
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

    return (
        <PageLayout title={`Roteiros - ${bancoData.nome}`}>
            <div className="space-y-6">
                {/* Header */}
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
                        <img
                            src={bancoData.logo}
                            alt={bancoData.nome}
                            className="h-12 object-contain"
                            onError={(e) => {
                                e.currentTarget.src = `https://via.placeholder.com/200x80/E5E7EB/6B7280?text=${bancoData.nome}`;
                            }}
                        />
                        <h2 className="text-2xl font-bold text-gray-900">{bancoData.nome}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lista de categorias e documentos */}
                    <div className="lg:col-span-1 space-y-4">
                        {bancoData.categorias.map((categoria: any, catIndex: number) => (
                            <Card key={catIndex}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {categoria.documentos.map((doc: any) => (
                                        <Button
                                            key={doc.id}
                                            variant={selectedDoc?.id === doc.id ? "default" : "outline"}
                                            className="w-full justify-start gap-2"
                                            onClick={() => setSelectedDoc(doc)}
                                        >
                                            {doc.tipo === "pdf" ? (
                                                <FileText className="h-4 w-4" />
                                            ) : (
                                                <Video className="h-4 w-4" />
                                            )}
                                            <span className="truncate">{doc.nome}</span>
                                        </Button>
                                    ))}
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
                                        <CardTitle className="flex items-center gap-2">
                                            {selectedDoc.tipo === "pdf" ? (
                                                <FileText className="h-5 w-5" />
                                            ) : (
                                                <Video className="h-5 w-5" />
                                            )}
                                            {selectedDoc.nome}
                                        </CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(selectedDoc.url, "_blank")}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Abrir em nova aba
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
                            <Card className="h-full flex items-center justify-center">
                                <CardContent className="text-center py-12">
                                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">
                                        Selecione um documento ou vídeo para visualizar
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
