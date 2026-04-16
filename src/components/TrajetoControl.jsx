import React from 'react';

export default function TrajetoControl({ emMovimento, onIniciar, onFinalizar }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
      {!emMovimento && (
        <button style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={onIniciar}>
          Iniciar Trajeto
        </button>
      )}
      {emMovimento && (
        <button style={{ padding: '8px 16px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={onFinalizar}>
          Finalizar Trajeto
        </button>
      )}
    </div>
  );
}
