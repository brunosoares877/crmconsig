import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Apenas as páginas essenciais (sem contextos complexos)
import SalesSimple from "@/pages/Sales-simple";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

// Componentes básicos (sem os problemáticos)
import { Toaster } from "@/components/ui/sonner";

// Create a simple client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Componente simples para debug
const SimpleDebugHome = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#fef3c7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ color: '#d97706', marginBottom: '20px' }}>
          🏠 LEADCONSIG - HOME
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '18px' }}>
          Versão híbrida funcionando!
        </p>
        
        <div style={{ marginTop: '30px' }}>
          <a 
            href="/sales" 
            style={{ 
              padding: '15px 30px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            IR PARA SALES ORIGINAL →
          </a>
        </div>
      </div>
    </div>
  );
};

function AppHybrid() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rotas básicas */}
          <Route path="/" element={<SimpleDebugHome />} />
          <Route path="/sales" element={<SalesSimple />} />
          <Route path="/login" element={<Login />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default AppHybrid; 