import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapaRotaSegura = forwardRef(({ posicaoAtiva, destino, isNavegando, outrosVeiculos, pontos, heading }, ref) => {
  const mapRef = useRef();
  // Valores iniciais sólidos para evitar erro de 'null'
  const [viewState, setViewState] = useState({ longitude: -60.0217, latitude: -3.1190, zoom: 8, pitch: 0 });
  const [rotaGeoJSON, setRotaGeoJSON] = useState(null);
  const [pontoSelecionado, setPontoSelecionado] = useState(null);

  useEffect(() => {
    if (posicaoAtiva && Array.isArray(posicaoAtiva)) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${posicaoAtiva[1]},${posicaoAtiva[0]};${destino[1]},${destino[0]}?geometries=geojson&overview=full`)
        .then(r => r.json()).then(data => {
          if (data.routes) setRotaGeoJSON(data.routes[0].geometry);
        });
    }
  }, [posicaoAtiva, destino]);

  useEffect(() => {
    if (!posicaoAtiva || !Array.isArray(posicaoAtiva)) return;
    
    if (isNavegando) {
      setViewState(prev => ({
        ...prev,
        longitude: Number(posicaoAtiva[1]) || prev.longitude,
        latitude: Number(posicaoAtiva[0]) || prev.latitude,
        zoom: 17,
        pitch: 65,
        transitionDuration: 1500
      }));
    } else if (rotaGeoJSON) {
      const lons = rotaGeoJSON.coordinates.map(c => c[0]);
      const lats = rotaGeoJSON.coordinates.map(c => c[1]);
      mapRef.current?.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]], { padding: 80, duration: 2000 });
    }
  }, [isNavegando, rotaGeoJSON, posicaoAtiva]);

  useImperativeHandle(ref, () => ({
    centralizarNoUsuario: () => {
      if (posicaoAtiva) setViewState(prev => ({ ...prev, longitude: posicaoAtiva[1], latitude: posicaoAtiva[0], zoom: 15, pitch: 0, transitionDuration: 1000 }));
    }
  }));

  return (
    <Map {...viewState} ref={mapRef} onMove={evt => setViewState(evt.viewState)} style={{ width: '100vw', height: '100vh' }} mapStyle="https://tiles.openfreemap.org/styles/liberty">
      {rotaGeoJSON && (
        <Source id="route-source" type="geojson" data={{ type: 'Feature', geometry: rotaGeoJSON }}>
          <Layer id="route-line" type="line" paint={{ 'line-color': '#f97316', 'line-width': 6 }} />
        </Source>
      )}

      {posicaoAtiva && (
        <Marker longitude={posicaoAtiva[1]} latitude={posicaoAtiva[0]}>
          <div style={{ transform: isNavegando ? `rotate(${Number(heading) || 0}deg)` : 'none', transition: 'transform 0.1s ease-out' }}>
            {isNavegando ? (
              <svg width="45" height="45" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#0284c7" strokeWidth="3"/>
                <path d="M25 10L15 30H35L25 10Z" fill="#0284c7"/>
              </svg>
            ) : (
              <img src="/src/assets/cami.png" className="w-12 drop-shadow-lg" alt="caminhao" />
            )}
          </div>
        </Marker>
      )}

      {/* CORREÇÃO DO ERRO 'MAP': Convertendo objeto outrosVeiculos em array */}
      {Object.values(outrosVeiculos || {}).map(v => (
        <Marker key={v.socketId} longitude={v.lng} latitude={v.lat}>
           <img src="/src/assets/cami.png" className="w-8 opacity-70" alt="colega" />
        </Marker>
      ))}

      {pontos?.map(p => (
        <Marker key={p.id} longitude={p.longitude} latitude={p.latitude} onClick={e => { e.originalEvent.stopPropagation(); setPontoSelecionado(p); }}>
          <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 21C16 17 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17 12 21Z" fill="#0284c7" stroke="white" strokeWidth="2"/><circle cx="12" cy="9" r="3" fill="white"/></svg>
        </Marker>
      ))}
      
      {pontoSelecionado && (
        <Popup longitude={pontoSelecionado.longitude} latitude={pontoSelecionado.latitude} onClose={() => setPontoSelecionado(null)}>
          <div className="p-1 font-bold text-sky-900">{pontoSelecionado.nome}</div>
        </Popup>
      )}
    </Map>
  );
});

export default MapaRotaSegura;