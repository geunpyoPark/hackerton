import { DEMO_REPORTS, PLACES, USER_TYPES } from '../data/accessibility';

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

export function getPlaceById(placeId) {
  return PLACES.find(place => place.id === placeId) || PLACES[0];
}

export function getReportsForPlace(placeId) {
  return getAllReports().filter(report => report.place_id === placeId);
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
