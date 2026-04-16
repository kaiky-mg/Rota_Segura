import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Conexão com o backend
const SOCKET_URL = 'http://localhost:8080';
const motoristaTesteId = "d9c936c9-6c3f-436b-ad44-f2040ed3f997";

export default function AlertaFlutuante() {
  const [alertaAtual, setAlertaAtual] = useState(null);

  useEffect(() => {
    // Inicia a escuta silenciosa
    const socket = io(SOCKET_URL, {
      query: { userToken: motoristaTesteId }
    });

    socket.on('alerta_na_pista', (novoObstaculo) => {
      console.log('Alerta recebido do backend:', novoObstaculo);
      setAlertaAtual(novoObstaculo); 
    });

    return () => socket.disconnect();
  }, []);

  // Fica invisível enquanto não houver perigo
  if (!alertaAtual) return null;

  return (
    // Overlay escuro de fundo (z-[9999] garante que fique acima de mapas ou menus)
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
      
      {/* Card Principal */}
      <div className="bg-white rounded-2xl p-6 w-full max-w-[350px] relative shadow-2xl text-center animate-fade-in-up">
        
        {/* Botão Fechar */}
        <button 
          className="absolute top-3 right-4 bg-transparent border-none text-xl cursor-pointer text-gray-400 hover:text-gray-800 transition-colors"
          onClick={() => setAlertaAtual(null)}
        >
          ✕
        </button>
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-center mb-4">
          <span className="text-3xl mr-2">⚠️</span>
          <h2 className="m-0 text-xl font-bold text-gray-800">Obstáculo à Frente!</h2>
        </div>

        {/* Corpo do Alerta */}
        <div className="text-left mb-6 px-2">
          <p className="font-bold my-1 text-gray-700">
            Perigo Reportado: <span className="text-red-600">{alertaAtual.tipo.replace(/_/g, ' ')}</span>
          </p>
          <p className="my-1 text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Atenção:</strong> {alertaAtual.descricao}
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 justify-center">
          <button 
            className="bg-white text-blue-600 border-2 border-blue-600 py-2 px-4 rounded-full font-bold flex-1 hover:bg-blue-50 transition-colors"
            onClick={() => setAlertaAtual(null)}
          >
            Detalhes
          </button>
          <button 
            className="bg-blue-600 text-white border-2 border-blue-600 py-2 px-4 rounded-full font-bold flex-1 hover:bg-blue-700 shadow-md transition-colors"
            onClick={() => alert('Rota de confirmação na próxima sprint!')}
          >
            Confirmar
          </button>
        </div>

      </div>
    </div>
  );
}