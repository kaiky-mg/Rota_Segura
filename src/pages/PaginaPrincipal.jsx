import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import '../App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import api from '../services/api';

import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import ProgressBar from '../components/ProgressBar';
import FixedBottomMenu from '../components/FixedBottomMenu';
import WeatherPill from '../components/WeatherPill';
import UserCount from '../components/UserCount';
import RotaBR319 from '../components/RotaBR319';
import ProfileMenu from '../components/ProfileMenu';
import { calculatePointAhead } from '../utils/calculatePointAhead';
import caminhaoBemol from '../assets/cami.png';

const SOCKET_URL = import.meta.env.VITE_API_URL;
const ENDPOINTS = {
  PONTOS: '/api/pontos-de-apoio',
  CLIMA: '/api/pontos-de-apoio/clima'
};
const CENTRO_PADRAO = [-3.1190, -60.0217]; 
const PORTO_VELHO = [-8.7619, -63.9039];

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
  const [pontos, setPontos] = useState([]);
  const [erro, setErro] = useState(null);
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(CENTRO_PADRAO);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(true);
  const [temPermissaoGps, setTemPermissaoGps] = useState(false);
  const [clima, setClima] = useState({});
  const [emMovimento, setEmMovimento] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [outrosVeiculos, setOutrosVeiculos] = useState({});
  const [modalFimTrajeto, setModalFimTrajeto] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const movimentoRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let userToken = localStorage.getItem('userToken') || `user_${Date.now()}`;
    localStorage.setItem('userToken', userToken);

    socketRef.current = io(SOCKET_URL, {
      query: { userToken },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => console.log('✅ WebSocket Conectado'));
    socketRef.current.on('nova_posicao_veiculo', (dados) => {
      setOutrosVeiculos(prev => ({ ...prev, [dados.socketId]: dados }));
    });
    socketRef.current.on('veiculo_saiu', (id) => {
      setOutrosVeiculos(prev => { const n = { ...prev }; delete n[id]; return n; });
    });
    socketRef.current.on('alerta_na_pista', (d) => alert(`⚠️ ALERTA: ${d.tipo}`));
    socketRef.current.on('atualizacao_clima', (d) => setClima(d));

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    let watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocalizacaoUsuario([latitude, longitude]);
        setTemPermissaoGps(true);
        setObtendoLocalizacao(false);

        if (socketRef.current && !emMovimento) {
          socketRef.current.emit('atualizar_posicao', { lat: latitude, lng: longitude, usuarioId: 'Motorista Real' });
        }
      },
      () => setObtendoLocalizacao(false),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [emMovimento]);

  useEffect(() => {
    api.get(ENDPOINTS.PONTOS)
      .then(res => setPontos(res.data))
      .catch(() => setErro("Não foi possível carregar os pontos de apoio."));
  }, []);

  const pontosOrdenados = [...pontos].sort((a, b) => b.latitude - a.latitude);
  const rotaCoordenadas = pontosOrdenados.map(p => [p.latitude, p.longitude]);

  const alternarMovimento = () => {
    if (emMovimento) {
      clearInterval(movimentoRef.current);
      setEmMovimento(false);
    } else {
      setEmMovimento(true);
      movimentoRef.current = setInterval(() => {
        setIndiceAtual((prev) => {
          if (prev < rotaCoordenadas.length - 1) {
            const nextIndex = prev + 1;
            const pos = rotaCoordenadas[nextIndex];
            socketRef.current?.emit('atualizar_posicao', { lat: pos[0], lng: pos[1], usuarioId: 'Simulação' });
            return nextIndex;
          }
          clearInterval(movimentoRef.current);
          setEmMovimento(false);
          setModalFimTrajeto(true);
          return prev;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (emMovimento && rotaCoordenadas.length > 0) {
      const ponto20km = calculatePointAhead(rotaCoordenadas, 20000);
      api.get(ENDPOINTS.CLIMA, { params: { lat: ponto20km[0], lng: ponto20km[1] } })
        .then(res => setClima(res.data))
        .catch(err => console.error('Erro clima:', err));
    }
  }, [indiceAtual, emMovimento]);

  if (obtendoLocalizacao) return <div className="h-screen flex items-center justify-center">Sincronizando satélites...</div>;

  return (
    <div className='flex flex-col h-screen relative'>
      <Header />
      
      <div className="absolute top-20 right-4 z-[1007]">
        <WeatherPill {...clima} />
      </div>

      <div className="absolute top-20 left-4 z-[1007]">
        <UserCount socket={socketRef.current} />
      </div>
      
      <FloatingActionButton onClick={alternarMovimento} icon="➕" />

      <ProgressBar progress={(rotaCoordenadas.length > 1 ? (indiceAtual / (rotaCoordenadas.length - 1)) * 100 : 0)} />

      <MapContainer center={localizacaoUsuario} zoom={12} className="custom-map-container">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {temPermissaoGps && (
          <>
            <RotaBR319 origem={localizacaoUsuario} destino={PORTO_VELHO} />
            {!emMovimento && <SeguirUsuario posicao={localizacaoUsuario} />}
            <Marker position={localizacaoUsuario} icon={iconeUsuario}><Popup>Você está aqui</Popup></Marker>
          </>
        )}

        {emMovimento && (
          <>
            <SeguirSimulacao posicao={rotaCoordenadas[indiceAtual]} />
            <Marker position={rotaCoordenadas[indiceAtual]} icon={iconeVeiculo} />
          </>
        )}

        {Object.values(outrosVeiculos).map(m => (
          <Marker key={m.socketId} position={[m.lat, m.lng]} icon={iconeOutroMotorista} />
        ))}

        {pontos.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]}>
            <Popup><strong>{p.nome}</strong><br/>{p.descricao}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <FixedBottomMenu onProfileClick={() => setIsProfileOpen(true)} />

      <ProfileMenu 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}

export default PaginaPrincipal;