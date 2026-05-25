import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hook para debounce de busca
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para cache simples
export const useCache = <T>(key: string, initialData: T) => {
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [cache]);

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    setCache(prev => new Map(prev).set(cacheKey, { data, timestamp: Date.now() }));
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return { getCachedData, setCachedData, clearCache };
};

// Hook para otimização de consultas
export const useOptimizedQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getCachedData, setCachedData } = useCache('query-cache', null);

  const executeQuery = useCallback(async (
    queryKey: string,
    queryFn: () => Promise<any>,
    useCache = true
  ) => {
    if (useCache) {
      const cached = getCachedData(queryKey);
      if (cached) {
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const result = await queryFn();
      if (useCache) {
        setCachedData(queryKey, result);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedData, setCachedData]);

  return { executeQuery, isLoading };
};

// Hook para paginação otimizada
export const usePagination = (itemsPerPage: number = 20) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);
  
  const paginationInfo = useMemo(() => ({
    from: (currentPage - 1) * itemsPerPage,
    to: currentPage * itemsPerPage - 1,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage
  }), [currentPage, totalPages, totalItems, itemsPerPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);
  const resetPage = useCallback(() => setCurrentPage(1), []);

  return {
    ...paginationInfo,
    setTotalItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage
  };
};

// Hook para lazy loading de imagens
export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setError(true);
    };
    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, error };
};

// Hook para otimização de performance geral
export const usePerformanceOptimization = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    queryTime: 0,
    lastUpdate: Date.now()
  });

  const measureRenderTime = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime,
      lastUpdate: Date.now()
    }));
  }, []);

  const measureQueryTime = useCallback(async (queryFn: () => Promise<any>) => {
    const startTime = performance.now();
    const result = await queryFn();
    const queryTime = performance.now() - startTime;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      queryTime,
      lastUpdate: Date.now()
    }));
    
    return result;
  }, []);

  // Otimização automática baseada em métricas
  const shouldOptimize = useMemo(() => {
    return performanceMetrics.renderTime > 100 || performanceMetrics.queryTime > 1000;
  }, [performanceMetrics]);

  return {
    performanceMetrics,
    measureRenderTime,
    measureQueryTime,
    shouldOptimize
  };
}; 