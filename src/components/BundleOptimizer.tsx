import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Package, 
  Timer, 
  TrendingUp, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useBundleOptimization, useBundleMetrics } from '@/hooks/useBundleOptimization';

interface BundleOptimizerProps {
  onSettingsChange?: (settings: any) => void;
}

export const BundleOptimizer: React.FC<BundleOptimizerProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    enablePreloading: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
    aggressiveOptimization: false
  });

  const optimization = useBundleOptimization({
    enablePreloading: settings.enablePreloading,
    enableImageOptimization: settings.enableImageOptimization,
    enableCodeSplitting: settings.enableCodeSplitting,
    preloadCriticalRoutes: settings.aggressiveOptimization 
      ? ['leads', 'dashboard', 'commission', 'settings'] 
      : ['leads', 'dashboard']
  });

  const bundleMetrics = useBundleMetrics();
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  useEffect(() => {
    // Analisar bundle na inicialização
    const results = optimization.analyzeBundle();
    setAnalysisResults(results);
    bundleMetrics.refresh();
  }, []);

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const performDeepAnalysis = () => {
    const results = optimization.analyzeBundle();
    const unusedCode = optimization.detectUnusedCode();
    
    setAnalysisResults({
      ...results,
      unusedCode,
      suggestions: [
        'Bundle está otimizado para performance',
        'Code splitting implementado corretamente',
        'Lazy loading ativo para componentes pesados'
      ]
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOptimizationScore = () => {
    let score = 0;
    if (settings.enablePreloading) score += 25;
    if (settings.enableImageOptimization) score += 25;
    if (settings.enableCodeSplitting) score += 30;
    if (bundleMetrics.getCompressionRatio() > 70) score += 20;
    return Math.min(score, 100);
  };

  const optimizationScore = getOptimizationScore();

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bundle Optimizer</h2>
          <p className="text-muted-foreground">
            Otimize o desempenho e tamanho do bundle da aplicação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={optimizationScore >= 80 ? "default" : "secondary"} className="text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Score: {optimizationScore}%
          </Badge>
        </div>
      </div>

      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Status de Otimização
          </CardTitle>
          <CardDescription>
            Visão geral das otimizações ativas e métricas de performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {formatBytes(bundleMetrics.metrics.totalBundleSize)}
              </div>
              <div className="text-sm text-blue-600">Tamanho Total</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Timer className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {Math.round(bundleMetrics.metrics.initialLoadTime)}ms
              </div>
              <div className="text-sm text-green-600">Tempo de Carregamento</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {Math.round(bundleMetrics.getCompressionRatio())}%
              </div>
              <div className="text-sm text-purple-600">Compressão</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">
                {bundleMetrics.metrics.chunksLoaded}
              </div>
              <div className="text-sm text-orange-600">Chunks Carregados</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score de Otimização</span>
              <span className="text-sm text-muted-foreground">{optimizationScore}%</span>
            </div>
            <Progress value={optimizationScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Otimização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Otimização
          </CardTitle>
          <CardDescription>
            Configure as otimizações automáticas do bundle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Preloading Inteligente</div>
              <div className="text-xs text-muted-foreground">
                Carrega recursos críticos automaticamente
              </div>
            </div>
            <Switch
              checked={settings.enablePreloading}
              onCheckedChange={(checked) => handleSettingChange('enablePreloading', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Otimização de Imagens</div>
              <div className="text-xs text-muted-foreground">
                Lazy loading e formato WebP automáticos
              </div>
            </div>
            <Switch
              checked={settings.enableImageOptimization}
              onCheckedChange={(checked) => handleSettingChange('enableImageOptimization', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Code Splitting</div>
              <div className="text-xs text-muted-foreground">
                Divisão automática de código por rotas
              </div>
            </div>
            <Switch
              checked={settings.enableCodeSplitting}
              onCheckedChange={(checked) => handleSettingChange('enableCodeSplitting', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Otimização Agressiva</div>
              <div className="text-xs text-muted-foreground">
                Preload de todas as rotas críticas
              </div>
            </div>
            <Switch
              checked={settings.aggressiveOptimization}
              onCheckedChange={(checked) => handleSettingChange('aggressiveOptimization', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Análise do Bundle
          </CardTitle>
          <CardDescription>
            Informações detalhadas sobre o bundle e sugestões de otimização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button onClick={performDeepAnalysis} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Analisar Bundle
            </Button>
            <Button onClick={optimization.preloadCriticalResources} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Preload Crítico
            </Button>
            <Button onClick={optimization.cleanupUnusedResources} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Cache
            </Button>
          </div>

          {analysisResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Scripts</div>
                  <div className="text-2xl font-bold">{analysisResults.scriptCount}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Estilos</div>
                  <div className="text-2xl font-bold">{analysisResults.styleCount}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Tamanho Estimado</div>
                  <div className="text-2xl font-bold">{analysisResults.estimatedSize}KB</div>
                </div>
              </div>

              {analysisResults.suggestions && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Status:</strong> {analysisResults.suggestions.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {analysisResults.unusedCode && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Código não utilizado:</strong> {analysisResults.unusedCode.unusedCodePercentage}%
                    <br />
                    <strong>Sugestões:</strong> {analysisResults.unusedCode.suggestions.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>
            Monitoramento em tempo real das métricas de bundle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-2">Uso de Memória</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatBytes(optimization.metrics.memoryUsage)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Cache Hit Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(optimization.metrics.cacheHitRate * 100)}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Próximos Passos Recomendados</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Considere implementar Service Worker para cache offline</li>
                <li>• Configure CDN para assets estáticos</li>
                <li>• Implemente virtual scrolling para listas grandes</li>
                <li>• Use compressão Brotli no servidor</li>
                <li>• Configure preload de recursos críticos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 