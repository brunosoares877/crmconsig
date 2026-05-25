import * as Sentry from "@sentry/react";
import React from 'react';

// Configuração do Sentry
export const initSentry = () => {
  // Só inicializar se SENTRY_DSN estiver explicitamente configurado
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;
  
  if (dsn && dsn !== "https://your-sentry-dsn@sentry.io/project-id") {
    Sentry.init({
      dsn,
      environment,
      
      // Performance monitoring
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% em produção, 100% em dev
      
      // Release tracking
      release: `leadconsig@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
      
      // Configurações avançadas
      beforeSend(event, hint) {
        // Filtrar erros conhecidos ou irrelevantes
        if (event.exception) {
          const error = hint.originalException;
          
          // Ignorar erros de rede comuns
          if (error && typeof error === 'object' && 'message' in error) {
            const message = error.message as string;
            if (
              message.includes('Network Error') ||
              message.includes('Failed to fetch') ||
              message.includes('ERR_INTERNET_DISCONNECTED') ||
              message.includes('ERR_NETWORK_CHANGED') ||
              message.includes('ChunkLoadError') ||
              message.includes('Loading chunk')
            ) {
              return null; // Não enviar estes erros
            }
          }
        }
        
        // Em desenvolvimento, também logar no console
        if (environment === 'development') {
          console.error('Sentry Event:', event);
        }
        
        return event;
      },
      
      // Configurar contexto inicial
      initialScope: {
        tags: {
          component: "leadconsig-crm",
          feature: "main-app",
          version: import.meta.env.VITE_APP_VERSION || '1.0.0'
        },
        level: "info"
      }
    });

    // Configurar tags globais
    Sentry.setTags({
      app: 'leadconsig',
      environment
    });

    console.log(`[Sentry] Inicializado para ${environment}`);
  } else {
    console.log('[Sentry] Não inicializado - ambiente de desenvolvimento');
  }
};

// Função para capturar erro manualmente
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, String(context[key]));
      });
    }
    scope.setLevel('error');
    Sentry.captureException(error);
  });
};

// Função para capturar mensagem
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, String(context[key]));
      });
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

// Função para adicionar breadcrumb
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data
  });
};

// Configurar contexto do usuário
export const setUserContext = (user: {
  id?: string;
  email?: string;
  username?: string;
  subscription?: string;
}) => {
  Sentry.setUser(user);
  
  // Adicionar breadcrumb para rastreamento
  addBreadcrumb(`Usuário configurado: ${user.email || user.id}`, 'auth', {
    userId: user.id,
    subscription: user.subscription
  });
};

// Limpar contexto do usuário (logout)
export const clearUserContext = () => {
  addBreadcrumb('Usuário deslogado', 'auth');
  Sentry.setUser(null);
};

// Configurar tags personalizadas
export const setCustomTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

// Performance monitoring para operações críticas
export const withSentryProfiling = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    addBreadcrumb(`Iniciando operação: ${operationName}`, 'performance', tags);
    const result = await operation();
    
    const duration = Date.now() - startTime;
    addBreadcrumb(`Operação concluída: ${operationName}`, 'performance', {
      ...tags,
      duration: `${duration}ms`,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    addBreadcrumb(`Operação falhou: ${operationName}`, 'performance', {
      ...tags,
      duration: `${duration}ms`,
      status: 'error'
    });
    
    captureError(error as Error, { operation: operationName, ...tags });
    throw error;
  }
};

// Monitoramento de métricas customizadas
export const recordMetric = (name: string, value: number, unit: string = 'none', tags?: Record<string, string>) => {
  addBreadcrumb(`Métrica: ${name}`, 'metric', {
    name,
    value: value.toString(),
    unit,
    ...tags
  });
};

// Configurações específicas para diferentes partes da aplicação
export const configureSentryForPage = (pageName: string, additionalTags?: Record<string, string>) => {
  Sentry.withScope((scope) => {
    scope.setTag("page", pageName);
    scope.setContext("page_info", {
      name: pageName,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    
    if (additionalTags) {
      Object.keys(additionalTags).forEach(key => {
        scope.setTag(key, additionalTags[key]);
      });
    }
  });
  
  addBreadcrumb(`Navegou para ${pageName}`, 'navigation', { page: pageName });
};

// Rastreamento de ações do usuário
export const trackUserAction = (action: string, data?: Record<string, any>) => {
  addBreadcrumb(`Usuário: ${action}`, 'user_action', data);
  
  // Para ações críticas, também registrar como evento
  const criticalActions = ['login', 'logout', 'purchase', 'delete_data', 'export_data'];
  if (criticalActions.includes(action.toLowerCase())) {
    captureMessage(`Ação crítica: ${action}`, 'info', data);
  }
};

// HOC para capturar erros em componentes React
export const withSentryErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  const SentryWrappedComponent = (props: P) => {
    return React.createElement(Sentry.ErrorBoundary, {
      fallback: () => React.createElement('div', {
        style: { 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }
      }, React.createElement('div', {
        style: { 
          padding: '2rem', 
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }
      }, [
        React.createElement('h3', { 
          key: 'title',
          style: { color: '#ef4444', marginBottom: '1rem' }
        }, 'Algo deu errado'),
        React.createElement('p', { 
          key: 'message',
          style: { marginBottom: '1.5rem', color: '#6b7280' }
        }, 'Nossa equipe foi notificada automaticamente.'),
        React.createElement('button', {
          key: 'reload',
          onClick: () => window.location.reload(),
          style: {
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }
        }, 'Recarregar página')
      ])),
      beforeCapture: (scope: any) => {
        scope.setTag('component', componentName);
        addBreadcrumb(`Erro no componente: ${componentName}`, 'error', {
          component: componentName
        });
      }
    }, React.createElement(WrappedComponent, props));
  };

  SentryWrappedComponent.displayName = `withSentryErrorBoundary(${componentName})`;
  return SentryWrappedComponent;
};

// Monitoramento de performance de API calls
export const trackApiCall = async <T>(
  url: string,
  method: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now();
  
  try {
    addBreadcrumb(`API Request: ${method} ${url}`, 'http', {
      method,
      url
    });
    
    const result = await apiCall();
    
    const duration = Date.now() - startTime;
    addBreadcrumb(`API Success: ${method} ${url}`, 'http', {
      method,
      url,
      duration: `${duration}ms`,
      status: 'success'
    });
    
    // Alertar se API está lenta (> 2s)
    if (duration > 2000) {
      captureMessage(`API lenta detectada: ${method} ${url}`, 'warning', {
        method,
        url,
        duration: `${duration}ms`
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    addBreadcrumb(`API Error: ${method} ${url}`, 'http', {
      method,
      url,
      duration: `${duration}ms`,
      status: 'error'
    });
    
    captureError(error as Error, {
      api_url: url,
      api_method: method,
      api_duration: `${duration}ms`
    });
    
    throw error;
  }
};

export default Sentry; 