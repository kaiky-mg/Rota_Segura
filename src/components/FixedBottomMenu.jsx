import React from 'react';

function FixedBottomMenu({ onMenuClick }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t flex justify-around items-center py-2 z-[1001]">
      <button
        onClick={() => onMenuClick('rota')}
        className="flex flex-col items-center text-sm text-gray-600 hover:text-blue-500 transition"
      >
        <span className="text-xl">📘</span>
        <span>Rota</span>
      </button>
      <button
        onClick={() => onMenuClick('alertas')}
        className="flex flex-col items-center text-sm text-gray-600 hover:text-blue-500 transition"
      >
        <span className="text-xl">⚠️</span>
        <span>Alertas</span>
      </button>
      <button
        onClick={() => onMenuClick('perfil')}
        className="flex flex-col items-center text-sm text-gray-600 hover:text-blue-500 transition"
      >
        <span className="text-xl">👤</span>
        <span>Perfil</span>
      </button>
    </div>
  );
}

export default FixedBottomMenu;