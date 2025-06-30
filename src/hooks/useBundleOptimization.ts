import { useEffect, useCallback, useRef, useState } from 'react';
import { initIntelligentPreloading, preloadRoute } from '@/utils/lazyLoading';

interface BundleOptimizationConfig {
  enablePreloading?: boolean;
  enableImageOptimization?: boolean;
  enableCodeSplitting?: boolean;
  preloadCriticalRoutes?: string[];
  lazyLoadThreshold?: number;
}

interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  chunkCount: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export const useBundleOptimization = (config: BundleOptimizationConfig = {}) => {
  const {
    enablePreloading = true,
    enableImageOptimization = true,
    enableCodeSplitting = true,
    preloadCriticalRoutes = ['leads', 'dashboard'],
    lazyLoadThreshold = 0.1
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleSize: 0,
    loadTime: 0,
    chunkCount: 0,
    cacheHitRate: 0,
    memoryUsage: 0
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  // Inicializar otimizações
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (enablePreloading) {
      cleanup = initIntelligentPreloading();
      cleanupRef.current = cleanup;

      // Preload rotas críticas
      setTimeout(() => {
        preloadCriticalRoutes.forEach(route => {
          preloadRoute(route);
        });
      }, 1000);
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [enablePreloading, preloadCriticalRoutes]);

  // Monitorar métricas de performance
  useEffect(() => {
    const updateMetrics = () => {
      const performance = window.performance;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics(prev => ({
        ...prev,
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }));
    };

    // Atualizar métricas quando a página carregar
    if (document.readyState === 'complete') {
      updateMetrics();
    } else {
      window.addEventListener('load', updateMetrics);
    }

    // Monitorar mudanças de performance periodicamente
    const interval = setInterval(updateMetrics, 30000); // 30 segundos

    return () => {
      window.removeEventListener('load', updateMetrics);
      clearInterval(interval);
    };
  }, []);

  // Otimização de imagens lazy
  const optimizeImage = useCallback((img: HTMLImageElement) => {
    if (!enableImageOptimization) return;

    // Adicionar lazy loading nativo
    img.loading = 'lazy';
    
    // Otimizar formato baseado no suporte do browser
    if (img.src && !img.src.includes('data:')) {
      const supportsWebP = () => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      };

      if (supportsWebP() && !img.src.includes('.webp')) {
        // Sugerir conversão para WebP (implementar no servidor)
        console.log('Imagem pode ser otimizada para WebP:', img.src);
      }
    }
  }, [enableImageOptimization]);

  // Hook para otimizar componentes pesados
  const optimizeHeavyComponent = useCallback((componentRef: HTMLElement | null) => {
    if (!componentRef || !enableCodeSplitting) return;

    // Implementar Intersection Observer para renderização sob demanda
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Componente está visível, pode carregar conteúdo pesado
            entry.target.setAttribute('data-loaded', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: lazyLoadThreshold }
    );

    observer.observe(componentRef);

    return () => observer.disconnect();
  }, [enableCodeSplitting, lazyLoadThreshold]);

  // Preload recursos críticos
  const preloadCriticalResources = useCallback(() => {
    // Preload CSS crítico
    const criticalCSS = document.querySelectorAll('link[rel="preload"][as="style"]');
    if (criticalCSS.length === 0) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = '/assets/index.css';
      document.head.appendChild(link);
    }

    // Preload fontes críticas
    const fonts = [
      '/fonts/inter-latin-wght-normal.woff2'
    ];

    fonts.forEach(fontPath => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontPath;
      document.head.appendChild(link);
    });
  }, []);

  // Limpar recursos não utilizados
  const cleanupUnusedResources = useCallback(() => {
    // Remover event listeners não utilizados
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Garbage collection manual se disponível
    if ('gc' in window) {
      (window as any).gc();
    }
  }, []);

  // Analisar e reportar performance do bundle
  const analyzeBundle = useCallback(() => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    const bundleInfo = {
      scriptCount: scripts.length,
      styleCount: styles.length,
      totalAssets: scripts.length + styles.length,
      estimatedSize: scripts.length * 50 + styles.length * 20 // Estimativa em KB
    };

    setMetrics(prev => ({
      ...prev,
      bundleSize: bundleInfo.estimatedSize,
      chunkCount: bundleInfo.scriptCount
    }));

    return bundleInfo;
  }, []);

  // Detectar e reportar código não utilizado
  const detectUnusedCode = useCallback(() => {
    if ('coverage' in window.performance) {
      // API de Coverage (quando disponível)
      const coverage = (window.performance as any).coverage;
      if (coverage) {
        const unusedRatio = coverage.reduce((acc: number, entry: any) => {
          return acc + (1 - entry.used / entry.total);
        }, 0) / coverage.length;

        return {
          unusedCodePercentage: Math.round(unusedRatio * 100),
          suggestions: [
            'Considere implementar tree-shaking mais agressivo',
            'Remova dependências não utilizadas',
            'Implemente code splitting para rotas'
          ]
        };
      }
    }

    return null;
  }, []);

  // Resource hints automáticos
  const addResourceHints = useCallback((urls: string[]) => {
    urls.forEach(url => {
      // DNS prefetch para domínios externos
      if (url.includes('://') && !url.includes(window.location.hostname)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = new URL(url).origin;
        document.head.appendChild(link);
      }

      // Preconnect para recursos críticos
      if (url.includes('supabase.co') || url.includes('sentry.io')) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = new URL(url).origin;
        document.head.appendChild(link);
      }
    });
  }, []);

  return {
    // Métricas
    metrics,
    
    // Funções de otimização
    optimizeImage,
    optimizeHeavyComponent,
    preloadCriticalResources,
    cleanupUnusedResources,
    analyzeBundle,
    detectUnusedCode,
    addResourceHints,
    
    // Configurações
    config: {
      enablePreloading,
      enableImageOptimization,
      enableCodeSplitting,
      preloadCriticalRoutes,
      lazyLoadThreshold
    }
  };
};

// Hook específico para monitoramento de performance do bundle
export const useBundleMetrics = () => {
  const [metrics, setMetrics] = useState({
    initialLoadTime: 0,
    totalBundleSize: 0,
    chunksLoaded: 0,
    cacheHits: 0,
    compressionRatio: 0
  });

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          if (resourceEntry.name.includes('.js') || resourceEntry.name.includes('.css')) {
            setMetrics(prev => ({
              ...prev,
              chunksLoaded: prev.chunksLoaded + 1,
              totalBundleSize: prev.totalBundleSize + (resourceEntry.transferSize || 0)
            }));
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  const getCompressionRatio = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    
    if (jsResources.length > 0) {
      const totalUncompressed = jsResources.reduce((acc, r) => acc + (r.decodedBodySize || 0), 0);
      const totalCompressed = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
      
      return totalCompressed > 0 ? (1 - totalCompressed / totalUncompressed) * 100 : 0;
    }
    
    return 0;
  }, []);

  return {
    metrics,
    getCompressionRatio,
    refresh: () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      setMetrics(prev => ({
        ...prev,
        initialLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        compressionRatio: getCompressionRatio()
      }));
    }
  };
}; 