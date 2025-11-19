import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // CSS da Rota
import './App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine'; // Importa a lógica da máquina de rota
import Header from './components/Header';

// --- CONFIGURAÇÃO DE ÍCONES ---

// Ícone do veículo da simulação
const iconeVeiculo = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Correção dos ícones padrão do Leaflet que somem no Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- CONSTANTES ---
const API_URL = 'http://localhost:3001/api/pontos-de-apoio';
const CENTRO_PADRAO = [-3.1190, -60.0217]; // Manaus (Fallback)
const PORTO_VELHO = [-8.7619, -63.9039];   // Destino fixo

// --- COMPONENTES AUXILIARES ---

// 1. Componente que calcula e desenha a rota
function RotaBR319({ origem, destino }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!origem || !destino) return;

    // Remove rota anterior para não duplicar ao se mover
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Cria a nova rota
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(origem[0], origem[1]),
        L.latLng(destino[0], destino[1])
      ],
      routeWhileDragging: false,
      show: false, // Esconde o painel de texto (Vire a direita...)
      addWaypoints: false, // Impede o usuário de alterar a rota manualmente
      fitSelectedRoutes: false, // Impede o zoom automático chato
      lineOptions: {
        styles: [{ color: '#FF4500', weight: 5, opacity: 0.8 }] // Laranja BR-319
      },
      // Remove os marcadores padrões "A" e "B" da rota (usaremos os nossos)
      createMarker: function() { return null; } 
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, origem, destino]); // Recalcula sempre que a origem (usuário) muda

  return null;
}

// 2. Componente para manter o mapa focado no usuário
function SeguirUsuario({ posicao }) {
  const map = useMap();
  useEffect(() => {
    if (posicao) {
      map.flyTo(posicao, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [posicao, map]);
  return null;
}

// 3. Componente para seguir o veículo da simulação
function SeguirSimulacao({ posicao }) {
  const map = useMap();
  useEffect(() => {
    if (posicao) map.setView(posicao);
  }, [posicao, map]);
  return null;
}

// --- APP PRINCIPAL ---

function App() {
  // Estados de Dados
  const [pontos, setPontos] = useState([]);
  const [erro, setErro] = useState(null);

  // Estados de Geolocalização
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(CENTRO_PADRAO);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(true);
  const [temPermissaoGps, setTemPermissaoGps] = useState(false);

  // Estados de Simulação
  const [emMovimento, setEmMovimento] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const movimentoRef = useRef(null);

  // 1. GEOLOCALIZAÇÃO EM TEMPO REAL (WatchPosition)
  useEffect(() => {
    let watchId = null;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("GPS Atualizado:", latitude, longitude);
          
          setLocalizacaoUsuario([latitude, longitude]);
          setTemPermissaoGps(true);
          setObtendoLocalizacao(false);
        },
        (error) => {
          console.error("Erro GPS:", error);
          setObtendoLocalizacao(false); // Libera o mapa mesmo com erro (usa padrão)
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0,
          distanceFilter: 10 // Só atualiza se mover 10 metros (Evita "pulos" parado)
        }
      );
    } else {
      console.log("Navegador sem suporte a GPS");
      setObtendoLocalizacao(false);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 2. Busca Pontos da API
  useEffect(() => {
    axios.get(API_URL)
      .then(res => setPontos(res.data))
      .catch(err => {
        console.error(err);
        setErro("Não foi possível carregar os pontos de apoio.");
      });
  }, []);

  // Lógica da Simulação (Pontos ordenados)
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
          if (prev < rotaCoordenadas.length - 1) return prev + 1;
          clearInterval(movimentoRef.current);
          setEmMovimento(false);
          return prev;
        });
      }, 1000);
    }
  };

  // Tela de carregamento inicial do GPS
  if (obtendoLocalizacao) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-semibold">Sincronizando satélites...</p>
      </div>
    );
  }

  return (

    <div className='  flex flex-col h-screen relative'>
      <Header />
      
      {/* Botão de Simulação (Flutuante) */}
      <button 
        onClick={alternarMovimento} 
        className="absolute top-24 right-4 z-[1000] bg-white p-2 rounded shadow-lg font-bold text-sm hover:bg-gray-100 transition"
        >
        {emMovimento ? "⛔ Parar Simulação" : "▶️ Testar Rota"}
      </button>

      {erro && (
        <div className="absolute top-24 left-4 z-[1000] bg-red-100 text-red-700 p-2 rounded shadow-lg">
          {erro}
        </div>
      )}

      <MapContainer 
        center={localizacaoUsuario} 
        zoom={12} 
        className="w-full h-full flex-grow z-0"
        >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

        {/* --- LÓGICA DE ROTA --- */}
        {/* Se tiver GPS, traça rota da posição atual até Porto Velho */}
        {temPermissaoGps && (
          <>
                <RotaBR319 origem={localizacaoUsuario} destino={PORTO_VELHO} />
                {/* Segue o usuário se a simulação NÃO estiver rodando */}
                {!emMovimento && <SeguirUsuario posicao={localizacaoUsuario} />}
            </>
        )}

        {/* --- LÓGICA DE SIMULAÇÃO --- */}
        {emMovimento && rotaCoordenadas.length > 0 && (
          <>
            <SeguirSimulacao posicao={rotaCoordenadas[indiceAtual]} />
            <Marker position={rotaCoordenadas[indiceAtual]} icon={iconeVeiculo}>
                <Popup>Veículo Simulado</Popup>
            </Marker>
          </>
        )}

        {/* --- MARCADORES --- */}
        
        {/* Marcador do Usuário */}
        {temPermissaoGps && (
          <Marker position={localizacaoUsuario}>
            <Popup>
              <strong>Sua Localização Atual</strong><br/>
              Atualizada em tempo real.
            </Popup>
          </Marker>
        )}

        {/* Marcador do Destino (Porto Velho) */}
        <Marker position={PORTO_VELHO}>
             <Popup>Chegada: Porto Velho</Popup>
        </Marker>

        {/* Pontos de Apoio da API */}
        {pontos.map((ponto) => (
          <Marker key={ponto.id} position={[ponto.latitude, ponto.longitude]}>
            <Popup>
              <strong className="text-blue-600">{ponto.nome}</strong>
              <p className="m-0 text-gray-700">{ponto.descricao}</p>
              {ponto.tipo && <span className="text-xs bg-gray-200 px-1 rounded">{ponto.tipo}</span>}
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
        
  );
}

export default App;