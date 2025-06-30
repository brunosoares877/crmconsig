import React from "react";
import { Link } from "react-router-dom";

const SalesWorking = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚀 LeadConsig - CRM para Corbans
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            O sistema mais completo para gestão de leads, agendamentos e comissões para corretores de seguros
          </p>
        </div>

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plano Mensal */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Mensal</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">
                R$ 97<span className="text-lg text-gray-500">/mês</span>
              </div>
              <p className="text-gray-600 mb-6">Perfeito para começar</p>
              
              <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Começar Agora
              </button>
            </div>
          </div>

          {/* Plano Semestral */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                MAIS POPULAR
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Semestral</h3>
              <div className="text-3xl font-bold text-green-600 mb-4">
                R$ 67<span className="text-lg text-gray-500">/mês</span>
              </div>
              <p className="text-gray-600 mb-6">Economia de 31%</p>
              
              <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Escolher Plano
              </button>
            </div>
          </div>

          {/* Plano Anual */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 hover:border-purple-500 transition-colors">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Anual</h3>
              <div className="text-3xl font-bold text-purple-600 mb-4">
                R$ 57<span className="text-lg text-gray-500">/mês</span>
              </div>
              <p className="text-gray-600 mb-6">Máxima economia</p>
              
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Melhor Oferta
              </button>
            </div>
          </div>
        </div>

        {/* Recursos */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Recursos Inclusos
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-800">Gestão de Leads</h4>
                <p className="text-gray-600">Organize e acompanhe todos seus prospects</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-800">Agendamentos</h4>
                <p className="text-gray-600">Calendário inteligente para reuniões</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-800">Cálculo de Comissões</h4>
                <p className="text-gray-600">Automático e preciso</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <h4 className="font-semibold text-gray-800">Relatórios</h4>
                <p className="text-gray-600">Dashboards e métricas em tempo real</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalesWorking; 