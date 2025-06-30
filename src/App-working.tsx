import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import pages
import Index from "@/pages/Index";
import SalesWorking from "@/pages/Sales-working";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sales" element={<SalesWorking />} />
          <Route path="*" element={<div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-gray-600">Página não encontrada</p>
            </div>
          </div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 