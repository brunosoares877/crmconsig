import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionService } from '@/services/subscriptionService';

type SubscriptionStatus = 'trial' | 'expired' | 'active';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  trialDaysLeft: number;
  subscriptionEndDate: string | null;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  startTrial: () => void;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SubscriptionStatus>('expired');
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const { isPrivilegedUser } = useAuth();

  // Função para sincronizar assinatura do backend
  const syncSubscriptionFromBackend = async () => {
    try {
      const subscription = await SubscriptionService.getActiveSubscription();

      if (subscription && subscription.status === 'active') {
        const endDate = new Date(subscription.end_date);
        if (endDate > new Date()) {
          setStatus('active');
          setSubscriptionEndDate(subscription.end_date);
          // Limpar trial se houver assinatura paga
          localStorage.removeItem('trialStartDate');
          setTrialStartDate(null);
          setTrialDaysLeft(0);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Erro ao sincronizar assinatura:', err);
      return false;
    }
  };

  // Função pública para revalidar assinatura
  const refreshSubscription = async () => {
    await syncSubscriptionFromBackend();
  };

  // Load subscription data on mount
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      // For privileged users, always consider them as having an active subscription
      if (isPrivilegedUser) {
        setStatus('active');
        setSubscriptionEndDate('9999-12-31'); // Far future date
        return;
      }

      // 1. Primeiro, verificar se há assinatura paga no backend
      const hasActiveSubscription = await syncSubscriptionFromBackend();
      if (hasActiveSubscription) {
        return; // Já configurou tudo
      }

      // 2. Se não tem assinatura ativa, bloqueia
      setStatus('expired');
      setTrialStartDate(null);
      setTrialDaysLeft(0);
    };

    loadSubscriptionStatus();
  }, [isPrivilegedUser]);

  // Lógica de contagem regressiva de trial removida

  // Periodically check for subscription updates from backend (every 5 minutes)
  useEffect(() => {
    if (!isPrivilegedUser) {
      const intervalId = setInterval(async () => {
        await syncSubscriptionFromBackend();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(intervalId);
    }
  }, [isPrivilegedUser]);

  const startTrial = () => {
    // Removido
  };

  const value = {
    status,
    trialDaysLeft,
    subscriptionEndDate,
    isTrialActive: status === 'trial',
    isSubscriptionActive: status === 'active',
    startTrial,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
