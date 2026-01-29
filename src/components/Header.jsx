import React from 'react';
import Bemol from '../assets/MARCA_BEMOL.svg';

function Header() {
  return (
    <header className="bg-white-500 text-blue-500 shadow-2xl rounded-2xl  p-1 flex items-center justify-between">
      <div className="flex items-center">
        <img src={Bemol} alt="Logo" className="h-18 w-18 mr-9" />
        <div>
          <h1 className="text-xl font-bold">Rota Segura</h1>
          <p className="text-sm text-gray-400 font-bold">Manaus -- Porto Velho</p>
        </div>

      </div>
    </header>
  );
}

export default Header;