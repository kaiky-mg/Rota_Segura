import React from 'react';

export default function TrajetoModal({ visible, onClose, onStart, onDirectionSelect }) {
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', minWidth: 320 }}>
        <h3>Qual o sentido da rota?</h3>
        <button style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, marginRight: 16, cursor: 'pointer' }} onClick={() => { onDirectionSelect('ida'); onStart(); }}>
          Ida para Porto Velho
        </button>
        <button style={{ padding: '8px 16px', background: '#fff', color: '#d32f2f', border: '1px solid #d32f2f', borderRadius: 4, cursor: 'pointer' }} onClick={() => { onDirectionSelect('volta'); onClose(); }}>
          Volta para Manaus
        </button>
        <button style={{ marginTop: 24, padding: '6px 12px', background: '#eee', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
