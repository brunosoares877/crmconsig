import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bug, Eye, AlertTriangle, CheckCircle, Activity, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSentryMonitoring } from '@/hooks/useSentryMonitoring';
import * as Sentry from '@sentry/react';

interface SentryStatus {
  isInitialized: boolean;
  hasErrors: boolean;
  totalEvents: number;
  recentErrors: any[];
  performance: {
    averageResponseTime: number;
    errorRate: number;
  };
}

const SentryManager: React.FC = () => {
  const [sentryStatus, setSentryStatus] = useState<SentryStatus>({
    isInitialized: false,
    hasErrors: false,
    totalEvents: 0,
    recentErrors: [],
    performance: {
      averageResponseTime: 0,
      errorRate: 0
    }
  });
  
  const [isTestingError, setIsTestingError] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  
  const { trackAction, trackError, trackMessage } = useSentryMonitoring();

  useEffect(() => {
    // Verificar se Sentry está inicializado
    const client = Sentry.getCurrentHub().getClient();
    setSentryStatus(prev => ({
      ...prev,
      isInitialized: !!client
    }));
  }, []);

  const handleTestError = async () => {
    setIsTestingError(true);
    try {
      // Simular erro para teste
      const testError = new Error('Erro de teste do Sentry - ignore esta mensagem');
      trackError(testError, {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'sentry_manager'
      });
      
      alert('Erro de teste enviado com sucesso para o Sentry!');
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
    } finally {
      setIsTestingError(false);
    }
  };

  const handleTestMessage = async () => {
    setIsTestingMessage(true);
    try {
      trackMessage('Mensagem de teste do Sentry', 'info', {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'sentry_manager'
      });
      
      alert('Mensagem de teste enviada com sucesso para o Sentry!');
    } finally {
      setIsTestingMessage(false);
    }
  };

  const handleTestAction = () => {
    trackAction('test_action', {
      feature: 'sentry_manager',
      timestamp: new Date().toISOString()
    });
    alert('Ação de teste registrada!');
  };

  const getSentryStatusColor = () => {
    if (!sentryStatus.isInitialized) return 'text-red-600';
    if (sentryStatus.hasErrors) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSentryStatusIcon = () => {
    if (!sentryStatus.isInitialized) {
      return <X className="h-4 w-4 text-red-600" />;
    }
    if (sentryStatus.hasErrors) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getSentryStatusText = () => {
    if (!sentryStatus.isInitialized) return 'Desativado';
    if (sentryStatus.hasErrors) return 'Com alertas';
    return 'Funcionando';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Monitoramento de Erros (Sentry)
          </CardTitle>
          <CardDescription>
            Sistema de monitoramento automático de erros e performance em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Status do Sentry</div>
                <div className={`text-lg font-semibold ${getSentryStatusColor()}`}>
                  {getSentryStatusText()}
                </div>
              </div>
              {getSentryStatusIcon()}
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-blue-600">Ambiente</div>
                <div className="text-lg font-semibold text-blue-700">
                  {import.meta.env.MODE}
                </div>
              </div>
              <Eye className="h-4 w-4 text-blue-600" />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-green-600">Versão</div>
                <div className="text-lg font-semibold text-green-700">
                  {import.meta.env.VITE_APP_VERSION || '1.0.0'}
                </div>
              </div>
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </div>

          {/* Funcionalidades do Sentry */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Funcionalidades Ativas:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Captura automática de erros</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Monitoramento de performance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Rastreamento de usuários</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Breadcrumbs de navegação</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Filtros inteligentes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Release tracking</span>
              </div>
            </div>
          </div>

          {/* Informações de Configuração */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Configurações:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">DSN Configurado:</span>
                  <Badge variant={import.meta.env.VITE_SENTRY_DSN ? 'default' : 'secondary'}>
                    {import.meta.env.VITE_SENTRY_DSN ? 'Sim' : 'Padrão'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sample Rate:</span>
                  <Badge variant="outline">
                    {import.meta.env.MODE === 'production' ? '10%' : '100%'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Error Boundaries:</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Tracking:</span>
                  <Badge variant="default">Ativo</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {!sentryStatus.isInitialized && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Sentry não inicializado:</strong> Configure a variável VITE_SENTRY_DSN para ativar o monitoramento completo.
              </AlertDescription>
            </Alert>
          )}

          {import.meta.env.MODE === 'development' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Modo desenvolvimento:</strong> O Sentry está configurado para capturar 100% dos eventos.
              </AlertDescription>
            </Alert>
          )}

          {/* Ações de Teste */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Testar Funcionalidades:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestError}
                disabled={isTestingError}
                className="flex items-center gap-2"
              >
                {isTestingError ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bug className="h-4 w-4" />
                )}
                Testar Erro
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestMessage}
                disabled={isTestingMessage}
                className="flex items-center gap-2"
              >
                {isTestingMessage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                Testar Mensagem
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestAction}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Testar Ação
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              ℹ️ Os testes são marcados como 'test: true' para fácil identificação no painel do Sentry
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios do Monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Benefícios do Monitoramento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Para Desenvolvedores:</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Detecção automática de erros</li>
                <li>• Stack traces completos</li>
                <li>• Context de usuário e navegador</li>
                <li>• Performance monitoring</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold text-gray-900">Para o Negócio:</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• Maior estabilidade da aplicação</li>
                <li>• Resolução proativa de problemas</li>
                <li>• Melhor experiência do usuário</li>
                <li>• Dados para otimização</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções de Configuração */}
      {!import.meta.env.VITE_SENTRY_DSN && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Como Configurar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">1. Criar projeto no Sentry:</p>
                <p className="text-gray-600">Acesse sentry.io e crie um novo projeto React</p>
              </div>
              
              <div>
                <p className="font-medium">2. Configurar variável de ambiente:</p>
                <div className="bg-gray-100 p-2 rounded font-mono text-xs">
                  VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
                </div>
              </div>
              
              <div>
                <p className="font-medium">3. Fazer deploy:</p>
                <p className="text-gray-600">O Sentry será ativado automaticamente em produção</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SentryManager; 