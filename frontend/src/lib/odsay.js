const ODSAY_API_KEY = import.meta.env.VITE_ODSAY_API_KEY;
const ODSAY_ROUTE_URL = 'https://api.odsay.com/v1/api/searchPubTransPathT';
const ODSAY_LANE_URL = 'https://api.odsay.com/v1/api/loadLane';

export async function searchSubwayRoute({ from, to }) {
  if (!ODSAY_API_KEY) {
    throw new Error('missing-odsay-key');
  }

  if (!from?.lng || !from?.lat || !to?.lng || !to?.lat) {
    throw new Error('missing-route-coordinates');
  }

  const params = new URLSearchParams({
    SX: String(from.lng),
    SY: String(from.lat),
    EX: String(to.lng),
    EY: String(to.lat),
    OPT: '0',
    SearchType: '0',
    SearchPathType: '1',
    apiKey: ODSAY_API_KEY,
  });

  const response = await fetch(`${ODSAY_ROUTE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`odsay-http-${response.status}`);
  }

  const data = await response.json();
  if (data.error?.length > 0) {
    throw new Error(data.error[0]?.message || 'odsay-error');
  }

  const route = normalizeSubwayRoute(data);
  if (!route.mapObj) {
    return route;
  }

  try {
    const laneData = await loadLane(route.mapObj);
    return {
      ...route,
      polyline: extractLanePolyline(laneData),
    };
  } catch (error) {
    console.error('ODsay lane load failed:', error);
    return route;
  }
}

async function loadLane(mapObj) {
  const params = new URLSearchParams({
    mapObject: `0:0@${mapObj}`,
    apiKey: ODSAY_API_KEY,
  });

  const response = await fetch(`${ODSAY_LANE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`odsay-lane-http-${response.status}`);
  }

  const data = await response.json();
  if (data.error?.length > 0) {
    throw new Error(data.error[0]?.message || 'odsay-lane-error');
  }

  return data;
}

function normalizeSubwayRoute(data) {
  const path = data?.result?.path?.[0];
  if (!path) {
    throw new Error('odsay-no-route');
  }

  const subwaySections = (path.subPath || []).filter(section => section.trafficType === 1);
  const stations = subwaySections.flatMap(section => extractSectionStations(section));
  const uniqueStations = dedupeStations(stations);

  const subPaths = (path.subPath || []).map(section => ({
    type: section.trafficType,
    time: section.sectionTime,
    distance: section.distance,
    stationCount: section.stationCount || 0,
    startName: cleanStationName(section.startName),
    endName: cleanStationName(section.endName),
    lineName: getLaneName(section),
    subwayCode: section.lane?.[0]?.subwayCode,
  }));

  return {
    totalTime: path.info?.totalTime,
    totalDistance: path.info?.totalDistance,
    payment: path.info?.payment,
    mapObj: path.info?.mapObj,
    stations: uniqueStations,
    summary: buildRouteSummary(subwaySections),
    subPaths,
  };
}

function extractLanePolyline(data) {
  const lanes = data?.result?.lane;
  if (!Array.isArray(lanes)) return [];

  return lanes.flatMap(lane => (
    (lane.section || []).flatMap(section => (
      (section.graphPos || [])
        .map(point => ({
          lat: toNumber(point.y),
          lng: toNumber(point.x),
        }))
        .filter(point => typeof point.lat === 'number' && typeof point.lng === 'number')
    ))
  ));
}

function extractSectionStations(section) {
  const passStations = section.passStopList?.stations;
  if (Array.isArray(passStations) && passStations.length > 0) {
    return passStations.map(station => ({
      name: cleanStationName(station.stationName || station.name),
      lat: toNumber(station.y),
      lng: toNumber(station.x),
      line: getLaneName(section),
    }));
  }

  return [
    {
      name: cleanStationName(section.startName),
      lat: toNumber(section.startY),
      lng: toNumber(section.startX),
      line: getLaneName(section),
    },
    {
      name: cleanStationName(section.endName),
      lat: toNumber(section.endY),
      lng: toNumber(section.endX),
      line: getLaneName(section),
    },
  ];
}

function dedupeStations(stations) {
  const result = [];
  stations.forEach((station) => {
    if (!station.name) return;
    const prev = result[result.length - 1];
    if (prev?.name === station.name) return;
    result.push(station);
  });
  return result;
}

function buildRouteSummary(sections) {
  return sections
    .map(section => {
      const line = getLaneName(section);
      const start = cleanStationName(section.startName);
      const end = cleanStationName(section.endName);
      return [line, start && `${start}역`, end && `${end}역`].filter(Boolean).join(' ');
    })
    .filter(Boolean)
    .join(' → ');
}

function getLaneName(section) {
  return section.lane?.[0]?.name || section.lane?.[0]?.subwayCodeName || '';
}

function cleanStationName(value) {
  return String(value || '').replace(/\s/g, '').replace(/역$/, '');
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
