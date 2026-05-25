import { useState, useEffect } from 'react';
import { getCacheMetrics, clearAllCaches, forceServiceWorkerUpdate } from '@/utils/serviceWorkerUtils';

interface CacheMetrics {
  staticCache: number;
  dynamicCache: number;
  apiCache: number;
  totalSize: number;
  isLoading: boolean;
  error: string | null;
}

interface CacheControls {
  refresh: () => Promise<void>;
  clearCache: () => Promise<boolean>;
  updateServiceWorker: () => Promise<boolean>;
  formatSize: (bytes: number) => string;
}

export const useCacheMetrics = (): [CacheMetrics, CacheControls] => {
  const [metrics, setMetrics] = useState<CacheMetrics>({
    staticCache: 0,
    dynamicCache: 0,
    apiCache: 0,
    totalSize: 0,
    isLoading: true,
    error: null
  });

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchMetrics = async () => {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }));
      const cacheData = await getCacheMetrics();
      setMetrics(prev => ({
        ...prev,
        ...cacheData,
        isLoading: false
      }));
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
    }
  };

  const refresh = async () => {
    await fetchMetrics();
  };

  const clearCache = async (): Promise<boolean> => {
    try {
      const success = await clearAllCaches();
      if (success) {
        await fetchMetrics(); // Atualizar métricas após limpeza
      }
      return success;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  };

  const updateServiceWorker = async (): Promise<boolean> => {
    try {
      return await forceServiceWorkerUpdate();
    } catch (error) {
      console.error('Erro ao atualizar Service Worker:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const controls: CacheControls = {
    refresh,
    clearCache,
    updateServiceWorker,
    formatSize
  };

  return [metrics, controls];
}; 