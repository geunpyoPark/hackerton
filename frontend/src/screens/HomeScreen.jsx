import { useState } from 'react';
import { AR } from '../design';
import { WheelchairIcon, StrollerIcon, ElderlyIcon, CrutchIcon, AppLogo } from '../components/Icons';
import { TabBar } from '../components/TabBar';
import { PLACES } from '../data/accessibility';

const USER_TYPES = [
  { id: 'wheelchair', label: '휠체어', Icon: WheelchairIcon },
  { id: 'stroller',   label: '유모차', Icon: StrollerIcon },
  { id: 'elderly',    label: '노약자', Icon: ElderlyIcon },
  { id: 'crutch',     label: '목발',   Icon: CrutchIcon },
];

export function HomeScreen({
  onNavigate,
  userType = 'wheelchair',
  onUserTypeChange,
  places = PLACES,
  reports = [],
  dataStatus = 'ready',
  routeQuery,
  onRouteSearch,
}) {
  const [from, setFrom] = useState(routeQuery?.from || '강남역');
  const [to, setTo] = useState(routeQuery?.to || '코엑스');
  const activeType = USER_TYPES.find(t => t.id === userType);
  const recentReports = reports.slice(0, 3);
  const featuredPlace = places.find(place => place.id === 'gangnam-exit-2') || places[0] || PLACES[0];

  return (
    <div style={{
      width: '100%', height: '100%', background: AR.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: AR.font, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 20px 12px',
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: AR.blue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AppLogo size={16} color="#fff"/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: AR.ink, letterSpacing: '-0.02em' }}>AbleRoute</div>
        </div>
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: AR.bg, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" stroke={AR.ink} strokeWidth="2" strokeLinejoin="round"/>
            <path d="M10 19a2 2 0 0 0 4 0" stroke={AR.ink} strokeWidth="2"/>
          </svg>
          <span style={{
            position: 'absolute', top: 8, right: 9,
            width: 7, height: 7, borderRadius: 4, background: AR.red,
            border: '1.5px solid #fff',
          }}/>
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 20px' }}>
        {/* Mode indicator */}
        <div style={{
          background: '#fff', borderRadius: 14,
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1px solid ${AR.border}`,
          marginTop: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: '#EFF4FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeType && <activeType.Icon size={16} color={AR.blue}/>}
            </div>
            <div style={{ fontSize: 13, color: AR.ink, fontWeight: 600 }}>
              {activeType?.label} 사용자 모드
            </div>
          </div>
          <button onClick={() => onNavigate?.('profile')} style={{
            background: '#EFF4FF', color: AR.blue,
            border: 'none', borderRadius: 8,
            padding: '6px 10px', fontSize: 12, fontWeight: 600,
            fontFamily: AR.font,
          }}>유형 변경</button>
        </div>

        {/* Search card */}
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: 16, marginTop: 12,
          border: `1px solid ${AR.border}`,
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: AR.blue }}/>
              <div style={{ width: 2, height: 28, background: AR.border, margin: '4px 0' }}/>
              <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                <path d="M6 1C3.2 1 1 3.2 1 6c0 3.8 5 7 5 7s5-3.2 5-7c0-2.8-2.2-5-5-5z" fill={AR.red}/>
              </svg>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <input aria-label="출발지" value={from} onChange={(event) => setFrom(event.target.value)} style={{
                padding: '11px 12px', borderRadius: 10, background: AR.bg,
                fontSize: 14, color: AR.ink, border: 'none', outline: 'none',
              }}/>
              <div style={{ height: 8 }}/>
              <input aria-label="도착지" value={to} onChange={(event) => setTo(event.target.value)} style={{
                padding: '11px 12px', borderRadius: 10, background: AR.bg,
                fontSize: 14, color: AR.ink, border: 'none', outline: 'none',
              }}/>
            </div>
            <button onClick={() => {
              setFrom(to);
              setTo(from);
            }} style={{
              width: 36, alignSelf: 'center',
              background: 'transparent', border: 'none',
              display: 'flex', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M7 4v14M7 18l-3-3M7 18l3-3M17 20V6M17 6l-3 3M17 6l3 3" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <button onClick={() => {
            if (onRouteSearch) {
              onRouteSearch({ from, to });
              return;
            }
            onNavigate?.('route');
          }} style={{
            marginTop: 14, width: '100%', height: 50,
            background: AR.blue, color: '#fff',
            border: 'none', borderRadius: 12,
            fontSize: 16, fontWeight: 700,
            fontFamily: AR.font,
            boxShadow: '0 4px 12px rgba(37,99,235,0.24)',
          }}>경로 검색하기</button>
        </div>

        {/* User type select */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink, marginBottom: 10 }}>사용자 유형 선택</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {USER_TYPES.map(({ id, label, Icon }) => {
              const active = userType === id;
              return (
            <button key={id} onClick={() => onUserTypeChange?.(id)} style={{
                  background: active ? '#EFF4FF' : '#fff',
                  border: `1.5px solid ${active ? AR.blue : AR.border}`,
                  borderRadius: 14,
                  padding: '14px 4px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  fontFamily: AR.font,
                }}>
                  <Icon size={26} color={active ? AR.blue : AR.ink}/>
                  <div style={{ fontSize: 12, fontWeight: 600, color: active ? AR.blue : AR.ink }}>{label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured card */}
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(120deg, #EFF4FF 0%, #F5F0FF 100%)',
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `1px solid ${AR.border}`,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" stroke={AR.red} strokeWidth="2"/>
                <circle cx="12" cy="9" r="2.5" fill={AR.red}/>
              </svg>
              <div style={{ fontSize: 11, fontWeight: 600, color: AR.muted }}>최근 제보가 많은 역</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: AR.ink, marginTop: 4, letterSpacing: '-0.01em' }}>
              {featuredPlace.name}
            </div>
            <div style={{
              fontSize: 12, color: AR.blue, fontWeight: 600,
              marginTop: 8, display: 'flex', alignItems: 'center', gap: 2,
            }}>
              바로 확인하기
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke={AR.blue} strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${AR.border}`,
          }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="14" width="14" height="14" rx="2" fill="#FECACA"/>
              <rect x="9" y="11" width="14" height="14" rx="2" fill={AR.red}/>
              <path d="M14 17l3 3 4-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Recent reports */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink }}>최근 제보</div>
          <div style={{ fontSize: 12, color: AR.muted, display: 'flex', alignItems: 'center', gap: 2 }}>
            더보기
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 6l6 6-6 6" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          {recentReports.map(report => {
            const place = places.find(item => item.id === report.place_id) || PLACES[0];
            return (
              <ReportRow
                key={report.id}
                severity={report.issue_type === 'elevator_broken' || report.issue_type === 'blocked' ? 'red' : 'yellow'}
                time={report.created_at.slice(5, 16).replace('T', ' ')}
                title={report.description || '접근성 제보'}
                loc={place.name}
                icon={report.issue_type === 'curb' ? 'bump' : report.issue_type === 'slope' || report.issue_type === 'steep_slope' ? 'slope' : 'elev'}
              />
            );
          })}
          {!recentReports.length && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: `1px solid ${AR.border}`, fontSize: 13, color: AR.muted }}>
              {dataStatus === 'loading' ? '제보를 불러오는 중입니다.' : '아직 표시할 제보가 없습니다.'}
            </div>
          )}
        </div>
      </div>

      <TabBar active="home" onNavigate={onNavigate}/>
    </div>
  );
}

function ReportRow({ severity, time, title, loc, icon }) {
  const sev = AR.sev[severity];
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 12,
      display: 'flex', gap: 12, alignItems: 'center',
      border: `1px solid ${AR.border}`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: sev.soft, color: sev.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon === 'elev' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3v18M9 9l-2 2 2 2M15 13l2-2-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {icon === 'bump' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M2 18h4l3-8 3 14 3-10 3 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {icon === 'slope' && (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 19L21 5M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          background: sev.soft, color: sev.fg,
          fontSize: 10, fontWeight: 700,
          padding: '2px 6px', borderRadius: 4,
        }}>{time}</span>
        <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink, marginTop: 4, letterSpacing: '-0.01em' }}>{title}</div>
        <div style={{ fontSize: 12, color: AR.muted, marginTop: 2 }}>{loc}</div>
      </div>
    </div>
  );
}
