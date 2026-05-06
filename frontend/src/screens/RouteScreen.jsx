import { AR } from '../design';
import { KakaoMap } from '../components/KakaoMap';
import { TabBar } from '../components/TabBar';
import { PLACES } from '../data/accessibility';
import {
  buildAccessibilitySummary,
  calculateReliability,
  filterReportsForPlace,
  formatRelativeDate,
  getRiskLevel,
  getUserTypeLabel,
} from '../lib/accessibility';

export function RouteScreen({ onNavigate, onBack, userType = 'wheelchair', places = PLACES, reports: allReports = [] }) {
  const mainPlace = places.find(place => place.id === 'gangnam-exit-2') || places[0] || PLACES[0];
  const reports = filterReportsForPlace(allReports, mainPlace.id);
  const reliability = calculateReliability(mainPlace, reports);
  const summary = buildAccessibilitySummary(mainPlace, reports, userType);
  const mapPlaces = places.map(place => ({
    ...place,
    risk: getRiskLevel(place, filterReportsForPlace(allReports, place.id)),
  }));
  const reportCount = reports.length + mainPlace.recent_reports_count;

  return (
    <div style={{
      width: '100%', height: '100%', background: AR.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: AR.font, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px 12px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ width: 36, height: 36, border: 'none', background: 'transparent' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={AR.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: AR.ink }}>경로 상세</div>
        <button style={{ width: 36, height: 36, border: 'none', background: 'transparent' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="12" r="2.5" stroke={AR.ink} strokeWidth="2"/>
            <circle cx="18" cy="6" r="2.5" stroke={AR.ink} strokeWidth="2"/>
            <circle cx="18" cy="18" r="2.5" stroke={AR.ink} strokeWidth="2"/>
            <path d="M8 11l8-4M8 13l8 4" stroke={AR.ink} strokeWidth="2"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Route summary */}
        <div style={{ padding: '8px 16px 12px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: AR.ink, letterSpacing: '-0.01em' }}>강남역</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M14 6l6 6-6 6" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 18, fontWeight: 800, color: AR.ink, letterSpacing: '-0.01em' }}>코엑스</div>
            </div>
            <div style={{
              background: '#EFF4FF', color: AR.blue,
              fontSize: 11, fontWeight: 700,
              padding: '4px 8px', borderRadius: 6,
            }}>{getUserTypeLabel(userType)} 모드</div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            border: `1px solid ${AR.border}`, borderRadius: 12, overflow: 'hidden',
          }}>
            <Stat label="총 거리" value="1.2 km"/>
            <Stat label="예상 시간" value="15분" border/>
            <Stat label="접근성 점수" value={`${reliability}%`} valueColor={reliability >= 80 ? AR.green : AR.yellow} border/>
          </div>
        </div>

        {/* Map */}
        <div style={{ position: 'relative', height: 280, background: '#E8EEF4', overflow: 'hidden' }}>
          <KakaoMap places={mapPlaces}/>
          <div style={{
            position: 'absolute', top: 12, right: 12,
            width: 38, height: 38, borderRadius: 10,
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 2v20M3 7l9 5 9-5" stroke={AR.ink} strokeWidth="1.6"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 38, height: 38, borderRadius: 19,
            background: AR.blue, boxShadow: '0 4px 12px rgba(37,99,235,0.32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#fff"/>
              <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Detail cards */}
        <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Route summary card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${AR.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AR.muted, marginBottom: 10 }}>추천 경로 요약</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: summary.accessible ? AR.greenSoft : AR.redSoft, color: summary.accessible ? AR.green : AR.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>✓</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: AR.ink }}>{summary.oneLine}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke={AR.muted} strokeWidth="1.8"/>
                <path d="M12 7v5l3 2" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 14, color: AR.ink }}>15분 소요 (1.2km)</div>
            </div>
          </div>

          {/* Risks card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${AR.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AR.muted, marginBottom: 10 }}>위험 요소</div>
            {reports.slice(0, 3).map(report => (
              <RiskRow
                key={report.id}
                severity={report.issue_type === 'elevator_broken' || report.issue_type === 'blocked' ? 'red' : 'yellow'}
                title={report.description || '접근성 위험 제보'}
                sub={`${formatRelativeDate(report.created_at)} 제보`}
              />
            ))}
            <div style={{ height: 8 }}/>
            <RiskRow severity="yellow" title={summary.risks} sub="공공데이터와 사용자 제보 기반"/>
          </div>

          {/* AI summary */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF4FF 0%, #F0FDF4 100%)',
            borderRadius: 14, padding: 16,
            border: `1px solid ${AR.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{
                background: AR.blue, color: '#fff',
                fontSize: 10, fontWeight: 800,
                padding: '3px 7px', borderRadius: 5, letterSpacing: '0.04em',
              }}>AI</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: AR.ink }}>AI 추천 안내</div>
            </div>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.55 }}>
              {summary.oneLine}{' '}
              <span style={{ color: summary.accessible ? AR.green : AR.red, fontWeight: 700 }}>{summary.action}</span>
            </div>
          </div>

          {/* Score card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${AR.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: AR.muted }}>접근성 신뢰도</div>
              <div style={{ fontSize: 11, color: AR.muted }}>최근 제보 {reportCount}건 · {formatRelativeDate(mainPlace.last_updated)} 업데이트</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: reliability >= 80 ? AR.green : AR.yellow, letterSpacing: '-0.02em' }}>{reliability}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: reliability >= 80 ? AR.green : AR.yellow }}>%</div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: reliability >= 80 ? AR.green : AR.yellow, fontWeight: 600 }}>{reliability >= 80 ? '높음' : '주의'}</div>
            </div>
            <div style={{ height: 8, background: AR.bg, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${reliability}%`, height: '100%',
                background: `linear-gradient(90deg, ${reliability >= 80 ? AR.green : AR.yellow} 0%, #34D399 100%)`,
                borderRadius: 4,
              }}/>
            </div>
          </div>
        </div>
      </div>

      <TabBar active="route" onNavigate={onNavigate}/>
    </div>
  );
}

function Stat({ label, value, valueColor, border }) {
  return (
    <div style={{
      padding: '10px 8px', textAlign: 'center',
      borderLeft: border ? `1px solid ${AR.border}` : 'none',
    }}>
      <div style={{ fontSize: 11, color: AR.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: valueColor || AR.ink, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

function RiskRow({ severity, title, sub }) {
  const sev = AR.sev[severity];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11,
        background: sev.soft, color: sev.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l11 18H1L12 3z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
          <path d="M12 10v5M12 17.5v.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: AR.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: AR.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}
