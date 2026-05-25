import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 Iniciando aplicação...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ Root element não encontrado!');
  throw new Error("Root element not found. Make sure there is a div with id='root' in your HTML.");
}

console.log('✅ Root element encontrado');

try {
  console.log('📦 Renderizando App...');
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('✅ App renderizado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao renderizar aplicação:', error);
  // Renderizar mensagem de erro simples
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: white;">
      <h1>Erro ao carregar aplicação</h1>
      <p>Por favor, recarregue a página.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Recarregar</button>
    </div>
  `;
}
