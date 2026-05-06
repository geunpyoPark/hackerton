const TMAP_API_KEY = import.meta.env.VITE_TMAP_API_KEY;
const TMAP_WALK_URL = '/api/tmap/routes/pedestrian';

export async function searchWalkingRoute({ from, to }) {
  if (!TMAP_API_KEY) {
    throw new Error('missing-tmap-key');
  }

  if (!from?.lng || !from?.lat || !to?.lng || !to?.lat) {
    throw new Error('missing-walking-route-coordinates');
  }

  const body = new URLSearchParams({
    startX: String(from.lng),
    startY: String(from.lat),
    endX: String(to.lng),
    endY: String(to.lat),
    reqCoordType: 'WGS84GEO',
    resCoordType: 'EPSG3857',
    startName: '출발지',
    endName: '도착지',
  });

  const response = await fetch(`${TMAP_WALK_URL}?version=1&format=json`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      appKey: TMAP_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`tmap-walk-http-${response.status}:${errorBody.slice(0, 300)}`);
  }

  const data = await response.json();
  const path = extractWalkingPath(data);

  if (path.length < 2) {
    throw new Error('tmap-walk-empty-path');
  }

  return {
    totalDistance: getRouteProperty(data, 'totalDistance'),
    totalTime: getRouteProperty(data, 'totalTime'),
    path,
  };
}

function extractWalkingPath(data) {
  return (data.features || [])
    .flatMap((feature) => {
      const geometry = feature.geometry;
      if (geometry?.type === 'LineString') {
        return geometry.coordinates;
      }
      if (geometry?.type === 'MultiLineString') {
        return geometry.coordinates.flat();
      }
      return [];
    })
    .map(([x, y]) => normalizeRoutePoint(Number(x), Number(y)))
    .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lng));
}

function normalizeRoutePoint(x, y) {
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    return { lat: y, lng: x };
  }

  return convertEpsg3857ToWgs84(x, y);
}

function convertEpsg3857ToWgs84(x, y) {
  const earthRadius = 6378137;
  const lng = (x / earthRadius) * (180 / Math.PI);
  const lat = (2 * Math.atan(Math.exp(y / earthRadius)) - Math.PI / 2) * (180 / Math.PI);
  return { lat, lng };
}

function getRouteProperty(data, key) {
  const value = (data.features || [])
    .map(feature => feature.properties?.[key])
    .find(item => item !== undefined && item !== null);
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
