import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import { io } from 'socket.io-client';

// --- COMPONENTES ---
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import ProgressBar from '../components/ProgressBar';
import FixedBottomMenu from '../components/FixedBottomMenu';
import WeatherPill from '../components/WeatherPill';
import UserCount from '../components/UserCount';
import MapaRotaSegura from '../components/MapaRotaSegura';

// --- CONSTANTES ---
const SOCKET_URL = import.meta.env.VITE_API_URL;
const PORTO_VELHO = [-8.7619, -63.9039];
const MANAUS = [-3.1190, -60.0217];

function PaginaPrincipal() {
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [isNavegando, setIsNavegando] = useState(false);
  const [outrosVeiculos, setOutrosVeiculos] = useState({});
  const [pontos, setPontos] = useState([]);
  const socketRef = useRef(null);

  // Cálculo de distância (Fórmula de Haversine) para evitar erro do 'geolib'
  const calcularProgressoReal = () => {
    if (!localizacaoUsuario) return 0;
    
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Raio da Terra em km

    const dLat = toRad(PORTO_VELHO[0] - localizacaoUsuario[0]);
    const dLon = toRad(PORTO_VELHO[1] - localizacaoUsuario[1]);

    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(localizacaoUsuario[0])) * Math.cos(toRad(PORTO_VELHO[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaRestante = R * c;
    const distanciaTotal = 870; // Extensão aproximada da BR-319

    const progresso = ((distanciaTotal - distanciaRestante) / distanciaTotal) * 100;
    return Math.max(0, Math.min(100, progresso)).toFixed(0);
  };

  useEffect(() => {
    // Configuração do Socket
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    // Monitorização do GPS real
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setLocalizacaoUsuario(p);
        socketRef.current.emit('atualizar_posicao', { 
          lat: p[0], 
          lng: p[1], 
          usuarioId: 'Motorista' 
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => {
      socketRef.current.disconnect();
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-900">
      
      {/* 1. MAPA (Fundo) */}
      <MapaRotaSegura 
        posicaoAtiva={localizacaoUsuario || MANAUS}
        destino={PORTO_VELHO}
        isNavegando={isNavegando}
        outrosVeiculos={outrosVeiculos}
        pontos={pontos}
      />

      {/* 2. CAMADA DE UI (Z-Index Superior) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
        
        {/* Topo: Header e Informações */}
        <div className="pointer-events-auto">
          <Header />
          <div className="absolute top-20 right-4 flex flex-col gap-2">
            <WeatherPill />
            <UserCount />
          </div>
        </div>

        {/* Centro-Direita: Botão de Navegação */}
        <div className="p-6 pointer-events-auto self-end mb-20">
          <FloatingActionButton 
            onClick={() => setIsNavegando(!isNavegando)} 
            icon={isNavegando ? "🗺️" : "🧭"} 
          />
        </div>

        {/* Base: Barra de Progresso e Menu (SEM GAP) */}
        <div className="bg-white/95 backdrop-blur-md pointer-events-auto border-t border-gray-200">
          <ProgressBar progress={calcularProgressoReal()} />
          <FixedBottomMenu />
        </div>
      </div>
    </div>
  );
}

export default PaginaPrincipal;