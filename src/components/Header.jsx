import React from 'react';
import Bemol from '../assets/MARCA_BEMOL.svg';

// O Header agora recebe a propriedade onProfileClick
function Header({ onProfileClick }) {
  return (
    <header className="bg-white-500 text-blue-500 shadow-2xl rounded-2xl p-1 flex items-center justify-between">
      {/* Lado Esquerdo: Logo e Título */}
      <div className="flex items-center">
        <img src={Bemol} alt="Logo" className="h-18 w-18 mr-9" />
        <div>
          <h1 className="text-xl font-bold">Rota Segura</h1>
          <p className="text-sm text-gray-400 font-bold">Manaus -- Porto Velho</p>
        </div>
      </div>

      {/* Lado Direito: Botão de Perfil */}
      <div className="pr-4">
        <button onClick={onProfileClick} className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
          {/* Ícone de Perfil (SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;