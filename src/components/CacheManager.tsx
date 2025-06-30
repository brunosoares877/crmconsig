import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Trash2, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useCacheMetrics } from '@/hooks/useCacheMetrics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const CacheManager: React.FC = () => {
  const [metrics, controls] = useCacheMetrics();
  const [isClearing, setIsClearing] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const success = await controls.clearCache();
      if (success) {
        alert('Cache limpo com sucesso! A página será recarregada.');
        window.location.reload();
      } else {
        alert('Erro ao limpar cache. Tente novamente.');
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleUpdateServiceWorker = async () => {
    setIsUpdating(true);
    try {
      const success = await controls.updateServiceWorker();
      if (success) {
        alert('Service Worker atualizado! A página será recarregada.');
        window.location.reload();
      } else {
        alert('Nenhuma atualização disponível no momento.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const maxCacheSize = 50 * 1024 * 1024; // 50MB
  const cacheUsagePercent = (metrics.totalSize / maxCacheSize) * 100;

  const getCacheStatusColor = () => {
    if (cacheUsagePercent < 50) return 'text-green-600';
    if (cacheUsagePercent < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCacheStatusIcon = () => {
    if (cacheUsagePercent < 80) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Gerenciamento de Cache
          </CardTitle>
          <CardDescription>
            Monitore e gerencie o cache da aplicação para melhor performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar métricas: {metrics.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Status Geral do Cache */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uso do Cache</span>
                <div className="flex items-center gap-1">
                  {getCacheStatusIcon()}
                  <span className={`text-sm font-medium ${getCacheStatusColor()}`}>
                    {cacheUsagePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress value={cacheUsagePercent} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {controls.formatSize(metrics.totalSize)} de {controls.formatSize(maxCacheSize)}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-2">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={controls.refresh}
                  disabled={metrics.isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${metrics.isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateServiceWorker}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Atualizar App
                </Button>
              </div>
            </div>
          </div>

          {/* Detalhes por Tipo de Cache */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {controls.formatSize(metrics.staticCache)}
              </div>
              <div className="text-sm text-blue-700 font-medium">Cache Estático</div>
              <div className="text-xs text-blue-600 mt-1">
                JS, CSS, imagens
              </div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {controls.formatSize(metrics.apiCache)}
              </div>
              <div className="text-sm text-green-700 font-medium">Cache API</div>
              <div className="text-xs text-green-600 mt-1">
                Dados do servidor
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {controls.formatSize(metrics.dynamicCache)}
              </div>
              <div className="text-sm text-purple-700 font-medium">Cache Dinâmico</div>
              <div className="text-xs text-purple-600 mt-1">
                Páginas visitadas
              </div>
            </div>
          </div>

          {/* Benefícios do Cache */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefícios do Cache:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Carregamento 40% mais rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Funciona offline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Reduz uso de dados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Melhora experiência</span>
              </div>
            </div>
          </div>

          {/* Aviso de Alto Uso */}
          {cacheUsagePercent > 80 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cache quase cheio:</strong> Considere limpar o cache para liberar espaço e melhorar a performance.
              </AlertDescription>
            </Alert>
          )}

          {/* Ações de Limpeza */}
          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearCache}
                disabled={isClearing || metrics.totalSize === 0}
                className="flex-1"
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Limpar Todo Cache
              </Button>
              
              <div className="text-xs text-muted-foreground flex-1 flex items-center justify-center px-2">
                ⚠️ Isso irá remover todos os dados em cache e a página será recarregada
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Worker:</span>
              <Badge variant="secondary">
                {'serviceWorker' in navigator ? 'Ativo' : 'Não Suportado'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache API:</span>
              <Badge variant="secondary">
                {'caches' in window ? 'Disponível' : 'Não Suportado'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notificações:</span>
              <Badge variant="secondary">
                {'Notification' in window ? 
                  (Notification.permission === 'granted' ? 'Ativas' : 'Disponíveis') : 
                  'Não Suportado'
                }
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CacheManager; 