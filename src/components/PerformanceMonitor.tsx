import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  queryTime: number;
  memoryUsed: number;
  connectionPoolSize: number;
  cacheHitRatio: number;
  timestamp: number;
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  issues: string[];
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
  isDevelopment?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible = false,
  onToggle,
  isDevelopment = process.env.NODE_ENV === 'development'
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

  // Coletar métricas de performance
  const collectMetrics = async () => {
    try {
      const startTime = performance.now();
      
      // Simular query ao banco (em produção seria uma query real de monitoramento)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const queryTime = performance.now() - startTime;
      const renderTime = performance.now();
      
      // Métricas de memória (aproximadas)
      const memoryInfo = (performance as any).memory;
      const memoryUsed = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;
      
      const newMetric: PerformanceMetrics = {
        renderTime: renderTime % 1000, // Simplificado para demo
        queryTime,
        memoryUsed,
        connectionPoolSize: Math.floor(Math.random() * 10) + 5, // Simulado
        cacheHitRatio: Math.random() * 100,
        timestamp: Date.now()
      };

      setMetrics(prev => {
        const updated = [...prev, newMetric];
        // Manter apenas os últimos 20 registros
        return updated.slice(-20);
      });
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  };

  // Iniciar/parar coleta de métricas
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCollecting && isVisible) {
      interval = setInterval(collectMetrics, 2000); // A cada 2 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCollecting, isVisible]);

  // Métricas calculadas
  const currentMetrics = useMemo(() => {
    if (metrics.length === 0) return null;
    
    const latest = metrics[metrics.length - 1];
    const avgQueryTime = metrics.reduce((sum, m) => sum + m.queryTime, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memoryUsed, 0) / metrics.length;
    
    return {
      ...latest,
      avgQueryTime,
      avgMemory,
      trend: metrics.length > 1 ? 
        (latest.queryTime > metrics[metrics.length - 2].queryTime ? 'up' : 'down') : 'stable'
    };
  }, [metrics]);

  // Status de saúde geral
  const healthStatus: HealthStatus = useMemo(() => {
    if (!currentMetrics) return { status: 'unknown', issues: [] };
    
    const issues = [];
    if (currentMetrics.queryTime > 1000) issues.push('Query lenta');
    if (currentMetrics.memoryUsed > 100) issues.push('Memória alta');
    if (currentMetrics.cacheHitRatio < 70) issues.push('Cache baixo');
    
    if (issues.length === 0) return { status: 'healthy', issues: [] };
    if (issues.length <= 1) return { status: 'warning', issues };
    return { status: 'critical', issues };
  }, [currentMetrics]);

  // Não mostrar em produção se não for explicitamente habilitado
  if (!isDevelopment && !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-50"
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </Button>
      ) : (
        <Card className="w-80 bg-white/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Monitor de Performance
                {healthStatus.status === 'healthy' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {healthStatus.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                {healthStatus.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollecting(!isCollecting)}
                  className={`h-6 px-2 text-xs ${isCollecting ? 'text-green-600' : 'text-gray-500'}`}
                >
                  {isCollecting ? 'Pausar' : 'Iniciar'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-3">
            {/* Status Geral */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Status Geral</span>
              <Badge 
                variant={healthStatus.status === 'healthy' ? 'default' : 
                        healthStatus.status === 'warning' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {healthStatus.status === 'healthy' && 'Saudável'}
                {healthStatus.status === 'warning' && 'Atenção'}
                {healthStatus.status === 'critical' && 'Crítico'}
                {healthStatus.status === 'unknown' && 'Desconhecido'}
              </Badge>
            </div>

            {/* Problemas encontrados */}
            {healthStatus.issues.length > 0 && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                <div className="font-medium mb-1">Problemas detectados:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {healthStatus.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentMetrics && (
              <>
                {/* Tempo de Query */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-gray-600">Tempo de Query</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono">
                      {currentMetrics.queryTime.toFixed(0)}ms
                    </span>
                    {currentMetrics.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-500" />}
                    {currentMetrics.trend === 'down' && <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />}
                  </div>
                </div>

                {/* Memória */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">Memória JS</span>
                  </div>
                  <span className="text-xs font-mono">
                    {currentMetrics.memoryUsed.toFixed(1)}MB
                  </span>
                </div>

                {/* Cache Hit Ratio */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-gray-600">Cache Hit</span>
                  </div>
                  <span className="text-xs font-mono">
                    {currentMetrics.cacheHitRatio.toFixed(0)}%
                  </span>
                </div>

                {/* Médias */}
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Média Query:</span>
                    <span className="font-mono">{currentMetrics.avgQueryTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Média Memória:</span>
                    <span className="font-mono">{currentMetrics.avgMemory.toFixed(1)}MB</span>
                  </div>
                </div>

                {/* Gráfico simples de tendência */}
                <div className="border-t pt-2">
                  <div className="text-xs text-gray-600 mb-1">Tempo de Query (últimos registros)</div>
                  <div className="flex items-end gap-0.5 h-8">
                    {metrics.slice(-10).map((metric, index) => {
                      const height = Math.min((metric.queryTime / 1000) * 100, 100);
                      return (
                        <div
                          key={index}
                          className={`flex-1 rounded-t ${
                            height > 80 ? 'bg-red-400' : 
                            height > 50 ? 'bg-yellow-400' : 'bg-green-400'
                          }`}
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${metric.queryTime.toFixed(0)}ms`}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {!currentMetrics && (
              <div className="text-center text-xs text-gray-500 py-4">
                Clique em "Iniciar" para começar o monitoramento
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 