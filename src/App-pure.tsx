import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Componente de Sales ultra-básico
const PureSales = () => {
  return (
    <div>
      <h1>SALES PURO FUNCIONANDO!</h1>
      <p>Versão sem dependências complexas</p>
    </div>
  );
};

// Componente de Home ultra-básico
const PureHome = () => {
  return (
    <div>
      <h1>HOME PURO FUNCIONANDO!</h1>
      <p>Versão sem dependências complexas</p>
      <a href="/sales">Ir para Sales</a>
    </div>
  );
};

// App completamente puro
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PureHome />} />
        <Route path="/sales" element={<PureSales />} />
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App; 