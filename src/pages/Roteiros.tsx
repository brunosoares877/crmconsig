import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";

// Dados dos bancos
const bancos = [
    {
        id: "amigoz",
        nome: "Amigoz",
        logo: "/logos/amigoz.png",
        categorias: ["Governos", "INSS", "Prefeituras", "SIAPE", "Outros Convênios"]
    },
    {
        id: "banrisul",
        nome: "Banrisul",
        logo: "/logos/banrisul.png",
        categorias: ["FGTS", "Governos", "INSS", "Outros Convênios", "Prefeituras"]
    },
    {
        id: "bmg",
        nome: "BMG",
        logo: "/logos/bmg.png",
        categorias: ["CLT", "FGTS", "Governos", "INSS", "SIAPE"]
    },
    {
        id: "brb",
        nome: "Financeira BRB",
        logo: "/logos/brb.png",
        categorias: ["FGTS", "Governos", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "c6",
        nome: "C6 Consig",
        logo: "/logos/c6.png",
        categorias: ["CLT", "FGTS", "INSS", "Prefeituras"]
    },
    {
        id: "bradesco",
        nome: "Bradesco",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/bradesco-logo-1.png",
        categorias: ["CLT", "FGTS", "Governos", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "itau",
        nome: "Itaú",
        logo: "https://logodownload.org/wp-content/uploads/2015/02/itau-logo-0.png",
        categorias: ["CLT", "FGTS", "Governos", "INSS", "Prefeituras"]
    },
    {
        id: "santander",
        nome: "Santander",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/santander-logo.png",
        categorias: ["CLT", "FGTS", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "caixa",
        nome: "Caixa Econômica",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/caixa-economica-federal-logo.png",
        categorias: ["FGTS", "Governos", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "banco-do-brasil",
        nome: "Banco do Brasil",
        logo: "https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo.png",
        categorias: ["CLT", "FGTS", "Governos", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "safra",
        nome: "Safra",
        logo: "https://logodownload.org/wp-content/uploads/2020/04/banco-safra-logo.png",
        categorias: ["FGTS", "Governos", "INSS", "Outros Convênios"]
    },
    {
        id: "pan",
        nome: "Banco Pan",
        logo: "https://logodownload.org/wp-content/uploads/2019/11/banco-pan-logo.png",
        categorias: ["CLT", "FGTS", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "mercantil",
        nome: "Mercantil do Brasil",
        logo: "https://logodownload.org/wp-content/uploads/2020/04/banco-mercantil-logo.png",
        categorias: ["Governos", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "daycoval",
        nome: "Daycoval",
        logo: "https://logodownload.org/wp-content/uploads/2020/04/banco-daycoval-logo.png",
        categorias: ["FGTS", "INSS", "Outros Convênios"]
    },
    {
        id: "ole",
        nome: "Olé Consignado",
        logo: "https://www.oleconsignado.com.br/wp-content/uploads/2021/03/logo-ole.png",
        categorias: ["FGTS", "INSS", "Prefeituras", "SIAPE"]
    },
    {
        id: "facta",
        nome: "Facta",
        logo: "https://www.factafinanceira.com.br/wp-content/themes/facta/assets/img/logo.png",
        categorias: ["Governos", "INSS", "Outros Convênios", "SIAPE"]
    },
    {
        id: "master",
        nome: "Master",
        logo: "https://www.bancomaster.com.br/Content/img/logo.png",
        categorias: ["FGTS", "INSS", "Prefeituras"]
    },
    {
        id: "cetelem",
        nome: "Cetelem",
        logo: "https://www.cetelem.com.br/content/dam/bnpparibas/br/cetelem/logo-cetelem.png",
        categorias: ["CLT", "INSS", "Outros Convênios"]
    }
];

export default function Roteiros() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBancos = bancos.filter(banco =>
        banco.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageLayout title="Roteiros Operacionais">
            <div className="space-y-6">
                {/* Header com busca */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Roteiros por Banco</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Selecione um banco para visualizar vídeos e documentos
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar banco..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/roteiros/admin")}
                            className="flex items-center gap-2 whitespace-nowrap"
                        >
                            <Settings className="h-4 w-4" />
                            Gerenciar
                        </Button>
                    </div>
                </div>

                {/* Grid de bancos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBancos.map((banco) => (
                        <Card
                            key={banco.id}
                            className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-cyan-400 group"
                        >
                            <CardContent className="p-0">
                                {/* Logo do banco */}
                                <div className="bg-white p-4 flex items-center justify-center h-24 border-b">
                                    <img
                                        src={banco.logo}
                                        alt={banco.nome}
                                        className="max-w-full max-h-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://via.placeholder.com/200x80/E5E7EB/6B7280?text=${banco.nome}`;
                                        }}
                                    />
                                </div>

                                {/* Botão Exibir Roteiros */}
                                <div className="p-3 bg-white">
                                    <Button
                                        onClick={() => navigate(`/roteiros/${banco.id}`)}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
                                    >
                                        Exibir Roteiros
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Lista de categorias */}
                                <div className="px-3 pb-3 space-y-1.5">
                                    {banco.categorias.map((categoria, index) => (
                                        <div
                                            key={index}
                                            className="text-xs text-gray-700 py-1 px-2.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            {categoria}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mensagem quando não há resultados */}
                {filteredBancos.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Nenhum banco encontrado</p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
