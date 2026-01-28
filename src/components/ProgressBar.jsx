import React from 'react';

function ProgressBar({ progress, startLocation = '-', endLocation = '-', startTime = '-', remainingTime = '-', arrivalTime = '-' }) {
  const roundedProgress = Math.round(progress);

  // A MÁGICA ESTÁ AQUI: position:fixed, bottom:0 e z-index alto
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-lg p-4 z-[1000]">
      <h2 className="text-lg font-semibold mb-2">Progresso da Viagem</h2>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-blue-500 text-xl mr-2">📍</span>
          <span>{startLocation}</span>
        </div>
        <span className="text-lg font-bold">{roundedProgress}%</span>
        <div className="flex items-center">
          <span className="text-blue-500 text-xl mr-2">🏁</span>
          <span>{endLocation}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${roundedProgress}%` }}
        ></div>
      </div>
      {/* <div className="flex justify-between text-sm text-gray-600">
        <div>
          <strong>Início:</strong> {startTime}
        </div>
        <div>
          <strong>Tempo Restante:</strong> {remainingTime}
        </div>
        <div>
          <strong>Previsão de Chegada:</strong> {arrivalTime}
        </div>
      </div> */}
    </div>
  );
}

export default ProgressBar;