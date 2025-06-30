import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

// Componente de debug simples para Sales
const DebugSales = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f8ff',
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
        <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>
          🎉 PÁGINA SALES FUNCIONANDO!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '18px' }}>
          Esta é uma versão DEBUG da página Sales
        </p>
        <div style={{
          padding: '20px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '2px solid #16a34a',
          marginBottom: '20px'
        }}>
          <strong style={{ color: '#166534', fontSize: '20px' }}>✅ ROTEAMENTO REACT FUNCIONANDO</strong>
          <br />
          <small>Timestamp: {new Date().toLocaleString()}</small>
        </div>
        
        <div style={{ marginTop: '30px' }}>
          <h3>📍 Informações de Debug:</h3>
          <p><strong>URL atual:</strong> {window.location.href}</p>
          <p><strong>Pathname:</strong> {window.location.pathname}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 80)}...</p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>🔗 Links de Teste:</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              Home
            </Link>
            <Link to="/sales" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              Sales (atual)
            </Link>
            <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#f59e0b', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Home de debug
const DebugHome = () => {
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
          🏠 PÁGINA HOME DEBUG
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '18px' }}>
          Página inicial funcionando perfeitamente!
        </p>
        
        <div style={{ marginTop: '30px' }}>
          <h3>🎯 Teste a página Sales:</h3>
          <Link 
            to="/sales" 
            style={{ 
              padding: '15px 30px', 
              backgroundColor: '#dc2626', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            IR PARA SALES →
          </Link>
        </div>
      </div>
    </div>
  );
};

// Componente que mostra a localização atual
const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <strong>Rota atual:</strong> {location.pathname}
    </div>
  );
};

// App debug simplificado
function AppDebug() {
  return (
    <Router>
      <LocationDisplay />
      <Routes>
        <Route path="/" element={<DebugHome />} />
        <Route path="/sales" element={<DebugSales />} />
        <Route path="*" element={
          <div style={{
            minHeight: '100vh',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#fecaca',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <h1 style={{ color: '#dc2626' }}>🚫 PÁGINA NÃO ENCONTRADA</h1>
            <p>Rota: {window.location.pathname}</p>
            <Link to="/" style={{ color: '#3b82f6', fontSize: '18px' }}>← Voltar para Home</Link>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default AppDebug; 