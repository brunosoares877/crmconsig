const CACHE_NAME = 'leadconsig-v2.0.0';
const STATIC_CACHE = 'leadconsig-static-v2.0.0';
const DYNAMIC_CACHE = 'leadconsig-dynamic-v2.0.0';
const API_CACHE = 'leadconsig-api-v2.0.0';

// Assets críticos para cache imediato
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/leadconsig-logo.png'
];

// Assets estáticos para cache
const STATIC_ASSETS = [
  '/assets/index.js',
  '/assets/index.css',
  '/fonts/inter-latin-wght-normal.woff2'
];

// URLs da API que devem ser cacheadas
const CACHEABLE_API_PATHS = [
  '/api/leads',
  '/api/stats',
  '/api/dashboard'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      }),
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/'));
      })
    ])
  );
  
  // Força ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => 
            cacheName.startsWith('leadconsig-') && 
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== API_CACHE
          )
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  // Toma controle imediatamente
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não HTTP
  if (!request.url.startsWith('http')) return;
  
  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
  }
});

// Verificar se é asset estático
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/);
}

// Verificar se é request de API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase.co') ||
         CACHEABLE_API_PATHS.some(path => url.pathname.includes(path));
}

// Verificar se é request de página
function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Estratégia: Cache First (para assets estáticos)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Cache First failed:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

// Estratégia: Network First (para API)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      // Cache apenas GET requests da API
      if (request.method === 'GET') {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({ 
      error: 'Offline - API not available',
      offline: true 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estratégia: Stale While Revalidate (para páginas)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Se network falhar, retorna index.html para SPA
    return cache.match('/index.html');
  });
  
  // Retorna cache imediatamente se disponível, senão espera network
  return cachedResponse || fetchPromise;
}

// Background Sync para requests falhados
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Revalidar cache da API
    const apiCache = await caches.open(API_CACHE);
    const apiRequests = await apiCache.keys();
    
    for (const request of apiRequests.slice(0, 10)) { // Limitar a 10 requests
      try {
        const response = await fetch(request);
        if (response.ok) {
          await apiCache.put(request, response);
        }
      } catch (error) {
        console.log('[SW] Background sync failed for:', request.url);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync error:', error);
  }
}

// Push notifications (para futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/leadconsig-logo.png',
        badge: '/leadconsig-logo.png',
        tag: 'leadconsig-notification'
      })
    );
  }
});

// Limpeza automática do cache
setInterval(() => {
  cleanupCache();
}, 24 * 60 * 60 * 1000); // 24 horas

async function cleanupCache() {
  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // Remove itens mais antigos que 30 dias
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader && new Date(dateHeader).getTime() < thirtyDaysAgo) {
            await cache.delete(request);
            console.log('[SW] Cleaned old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.log('[SW] Cache cleanup error:', error);
  }
} 