import React, { useState, useEffect } from 'react';

/**
 * Componente para exibir o número de usuários online.
 * @param {Object} props
 * @param {Object} props.socket - A instância do socket.io conectada
 */
function UserCount({ socket }) {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Se o socket não estiver pronto/conectado, não faz nada ainda
    if (!socket) return;

    // Listener para o evento que criamos no backend
    const handleContagem = (data) => {
      console.log("👥 Contagem recebida:", data.count);
      setUserCount(data.count);
    };

    // Registra o ouvinte
    socket.on('contagem_usuarios', handleContagem);

    // IMPORTANTE: Limpa o ouvinte quando o componente for desmontado
    // Isso evita que o contador atualize componentes que não existem mais
    return () => {
      socket.off('contagem_usuarios', handleContagem);
    };
  }, [socket]); // Recria o listener apenas se a instância do socket mudar

  return (
    <div className="bg-white/90 mt-3  backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${userCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Online</span>
        <span className="text-lg font-bold text-gray-800 leading-none">{userCount}</span>
      </div>
    </div>
  );
}

export default UserCount;