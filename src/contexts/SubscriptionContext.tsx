
import React, { createContext, useState, useContext, useEffect } from 'react';

type SubscriptionStatus = 'trial' | 'expired' | 'active';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  trialDaysLeft: number;
  subscriptionEndDate: string | null;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  startTrial: () => void;
  activateSubscription: (endDate: string) => void;
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

  // Load subscription data from localStorage on mount
  useEffect(() => {
    const storedTrialStartDate = localStorage.getItem('trialStartDate');
    const storedSubscriptionEndDate = localStorage.getItem('subscriptionEndDate');

    // Check for active subscription
    if (storedSubscriptionEndDate) {
      const endDate = new Date(storedSubscriptionEndDate);
      if (endDate > new Date()) {
        setStatus('active');
        setSubscriptionEndDate(storedSubscriptionEndDate);
      } else {
        setStatus('expired');
        setSubscriptionEndDate(null);
      }
    } 
    // Check for active trial
    else if (storedTrialStartDate) {
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
    // Auto-start trial if no trial or subscription exists yet
    else {
      startTrial();
    }
  }, []);

  // Update trial days left every day
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

      // Set interval to check daily
      const intervalId = setInterval(updateDaysLeft, 1000 * 60 * 60); // Check every hour
      return () => clearInterval(intervalId);
    }
  }, [status, trialStartDate]);

  const startTrial = () => {
    const now = new Date().toISOString();
    localStorage.setItem('trialStartDate', now);
    setTrialStartDate(now);
    setStatus('trial');
    setTrialDaysLeft(7);
  };

  const activateSubscription = (endDate: string) => {
    localStorage.setItem('subscriptionEndDate', endDate);
    setSubscriptionEndDate(endDate);
    setStatus('active');
  };

  const value = {
    status,
    trialDaysLeft,
    subscriptionEndDate,
    isTrialActive: status === 'trial',
    isSubscriptionActive: status === 'active',
    startTrial,
    activateSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
