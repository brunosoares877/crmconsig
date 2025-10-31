import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id='root' in your HTML.");
}

// Log para debug em produção
console.log('Iniciando aplicação...');
console.log('Variáveis de ambiente:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? '✓ Configurada' : '✗ Não configurada',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Configurada' : '✗ Não configurada',
});

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
