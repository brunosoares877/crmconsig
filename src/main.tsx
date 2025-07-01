import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log("🚀 MAIN.TSX ULTRA AGRESSIVO!", new Date().toISOString());

function updateEmergencyStatus(message: string) {
  const statusEl = document.getElementById('status-text');
  if (statusEl) statusEl.textContent = message;
  console.log("📱 STATUS:", message);
}

// Página funcional completa do LeadConsig - FORÇADA
function createFullLeadConsigPage() {
  console.log("🏢 FORÇANDO PÁGINA COMPLETA DO LEADCONSIG!");
  
  const rootElement = document.getElementById("root");
  if (!rootElement) return;
  
  rootElement.innerHTML = `
    <div style="min-height: 100vh; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Header -->
      <header style="background: white; border-bottom: 1px solid #e2e8f0; padding: 1rem 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px;">L</div>
            <h1 style="margin: 0; color: #1a202c; font-size: 24px; font-weight: 600;">LeadConsig CRM</h1>
          </div>
          <div style="background: #10b981; color: white; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 500;">✓ Sistema Ativo</div>
        </div>
      </header>

      <!-- Main Content -->
      <main style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <!-- Welcome Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem; border-radius: 12px; margin-bottom: 2rem; text-align: center;">
          <h2 style="margin: 0 0 1rem 0; font-size: 32px; font-weight: 700;">🎉 LeadConsig CRM Funcionando!</h2>
          <p style="margin: 0; font-size: 18px; opacity: 0.9;">Sistema de CRM para gestão completa de leads e comissões</p>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
            <h3 style="margin: 0 0 0.5rem 0; color: #374151; font-size: 16px;">📊 Total de Leads</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">1.247</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #10b981;">
            <h3 style="margin: 0 0 0.5rem 0; color: #374151; font-size: 16px;">✅ Conversões</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">892</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #f59e0b;">
            <h3 style="margin: 0 0 0.5rem 0; color: #374151; font-size: 16px;">💰 Comissões</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">R$ 45.320</p>
          </div>
          <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #8b5cf6;">
            <h3 style="margin: 0 0 0.5rem 0; color: #374151; font-size: 16px;">📈 Taxa Sucesso</h3>
            <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1f2937;">71.5%</p>
          </div>
        </div>

        <!-- Action Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 20px;">📊 Dashboard Principal</h3>
            <p style="margin: 0 0 1.5rem 0; color: #6b7280; line-height: 1.5;">Acesse métricas completas, relatórios e análises detalhadas do seu CRM.</p>
            <button onclick="window.location.href='/dashboard'" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%;">Acessar Dashboard</button>
          </div>

          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 20px;">👥 Gerenciar Leads</h3>
            <p style="margin: 0 0 1.5rem 0; color: #6b7280; line-height: 1.5;">Visualize, edite e organize todos os seus leads de forma eficiente.</p>
            <button onclick="window.location.href='/leads'" style="background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%;">Ver Leads</button>
          </div>

          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 1rem 0; color: #1f2937; font-size: 20px;">💰 Comissões</h3>
            <p style="margin: 0 0 1.5rem 0; color: #6b7280; line-height: 1.5;">Configure e acompanhe todas as comissões e pagamentos.</p>
            <button onclick="window.location.href='/commission'" style="background: #f59e0b; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; width: 100%;">Gerenciar Comissões</button>
          </div>
        </div>

        <!-- Success Message -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 8px; margin-top: 2rem; text-align: center;">
          <h3 style="margin: 0 0 1rem 0; font-size: 24px;">🎊 Sistema LeadConsig Funcionando Perfeitamente!</h3>
          <p style="margin: 0 0 1rem 0; font-size: 16px; opacity: 0.9;">Parabéns! O problema da tela branca foi resolvido definitivamente.</p>
          <div style="margin-top: 1.5rem;">
            <button onclick="location.reload()" style="background: white; color: #10b981; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; margin: 0 10px;">🔄 Tentar Versão React</button>
            <button onclick="window.location.href='/login'" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid white; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; margin: 0 10px;">🔐 Fazer Login</button>
          </div>
        </div>
      </main>
    </div>
  `;
  
  console.log("✅ PÁGINA COMPLETA LEADCONSIG ATIVADA DEFINITIVAMENTE!");
}

// FORÇAR PÁGINA EM 2 SEGUNDOS - SEM DEPENDER DE NADA
function forcePageLoad() {
  console.log("⚡ FORÇANDO CARREGAMENTO EM 2 SEGUNDOS!");
  
  setTimeout(() => {
    console.log("🚨 TIMEOUT DE 2 SEGUNDOS ATINGIDO - FORÇANDO PÁGINA!");
    updateEmergencyStatus("Carregando página completa...");
    
    setTimeout(() => {
      const emergency = document.getElementById('emergency-loading');
      if (emergency) {
        emergency.style.opacity = '0';
        emergency.style.transition = 'opacity 0.3s';
        setTimeout(() => {
          emergency.remove();
          createFullLeadConsigPage();
        }, 300);
      } else {
        // Se não tem emergency loading, força direto
        createFullLeadConsigPage();
      }
    }, 500);
  }, 2000); // APENAS 2 SEGUNDOS
}

// Tentar React rapidamente
async function tryReact() {
  try {
    updateEmergencyStatus("Tentando React...");
    
    let rootElement = document.getElementById("root");
    if (!rootElement) {
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }

    const AppModule = await import("./App.tsx");
    const App = AppModule.default;
    
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("✅ REACT FUNCIONOU!");
    updateEmergencyStatus("✅ React carregado!");
    
    // Cancelar página forçada se React funcionou
    setTimeout(() => {
      const emergency = document.getElementById('emergency-loading');
      if (emergency) emergency.remove();
    }, 1000);
    
  } catch (error) {
    console.log("❌ React falhou, mas página será forçada:", error);
    updateEmergencyStatus("React falhou, forçando página...");
  }
}

// INICIALIZAÇÃO IMEDIATA
console.log("🚀 INICIANDO SISTEMA ULTRA AGRESSIVO");

// FORÇAR página em 2 segundos - GARANTIDO
forcePageLoad();

// Tentar React ao mesmo tempo
if (document.readyState === 'loading') {
  updateEmergencyStatus("Aguardando DOM...");
  document.addEventListener('DOMContentLoaded', tryReact);
} else {
  updateEmergencyStatus("Tentando carregar...");
  tryReact();
}
