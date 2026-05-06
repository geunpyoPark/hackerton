import { DEMO_REPORTS, PLACES, USER_TYPES } from '../data/accessibility';
import { hasSupabaseConfig, supabase } from './supabase';

const USER_ID_KEY = 'ableRouteUserId';

function createLocalId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getLocalUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = createLocalId();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export function setLocalUserId(userId) {
  localStorage.setItem(USER_ID_KEY, userId);
}

export function getKakaoProfileId(kakaoUser) {
  if (!kakaoUser?.id) return null;
  return `kakao-${kakaoUser.id}`;
}

function fallbackProfile(userType = localStorage.getItem('ableRouteUserType') || 'wheelchair', userId = getLocalUserId(), nickname = 'able_user01') {
  const reports = getStoredReports();
  const points = reports.reduce((total, report) => total + 10 + (report.image_url ? 20 : 0), 0);
  return {
    id: userId,
    nickname,
    user_type: userType,
    points,
    level: Math.max(1, Math.floor(points / 500) + 1),
  };
}

export function getUserTypeLabel(userType) {
  return USER_TYPES.find(type => type.id === userType)?.label || '휠체어';
}

export function getStoredReports() {
  try {
    return JSON.parse(localStorage.getItem('ableRouteReports') || '[]');
  } catch {
    return [];
  }
}

export function saveStoredReport(report) {
  const reports = getStoredReports();
  localStorage.setItem('ableRouteReports', JSON.stringify([report, ...reports]));
}

export function getAllReports() {
  return [...getStoredReports(), ...DEMO_REPORTS];
}

export async function ensureLocalProfile(userType = 'wheelchair', options = {}) {
  const userId = options.userId || getLocalUserId();
  const nickname = options.nickname || 'able_user01';
  localStorage.setItem('ableRouteUserType', userType);
  setLocalUserId(userId);

  if (!hasSupabaseConfig) return fallbackProfile(userType, userId, nickname);

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      nickname,
      user_type: userType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('Supabase profile fallback:', error.message);
    return fallbackProfile(userType, userId, nickname);
  }

  return data;
}

export async function fetchProfile(userId = getLocalUserId(), userType = 'wheelchair') {
  if (!hasSupabaseConfig) return fallbackProfile(userType, userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Supabase profile fetch fallback:', error.message);
    return fallbackProfile(userType, userId);
  }

  return data || ensureLocalProfile(userType, { userId });
}

export async function fetchPlaces() {
  if (!hasSupabaseConfig) return PLACES;

  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('name');

  if (error || !data?.length) {
    if (error) console.warn('Supabase places fallback:', error.message);
    return PLACES;
  }

  return data;
}

export async function fetchReports() {
  if (!hasSupabaseConfig) return getAllReports();

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase reports fallback:', error.message);
    return getAllReports();
  }

  return data?.length ? data : getAllReports();
}

async function addReportPoints(userId, hasImage) {
  if (!hasSupabaseConfig) return null;

  const current = await fetchProfile(userId);
  const nextPoints = (current?.points || 0) + 10 + (hasImage ? 20 : 0);
  const nextLevel = Math.max(1, Math.floor(nextPoints / 500) + 1);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      points: nextPoints,
      level: nextLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.warn('Supabase points update skipped:', error.message);
    return current;
  }

  return data;
}

export async function createReport(reportInput) {
  const userId = reportInput.user_id || getLocalUserId();
  const report = {
    place_id: reportInput.place_id,
    user_id: userId,
    issue_type: reportInput.issue_type,
    description: reportInput.description,
    image_url: reportInput.image_url || '',
    lat: reportInput.lat,
    lng: reportInput.lng,
    status: 'active',
    verified_count: 0,
  };

  if (!hasSupabaseConfig) {
    const localReport = {
      ...report,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    saveStoredReport(localReport);
    return { data: localReport, profile: fallbackProfile(), source: 'local' };
  }

  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select()
    .single();

  if (error) {
    console.warn('Supabase report fallback:', error.message);
    const localReport = {
      ...report,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    saveStoredReport(localReport);
    return { data: localReport, profile: fallbackProfile(), source: 'fallback', error };
  }

  const profile = await addReportPoints(userId, Boolean(report.image_url));
  return { data, profile, source: 'supabase' };
}

export async function updateUserType(userType, userId = getLocalUserId()) {
  localStorage.setItem('ableRouteUserType', userType);

  if (!hasSupabaseConfig) return fallbackProfile(userType, userId);

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      nickname: 'able_user01',
      user_type: userType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('Supabase user type fallback:', error.message);
    return fallbackProfile(userType, userId);
  }

  return data;
}

export function getPlaceById(placeId) {
  return PLACES.find(place => place.id === placeId) || PLACES[0];
}

export function getReportsForPlace(placeId) {
  return getAllReports().filter(report => report.place_id === placeId);
}

export function filterReportsForPlace(reports, placeId) {
  return reports.filter(report => report.place_id === placeId);
}

export function calculateReliability(place, reports) {
  const publicScore = place.public_data ? 30 : 0;
  const reportCount = reports.length + (place.recent_reports_count || 0);
  const reportScore = reportCount >= 10 ? 30 : reportCount >= 4 ? 20 : reportCount >= 1 ? 10 : 0;
  const latestReportDate = reports
    .map(report => new Date(report.created_at).getTime())
    .filter(Boolean)
    .sort((a, b) => b - a)[0];
  const latestDate = latestReportDate || new Date(place.last_updated).getTime();
  const daysOld = Math.floor((Date.now() - latestDate) / 86400000);
  const recencyScore = daysOld <= 7 ? 30 : daysOld <= 30 ? 15 : 0;

  return Math.min(100, publicScore + reportScore + recencyScore);
}

export function getRiskLevel(place, reports) {
  const issueTypes = reports.map(report => report.issue_type);
  if (
    place.has_stairs ||
    place.has_curb ||
    issueTypes.includes('elevator_broken') ||
    issueTypes.includes('blocked') ||
    issueTypes.includes('stairs') ||
    issueTypes.includes('curb')
  ) {
    return 'red';
  }
  if (place.slope_level === 'medium' || issueTypes.includes('steep_slope') || issueTypes.includes('slope')) {
    return 'yellow';
  }
  return 'green';
}

export function buildAccessibilitySummary(place, reports, userType) {
  const label = getUserTypeLabel(userType);
  const issueTypes = reports.map(report => report.issue_type);
  const hasElevatorProblem = !place.has_elevator || issueTypes.includes('elevator_broken');
  const hasStepProblem = place.has_stairs || place.has_curb || issueTypes.includes('stairs') || issueTypes.includes('curb');
  const hasSlopeProblem = place.slope_level !== 'low' || issueTypes.includes('steep_slope') || issueTypes.includes('slope');

  if (userType === 'wheelchair' && (hasElevatorProblem || hasStepProblem)) {
    return {
      oneLine: `${label} 이용자는 ${place.name} 이용이 어렵습니다.`,
      risks: '엘리베이터 이용 제한과 계단/턱 위험이 확인됩니다.',
      action: '4번 출구처럼 엘리베이터가 있는 대체 출구를 이용하세요.',
      accessible: false,
    };
  }

  if ((userType === 'stroller' || userType === 'elderly') && hasStepProblem) {
    return {
      oneLine: `${label} 기준으로 주의가 필요한 경로입니다.`,
      risks: '계단 또는 턱이 있어 이동 속도가 느려질 수 있습니다.',
      action: '가능하면 엘리베이터가 있는 출구를 선택하고 보호자 동행을 권장합니다.',
      accessible: false,
    };
  }

  if (hasSlopeProblem) {
    return {
      oneLine: `${label} 기준으로 이동은 가능하지만 경사 구간 주의가 필요합니다.`,
      risks: '경사 구간 관련 제보가 있습니다.',
      action: '천천히 이동하고 우천 시 대체 경로를 확인하세요.',
      accessible: true,
    };
  }

  return {
    oneLine: `${label} 기준으로 이동 가능한 경로입니다.`,
    risks: '큰 위험 요소가 확인되지 않았습니다.',
    action: '현재 추천 경로를 이용해도 됩니다.',
    accessible: true,
  };
}

export function formatRelativeDate(dateValue) {
  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 86400000));
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '1일 전';
  return `${diffDays}일 전`;
}
