const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY || import.meta.env.VITE_KAKAO_MAP_KEY;
let kakaoMapLoader;

export async function resolveKakaoPlaceLocation(query) {
  if (!query || !KAKAO_MAP_APP_KEY) return null;
  const kakao = await loadKakaoMapSdk();
  const placeSearch = kakao.maps.services ? new kakao.maps.services.Places() : null;
  if (!placeSearch) return null;

  // ✅ name, address 추가
  return new Promise((resolve) => {
    placeSearch.keywordSearch(query, (results, status) => {
      if (status !== window.kakao.maps.services.Status.OK || !results?.[0]) {
        resolve(null);
        return;
      }
      resolve({
        name: results[0].place_name,
        lat: Number(results[0].y),
        lng: Number(results[0].x),
        address: results[0].address_name,
        road_address: results[0].road_address_name || '',
        station_name: results[0].place_name,
      });
    });
  });
}

function loadKakaoMapSdk() {
  if (window.kakao?.maps?.services) {
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
      if (window.kakao?.maps?.load) {
        handleLoad();
        return;
      }
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