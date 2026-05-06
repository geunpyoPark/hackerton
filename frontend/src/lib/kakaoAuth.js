const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI || window.location.origin;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function startKakaoLogin() {
  if (!KAKAO_REST_API_KEY) {
    throw new Error('VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다.');
  }

  const params = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: 'code',
  });

  window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeKakaoCode(code) {
  const response = await fetch(`${API_BASE_URL}/auth/kakao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.detail || '카카오 로그인에 실패했습니다.');
  }

  return response.json();
}
