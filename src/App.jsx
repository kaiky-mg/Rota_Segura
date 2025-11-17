// Componente auxiliar para centralizar o mapa no veículo
function CentralizarNoVeiculo({ posicao }) {
  const map = useMap();
  React.useEffect(() => {
    if (posicao) {
      map.setView(posicao);
    }
  }, [posicao, map]);
  return null;
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css'; // Importa o CSS do Leaflet
import './App.css'; // Seu CSS personalizado (se necessário)
// Importa os componentes do React-Leaflet (forma correta para o Vite)
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useRef } from 'react';

// Ponto inicial do mapa (Meio da BR-319)
const centroDoMapa = [-5.8, -61.5]; // Lat, Lng
const zoomInicial = 8;

// URL da sua API Node.js (que já está rodando!)
const API_URL = 'http://localhost:3001/api/pontos-de-apoio';


function App() {
  // Estado para armazenar o GeoJSON da BR-319
  const [geojsonData, setGeojsonData] = useState(null);

  // Carrega o arquivo GeoJSON da BR-319
  useEffect(() => {
    fetch('/br319.geojson')
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error('Erro ao carregar GeoJSON:', err));
  }, []);
  // Todos os hooks devem ser declarados antes de qualquer return condicional!
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  // Simulação do ícone percorrendo a rota
  const [emMovimento, setEmMovimento] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const movimentoRef = useRef(null);

  useEffect(() => {
    async function buscarPontos() {
      try {
        console.log('Buscando dados da API...');
        const resposta = await axios.get(API_URL);
        console.log('Dados recebidos:', resposta.data);
        setPontos(resposta.data);
      } catch (err) {
        console.error('Erro ao buscar dados da API:', err);
        setErro('Falha ao carregar os pontos. O servidor backend está rodando?');
      } finally {
        setCarregando(false);
      }
    }
    buscarPontos();
  }, []);

  // Ordena os pontos por latitude (ajuste se necessário para sua API)
  const pontosOrdenados = [...pontos].sort((a, b) => b.latitude - a.latitude);
  // Extrai as coordenadas para a Polyline
  const rotaCoordenadas = pontosOrdenados.map(p => [p.latitude, p.longitude]);

  // Ícone customizado para o "veículo"
  const iconeVeiculo = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Função para iniciar/parar simulação
  const alternarMovimento = () => {
    if (emMovimento) {
      clearInterval(movimentoRef.current);
      setEmMovimento(false);
    } else {
      setEmMovimento(true);
      movimentoRef.current = setInterval(() => {
        setIndiceAtual((prev) => {
          if (prev < rotaCoordenadas.length - 1) {
            return prev + 1;
          } else {
            clearInterval(movimentoRef.current);
            setEmMovimento(false);
            return prev;
          }
        });
      }, 1000);
    }
  };

  // Botão para resetar simulação
  const resetarMovimento = () => {
    clearInterval(movimentoRef.current);
    setIndiceAtual(0);
    setEmMovimento(false);
  };

  // Renderização condicional deve vir DEPOIS dos hooks
  if (carregando) {
    return (
      <div className="flex items-center justify-center w-full h-full text-xl font-semibold text-gray-700">
        Carregando mapa e pontos...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 text-xl font-semibold text-red-700 bg-red-100 rounded-lg">
        {erro}
      </div>
    );
  }



  // ... (removido duplicatas, já declarado no topo) ...

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', zIndex: 1000, top: 10, left: 10 }}>
        <button onClick={alternarMovimento} style={{ marginRight: 8, padding: '8px 16px', background: emMovimento ? '#f87171' : '#4ade80', color: '#fff', border: 'none', borderRadius: 4 }}>
          {emMovimento ? 'Parar Simulação' : 'Iniciar Simulação'}
        </button>
        <button onClick={resetarMovimento} style={{ padding: '8px 16px', background: '#60a5fa', color: '#fff', border: 'none', borderRadius: 4 }}>
          Resetar
        </button>
      </div>
      <MapContainer center={centroDoMapa} zoom={zoomInicial} style={{ width: '100vw', height: '100vh' }}>
        {/* Centraliza o mapa no veículo */}
        {rotaCoordenadas.length > 0 && (
          <CentralizarNoVeiculo posicao={rotaCoordenadas[indiceAtual]} />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />


        {/* Traçado real da BR-319 via GeoJSON */}
        {geojsonData && (
          <GeoJSON data={geojsonData} style={{ color: 'red', weight: 4 }} />
        )}

        {/* Linha antiga (pontos de apoio) - pode remover se quiser */}
        {/* <Polyline positions={rotaCoordenadas} pathOptions={{ color: 'red', weight: 4 }} /> */}

        {/* Marcador "veículo" percorrendo a rota */}
        {rotaCoordenadas.length > 0 && (
          <Marker
            position={rotaCoordenadas[indiceAtual]}
            icon={iconeVeiculo}
          >
            <Popup>Veículo em movimento</Popup>
          </Marker>
        )}

        {/* Marcadores dos pontos */}
        {pontos.map((ponto) => (
          <Marker
            key={ponto.id}
            position={[ponto.latitude, ponto.longitude]}
          >
            <Popup>
              <strong className="text-base">{ponto.nome}</strong>
              <br />
              {ponto.descricao}
              <br />
              {ponto.nome.includes('KM ') && (
                <small>KM {ponto.nome.split('KM ')[1]}</small>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;