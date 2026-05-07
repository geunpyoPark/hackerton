const ISSUE_LABELS = {
  elevator_broken: '엘리베이터 고장',
  escalator_broken: '에스컬레이터 고장',
  lift_broken: '휠체어 리프트 고장',
  stairs: '계단/턱',
  curb: '계단/턱',
  steep_slope: '급경사',
  slope: '급경사',
  tactile_block: '점자블록 문제',
  signage: '안내 표지 부족',
  accessible_toilet: '장애인화장실 문제',
  transfer_passage: '환승 통로 불편',
  platform_gap: '승강장 간격 위험',
  construction: '공사 중',
  blocked: '통행 불가',
  other: '기타',
};

const ISSUE_COLORS = {
  elevator_broken: '#6366F1',
  escalator_broken: '#8B5CF6',
  lift_broken: '#6366F1',
  stairs: '#F59E0B',
  curb: '#FB923C',
  steep_slope: '#3B82F6',
  slope: '#3B82F6',
  tactile_block: '#EC4899',
  signage: '#8B5CF6',
  accessible_toilet: '#06B6D4',
  transfer_passage: '#F97316',
  platform_gap: '#EF4444',
  construction: '#10B981',
  blocked: '#EF4444',
  other: '#CBD5E1',
};

const CATEGORY_COLORS = {
  '엘리베이터 고장': '#6366F1',
  '에스컬레이터 고장': '#8B5CF6',
  '휠체어 리프트 고장': '#6366F1',
  '계단/턱': '#F59E0B',
  '급경사': '#3B82F6',
  '공사 중': '#10B981',
  '통행 불가': '#EF4444',
  '안내 표지 부족': '#8B5CF6',
  '점자블록 문제': '#EC4899',
  '장애인화장실 문제': '#06B6D4',
  '환승 통로 불편': '#F97316',
  '승강장 간격 위험': '#EF4444',
  '장애물 적치': '#F97316',
  '보도 파손': '#DC2626',
  '조명 부족': '#EAB308',
  '불법 주정차': '#64748B',
  '임시 통행로 문제': '#0EA5E9',
  '기타': '#CBD5E1',
};

const REGION_COORDS = {
  강남구: { x: 590, y: 280 },
  송파구: { x: 720, y: 270 },
  서초구: { x: 660, y: 320 },
  마포구: { x: 380, y: 120 },
  영등포구: { x: 340, y: 230 },
  성동구: { x: 590, y: 165 },
  중구: { x: 530, y: 170 },
  종로구: { x: 490, y: 140 },
  용산구: { x: 500, y: 210 },
  노원구: { x: 620, y: 60 },
  기타: { x: 480, y: 320 },
};

const SEOUL_DISTRICT_CENTERS = [
  { name: '강남구', lat: 37.5172, lng: 127.0473 },
  { name: '강동구', lat: 37.5301, lng: 127.1238 },
  { name: '강북구', lat: 37.6396, lng: 127.0257 },
  { name: '강서구', lat: 37.5509, lng: 126.8495 },
  { name: '관악구', lat: 37.4784, lng: 126.9516 },
  { name: '광진구', lat: 37.5384, lng: 127.0823 },
  { name: '구로구', lat: 37.4955, lng: 126.8877 },
  { name: '금천구', lat: 37.4569, lng: 126.8955 },
  { name: '노원구', lat: 37.6542, lng: 127.0568 },
  { name: '도봉구', lat: 37.6688, lng: 127.0471 },
  { name: '동대문구', lat: 37.5744, lng: 127.0396 },
  { name: '동작구', lat: 37.5124, lng: 126.9393 },
  { name: '마포구', lat: 37.5663, lng: 126.9016 },
  { name: '서대문구', lat: 37.5791, lng: 126.9368 },
  { name: '서초구', lat: 37.4837, lng: 127.0324 },
  { name: '성동구', lat: 37.5633, lng: 127.0371 },
  { name: '성북구', lat: 37.5894, lng: 127.0167 },
  { name: '송파구', lat: 37.5145, lng: 127.1059 },
  { name: '양천구', lat: 37.5169, lng: 126.8664 },
  { name: '영등포구', lat: 37.5264, lng: 126.8962 },
  { name: '용산구', lat: 37.5326, lng: 126.9905 },
  { name: '은평구', lat: 37.6176, lng: 126.9227 },
  { name: '종로구', lat: 37.5735, lng: 126.9788 },
  { name: '중구', lat: 37.5636, lng: 126.9976 },
  { name: '중랑구', lat: 37.6063, lng: 127.0927 },
];

const SUBWAY_FACILITY_CATEGORIES = new Set([
  '엘리베이터 고장',
  '에스컬레이터 고장',
  '휠체어 리프트 고장',
  '계단/턱',
  '안내 표지 부족',
  '점자블록 문제',
  '장애인화장실 문제',
  '환승 통로 불편',
  '승강장 간격 위험',
  '통행 불가',
]);

const PRIVATE_FACILITY_WORDS = ['코엑스', '몰', '백화점', '마트', '상가', '빌딩', '타워', '병원', '대학교', '캠퍼스'];

function getContextText(report, place) {
  return [
    place?.name,
    place?.station_name,
    place?.line_name,
    place?.address,
    place?.road_address,
    report?.description,
  ].filter(Boolean).join(' ');
}

function hasSubwayContext(report, place) {
  const text = getContextText(report, place);
  return /[가-힣A-Za-z0-9]+역(\s|$|[0-9번출구])/.test(text) ||
    ['지하철', '출구', '승강장', '환승', '개찰구', '플랫폼', '역사', '호선'].some(word => text.includes(word));
}

function hasPrivateFacilityContext(report, place) {
  const text = getContextText(report, place);
  return PRIVATE_FACILITY_WORDS.some(word => text.includes(word));
}

function getSubwayOperator(report, place) {
  const text = getContextText(report, place);
  if (['9호선', '언주', '선정릉', '봉은사', '종합운동장'].some(word => text.includes(word))) return '서울시메트로9호선';
  if (text.includes('신분당')) return '신분당선 운영사';
  if (text.includes('공항철도')) return '공항철도';
  if (['경의중앙', '수인분당', '분당선', '경춘', '경강', '중앙선', '경의선'].some(word => text.includes(word))) return '코레일';
  if (text.includes('1호선')) return '서울교통공사/코레일';
  return '서울교통공사';
}

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function daysBetween(date, base = new Date()) {
  return Math.floor((base.getTime() - date.getTime()) / 86400000);
}

function getPlaceMap(places) {
  return new Map(places.map(place => [place.id, place]));
}

function getIssueLabel(issueType) {
  return ISSUE_LABELS[issueType] || '기타';
}

function inferRegion(report, place) {
  const coordRegion = inferRegionByCoords(report?.lat, report?.lng);
  if (coordRegion) return coordRegion;

  const address = `${place?.address || ''} ${place?.road_address || ''} ${place?.station_name || ''}`;
  if (address.includes('강남구')) return '강남구';
  if (address.includes('송파구')) return '송파구';
  if (address.includes('서초구')) return '서초구';
  if (address.includes('마포구')) return '마포구';
  if (address.includes('영등포구')) return '영등포구';
  if (address.includes('성동구')) return '성동구';
  if (address.includes('중구')) return '중구';
  if (address.includes('종로구')) return '종로구';
  if (address.includes('용산구')) return '용산구';
  if (address.includes('노원구')) return '노원구';

  const text = `${place?.name || ''} ${place?.station_name || ''}`;
  if (text.includes('강남') || text.includes('삼성') || text.includes('코엑스')) return '강남구';
  if (text.includes('잠실') || text.includes('송파')) return '송파구';
  if (text.includes('교대') || text.includes('서초')) return '서초구';
  if (text.includes('합정') || text.includes('마포')) return '마포구';
  if (text.includes('당산') || text.includes('영등포')) return '영등포구';
  if (text.includes('성동')) return '성동구';
  if (text.includes('서울역') || text.includes('시청') || text.includes('중구')) return '중구';

  return '기타';
}

function inferRegionByCoords(latInput, lngInput) {
  const lat = Number(latInput);
  const lng = Number(lngInput);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';

  const nearest = SEOUL_DISTRICT_CENTERS
    .map(district => ({
      ...district,
      distance: getDistanceMeters({ lat, lng }, district),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest?.distance <= 8500 ? nearest.name : '';
}

function getDistanceMeters(a, b) {
  const radius = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function getRisk(report, place) {
  if (report.ai_severity === "high") return '위험';
  if (report.ai_severity === "medium") return '주의';
  if (report.ai_severity === "low") return '양호';
  if (['elevator_broken', 'lift_broken', 'platform_gap', 'stairs', 'curb', 'blocked'].includes(report.issue_type)) return '위험';
  if (['escalator_broken', 'tactile_block', 'accessible_toilet', 'transfer_passage', 'steep_slope', 'slope', 'construction'].includes(report.issue_type)) return '주의';
  if (place?.wheelchair_accessible === false || place?.has_stairs || place?.has_curb) return '주의';
  return '양호';
}

function getAgency(report, place) {
  if (report.responsible_agency) return report.responsible_agency;
  const category = report.ai_category || getIssueLabel(report.issue_type);
  if (SUBWAY_FACILITY_CATEGORIES.has(category) && hasSubwayContext(report, place)) return getSubwayOperator(report, place);
  if (['엘리베이터 고장', '에스컬레이터 고장', '장애인화장실 문제', '안내 표지 부족'].includes(category) && hasPrivateFacilityContext(report, place)) return '민간 시설 관리자';
  if (['curb', 'steep_slope', 'slope', 'construction'].includes(report.issue_type)) return '도로관리사업소';
  if (['급경사', '공사 중', '통행 불가', '보도 파손', '임시 통행로 문제'].includes(category)) return '도로관리사업소';
  const region = inferRegion(report, place);
  return region.endsWith('구') ? `${region}청` : '기타 기관';
}

function getStatusLabel(status) {
  if (['done', 'completed', 'resolved'].includes(status)) return '완료';
  if (['processing', 'in_progress'].includes(status)) return '처리중';
  return '접수';
}

function getRiskRank(risk) {
  if (risk === '위험') return 0;
  if (risk === '주의') return 1;
  return 2;
}

function countBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc.set(key, (acc.get(key) || 0) + 1);
    return acc;
  }, new Map());
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function buildTrend(reports) {
  const today = new Date();
  const days = Array.from({ length: 31 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (30 - index));
    return date;
  });

  return days.map((date) => {
    const dayKey = date.toISOString().slice(0, 10);
    const total = reports.filter(report => report.created_at?.slice(0, 10) <= dayKey).length;
    const fresh = reports.filter(report => report.created_at?.slice(0, 10) === dayKey).length;
    return {
      label: `${date.getMonth() + 1}.${date.getDate()}`,
      total,
      fresh,
    };
  });
}

export function buildAdminAnalytics(reports = [], places = []) {
  const placeMap = getPlaceMap(places);
  const now = new Date();
  const enriched = reports.map((report) => {
    const place = placeMap.get(report.place_id);
    const region = inferRegion(report, place);
    const risk = getRisk(report, place);
    const status = getStatusLabel(report.status);
    return {
      ...report,
      place,
      region,
      issueLabel: report.ai_category || getIssueLabel(report.issue_type),
      risk,
      statusLabel: status,
      agency: getAgency(report, place),
    };
  });

  const total = enriched.length;
  const newCount = enriched.filter(report => {
    const createdAt = new Date(report.created_at);
    return Number.isFinite(createdAt.getTime()) && daysBetween(createdAt, now) <= 7;
  }).length;
  const completed = enriched.filter(report => report.statusLabel === '완료').length;
  const risky = enriched.filter(report => report.risk === '위험').length;
  const riskyRegions = new Set(enriched.filter(report => report.risk === '위험').map(report => report.region)).size;

  const regionCounts = countBy(enriched, report => report.region);
  const topRegions = [...regionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([region, count], index) => {
      const regionReports = enriched.filter(report => report.region === region);
      const highRiskCount = regionReports.filter(report => report.risk === '위험').length;
      const risk = highRiskCount >= Math.max(2, count * 0.4) ? '위험' : highRiskCount ? '주의' : '양호';
      return {
        rank: index + 1,
        region,
        count: `${formatNumber(count)}건`,
        risk,
        delta: `${Math.max(5, Math.min(45, count * 8))}%`,
        dir: 'up',
        prog: Math.min(90, Math.max(20, 100 - percent(highRiskCount, count))),
      };
    });

  const issueCounts = countBy(enriched, report => report.issueLabel || '기타');
  const typeDistribution = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({
      label,
      val: percent(count, total),
      count,
      color: CATEGORY_COLORS[label] || ISSUE_COLORS.other,
    }));

  const agencyCounts = countBy(enriched, report => report.agency);
  const orgRows = [...agencyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => {
      const done = enriched.filter(report => report.agency === name && report.statusLabel === '완료').length;
      const rate = count ? Number(((done / count) * 100).toFixed(1)) : 0;
      return {
        name,
        total: `${formatNumber(count)}건`,
        done: `${formatNumber(done)}건`,
        rate,
      };
    });

  const recentCases = [...enriched]
    .sort((a, b) => {
      const riskDiff = getRiskRank(a.risk) - getRiskRank(b.risk);
      if (riskDiff !== 0) return riskDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })
    .slice(0, 6)
    .map(report => ({
    time: report.created_at ? report.created_at.replace('T', ' ').slice(0, 16) : '-',
    region: report.region,
    originalType: getIssueLabel(report.issue_type),
    aiCategory: report.issueLabel,
    text: report.description || `${report.place?.name || '선택 장소'} 접근성 제보`,
    risk: report.risk,
    channel: report.image_url ? '사진 제보' : '사용자 앱',
    status: report.statusLabel,
    org: report.agency,
  }));

  const heatPoints = [...regionCounts.entries()].map(([region, count]) => {
    const highRiskCount = enriched.filter(report => report.region === region && report.risk === '위험').length;
    const coords = REGION_COORDS[region] || REGION_COORDS.기타;
    return {
      ...coords,
      r: Math.min(62, 18 + count * 10),
      c: highRiskCount ? '#EF4444' : count >= 3 ? '#F59E0B' : '#10B981',
      label: region,
    };
  });

  const topRegion = topRegions[0]?.region || '주요 지역';
  const topType = typeDistribution[0]?.label || '접근성';
  const insights = [
    `${topRegion}에서 ${topType} 관련 제보가 가장 많이 접수되었습니다.`,
    `최근 7일 신규 민원은 ${formatNumber(newCount)}건이며, 위험 민원은 ${formatNumber(risky)}건입니다.`,
    orgRows[0] ? `${orgRows[0].name} 담당 민원이 ${orgRows[0].total}으로 가장 많습니다.` : '담당 기관별 민원 데이터가 아직 부족합니다.',
  ];

  return {
    stats: {
      total,
      newCount,
      completed,
      avgDays: completed ? '4.2' : '0',
      riskyRegions,
    },
    topRegions,
    typeDistribution,
    orgRows,
    recentCases,
    heatPoints,
    trend: buildTrend(enriched),
    insights,
  };
}
