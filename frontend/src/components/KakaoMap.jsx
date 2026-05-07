import { useEffect, useMemo, useRef, useState } from 'react';
import { AR } from '../design';
import { FakeMap } from './FakeMap';

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY || import.meta.env.VITE_KAKAO_MAP_KEY;
let kakaoMapLoader;
const EMPTY_ROUTE_PATH = [];

const DEFAULT_ROUTE_POINTS = [
  { id: 'start', name: '강남역', lat: 37.497952, lng: 127.027619, risk: 'green' },
  { id: 'teheran', name: '테헤란로', lat: 37.503629, lng: 127.041565, risk: 'red' },
  { id: 'samsung', name: '삼성역', lat: 37.508844, lng: 127.06316, risk: 'yellow' },
  { id: 'end', name: '코엑스', lat: 37.511682, lng: 127.059151, risk: 'green' },
];

const markerColor = {
  green: AR.green,
  yellow: AR.yellow,
  red: AR.red,
};

const facilityStyle = {
  elevator: { label: 'EV', color: AR.blue },
  escalator: { label: 'ES', color: '#F97316' },
  restroom: { label: 'WC', color: '#7C3AED' },
  charger: { label: 'CH', color: AR.green },
  lift: { label: 'LF', color: '#0891B2' },
  movingWalk: { label: 'MW', color: '#0EA5E9' },
  safePlatform: { label: 'SP', color: '#F59E0B' },
  signLanguagePhone: { label: 'SL', color: '#DB2777' },
  helper: { label: 'HP', color: '#475569' },
};

function loadKakaoMapSdk() {
  if (!KAKAO_MAP_APP_KEY) {
    return Promise.reject(new Error('missing-kakao-map-key'));
  }

  if (window.kakao?.maps?.Map) {
    return Promise.resolve(window.kakao);
  }

  if (kakaoMapLoader) {
    return kakaoMapLoader;
  }

  kakaoMapLoader = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-kakao-map-sdk="true"]');

    function handleLoad() {
      if (!window.kakao?.maps?.load) {
        reject(new Error('kakao-map-sdk-unavailable'));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    }

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.kakaoMapSdk = 'true';
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false&libraries=services`;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });

  return kakaoMapLoader;
}

export function KakaoMap({
  places = [],
  routePath = EMPTY_ROUTE_PATH,
  center,
  height = '100%',
  disableFallbackRoute = false,
  onPlaceClick,
  onMapClick,
}) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const centerRef = useRef(null);
  const [loadState, setLoadState] = useState(KAKAO_MAP_APP_KEY ? 'loading' : 'missing-key');
  const currentOrigin = window.location.origin;
  const mapPlaces = useMemo(() => (
    places.length > 0 ? places : DEFAULT_ROUTE_POINTS
  ), [places]);

  useEffect(() => {
    if (!KAKAO_MAP_APP_KEY) return undefined;

    let canceled = false;

    loadKakaoMapSdk()
      .then(async (kakao) => {
        if (canceled || !mapNodeRef.current) return;

        const { maps } = kakao;
        const resolvedPlaces = await resolvePlaceLocations(kakao, mapPlaces);
        if (canceled || !mapNodeRef.current) return;

        const validPlaces = resolvedPlaces.filter((place) => (
          typeof place.lat === 'number' && typeof place.lng === 'number'
        ));
        const target = center || getRouteCenter(validPlaces) || DEFAULT_ROUTE_POINTS[0];
        const targetCenter = new maps.LatLng(target.lat, target.lng);

        const map = new maps.Map(mapNodeRef.current, {
          center: targetCenter,
          level: 6,
        });

        if (onMapClick) {
          const geocoder = maps.services ? new maps.services.Geocoder() : null;
          maps.event.addListener(map, 'click', (event) => {
            const latlng = event.latLng;
            const point = {
              lat: latlng.getLat(),
              lng: latlng.getLng(),
              name: '지도 선택 위치',
              address: '',
              road_address: '',
            };

            if (!geocoder) {
              onMapClick(point);
              return;
            }

            geocoder.coord2Address(point.lng, point.lat, (result, status) => {
              if (status !== maps.services.Status.OK || !result?.[0]) {
                onMapClick(point);
                return;
              }

              const address = result[0].address?.address_name || '';
              const roadAddress = result[0].road_address?.address_name || '';
              onMapClick({
                ...point,
                name: roadAddress || address || point.name,
                address,
                road_address: roadAddress,
              });
            });
          });
        }

        const routePathOnly = routePath.length > 1
          ? routePath
          : disableFallbackRoute
          ? []
          : validPlaces
            .filter((place) => !place.type)
            .map((place) => ({ lat: place.lat, lng: place.lng }));

        if (routePathOnly.length > 1) {
          new maps.Polyline({
            map,
            path: routePathOnly.map((point) => new maps.LatLng(point.lat, point.lng)),
            strokeWeight: 6,
            strokeColor: AR.blue,
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
          });
        }

        validPlaces.forEach((place, index) => {
          const position = new maps.LatLng(place.lat, place.lng);

          if (!place.type && !place.routeVia) {
            new maps.Marker({ map, position, title: place.name });
          }

          if (!place.routeVia) {
            new maps.CustomOverlay({
              map,
              position,
              yAnchor: place.type ? 0.9 : 2.35,
              content: buildOverlayContent(place, index, validPlaces.length, onPlaceClick),
            });
          }
        });

        mapRef.current = map;
        centerRef.current = targetCenter;
        setLoadState('ready');

        requestAnimationFrame(() => {
          map.relayout();
          map.setCenter(targetCenter);
          map.setLevel(6);
        });
      })
      .catch((error) => {
        console.error('Kakao map load failed:', error);
        if (!canceled) setLoadState('error');
      });

    return () => {
      canceled = true;
      mapRef.current = null;
      centerRef.current = null;
    };
  }, [center, disableFallbackRoute, mapPlaces, onMapClick, onPlaceClick, routePath]);

  useEffect(() => {
    if (!mapNodeRef.current || !window.ResizeObserver) return undefined;

    const observer = new ResizeObserver(() => {
      if (!mapRef.current || !centerRef.current) return;
      mapRef.current.relayout();
      mapRef.current.setCenter(centerRef.current);
    });

    observer.observe(mapNodeRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height, background: '#E8EEF4' }}>
      <div ref={mapNodeRef} style={{ width: '100%', height: '100%', display: loadState === 'ready' ? 'block' : 'none' }} />
      {loadState !== 'ready' && (
        <>
          <FakeMap />
          <FallbackMarkers places={mapPlaces} />
        </>
      )}
      {loadState === 'loading' && <MapNotice>지도 불러오는 중</MapNotice>}
      {loadState === 'missing-key' && <MapNotice>VITE_KAKAO_MAP_APP_KEY 필요</MapNotice>}
      {loadState === 'error' && <MapNotice>카카오 Web 도메인 확인: {currentOrigin}</MapNotice>}
    </div>
  );
}

async function resolvePlaceLocations(kakao, places) {
  const placeSearch = kakao.maps.services ? new kakao.maps.services.Places() : null;

  return Promise.all(places.map(async (place) => {
    if (typeof place.lat === 'number' && typeof place.lng === 'number') return place;
    if (!placeSearch || !place.locationQuery) return place;

    const coords = await searchPlace(placeSearch, place.locationQuery);
    if (!coords) return place;

    return { ...place, lat: coords.lat, lng: coords.lng };
  }));
}

function searchPlace(placeSearch, query) {
  return new Promise((resolve) => {
    placeSearch.keywordSearch(query, (results, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !results?.[0]) {
        resolve(null);
        return;
      }
      resolve({ lat: Number(results[0].y), lng: Number(results[0].x) });
    });
  });
}

function getRouteCenter(places) {
  if (places.length === 0) return null;

  const totals = places.reduce((acc, place) => ({
    lat: acc.lat + place.lat,
    lng: acc.lng + place.lng,
  }), { lat: 0, lng: 0 });

  return {
    lat: totals.lat / places.length,
    lng: totals.lng / places.length,
  };
}

function buildOverlayContent(place, index, total, onPlaceClick) {
  const isFacility = Boolean(place.type);
  const isRouteRisk = Boolean(place.routeRisk);
  const isStart = place.routeRole === 'start' || (!isFacility && !isRouteRisk && index === 0);
  const isEnd = place.routeRole === 'end' || (!isFacility && !isRouteRisk && index === total - 1);
  const style = facilityStyle[place.type];
  const label = isFacility ? style?.label || 'F' : isRouteRisk ? '위험' : isStart ? '출발' : isEnd ? '도착' : place.name;
  const background = isFacility ? style?.color || AR.blue : isRouteRisk ? AR.red : isStart ? AR.blue : isEnd ? AR.red : '#fff';
  const color = isFacility || isRouteRisk || isStart || isEnd ? '#fff' : AR.ink;
  const border = isFacility || isRouteRisk || isStart || isEnd ? 'none' : `1px solid ${AR.border}`;
  const element = document.createElement('button');

  element.type = 'button';
  element.title = place.name || label;
  element.textContent = label;
  element.style.border = border;
  element.style.background = background;
  element.style.color = color;
  element.style.fontWeight = '800';
  element.style.textAlign = 'center';
  element.style.boxShadow = '0 2px 8px rgba(15,23,42,.18)';
  element.style.cursor = isRouteRisk || onPlaceClick ? 'pointer' : 'default';

  if (onPlaceClick) {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      onPlaceClick(place);
    });
  }

  if (isFacility) {
    element.style.width = '22px';
    element.style.height = '22px';
    element.style.borderRadius = '50%';
    element.style.border = '2px solid #fff';
    element.style.fontSize = '9px';
    element.style.lineHeight = '18px';
    element.style.padding = '0';
    return element;
  }

  element.style.padding = '4px 8px';
  element.style.borderRadius = '6px';
  element.style.fontSize = '11px';
  element.style.whiteSpace = 'nowrap';
  return element;
}

function FallbackMarkers({ places }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {places.slice(0, 4).map((place, index) => (
        <div key={place.id || place.name} style={{
          position: 'absolute',
          left: `${18 + index * 22}%`,
          top: `${28 + (index % 2) * 22}%`,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{
            width: 18, height: 18, borderRadius: 9,
            background: facilityStyle[place.type]?.color || markerColor[place.risk] || AR.blue,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,.18)',
          }} />
          <span style={{
            maxWidth: 92, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            padding: '3px 6px', borderRadius: 7,
            background: '#fff', border: `1px solid ${AR.border}`,
            fontSize: 10, fontWeight: 700, color: AR.ink,
          }}>{place.name}</span>
        </div>
      ))}
    </div>
  );
}

function MapNotice({ children }) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: 12, zIndex: 2,
      padding: '6px 9px', borderRadius: 8,
      background: 'rgba(255,255,255,0.92)', color: AR.ink,
      fontSize: 11, fontWeight: 700,
      boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
    }}>
      {children}
    </div>
  );
}
