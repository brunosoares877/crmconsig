import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { registerServiceWorker, requestNotificationPermission } from "./utils/serviceWorkerUtils";
import { initSentry } from "./utils/sentry";

// Inicializar Sentry primeiro
initSentry();

// Inicializar otimizações de bundle
const initBundleOptimizations = () => {
  // Preload recursos críticos
  const preloadCritical = () => {
    const criticalResources = [
      '/assets/index.css',
      '/leadconsig-logo.png'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'image';
      if (!document.querySelector(`link[href="${resource}"]`)) {
        document.head.appendChild(link);
      }
    });
  };
  
  // Resource hints para domínios críticos
  const addResourceHints = () => {
    const domains = [
      'https://xyzzkqvmjkzljjjgrwma.supabase.co',
      'https://o4507473953669120.ingest.sentry.io'
    ];
    
    domains.forEach(domain => {
      try {
        const url = new URL(domain);
        if (!document.querySelector(`link[href="${url.origin}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = url.origin;
          document.head.appendChild(link);
        }
      } catch (e) {
        // Ignorar URLs inválidas
      }
    });
  };
  
  // Executar otimizações
  preloadCritical();
  addResourceHints();
  
  // Lazy loading de imagens após carregamento inicial
  setTimeout(() => {
    document.querySelectorAll('img').forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
    });
  }, 1000);
};

// Executar otimizações de bundle
if (import.meta.env.PROD) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBundleOptimizations);
  } else {
    initBundleOptimizations();
  }
}

// Sistema de versionamento para forçar atualização do cache
const APP_VERSION = '1.0.1'; // Incrementar quando houver mudanças importantes
const STORAGE_KEY = 'app_version';

// Verificar se há nova versão
const currentVersion = localStorage.getItem(STORAGE_KEY);
if (currentVersion !== APP_VERSION) {
  // Nova versão detectada - limpar cache e recarregar
  localStorage.setItem(STORAGE_KEY, APP_VERSION);
  
  // Limpar cache do service worker se existir
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  // Forçar reload se não for a primeira visita
  if (currentVersion) {
    // window.location.reload(); // Comentado para evitar loop de recarregamento
  }
}

// Get the root element
const rootElement = document.getElementById("root");

// Make sure rootElement exists before creating root
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root and render App
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Registrar Service Worker após a aplicação carregar
if (import.meta.env.PROD) {
  registerServiceWorker().then(success => {
    if (success) {
      console.log('[SW] Service Worker registrado com sucesso');
      // Solicitar permissão para notificações
      requestNotificationPermission().then(granted => {
        if (granted) {
          console.log('[SW] Permissão para notificações concedida');
        }
      });
    }
  });
}
