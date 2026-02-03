import React from 'react';

function ProgressBar({ 
  progress, 
  isNavegando, 
  onToggleNavegacao, 
  onRecentrar 
}) {
  const roundedProgress = Math.round(progress);

  return (
    // Container principal fixo na base da tela
    <div className="fixed bottom-0 left-0 w-full p-4 z-[1000] pointer-events-auto">
      <div className="bg-white rounded-2xl shadow-lg p-4">
        
        {/* Container dos Botões */}
        <div className="flex justify-center gap-4 mb-4">
          <button 
            onClick={onToggleNavegacao} 
            className="flex-1 bg-sky-600 text-white font-bold py-3 px-6 rounded-full shadow-lg text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            {isNavegando ? "Sair da Navegação" : "Iniciar Navegação"}
          </button>
          <button 
            onClick={onRecentrar} 
            className="flex-1 bg-white text-sky-600 font-bold py-3 px-6 rounded-full shadow-lg border-2 border-sky-600 text-xs uppercase tracking-widest active:scale-95 transition-all"
          >
            Recentralizar
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${roundedProgress}%` }}
          ></div>
        </div>

        {/* Título e Porcentagem */}
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Progresso da Viagem
          </p>
          <p className="text-sm font-bold text-gray-800">
            {roundedProgress}%
          </p>
        </div>

      </div>
    </div>
  );
}

export default ProgressBar;