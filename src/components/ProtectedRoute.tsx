import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireSubscription?: boolean; // Se false, permite trial
}

/**
 * Componente para proteger rotas que exigem assinatura ativa
 * 
 * Funcionalidades:
 * - Verifica se usuário tem assinatura ativa no backend
 * - Permite acesso durante trial (7 dias)
 * - Redireciona para página de vendas se expirado
 * - Mostra loading enquanto valida
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireSubscription = false
}) => {
    const { isSubscriptionActive, isTrialActive, status } = useSubscription();
    const { isPrivilegedUser } = useAuth();
    const [isValidating, setIsValidating] = useState(true);

    useEffect(() => {
        // Pequeno delay para garantir que o contexto carregou
        const timer = setTimeout(() => {
            setIsValidating(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Mostrar loading enquanto valida
    if (isValidating) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Verificando acesso...</p>
                </div>
            </div>
        );
    }

    // Usuários privilegiados sempre têm acesso
    if (isPrivilegedUser) {
        return <>{children}</>;
    }

    // Se requer assinatura paga (não aceita trial)
    if (requireSubscription) {
        if (!isSubscriptionActive) {
            return <Navigate to="/sales" replace />;
        }
    }
    // Se aceita trial ou assinatura
    else {
        if (!isSubscriptionActive && !isTrialActive) {
            return <Navigate to="/sales" replace />;
        }
    }

    // Usuário tem acesso
    return <>{children}</>;
};

export default ProtectedRoute;
