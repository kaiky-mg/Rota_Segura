import React, { useState, useEffect } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapaRotaSegura = ({ posicaoAtiva, destino, isNavegando, pontos, outrosVeiculos }) => {
  // 1. Estado da Câmera (Resolve o problema do mapa "fixo")
  const [viewState, setViewState] = useState({
    longitude: -60.0217,
    latitude: -3.1190,
    zoom: 13,
    pitch: 0,
    bearing: 0
  });

  const [rotaGeoJSON, setRotaGeoJSON] = useState(null);

  // 2. Busca a Rota Real que respeita a BR-319 (API OSRM)
  useEffect(() => {
    const buscarRotaNaEstrada = async () => {
      if (!posicaoAtiva || !destino) return;

      try {
        // OSRM espera: longitude,latitude;longitude,latitude
        const url = `https://router.project-osrm.org/route/v1/driving/${posicaoAtiva[1]},${posicaoAtiva[0]};${destino[1]},${destino[0]}?geometries=geojson&overview=full`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          setRotaGeoJSON({
            type: 'Feature',
            geometry: data.routes[0].geometry // Isso contém todos os pontos da BR-319
          });
        }
      } catch (error) {
        console.error("Erro ao buscar trajeto rodoviário:", error);
      }
    };

    buscarRotaNaEstrada();
  }, [posicaoAtiva, destino]);

  // 3. Controle de Câmera (Efeito Uber / Navegação)
  useEffect(() => {
    if (posicaoAtiva && isNavegando) {
      setViewState(prev => ({
        ...prev,
        longitude: posicaoAtiva[1],
        latitude: posicaoAtiva[0],
        zoom: 17, // Zoom de navegação
        pitch: 65, // Inclinação 3D real
        transitionDuration: 1000 // Movimento suave
      }));
    }
  }, [posicaoAtiva, isNavegando]);

  return (
    <div className="h-screen w-screen absolute top-0 left-0">
      <Map
        {...viewState}
        // Permite que o usuário arraste o mapa livremente
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Controles de Navegação (Zoom/Bússola) */}
        <NavigationControl position="top-left" />

        {/* CAMADA DA ROTA REAL (A linha que segue a BR-319) */}
        {rotaGeoJSON && (
          <Source id="route-source" type="geojson" data={rotaGeoJSON}>
            <Layer
              id="route-layer"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#FF4500', // Laranja característico
                'line-width': 6,
                'line-opacity': 0.8
              }}
            />
          </Source>
        )}

        {/* SEU CAMINHÃO (GPS Real) */}
        {posicaoAtiva && (
          <Marker longitude={posicaoAtiva[1]} latitude={posicaoAtiva[0]} anchor="bottom">
            <img 
              src="/src/assets/cami.png" 
              style={{ 
                width: '45px',
                // Ajusta a inclinação do ícone para o modo 3D
                transform: isNavegando ? 'rotateX(-45deg)' : 'none' 
              }} 
              alt="Meu Caminhão" 
            />
          </Marker>
        )}

        {/* OUTROS MOTORISTAS (Socket.io) */}
        {Object.values(outrosVeiculos).map(v => (
          <Marker key={v.socketId} longitude={v.lng} latitude={v.lat} anchor="bottom">
             <img src="/src/assets/cami.png" style={{ width: '35px', opacity: 0.6 }} alt="Colega" />
          </Marker>
        ))}

        {/* PONTOS DE APOIO (Retornados da sua API) */}
        {pontos.map(p => (
          <Marker key={p.id} longitude={p.longitude} latitude={p.latitude}>
            <div className="text-2xl" title={p.nome}>📍</div>
          </Marker>
        ))}
      </Map>
    </div>
  );
};

export default MapaRotaSegura;