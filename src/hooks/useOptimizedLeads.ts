import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './usePerformanceOptimization';

interface Lead {
  id: string;
  name: string;
  status: string;
  phone: string;
  cpf: string;
  amount?: number;
  created_at: string;
  user_id: string;
}

interface LeadStats {
  total: number;
  new: number;
  qualified: number;
  converted: number;
}

interface UseOptimizedLeadsOptions {
  pageSize?: number;
  enableCache?: boolean;
  cacheDuration?: number;
}

export const useOptimizedLeads = (options: UseOptimizedLeadsOptions = {}) => {
  const {
    pageSize = 20,
    enableCache = true,
    cacheDuration = 5 * 60 * 1000 // 5 minutos
  } = options;

  // Estados
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({ total: 0, new: 0, qualified: 0, converted: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search para evitar consultas excessivas
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Cache simples em memória
  const [cache, setCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());

  // Função para gerar chave de cache
  const getCacheKey = useCallback((page: number, search: string, status: string, sort: string, order: string) => {
    return `leads_${page}_${search}_${status}_${sort}_${order}`;
  }, []);

  // Função para verificar cache
  const getCachedData = useCallback((key: string) => {
    if (!enableCache) return null;
    
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data;
    }
    return null;
  }, [cache, enableCache, cacheDuration]);

  // Função para salvar no cache
  const setCachedData = useCallback((key: string, data: any) => {
    if (!enableCache) return;
    
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, { data, timestamp: Date.now() });
      
      // Limitar tamanho do cache (máximo 50 entradas)
      if (newCache.size > 50) {
        const firstKey = newCache.keys().next().value;
        newCache.delete(firstKey);
      }
      
      return newCache;
    });
  }, [enableCache]);

  // Buscar estatísticas otimizadas
  const fetchStats = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Query otimizada para estatísticas - apenas status e user_id
      const { data: allLeads, error: leadsError } = await supabase
        .from('leads')
        .select('status')
        .eq('user_id', userData.user.id);

      if (leadsError) throw leadsError;

      const calculatedStats = (allLeads || []).reduce((acc, lead) => {
        acc.total++;
        if (lead.status === 'novo') acc.new++;
        if (lead.status === 'qualificado') acc.qualified++;
        if (lead.status === 'convertido') acc.converted++;
        return acc;
      }, { total: 0, new: 0, qualified: 0, converted: 0 });

      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Buscar leads com otimizações
  const fetchLeads = useCallback(async (
    page: number = 1,
    search: string = '',
    status: string = 'all',
    sort: string = 'created_at',
    order: string = 'desc',
    useCache: boolean = true
  ) => {
    const cacheKey = getCacheKey(page, search, status, sort, order);
    
    // Verificar cache primeiro
    if (useCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setLeads(cachedData.leads);
        setTotalCount(cachedData.totalCount);
        setHasNextPage(cachedData.hasNextPage);
        return cachedData;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      // Construir query otimizada - apenas campos essenciais
      let query = supabase
        .from('leads')
        .select('id, name, status, phone, cpf, created_at', { count: 'exact' })
        .eq('user_id', userData.user.id);

      // Aplicar filtros
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Busca textual
      if (search.trim()) {
        query = query.or(`name.ilike.%${search}%,cpf.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      // Ordenação
      query = query.order(sort as any, { ascending: order === 'asc' });

      // Paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: leadsData, error: leadsError, count } = await query;

      if (leadsError) throw leadsError;

      const result = {
        leads: (leadsData || []) as Lead[],
        totalCount: count || 0,
        hasNextPage: (count || 0) > page * pageSize
      };

      // Salvar no cache
      setCachedData(cacheKey, result);

      // Atualizar estado
      setLeads(result.leads);
      setTotalCount(result.totalCount);
      setHasNextPage(result.hasNextPage);

      return result;

    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching leads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, getCacheKey, getCachedData, setCachedData]);

  // Buscar página seguinte
  const fetchNextPage = useCallback(() => {
    if (hasNextPage && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchLeads(nextPage, debouncedSearch, statusFilter, sortBy, sortOrder);
    }
  }, [hasNextPage, isLoading, currentPage, debouncedSearch, statusFilter, sortBy, sortOrder, fetchLeads]);

  // Resetar para primeira página
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    fetchLeads(1, debouncedSearch, statusFilter, sortBy, sortOrder);
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, fetchLeads]);

  // Invalidar cache
  const invalidateCache = useCallback(() => {
    setCache(new Map());
  }, []);

  // Buscar leads quando filtros mudam
  useEffect(() => {
    resetToFirstPage();
  }, [debouncedSearch, statusFilter, sortBy, sortOrder, resetToFirstPage]);

  // Buscar estatísticas na montagem
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Métricas calculadas
  const metrics = useMemo(() => ({
    conversionRate: stats.total > 0 ? ((stats.converted / stats.total) * 100).toFixed(1) : '0.0',
    totalPages: Math.ceil(totalCount / pageSize),
    currentPageInfo: {
      from: (currentPage - 1) * pageSize + 1,
      to: Math.min(currentPage * pageSize, totalCount),
      total: totalCount
    }
  }), [stats, totalCount, pageSize, currentPage]);

  return {
    // Dados
    leads,
    stats,
    metrics,
    
    // Estado
    isLoading,
    error,
    hasNextPage,
    currentPage,
    totalCount,
    
    // Filtros
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    
    // Ações
    setSearchQuery,
    setStatusFilter,
    setSortBy,
    setSortOrder,
    fetchNextPage,
    resetToFirstPage,
    invalidateCache,
    refetch: () => fetchLeads(currentPage, debouncedSearch, statusFilter, sortBy, sortOrder, false),
    refetchStats: fetchStats
  };
}; 