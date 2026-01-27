import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../App.css';
import { io } from 'socket.io-client';
import api from '../services/api'; 

import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import FixedBottomMenu from '../components/FixedBottomMenu';
import WeatherPill from '../components/WeatherPill';
import UserCount from '../components/UserCount';
import MapaRotaSegura from '../components/MapaRotaSegura';

const SOCKET_URL = import.meta.env.VITE_API_URL;
// Coordenadas fixas para cálculo de progresso real
const MANAUS = [-3.1190, -60.0217];
const PORTO_VELHO = [-8.7619, -63.9039];

function PaginaPrincipal() {
  // Inicializamos com MANAUS em vez de null para blindar o mapa contra erros de tipo
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(MANAUS);
  const [isNavegando, setIsNavegando] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(0); 
  const [outrosVeiculos, setOutrosVeiculos] = useState({}); 
  const [pontos, setPontos] = useState([]); 
  const socketRef = useRef(null);
  const mapaRef = useRef(null);

  // --- LÓGICA DE ORIENTAÇÃO BLINDADA ---
  const handleOrientation = useCallback((event) => {
    let heading = 0;
    if (event.alpha !== null && event.alpha !== undefined) {
      heading = 360 - event.alpha; // Android absoluto
    } else if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading; // iOS
    }
    // Forçamos a conversão para número para eliminar o erro 'found null instead'
    setDeviceHeading(Number(heading) || 0);
  }, []);

  const toggleNavegacao = async () => {
    const turningOn = !isNavegando;
    setIsNavegando(turningOn);

    if (turningOn) {
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') window.addEventListener('deviceorientation', handleOrientation, true);
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      }
    } else {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
      setDeviceHeading(0);
    }
  };

  // Cálculo Haversine para progresso dinâmico (resolve os 13%)
  const calcularDistancia = (p1, p2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(p2[0] - p1[0]);
    const dLon = toRad(p2[1] - p1[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(p1[0])) * Math.cos(toRad(p2[0])) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calcularProgressoReal = (pos) => {
    const totalRota = calcularDistancia(MANAUS, PORTO_VELHO);
    const restante = calcularDistancia(pos, PORTO_VELHO);
    const perc = ((totalRota - restante) / totalRota) * 100;
    return Math.max(0, Math.min(100, perc)).toFixed(0);
  };

  useEffect(() => {
    let token = localStorage.getItem('userToken') || `motorista_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userToken', token);
    socketRef.current = io(SOCKET_URL, { query: { userToken: token }, transports: ['polling', 'websocket'] });

    api.get('/api/pontos-de-apoio').then(res => setPontos(res.data)).catch(e => console.error(e));

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocalizacaoUsuario([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => {
      socketRef.current?.disconnect();
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-900">
      <MapaRotaSegura 
        ref={mapaRef}
        posicaoAtiva={localizacaoUsuario}
        destino={PORTO_VELHO}
        isNavegando={isNavegando}
        outrosVeiculos={outrosVeiculos}
        pontos={pontos}
        heading={deviceHeading} 
      />

      <div className="absolute inset-0 z-[2000] pointer-events-none flex flex-col justify-between">
        <div className="pointer-events-auto w-full bg-white shadow-xl border-b border-gray-200">
          <Header />
          <div className="absolute top-[70px] left-4"><UserCount socket={socketRef.current} /></div>
          <div className="absolute top-[70px] right-4"><WeatherPill /></div>
        </div>

        <div className="absolute right-5 bottom-48 flex flex-col gap-4 pointer-events-auto items-end">
          <button onClick={toggleNavegacao} className="bg-sky-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-xs uppercase tracking-widest active:scale-95">
            {isNavegando ? "Sair da Navegação" : "Iniciar Navegação"}
          </button>
          <button onClick={() => mapaRef.current?.centralizarNoUsuario()} className="bg-white text-sky-600 font-bold py-3 px-8 rounded-full shadow-lg border-2 border-sky-600 text-xs uppercase tracking-widest active:scale-95">
            Recentrar
          </button>
        </div>

        <div className="pointer-events-auto flex flex-col gap-0 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.15)]">
          <div className="w-full block leading-none overflow-hidden">
            <ProgressBar progress={calcularProgressoReal(localizacaoUsuario)} />
          </div>
          <FixedBottomMenu />
        </div>
      </div>
    </div>
  );
}

export default PaginaPrincipal;