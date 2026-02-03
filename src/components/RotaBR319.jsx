import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function RotaBR319({ origem, destino }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  // 1. Inicialização do Controle (Executa apenas uma vez ao montar)
  useEffect(() => {
    if (!map || !origem || !destino) return;

    // Criamos o controle com configurações estritas de "Clean UI"
    const control = L.Routing.control({
      waypoints: [
        L.latLng(origem[0], origem[1]),
        L.latLng(destino[0], destino[1])
      ],
      lineOptions: {
        styles: [{ color: "#FF4500", weight: 6, opacity: 0.8 }]
      },
      show: false,                // Esconde o painel de itinerário
      addWaypoints: false,        // Impede cliques no mapa para novos pontos
      draggableWaypoints: false,   // Bloqueia arrastar os pontos
      fitSelectedRoutes: false,    // Evita saltos de câmera indesejados
      createMarker: () => null     // Não cria marcadores padrão (usa os seus)
    }).addTo(map);

    // "Seguro de Vida": Garante que o container de texto nunca apareça no DOM
    const container = control.getContainer();
    if (container) {
      container.style.display = 'none';
    }

    routingControlRef.current = control;

    // Cleanup robusto: evita o erro "Cannot read properties of undefined"
    return () => {
      if (map && routingControlRef.current) {
        try {
          // Removemos o controle de forma segura
          map.removeControl(routingControlRef.current);
          routingControlRef.current = null;
        } catch (e) {
          // Silencia o erro caso o Leaflet já tenha limpado o controle
        }
      }
    };
  }, [map]); // Dependência apenas do mapa para não resetar a rota toda hora

  // 2. Efeito de Atualização (Sincroniza a linha com o movimento do caminhão)
  useEffect(() => {
    if (routingControlRef.current && origem && destino) {
      try {
        // Atualiza apenas as coordenadas sem destruir o objeto
        routingControlRef.current.setWaypoints([
          L.latLng(origem[0], origem[1]),
          L.latLng(destino[0], destino[1])
        ]);
      } catch (err) {
        console.warn("Aguardando inicialização da rota...");
      }
    }
  }, [origem, destino]);

  return null;
}

export default RotaBR319;