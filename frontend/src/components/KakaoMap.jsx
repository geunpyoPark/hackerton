import { useEffect, useMemo, useRef, useState } from 'react';
import { AR } from '../design';
import { FakeMap } from './FakeMap';

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY || import.meta.env.VITE_KAKAO_MAP_KEY;
let kakaoMapLoader;

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

export function KakaoMap({ places = [], center, height = '100%' }) {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const [loadState, setLoadState] = useState(KAKAO_MAP_APP_KEY ? 'loading' : 'missing-key');
  const currentOrigin = window.location.origin;
  const mapPlaces = useMemo(() => (
    places.length > 0 ? places : DEFAULT_ROUTE_POINTS
  ), [places]);

  useEffect(() => {
    if (!KAKAO_MAP_APP_KEY) {
      return undefined;
    }

    let canceled = false;

    loadKakaoMapSdk()
      .then((kakao) => {
        if (canceled || !mapNodeRef.current) return;

        const { maps } = kakao;
        const bounds = new maps.LatLngBounds();
        const target = center || mapPlaces[0] || DEFAULT_ROUTE_POINTS[0];
        const routePath = mapPlaces
          .filter((place) => typeof place.lat === 'number' && typeof place.lng === 'number')
          .map((place) => {
            const latLng = new maps.LatLng(place.lat, place.lng);
            bounds.extend(latLng);
            return latLng;
          });

        const map = new maps.Map(mapNodeRef.current, {
          center: new maps.LatLng(target.lat, target.lng),
          level: 4,
        });

        if (routePath.length > 1) {
          new maps.Polyline({
            map,
            path: routePath,
            strokeWeight: 6,
            strokeColor: AR.blue,
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
          });
        }

        mapPlaces.forEach((place, index) => {
          if (typeof place.lat !== 'number' || typeof place.lng !== 'number') return;

          const position = new maps.LatLng(place.lat, place.lng);
          new maps.Marker({
            map,
            position,
            title: place.name,
          });

          new maps.CustomOverlay({
            map,
            position,
            yAnchor: 2.35,
            content: buildOverlayContent(place, index, mapPlaces.length),
          });
        });

        if (routePath.length > 0) {
          map.setBounds(bounds, 24, 24, 24, 24);
        }

        mapRef.current = map;
        setLoadState('ready');

        window.setTimeout(() => {
          map.relayout();
          if (routePath.length > 0) {
            map.setBounds(bounds, 24, 24, 24, 24);
          }
        }, 0);
      })
      .catch((error) => {
        console.error('Kakao map load failed:', error);
        if (!canceled) setLoadState('error');
      });

    return () => {
      canceled = true;
      mapRef.current = null;
    };
  }, [center, mapPlaces]);

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

function buildOverlayContent(place, index, total) {
  const isStart = index === 0;
  const isEnd = index === total - 1;
  const label = isStart ? '출발' : isEnd ? '도착' : place.name;
  const background = isStart ? AR.blue : isEnd ? AR.red : '#fff';
  const color = isStart || isEnd ? '#fff' : AR.ink;
  const border = isStart || isEnd ? 'none' : `1px solid ${AR.border}`;

  return `<div style="padding:4px 8px;border-radius:6px;background:${background};color:${color};border:${border};font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(15,23,42,.18)">${label}</div>`;
}

function FallbackMarkers({ places }) {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {places.slice(0, 4).map((place, index) => (
        <div key={place.id || place.name} style={{
          position: 'absolute',
          left: `${18 + index * 22}%`,
          top: `${28 + (index % 2) * 22}%`,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}>
          <span style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: markerColor[place.risk] || AR.blue,
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,.18)',
          }} />
          <span style={{
            maxWidth: 92,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '3px 6px',
            borderRadius: 7,
            background: '#fff',
            border: `1px solid ${AR.border}`,
            fontSize: 10,
            fontWeight: 700,
            color: AR.ink,
          }}>{place.name}</span>
        </div>
      ))}
    </div>
  );
}

function MapNotice({ children }) {
  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: 12,
      zIndex: 2,
      padding: '6px 9px',
      borderRadius: 8,
      background: 'rgba(255,255,255,0.92)',
      color: AR.ink,
      fontSize: 11,
      fontWeight: 700,
      boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
    }}>
      {children}
    </div>
  );
}
