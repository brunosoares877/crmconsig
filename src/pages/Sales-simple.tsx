import React from "react";

const SalesSimple = () => {
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
        maxWidth: '800px'
      }}>
        <h1 style={{ color: '#1e40af', marginBottom: '20px', fontSize: '36px' }}>
          🚀 LeadConsig - CRM para Corbans
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '18px' }}>
          O sistema mais completo para gestão de leads de crédito consignado
        </p>

        <div style={{
          padding: '20px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '2px solid #16a34a',
          marginBottom: '30px'
        }}>
          <strong style={{ color: '#166534', fontSize: '20px' }}>✅ PÁGINA SALES SIMPLIFICADA FUNCIONANDO</strong>
          <br />
          <small>Timestamp: {new Date().toLocaleString()}</small>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#1e40af', marginBottom: '15px' }}>💰 Planos Disponíveis</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {/* Plano Mensal */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>Plano Mensal</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '10px' }}>
                R$ 37,90/mês
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Perfeito para começar
              </p>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}>
                Escolher Plano
              </button>
            </div>

            {/* Plano Semestral */}
            <div style={{
              backgroundColor: '#eff6ff',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #3b82f6',
              textAlign: 'center'
            }}>
              <div style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '12px',
                marginBottom: '10px',
                display: 'inline-block'
              }}>
                Recomendado
              </div>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>Plano Semestral</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '5px' }}>
                R$ 187,00/6 meses
              </div>
              <div style={{ fontSize: '14px', color: '#16a34a', marginBottom: '10px' }}>
                Economize 17%
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Melhor custo-benefício
              </p>
              <button style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}>
                Escolher Plano
              </button>
            </div>

            {/* Plano Anual */}
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #16a34a',
              textAlign: 'center'
            }}>
              <div style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '12px',
                marginBottom: '10px',
                display: 'inline-block'
              }}>
                Maior Economia
              </div>
              <h3 style={{ color: '#1e40af', marginBottom: '10px' }}>Plano Anual</h3>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '5px' }}>
                R$ 297,00/ano
              </div>
              <div style={{ fontSize: '14px', color: '#16a34a', marginBottom: '10px' }}>
                Economize 34%
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Melhor investimento
              </p>
              <button style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}>
                Escolher Plano
              </button>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #f59e0b',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '10px' }}>🎯 Principais Recursos:</h3>
          <ul style={{ textAlign: 'left', color: '#92400e', margin: 0, paddingLeft: '20px' }}>
            <li>Gestão completa de leads</li>
            <li>Dashboard com métricas em tempo real</li>
            <li>Controle de comissões automático</li>
            <li>Sistema de lembretes inteligente</li>
            <li>Relatórios detalhados</li>
            <li>Suporte técnico especializado</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px' }}>
          <button style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            🚀 Começar Teste Grátis de 7 Dias
          </button>
        </div>

        <p style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          ✅ Sem cartão de crédito • ✅ Cancele quando quiser • ✅ Suporte 24/7
        </p>
      </div>
    </div>
  );
};

export default SalesSimple; 