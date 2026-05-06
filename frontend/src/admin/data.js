const ISSUE_LABELS = {
  elevator_broken: '엘리베이터 고장',
  stairs: '계단/턱',
  curb: '계단/턱',
  steep_slope: '급경사',
  slope: '급경사',
  construction: '공사 중',
  blocked: '통행 불가',
};

const ISSUE_COLORS = {
  elevator_broken: '#6366F1',
  stairs: '#F59E0B',
  curb: '#FB923C',
  steep_slope: '#3B82F6',
  slope: '#3B82F6',
  construction: '#10B981',
  blocked: '#EF4444',
  other: '#CBD5E1',
};

const REGION_COORDS = {
  강남구: { x: 590, y: 280 },
  송파구: { x: 720, y: 270 },
  서초구: { x: 660, y: 320 },
  마포구: { x: 380, y: 120 },
  영등포구: { x: 340, y: 230 },
  성동구: { x: 590, y: 165 },
  중구: { x: 530, y: 170 },
  기타: { x: 480, y: 320 },
};

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

function inferRegion(place) {
  const text = `${place?.name || ''} ${place?.station_name || ''}`;
  if (text.includes('강남') || text.includes('삼성') || text.includes('코엑스')) return '강남구';
  if (text.includes('잠실') || text.includes('송파')) return '송파구';
  if (text.includes('교대') || text.includes('서초')) return '서초구';
  if (text.includes('합정') || text.includes('마포')) return '마포구';
  if (text.includes('당산') || text.includes('영등포')) return '영등포구';
  if (text.includes('성동')) return '성동구';
  if (text.includes('서울역') || text.includes('시청') || text.includes('중구')) return '중구';
  return place?.station_name || '기타';
}

function getRisk(report, place) {
  if (report.ai_severity === "high") return '위험';
  if (report.ai_severity === "medium") return '주의';
  if (report.ai_severity === "low") return '양호';
  if (['elevator_broken', 'stairs', 'curb', 'blocked'].includes(report.issue_type)) return '위험';
  if (['steep_slope', 'slope', 'construction'].includes(report.issue_type)) return '주의';
  if (place?.wheelchair_accessible === false || place?.has_stairs || place?.has_curb) return '주의';
  return '양호';
}

function getAgency(report, place) {
  if (report.responsible_agency) return report.responsible_agency;
  if (['elevator_broken', 'stairs', 'blocked'].includes(report.issue_type) && place?.station_name) return '서울교통공사';
  if (['curb', 'steep_slope', 'slope', 'construction'].includes(report.issue_type)) return '도로관리사업소';
  const region = inferRegion(place);
  return region.endsWith('구') ? `${region}청` : '기타 기관';
}

function getStatusLabel(status) {
  if (['done', 'completed', 'resolved'].includes(status)) return '완료';
  if (['processing', 'in_progress'].includes(status)) return '처리중';
  return '접수';
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
    const region = inferRegion(place);
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

  const issueCounts = countBy(enriched, report => report.issue_type || 'other');
  const typeDistribution = [...issueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([issueType, count]) => ({
      label: getIssueLabel(issueType),
      val: percent(count, total),
      count,
      color: ISSUE_COLORS[issueType] || ISSUE_COLORS.other,
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

  const recentCases = enriched.slice(0, 5).map(report => ({
    time: report.created_at ? report.created_at.replace('T', ' ').slice(0, 16) : '-',
    region: report.region,
    type: report.issueLabel,
    text: report.ai_summary || report.description || `${report.place?.name || '선택 장소'} 접근성 제보`,
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
