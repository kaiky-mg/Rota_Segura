import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function RotaBR319({ origem, destino }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!origem || !destino) return;

    // Remove rota anterior para evitar duplicação
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (error) {
        console.warn('Erro ao remover controle de rota:', error);
      }
    }

    // Cria nova rota
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(origem[0], origem[1]),
        L.latLng(destino[0], destino[1]),
      ],
      routeWhileDragging: false,
      show: false, // Esconde o painel de texto
      addWaypoints: false,
      fitSelectedRoutes: false,
      lineOptions: {
        styles: [{ color: '#FF4500', weight: 5, opacity: 0.8 }], // Laranja BR-319
      },
      createMarker: () => null,
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (error) {
          console.warn('Erro ao limpar controle de rota:', error);
        }
      }
    };
  }, [map, origem, destino]);

  return null;
}

export default RotaBR319;