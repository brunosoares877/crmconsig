import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Componente de teste simples
const TestPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f9ff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#1e40af', marginBottom: '1rem' }}>
          🎉 LeadConsig FUNCIONANDO!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Site carregando no Netlify! Cache invalidated!
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#dcfce7',
          borderRadius: '4px',
          border: '1px solid #16a34a'
        }}>
          <strong style={{ color: '#166534' }}>✅ Sistema Online</strong>
          <br />
          <small>BUILD ÚNICO: {Date.now()} - {new Date().toLocaleString()}</small>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
