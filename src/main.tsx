import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 Iniciando LeadConsig...");

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element não encontrado!");
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
