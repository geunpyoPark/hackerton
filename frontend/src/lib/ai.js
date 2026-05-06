const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchAccessibilitySummary({ userType, place, reports }) {
  const response = await fetch(`${apiBaseUrl}/ai/accessibility-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_type: userType,
      place,
      reports,
    }),
  });

  if (!response.ok) {
    throw new Error('AI 요약 API 요청에 실패했습니다.');
  }

  return response.json();
}
