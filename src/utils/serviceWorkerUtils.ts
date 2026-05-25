// Utilitários para Service Worker
export const registerServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[SW] Service Worker registrado com sucesso:', registration.scope);
      
      // Escutar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] Nova versão disponível');
              // Aqui você pode mostrar uma notificação para o usuário
              showUpdateNotification();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('[SW] Erro ao registrar Service Worker:', error);
      return false;
    }
  }
  
  console.warn('[SW] Service Worker não suportado neste navegador');
  return false;
};

export const showUpdateNotification = () => {
  // Implementar notificação de atualização
  if (Notification.permission === 'granted') {
    new Notification('LeadConsig Atualizado', {
      body: 'Uma nova versão está disponível. Recarregue a página para obter as melhorias.',
      icon: '/leadconsig-logo.png',
      tag: 'app-update'
    });
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// Métricas de cache
export const getCacheMetrics = async (): Promise<{
  staticCache: number;
  dynamicCache: number;
  apiCache: number;
  totalSize: number;
}> => {
  if (!('caches' in window)) {
    return { staticCache: 0, dynamicCache: 0, apiCache: 0, totalSize: 0 };
  }

  try {
    const cacheNames = await caches.keys();
    let staticCache = 0;
    let dynamicCache = 0;
    let apiCache = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const size = await getResponseSize(response);
          
          if (cacheName.includes('static')) {
            staticCache += size;
          } else if (cacheName.includes('api')) {
            apiCache += size;
          } else {
            dynamicCache += size;
          }
        }
      }
    }

    const totalSize = staticCache + dynamicCache + apiCache;
    
    return {
      staticCache,
      dynamicCache,
      apiCache,
      totalSize
    };
  } catch (error) {
    console.error('[SW] Erro ao obter métricas de cache:', error);
    return { staticCache: 0, dynamicCache: 0, apiCache: 0, totalSize: 0 };
  }
};

const getResponseSize = async (response: Response): Promise<number> => {
  try {
    const blob = await response.clone().blob();
    return blob.size;
  } catch {
    return 0;
  }
};

// Limpar cache manualmente
export const clearAllCaches = async (): Promise<boolean> => {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] Todos os caches foram limpos');
    return true;
  } catch (error) {
    console.error('[SW] Erro ao limpar caches:', error);
    return false;
  }
};

// Forçar atualização do Service Worker
export const forceServiceWorkerUpdate = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('[SW] Service Worker atualizado forçadamente');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[SW] Erro ao forçar atualização:', error);
    return false;
  }
};

// Configurações de cache personalizadas
export const configureCacheSettings = (settings: {
  staticCacheTTL?: number;
  apiCacheTTL?: number;
  maxCacheSize?: number;
}) => {
  localStorage.setItem('cache-settings', JSON.stringify(settings));
};

export const getCacheSettings = () => {
  const settings = localStorage.getItem('cache-settings');
  return settings ? JSON.parse(settings) : {
    staticCacheTTL: 31536000, // 1 ano
    apiCacheTTL: 300, // 5 minutos
    maxCacheSize: 50 * 1024 * 1024 // 50MB
  };
}; 