import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 LEADCONSIG INICIANDO - Versão Debug", new Date().toISOString());

// Criar indicador visual imediatamente
function createLoadingIndicator() {
  const loading = document.createElement('div');
  loading.id = 'loading-indicator';
  loading.innerHTML = `
    <div style="
      position: fixed; 
      top: 0; left: 0; 
      width: 100%; height: 100%; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center; 
      z-index: 9999;
      font-family: Arial, sans-serif;
      color: white;
    ">
      <div style="font-size: 24px; margin-bottom: 20px;">⚡ LeadConsig CRM</div>
      <div style="font-size: 16px; margin-bottom: 10px;">Carregando aplicação...</div>
      <div style="font-size: 12px; opacity: 0.8;" id="debug-status">Inicializando...</div>
    </div>
  `;
  document.body.appendChild(loading);
  return loading;
}

function updateStatus(message: string) {
  console.log("📱 STATUS:", message);
  const statusEl = document.getElementById('debug-status');
  if (statusEl) statusEl.textContent = message;
}

function removeLoadingIndicator() {
  const loading = document.getElementById('loading-indicator');
  if (loading) loading.remove();
}

function initializeApp() {
  try {
    updateStatus("Verificando DOM...");
    console.log("📋 Document ready state:", document.readyState);
    console.log("📋 User Agent:", navigator.userAgent);
    
    // Get the root element
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("❌ Root element não encontrado!");
      console.error("📋 Document body:", document.body);
      console.error("📋 Document children:", document.children);
      
      updateStatus("ERRO: Root element não encontrado!");
      
      // Criar root element se não existir
      const newRoot = document.createElement('div');
      newRoot.id = 'root';
      document.body.appendChild(newRoot);
      console.log("✅ Root element criado manualmente");
      updateStatus("Root element criado, tentando novamente...");
      
      setTimeout(() => initializeApp(), 100);
      return;
    }

    updateStatus("Root encontrado, iniciando React...");
    console.log("✅ Root element encontrado:", rootElement);

    // Create root and render App
    updateStatus("Criando aplicação React...");
    const root = createRoot(rootElement);
    
    updateStatus("Renderizando aplicação...");
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("✅ Aplicação renderizada com sucesso!");
    updateStatus("Aplicação carregada!");
    
    // Remover loading após 2 segundos
    setTimeout(() => {
      removeLoadingIndicator();
      console.log("✅ Loading indicator removido");
    }, 2000);
    
  } catch (error) {
    console.error("❌ ERRO CRÍTICO ao renderizar aplicação:", error);
    updateStatus(`ERRO: ${error}`);
    
    // Mostrar erro na tela
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: #ff4444; color: white; 
        display: flex; align-items: center; justify-content: center; 
        font-family: Arial; text-align: center; z-index: 10000;
      ">
        <div>
          <h2>❌ Erro no LeadConsig</h2>
          <p>Erro: ${error}</p>
          <p style="font-size: 12px;">Verifique o console do navegador</p>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
}

// Criar loading indicator imediatamente
const loadingEl = createLoadingIndicator();

// Aguardar DOM estar pronto
if (document.readyState === 'loading') {
  updateStatus("Aguardando DOM carregar...");
  console.log("⏳ Aguardando DOM carregar...");
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  updateStatus("DOM já carregado, inicializando...");
  console.log("✅ DOM já carregado, inicializando...");
  initializeApp();
}

// Timeout de segurança
setTimeout(() => {
  if (document.getElementById('loading-indicator')) {
    console.error("⚠️ TIMEOUT: Aplicação não carregou em 10 segundos");
    updateStatus("TIMEOUT - Aplicação não carregou");
  }
}, 10000);
