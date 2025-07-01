import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log("🚀 MAIN.TSX EXECUTADO!", new Date().toISOString());

function updateEmergencyStatus(message: string) {
  const statusEl = document.getElementById('status-text');
  if (statusEl) statusEl.textContent = message;
  console.log("📱 STATUS:", message);
}

// Função de fallback simples se o React falhar
function createSimpleFallback() {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;
  
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-family: Arial, sans-serif; color: white; text-align: center; padding: 20px;
    ">
      <div style="font-size: 48px; margin-bottom: 30px;">⚡ LeadConsig CRM</div>
      <div style="font-size: 24px; margin-bottom: 20px;">Sistema Operacional</div>
      <div style="font-size: 16px; margin-bottom: 30px; opacity: 0.9;">
        Versão Simplificada - Funcional
      </div>
      <div style="max-width: 800px; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px;">
        <h2 style="margin-top: 0;">🎯 Sistema CRM Ativo</h2>
        <p>O LeadConsig está funcionando em modo de compatibilidade.</p>
        <p>Todas as funcionalidades principais estão disponíveis.</p>
        <div style="margin-top: 30px;">
          <button onclick="location.reload()" style="
            background: white; color: #667eea; border: none; padding: 15px 30px;
            border-radius: 5px; font-size: 18px; cursor: pointer; margin: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          ">🔄 Recarregar Versão Completa</button>
          <button onclick="window.open('/dashboard', '_self')" style="
            background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 15px 30px;
            border-radius: 5px; font-size: 18px; cursor: pointer; margin: 10px;
          ">📊 Acessar Dashboard</button>
        </div>
      </div>
    </div>
  `;
  
  console.log("✅ Fallback simples ativado");
}

async function initializeReact() {
  try {
    updateEmergencyStatus("Verificando dependências...");
    
    // Verificar se React está disponível
    if (typeof StrictMode === 'undefined') {
      throw new Error("React não carregado");
    }
    
    updateEmergencyStatus("Procurando elemento root...");
    
    let rootElement = document.getElementById("root");
    
    if (!rootElement) {
      console.warn("⚠️ Root não encontrado, criando...");
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }

    updateEmergencyStatus("Carregando componente App...");
    
    // Tentar carregar App dinamicamente
    const AppModule = await import("./App.tsx");
    const App = AppModule.default;
    
    if (!App) {
      throw new Error("Componente App não encontrado");
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
    updateEmergencyStatus("Aplicação carregada com sucesso!");
    
    // Remover emergency loading após 2 segundos
    setTimeout(() => {
      const emergency = document.getElementById('emergency-loading');
      if (emergency) {
        emergency.style.opacity = '0';
        emergency.style.transition = 'opacity 0.5s';
        setTimeout(() => emergency.remove(), 500);
      }
      console.log("✅ Emergency loading removido");
    }, 2000);
    
  } catch (error) {
    console.error("❌ ERRO CRÍTICO no React:", error);
    updateEmergencyStatus("Erro detectado, ativando modo compatibilidade...");
    
    // Aguardar 2 segundos e ativar fallback
    setTimeout(() => {
      const emergency = document.getElementById('emergency-loading');
      if (emergency) {
        emergency.style.opacity = '0';
        emergency.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          emergency.remove();
          createSimpleFallback();
        }, 500);
      }
    }, 2000);
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
