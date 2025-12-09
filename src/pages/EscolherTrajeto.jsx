import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function EscolherTrajeto() {
  const navigate = useNavigate();

  const handleEscolher = (sentido) => {
    if (sentido === 'ida') {
      localStorage.setItem('sentidoRota', 'ida');
      navigate('/rota');
    } else {
      alert('Por enquanto só está disponível a rota de ida para Porto Velho.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', minWidth: 320 }}>
        <h2>Escolha o sentido da rota</h2>
        <button style={{ padding: '12px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, marginRight: 16, cursor: 'pointer', fontSize: 16 }} onClick={() => handleEscolher('ida')}>
          Ida para Porto Velho
        </button>
        <button style={{ padding: '12px 24px', background: '#fff', color: '#d32f2f', border: '2px solid #d32f2f', borderRadius: 6, cursor: 'pointer', fontSize: 16 }} onClick={() => handleEscolher('volta')}>
          Volta para Manaus
        </button>
      </div>
    </div>
  );
}
