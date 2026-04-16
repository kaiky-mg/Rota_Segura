import L from 'leaflet';

/**
 * Calcula o ponto na polyline a uma distância específica à frente.
 * @param {Array} polyline - Array de coordenadas da rota.
 * @param {number} distance - Distância em metros à frente.
 * @returns {Array} Coordenadas [latitude, longitude] do ponto calculado.
 */
export function calculatePointAhead(polyline, distance) {
  let accumulatedDistance = 0;

  for (let i = 0; i < polyline.length - 1; i++) {
    const start = L.latLng(polyline[i]);
    const end = L.latLng(polyline[i + 1]);

    const segmentDistance = start.distanceTo(end);

    if (accumulatedDistance + segmentDistance >= distance) {
      const ratio = (distance - accumulatedDistance) / segmentDistance;
      const lat = start.lat + ratio * (end.lat - start.lat);
      const lng = start.lng + ratio * (end.lng - start.lng);
      return [lat, lng];
    }

    accumulatedDistance += segmentDistance;
  }

  // Caso a distância seja maior que a rota, retorna o último ponto
  return polyline[polyline.length - 1];
}