import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../App.css';
import { io } from 'socket.io-client';
import api from '../services/api'; 

import Header from '../components/Header';
import ProgressBar from '../components/ProgressBar';
import WeatherPill from '../components/WeatherPill';
import UserCount from '../components/UserCount';
import MapaRotaSegura from '../components/MapaRotaSegura';
import RotaBR319 from '../components/RotaBR319';
import ProfileMenu from '../components/ProfileMenu';
import { calculatePointAhead } from '../utils/calculatePointAhead';
import caminhaoBemol from '../assets/cami.png';
import AlertaFlutuante from '../components/AlertaFlutuante';
import MenuReportar from '../components/MenuReportar';

const SOCKET_URL = import.meta.env.VITE_API_URL;

// COORDENADAS RETA FINAL ADS - BEMOL
const MANAUS = [-3.1190, -60.0217];
const PORTO_VELHO = [-8.7619, -63.9039];
// so pra versionar 


const iconeVeiculo = new L.Icon({ iconUrl: caminhaoBemol, iconSize: [32, 32], iconAnchor: [16, 16] });
const iconeUsuario = new L.Icon({ iconUrl: caminhaoBemol, iconSize: [80, 80], iconAnchor: [40, 40] });
const iconeOutroMotorista = new L.Icon({
  iconUrl: caminhaoBemol,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  className: 'opacity-80'
});

function SeguirUsuario({ posicao }) {
  const map = useMap();
  useEffect(() => { if (posicao) map.flyTo(posicao, map.getZoom(), { animate: true, duration: 1 }); }, [posicao, map]);
  return null;
}

function SeguirSimulacao({ posicao }) {
  const map = useMap();
  useEffect(() => { if (posicao) map.setView(posicao); }, [posicao, map]);
  return null;
}

function PaginaPrincipal() {
  // Inicializamos com MANAUS para evitar que o mapa receba null e quebre o console
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(MANAUS);
  const [isNavegando, setIsNavegando] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(0); 
  const [pontos, setPontos] = useState([]);
  const [erro, setErro] = useState(null);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(true);
  const [temPermissaoGps, setTemPermissaoGps] = useState(false);
  const [clima, setClima] = useState({});
  const [emMovimento, setEmMovimento] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [outrosVeiculos, setOutrosVeiculos] = useState({});
  const [modalFimTrajeto, setModalFimTrajeto] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const movimentoRef = useRef(null);
  const socketRef = useRef(null);
  const mapaRef = useRef(null);

  // --- LÓGICA DE ORIENTAÇÃO (BÚSSOLA) BLINDADA ---
  const handleOrientation = useCallback((event) => {
    let heading = 0;
    if (event.webkitCompassHeading) {
      heading = event.webkitCompassHeading; // iOS
    } else if (event.alpha !== null && event.alpha !== undefined) {
      heading = 360 - event.alpha; // Android Absoluto
    }
    setDeviceHeading(Number(heading) || 0); // Blindagem contra null/NaN
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
    if (!p1 || !p2) return 0;
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
    setSocket(socketRef.current);

    socketRef.current.on('nova_posicao_veiculo', (dados) => {
      setOutrosVeiculos(prev => ({ ...prev, [dados.socketId]: dados }));
    });

    socketRef.current.on('veiculo_saiu', (id) => {
      setOutrosVeiculos(prev => {
        const novo = { ...prev };
        delete novo[id];
        return novo;
      });
    });

    socketRef.current.on('atualizacao_clima', (dados) => {
      setClima(dados);
    });

    // Busca pontos com validação rigorosa para evitar erro de .map
    api.get('/api/pontos-de-apoio')
      .then(res => setPontos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPontos([]));

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
      
      {/* Container do mapa, sem a classe 'mapa-modo-uber' */}
      <div className="w-full h-full">
        <MapaRotaSegura 
          ref={mapaRef}
          posicaoAtiva={localizacaoUsuario}
          destino={PORTO_VELHO}
          isNavegando={isNavegando}
          outrosVeiculos={outrosVeiculos}
          pontos={pontos}
          heading={deviceHeading} 
        />
      </div>

      {/* Header posicionado de forma absoluta no topo */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-auto">
        <div className="bg-white shadow-xl border-b border-gray-200">
          <Header onProfileClick={() => setIsProfileOpen(true)} />
        </div>
        <div className="absolute top-[70px] left-4"><UserCount socket={socket} /></div>
        <div className="absolute top-[70px] right-4"><WeatherPill condition={clima.condition} temp={clima.temp} isCritical={clima.isCritical} mensagem={clima.mensagem} /></div>
      </div>

      {/* ProgressBar agora é o nosso painel de controle */}
      <ProgressBar 
        progress={calcularProgressoReal(localizacaoUsuario)}
        isNavegando={isNavegando}
        onToggleNavegacao={toggleNavegacao}
        onRecentrar={() => mapaRef.current?.centralizarNoUsuario()}
      />

      {/* ProfileMenu, que também usa posicionamento fixo e z-index alto */}
      <ProfileMenu 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
      <AlertaFlutuante /> {/* Componente para exibir alertas de obstáculos em tempo real */}

      <MenuReportar /> {/* Componente para reportar perigos, posicionado de forma fixa */}
    </div>
  );
}

export default PaginaPrincipal;