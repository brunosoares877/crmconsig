import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configurar tamanho do canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Cores vibrantes estilo Google
        const colors = [
            '#4285F4', // Azul Google
            '#EA4335', // Vermelho Google
            '#FBBC04', // Amarelo Google
            '#34A853', // Verde Google
            '#FF6D00', // Laranja
            '#9C27B0', // Roxo
            '#00BCD4', // Cyan
            '#E91E63', // Pink
        ];

        // Criar partícula
        const createParticle = (x: number, y: number): Particle => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;

            return {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
            };
        };

        // Rastrear movimento do mouse
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };

            // Criar múltiplas partículas ao mover o mouse
            for (let i = 0; i < 3; i++) {
                particlesRef.current.push(
                    createParticle(
                        e.clientX + (Math.random() - 0.5) * 10,
                        e.clientY + (Math.random() - 0.5) * 10
                    )
                );
            }
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        // Criar partículas iniciais espalhadas
        for (let i = 0; i < 50; i++) {
            particlesRef.current.push(
                createParticle(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height
                )
            );
        }

        // Animação
        const animate = () => {
            // Limpar com trail effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;

            // Atualizar e desenhar partículas
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                // Aplicar gravidade suave
                p.vy += 0.05;

                // Atualizar posição
                p.x += p.vx;
                p.y += p.vy;

                // Diminuir vida
                p.life -= 0.01;

                // Remover partículas mortas ou fora da tela
                if (p.life <= 0 || p.y > canvas.height + 50 || p.x < -50 || p.x > canvas.width + 50) {
                    particles.splice(i, 1);
                    continue;
                }

                // Desenhar partícula com trail
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, 'transparent');

                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.globalAlpha = p.life;
                ctx.fill();

                // Desenhar trail (rastro)
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = p.life * 0.5;
                ctx.stroke();
            }

            ctx.globalAlpha = 1;

            // Limitar número de partículas
            if (particles.length > 500) {
                particles.splice(0, particles.length - 500);
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                opacity: 0.8,
                mixBlendMode: 'normal'
            }}
        />
    );
};

export default ParticleBackground;
