import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RoteirosCard3D = () => {
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateXValue = ((y - centerY) / centerY) * -10;
        const rotateYValue = ((x - centerX) / centerX) * 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="perspective-1000"
            style={{
                perspective: '1000px',
            }}
        >
            <Card
                className="group relative overflow-hidden border-0 shadow-2xl transition-all duration-300 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 hover:shadow-cyan-500/50 cursor-pointer"
                style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${rotateX || rotateY ? 1.05 : 1})`,
                    transition: 'transform 0.1s ease-out',
                }}
                onClick={() => navigate('/roteiros')}
            >
                {/* Efeito de brilho que segue o mouse */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${rotateY * 5 + 50}% ${rotateX * 5 + 50}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                    }}
                />

                {/* Padrão de fundo animado */}
                <div className="absolute inset-0 opacity-20">
                    <div
                        className="w-full h-full bg-repeat"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                        }}
                    />
                </div>

                {/* Círculos decorativos */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-300/20 rounded-full blur-xl" />

                <CardHeader className="relative z-10 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                            <FolderOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                            NOVO!
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-100 transition-colors duration-300">
                        Roteiros Operacionais
                    </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 p-6 pt-0">
                    <p className="text-white/90 leading-relaxed mb-6 text-base">
                        Acesse manuais, vídeos e documentos de todos os bancos em um só lugar. Organize seus roteiros por convênio.
                    </p>

                    {/* Features list */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center text-white/90 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 mr-2" />
                            <span>18+ bancos disponíveis</span>
                        </div>
                        <div className="flex items-center text-white/90 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 mr-2" />
                            <span>Vídeos e PDFs organizados</span>
                        </div>
                        <div className="flex items-center text-white/90 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 mr-2" />
                            <span>Sistema de administração</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                        className="w-full bg-white text-blue-600 hover:bg-cyan-50 font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:scale-105"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/roteiros');
                        }}
                    >
                        Acessar Roteiros
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </CardContent>

                {/* Borda inferior animada */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-300 via-white to-cyan-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Card>
        </div>
    );
};

export default RoteirosCard3D;
