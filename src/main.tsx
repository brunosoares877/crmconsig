import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

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
