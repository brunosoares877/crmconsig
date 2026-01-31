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

      // 2. Se não há assinatura paga, verificar trial no localStorage
      const storedTrialStartDate = localStorage.getItem('trialStartDate');

      if (storedTrialStartDate) {
        const startDate = new Date(storedTrialStartDate);
        const now = new Date();
        const trialEndDate = new Date(startDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

        if (trialEndDate > now) {
          setStatus('trial');
          setTrialStartDate(storedTrialStartDate);

          // Calculate days left
          const diffTime = trialEndDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(diffDays);
        } else {
          setStatus('expired');
          setTrialStartDate(null);
          setTrialDaysLeft(0);
        }
      }
      // 3. Auto-start trial if no trial or subscription exists yet
      else {
        startTrial();
      }
    };

    loadSubscriptionStatus();
  }, [isPrivilegedUser]);

  // Update trial days left every hour
  useEffect(() => {
    if (status === 'trial' && trialStartDate) {
      const updateDaysLeft = () => {
        const startDate = new Date(trialStartDate);
        const now = new Date();
        const trialEndDate = new Date(startDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

        if (trialEndDate > now) {
          const diffTime = trialEndDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(diffDays);
        } else {
          setStatus('expired');
          setTrialDaysLeft(0);
        }
      };

      // Update immediately
      updateDaysLeft();

      // Set interval to check hourly
      const intervalId = setInterval(updateDaysLeft, 1000 * 60 * 60); // Check every hour
      return () => clearInterval(intervalId);
    }
  }, [status, trialStartDate]);

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
    // Don't start trial for privileged users
    if (isPrivilegedUser) return;

    const now = new Date().toISOString();
    localStorage.setItem('trialStartDate', now);
    setTrialStartDate(now);
    setStatus('trial');
    setTrialDaysLeft(7);
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
