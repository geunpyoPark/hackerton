import { useEffect, useRef, useState } from 'react';
import { AR } from '../design';
import { FakeMap } from './FakeMap';

const kakaoMapKey = import.meta.env.VITE_KAKAO_MAP_KEY;

const markerColor = {
  green: AR.green,
  yellow: AR.yellow,
  red: AR.red,
};

export function KakaoMap({ places = [], center, height = '100%' }) {
  const mapRef = useRef(null);
  const [hasKakaoMap, setHasKakaoMap] = useState(false);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    function renderMap() {
      if (!window.kakao?.maps || !mapRef.current) return;
      window.kakao.maps.load(() => {
        const target = center || places[0] || { lat: 37.49794, lng: 127.02762 };
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(target.lat, target.lng),
          level: 4,
        });

        places.forEach(place => {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(place.lat, place.lng),
            map,
          });
          const content = `<div style="padding:6px 8px;border-radius:8px;background:#fff;border:1px solid #E5E8EE;font-size:12px;font-weight:700;color:#0F172A;box-shadow:0 2px 8px rgba(0,0,0,.12)">${place.name}</div>`;
          const overlay = new window.kakao.maps.CustomOverlay({
            position: marker.getPosition(),
            content,
            yAnchor: 2.3,
          });
          overlay.setMap(map);
        });
        setHasKakaoMap(true);
      });
    }

    if (!window.kakao?.maps && kakaoMapKey && !document.querySelector('script[data-able-route-kakao]')) {
      const script = document.createElement('script');
      script.dataset.ableRouteKakao = 'true';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = renderMap;
      document.head.appendChild(script);
      return;
    }

    if (!window.kakao?.maps) {
      return;
    }

    renderMap();
  }, [center, places]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', display: hasKakaoMap ? 'block' : 'none' }} />
      {!hasKakaoMap && (
        <>
          <FakeMap />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {places.slice(0, 4).map((place, index) => (
              <div key={place.id} style={{
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
        </>
      )}
    </div>
  );
}
