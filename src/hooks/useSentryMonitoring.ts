import { useEffect, useCallback } from 'react';
import { 
  setUserContext, 
  clearUserContext, 
  configureSentryForPage, 
  trackUserAction,
  captureError,
  captureMessage,
  addBreadcrumb,
  trackApiCall,
  withSentryProfiling,
  recordMetric
} from '@/utils/sentry';

interface SentryHookReturn {
  trackAction: (action: string, data?: Record<string, any>) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, any>) => void;
  trackApiCall: <T>(url: string, method: string, apiCall: () => Promise<T>) => Promise<T>;
  trackMetric: (name: string, value: number, unit?: string, tags?: Record<string, string>) => void;
  setUser: (user: { id?: string; email?: string; username?: string; subscription?: string }) => void;
  clearUser: () => void;
  configurePage: (pageName: string, additionalTags?: Record<string, string>) => void;
  withProfiling: <T>(operationName: string, operation: () => Promise<T>, tags?: Record<string, string>) => Promise<T>;
}

export const useSentryMonitoring = (): SentryHookReturn => {
  
  const trackAction = useCallback((action: string, data?: Record<string, any>) => {
    trackUserAction(action, data);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    captureError(error, context);
  }, []);

  const trackMessage = useCallback((message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
    captureMessage(message, level, context);
  }, []);

  const trackApi = useCallback(<T>(url: string, method: string, apiCall: () => Promise<T>) => {
    return trackApiCall(url, method, apiCall);
  }, []);

  const trackMetric = useCallback((name: string, value: number, unit: string = 'none', tags?: Record<string, string>) => {
    recordMetric(name, value, unit, tags);
  }, []);

  const setUser = useCallback((user: { id?: string; email?: string; username?: string; subscription?: string }) => {
    setUserContext(user);
  }, []);

  const clearUser = useCallback(() => {
    clearUserContext();
  }, []);

  const configurePage = useCallback((pageName: string, additionalTags?: Record<string, string>) => {
    configureSentryForPage(pageName, additionalTags);
  }, []);

  const withProfiling = useCallback(<T>(operationName: string, operation: () => Promise<T>, tags?: Record<string, string>) => {
    return withSentryProfiling(operationName, operation, tags);
  }, []);

  return {
    trackAction,
    trackError,
    trackMessage,
    trackApiCall: trackApi,
    trackMetric,
    setUser,
    clearUser,
    configurePage,
    withProfiling
  };
};

// Hook específico para páginas
export const useSentryPageTracking = (pageName: string, additionalTags?: Record<string, string>) => {
  const { configurePage } = useSentryMonitoring();

  useEffect(() => {
    configurePage(pageName, additionalTags);
    
    // Breadcrumb para tempo gasto na página
    const startTime = Date.now();
    
    return () => {
      const timeSpent = Date.now() - startTime;
      addBreadcrumb(`Saiu da página: ${pageName}`, 'navigation', {
        page: pageName,
        timeSpent: `${timeSpent}ms`
      });
    };
  }, [pageName, additionalTags, configurePage]);
};

// Hook para monitoramento de performance de operações
export const useSentryPerformanceTracking = () => {
  const trackOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> => {
    return withSentryProfiling(operationName, operation, tags);
  }, []);

  const trackSyncOperation = useCallback(<T>(
    operationName: string,
    operation: () => T,
    tags?: Record<string, string>
  ): T => {
    const startTime = Date.now();
    
    try {
      addBreadcrumb(`Iniciando operação sync: ${operationName}`, 'performance', tags);
      const result = operation();
      
      const duration = Date.now() - startTime;
      addBreadcrumb(`Operação sync concluída: ${operationName}`, 'performance', {
        ...tags,
        duration: `${duration}ms`,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      addBreadcrumb(`Operação sync falhou: ${operationName}`, 'performance', {
        ...tags,
        duration: `${duration}ms`,
        status: 'error'
      });
      
      captureError(error as Error, { operation: operationName, ...tags });
      throw error;
    }
  }, []);

  return {
    trackOperation,
    trackSyncOperation
  };
};

// Hook para monitoramento de formulários
export const useSentryFormTracking = (formName: string) => {
  const { trackAction, trackError } = useSentryMonitoring();

  const trackFormSubmit = useCallback((formData?: Record<string, any>) => {
    trackAction('form_submit', {
      form: formName,
      ...formData
    });
  }, [formName, trackAction]);

  const trackFormError = useCallback((error: Error, fieldName?: string) => {
    trackError(error, {
      form: formName,
      field: fieldName
    });
  }, [formName, trackError]);

  const trackFieldInteraction = useCallback((fieldName: string, action: 'focus' | 'blur' | 'change') => {
    addBreadcrumb(`Form field ${action}: ${fieldName}`, 'user_interaction', {
      form: formName,
      field: fieldName,
      action
    });
  }, [formName]);

  return {
    trackFormSubmit,
    trackFormError,
    trackFieldInteraction
  };
};

// Hook para rastreamento de APIs específicas
export const useSentryApiTracking = () => {
  const { trackApiCall } = useSentryMonitoring();

  const trackSupabaseCall = useCallback(<T>(operation: string, apiCall: () => Promise<T>) => {
    return trackApiCall(`supabase/${operation}`, 'POST', apiCall);
  }, [trackApiCall]);

  const trackHttpCall = useCallback(<T>(url: string, method: string, apiCall: () => Promise<T>) => {
    return trackApiCall(url, method, apiCall);
  }, [trackApiCall]);

  return {
    trackSupabaseCall,
    trackHttpCall
  };
};

// Hook para monitoramento de autenticação
export const useSentryAuthTracking = () => {
  const { setUser, clearUser, trackAction } = useSentryMonitoring();

  const trackLogin = useCallback((user: { id?: string; email?: string; username?: string; subscription?: string }) => {
    setUser(user);
    trackAction('login', {
      userId: user.id,
      email: user.email,
      subscription: user.subscription
    });
  }, [setUser, trackAction]);

  const trackLogout = useCallback(() => {
    trackAction('logout');
    clearUser();
  }, [trackAction, clearUser]);

  const trackSubscriptionChange = useCallback((oldPlan: string, newPlan: string) => {
    trackAction('subscription_change', {
      oldPlan,
      newPlan
    });
  }, [trackAction]);

  return {
    trackLogin,
    trackLogout,
    trackSubscriptionChange
  };
}; 