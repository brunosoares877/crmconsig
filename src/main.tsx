import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 MAIN.TSX EXECUTADO!", new Date().toISOString());

function updateEmergencyStatus(message: string) {
  const statusEl = document.getElementById('status-text');
  if (statusEl) statusEl.textContent = message;
  console.log("📱 STATUS:", message);
}

function initializeReact() {
  try {
    updateEmergencyStatus("Procurando elemento root...");
    
    let rootElement = document.getElementById("root");
    
    if (!rootElement) {
      console.warn("⚠️ Root não encontrado, criando...");
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }

    updateEmergencyStatus("Inicializando React...");
    
    const root = createRoot(rootElement);
    
    updateEmergencyStatus("Renderizando aplicação...");
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("✅ React renderizado com sucesso!");
    updateEmergencyStatus("Aplicação carregada!");
    
    // Remover emergency loading após 3 segundos
    setTimeout(() => {
      const emergency = document.getElementById('emergency-loading');
      if (emergency) {
        emergency.style.opacity = '0';
        emergency.style.transition = 'opacity 0.5s';
        setTimeout(() => emergency.remove(), 500);
      }
      console.log("✅ Emergency loading removido");
    }, 3000);
    
  } catch (error) {
    console.error("❌ ERRO CRÍTICO no React:", error);
    updateEmergencyStatus("ERRO: " + error);
    
    // Mostrar erro na emergency div
    const emergency = document.getElementById('emergency-loading');
    if (emergency) {
      emergency.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 20px;">❌ Erro LeadConsig</div>
          <div style="font-size: 18px; margin-bottom: 15px;">Erro: ${error}</div>
          <div style="font-size: 14px; opacity: 0.9; margin-bottom: 20px;">Verifique o console (F12)</div>
          <button onclick="location.reload()" style="
            background: white; color: #ff4444; border: none; padding: 10px 20px; 
            border-radius: 5px; font-size: 16px; cursor: pointer;
          ">🔄 Tentar Novamente</button>
        </div>
      `;
    }
  }
}

// Aguardar o DOM estar completamente pronto
if (document.readyState === 'loading') {
  updateEmergencyStatus("Aguardando DOM...");
  document.addEventListener('DOMContentLoaded', initializeReact);
} else {
  updateEmergencyStatus("DOM pronto, iniciando...");
  initializeReact();
}
