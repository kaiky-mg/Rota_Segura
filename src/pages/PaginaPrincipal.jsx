import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // CSS da Rota
import '../App.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { icon } from 'leaflet';
import 'leaflet-routing-machine'; // Importa a lógica da máquina de rota
import { useNavigate } from 'react-router-dom';

// --- [WEBSOCKET] Biblioteca ---
// Certifique-se de ter rodado: npm install socket.io-client
import { io } from 'socket.io-client';

// --- IMPORTAÇÕES DE COMPONENTES ---
import Header from '../components/Header';
import FloatingActionButton from '../components/FloatingActionButton';
import ProgressBar from '../components/ProgressBar';
import FixedBottomMenu from '../components/FixedBottomMenu';
import WeatherPill from '../components/WeatherPill';
import UserCount from '../components/UserCount'; // [NOVO] Importando o contador
import RotaBR319 from '../components/RotaBR319';
import { calculatePointAhead } from '../utils/calculatePointAhead';

// --- CONFIGURAÇÃO DE ÍCONES ---
import caminhaoBemol from '../assets/cami.png';

// Ícone do veículo da simulação
const iconeVeiculo = new L.Icon({
  iconUrl: caminhaoBemol,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Ícone do usuário
const iconeUsuario = new L.Icon({
  iconUrl: caminhaoBemol, 
  iconSize: [80, 80], 
  iconAnchor: [40, 40], 
});

// --- [WEBSOCKET] Ícone para Outros Motoristas ---
const iconeOutroMotorista = new L.Icon({
  iconUrl: caminhaoBemol,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  className: 'opacity-80' // Classe CSS/Tailwind para diferenciar levemente
});

// Correção dos ícones padrão do Leaflet que somem no Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- CONSTANTES ---
const API_URL = 'https://localhost:3001/api/pontos-de-apoio';
const SOCKET_URL = 'https://localhost:3001'; // URL do seu Backend
const CENTRO_PADRAO = [-3.1190, -60.0217]; // Manaus (Fallback)
const PORTO_VELHO = [-8.7619, -63.9039];   // Destino fixo


// --- COMPONENTES AUXILIARES ---

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


// --- COMPONENTE PRINCIPAL ---

function PaginaPrincipal() {
  // Estados de Dados
  const [pontos, setPontos] = useState([]);
  const [erro, setErro] = useState(null);

  // Estados de Geolocalização
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(CENTRO_PADRAO);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(true);
  const [temPermissaoGps, setTemPermissaoGps] = useState(false);
  
  // Estado do Clima
  const [clima, setClima] = useState({}); // Inicializa vazio

  // Estados de Simulação
  const [emMovimento, setEmMovimento] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const movimentoRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalFimTrajeto, setModalFimTrajeto] = useState(false); // [NOVO] Estado para o modal de fim de trajeto
  const navigate = useNavigate();

  // --- [WEBSOCKET] Estados ---
  const socketRef = useRef(null); 
  const [outrosVeiculos, setOutrosVeiculos] = useState({});

  // Estado para controle de trajeto
  const [trajetoEscolhido, setTrajetoEscolhido] = useState(null);

  // Gera ou recupera o token persistente do usuário
  useEffect(() => {
    let userToken = localStorage.getItem('userToken');
    if (!userToken) {
      userToken = `user_${Date.now()}`; // Gera um token único
      localStorage.setItem('userToken', userToken);
    }
    console.log('Token do usuário:', userToken);
  }, []);

  // Conecta ao servidor com o token do usuário
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');

    // Adiciona logs para depuração
    console.log('Tentando conectar ao WebSocket com token:', userToken);

    socketRef.current = io(SOCKET_URL, {
      query: { userToken },
      transports: ['websocket'], // Força o transporte WebSocket
      reconnectionAttempts: 5, // Tenta reconectar até 5 vezes
      reconnectionDelay: 2000, // Intervalo entre tentativas
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Conectado ao WebSocket:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Erro ao conectar ao WebSocket:', error);
    });

    socketRef.current.on('disconnect', () => {
      console.warn('WebSocket desconectado.');
    });

    // Listener: Recebe posição de outro veículo
    socketRef.current.on('nova_posicao_veiculo', (dados) => {
      setOutrosVeiculos((prev) => ({
        ...prev,
        [dados.socketId]: dados // Adiciona ou atualiza no objeto
      }));
    });

    // Listener: Veículo desconectou
    socketRef.current.on('veiculo_saiu', (idSocketSaiu) => {
      setOutrosVeiculos((prev) => {
        const novaLista = { ...prev };
        delete novaLista[idSocketSaiu];
        return novaLista;
      });
    });

    // Listener: Alerta de perigo
    socketRef.current.on('alerta_na_pista', (dados) => {
        alert(`⚠️ ALERTA NA PISTA: ${dados.tipo}`);
    });

    // Listener: Atualização do clima
    socketRef.current.on('atualizacao_clima', (dados) => {
      console.log('Dados do clima recebidos:', dados);
      setClima(dados);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);


  // -----------------------------------------------------------
  // 2. Geolocalização + Envio para WebSocket
  // -----------------------------------------------------------
  useEffect(() => {
    let watchId = null;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          setLocalizacaoUsuario([latitude, longitude]);
          setTemPermissaoGps(true);
          setObtendoLocalizacao(false);
            console.log('Coordenada atual:', latitude, longitude);

          // --- [WEBSOCKET] Enviar posição REAL ---
          // Envia apenas se não estivermos rodando a simulação
          if (socketRef.current && !emMovimento) {
            socketRef.current.emit('atualizar_posicao', {
                lat: latitude,
                lng: longitude,
                usuarioId: 'Motorista Real' // Idealmente viria de um AuthContext
            });
          }
        },
        (error) => {
          console.error("Erro GPS:", error);
          setObtendoLocalizacao(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0,
          distanceFilter: 10 
        }
      );
    } else {
      console.log("Navegador sem suporte a GPS");
      setObtendoLocalizacao(false);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [emMovimento]); 


  // 3. Busca Pontos da API
  useEffect(() => {
    axios.get(API_URL)
      .then(res => setPontos(res.data))
      .catch(err => {
        console.error(err);
        setErro("Não foi possível carregar os pontos de apoio.");
      });
  }, []);

  // -----------------------------------------------------------
  // 4. Lógica da Simulação + Envio para WebSocket
  // -----------------------------------------------------------
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
            const currentPos = rotaCoordenadas[prev];
            const nextPos = rotaCoordenadas[nextIndex];

            // Interpolação simples
            const interpolatedPos = [
              currentPos[0] + (nextPos[0] - currentPos[0]) * 0.05,
              currentPos[1] + (nextPos[1] - currentPos[1]) * 0.05,
            ];
            
            // --- [WEBSOCKET] Enviar posição SIMULADA ---
            if (socketRef.current) {
                socketRef.current.emit('atualizar_posicao', {
                    lat: interpolatedPos[0],
                    lng: interpolatedPos[1],
                    usuarioId: 'Simulação'
                });
            }

            setIndiceAtual(nextIndex);
            return nextIndex;
          }
          clearInterval(movimentoRef.current);
          setEmMovimento(false);
          setModalFimTrajeto(true); // [NOVO] Abre o modal de fim de trajeto
          return prev;
        });
      }, 500);
    }
  };

  // Função para iniciar trajeto
  const iniciarTrajeto = () => {
    setModalVisible(true);
  };

  const confirmarInicio = (tipo) => {
    if (tipo === 'ida') {
      setIndiceAtual(0);
      setEmMovimento(true);
      setModalVisible(false);
    } else {
      alert('Por enquanto só está disponível a rota de ida para Porto Velho.');
      setModalVisible(false);
    }
  };

  // Função para finalizar trajeto
  const finalizarTrajeto = () => {
    if (window.confirm('Deseja finalizar o trajeto?')) {
      setEmMovimento(false);
      setIndiceAtual(0);
    }
  };

  // Efeito do Clima (Opcional)
  useEffect(() => {
    const timer = setInterval(() => {
      setClima(prev => ({
        temp: prev.condition === 'sun' ? 26 : 31,
        condition: prev.condition === 'sun' ? 'rain' : 'sun',
        isCritical: prev.condition === 'sun'
      }));
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  // Efeito para buscar clima a 20km de distância
  useEffect(() => {
    if (emMovimento && rotaCoordenadas.length > 0) {
      const ponto20km = calculatePointAhead(rotaCoordenadas, 20000); // Calcula o ponto a 20 km

      // Faz uma requisição ao backend para obter o clima do ponto
      axios
        .get(`${API_URL}/clima`, {
          params: { lat: ponto20km[0], lng: ponto20km[1] },
        })
        .then((res) => {
          console.log('Clima previsto para 20 km à frente:', res.data);
          setClima(res.data);
        })
        .catch((err) => {
          console.error('Erro ao buscar clima para 20 km à frente:', err);
        });
    }
  }, [emMovimento, rotaCoordenadas]);

  // Tela de Carregamento
  if (obtendoLocalizacao) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600 font-semibold">Sincronizando satélites...</p>
      </div>
    );
  }

  const sentidoRota = localStorage.getItem('sentidoRota');
  if (!sentidoRota) {
    // Se não houver sentido definido, redireciona para a escolha
    window.location.href = '/';
    return null;
  }

  return (
    <div className='flex flex-col h-screen relative'>
      <Header />

      {/* --- Canto Superior DIREITO: Clima --- */}
      <div className="absolute top-20 right-4 z-[1007]">
        {/* Renderiza a pílula do clima com os dados dinâmicos */}
        <WeatherPill
          condition={clima.condition}
          temp={clima.temp}
          isCritical={clima.isCritical}
          mensagem={clima.mensagem}
        />
      </div>

      {/* --- [NOVO] Canto Superior ESQUERDO: UserCount --- */}
      {/* Posicionado espelhado ao WeatherPill (top-20 left-4) */}
      <div className="absolute top-20 left-4 z-[1007]">
        <UserCount socket={socketRef.current} />
      </div>
      
      <FloatingActionButton 
        onClick={alternarMovimento} 
        icon="➕" 
        label="Ação"
      />

      <ProgressBar 
      progress={(rotaCoordenadas.length > 1 ? Math.min((indiceAtual / (rotaCoordenadas.length - 1)) * 100) : 0)} />

      <FixedBottomMenu onMenuClick={(menu) => console.log(`Menu clicado: ${menu}`)} />

      <button 
        onClick={alternarMovimento} 
        className="absolute bottom-16 left-4 z-[1000] bg-white p-2 rounded shadow-lg font-bold text-sm hover:bg-gray-100 transition"
      >
        {emMovimento ? "⛔ Parar Simulação" : "▶️ Testar Rota"}
      </button>

      {erro && (
        <div className="absolute top-36 left-4 z-[1000] bg-red-100 text-red-700 p-2 rounded shadow-lg">
          {erro}
        </div>
      )}

      {/* --- [NOVO] Modal de Fim de Trajeto --- */}
      {modalFimTrajeto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <h2>Trajeto finalizado!</h2>
            <p>Você chegou ao destino final (Porto Velho).</p>
            <button style={{ marginTop: 24, padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={() => {
              setModalFimTrajeto(false);
              localStorage.removeItem('sentidoRota');
              navigate('/');
            }}>
              OK
            </button>
          </div>
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

        {/* --- ROTA E SEGUIR USUÁRIO --- */}
        {temPermissaoGps && (
          <>
            {/* Renderiza a rota BR-319 */}
            <RotaBR319 origem={localizacaoUsuario} destino={PORTO_VELHO} />
            {!emMovimento && <SeguirUsuario posicao={localizacaoUsuario} />}
          </>
        )}

        {/* --- VISUALIZAÇÃO DA SIMULAÇÃO --- */}
        {emMovimento && rotaCoordenadas.length > 0 && (
          <>
            <SeguirSimulacao posicao={rotaCoordenadas[indiceAtual]} />
            <Marker position={rotaCoordenadas[indiceAtual]} icon={iconeVeiculo}>
                <Popup>Veículo Simulado</Popup>
            </Marker>
          </>
        )}

        {/* --- [WEBSOCKET] OUTROS MOTORISTAS --- */}
        {Object.values(outrosVeiculos).map((motorista) => (
            <Marker 
                key={motorista.socketId}
                position={[motorista.lat, motorista.lng]}
                icon={iconeOutroMotorista}
            >
                <Popup>
                    <strong>Motorista na Pista</strong><br/>
                    ID: {motorista.usuarioId || "Desconhecido"}
                </Popup>
            </Marker>
        ))}

        {/* --- MARCADORES PADRÃO --- */}
        {temPermissaoGps && (
          <Marker position={localizacaoUsuario} icon={iconeUsuario}>
            <Popup>
              <strong>Sua Localização Atual</strong><br/>
              Atualizada em tempo real.
            </Popup>
          </Marker>
        )}

        <Marker position={PORTO_VELHO}>
             <Popup>Chegada: Porto Velho</Popup>
        </Marker>

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

export default PaginaPrincipal;