import { useEffect, useRef, useState } from 'react';
import { AR } from '../design';
import { FakeMap } from './FakeMap';

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
let kakaoMapLoader;

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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false`;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });

  return kakaoMapLoader;
}

const ROUTE_POINTS = [
  { name: '강남역', lat: 37.497952, lng: 127.027619 },
  { name: '테헤란로', lat: 37.503629, lng: 127.041565 },
  { name: '삼성역', lat: 37.508844, lng: 127.06316 },
  { name: '코엑스', lat: 37.511682, lng: 127.059151 },
];

export function KakaoMap() {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const [loadState, setLoadState] = useState(KAKAO_MAP_APP_KEY ? 'loading' : 'missing-key');
  const currentOrigin = window.location.origin;

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
        const routePath = ROUTE_POINTS.map((point) => {
          const latLng = new maps.LatLng(point.lat, point.lng);
          bounds.extend(latLng);
          return latLng;
        });

        const map = new maps.Map(mapNodeRef.current, {
          center: routePath[1],
          level: 5,
        });

        new maps.Polyline({
          map,
          path: routePath,
          strokeWeight: 6,
          strokeColor: AR.blue,
          strokeOpacity: 0.9,
          strokeStyle: 'solid',
        });

        ROUTE_POINTS.forEach((point, index) => {
          const position = routePath[index];
          const marker = new maps.Marker({
            map,
            position,
            title: point.name,
          });

          if (index === 0 || index === ROUTE_POINTS.length - 1) {
            new maps.CustomOverlay({
              map,
              position,
              yAnchor: 2.35,
              content: `<div style="padding:4px 8px;border-radius:6px;background:${index === 0 ? AR.blue : AR.red};color:#fff;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(15,23,42,.18)">${index === 0 ? '출발' : '도착'}</div>`,
            });
          }

          return marker;
        });

        map.setBounds(bounds, 24, 24, 24, 24);
        mapRef.current = map;
        setLoadState('ready');

        window.setTimeout(() => {
          map.relayout();
          map.setBounds(bounds, 24, 24, 24, 24);
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
  }, []);

  if (loadState === 'missing-key') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FakeMap />
        <MapNotice>VITE_KAKAO_MAP_APP_KEY 필요</MapNotice>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <FakeMap />
        <MapNotice>카카오 Web 도메인 확인: {currentOrigin}</MapNotice>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#E8EEF4' }}>
      <div ref={mapNodeRef} style={{ width: '100%', height: '100%' }} />
      {loadState === 'loading' && <MapNotice>지도 불러오는 중</MapNotice>}
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
