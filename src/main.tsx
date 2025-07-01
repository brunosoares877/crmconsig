import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 Iniciando LeadConsig...");

function initializeApp() {
  console.log("📋 Document ready state:", document.readyState);
  
  // Get the root element
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("❌ Root element não encontrado!");
    console.error("DOM innerHTML:", document.body?.innerHTML);
    throw new Error("Root element not found");
  }

  console.log("✅ Root element encontrado, criando aplicação...");

  // Create root and render App
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log("✅ Aplicação renderizada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao renderizar aplicação:", error);
  }
}

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  console.log("⏳ Aguardando DOM carregar...");
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log("✅ DOM já carregado, inicializando...");
  initializeApp();
}
