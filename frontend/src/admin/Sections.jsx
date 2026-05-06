import { AD } from './tokens';
import { Card, Pill, Trend, ProgressBar, MoreLink } from './shared';

// ─── TOP 5 Regions ────────────────────────────────────────────────────────────
const TOP_ROWS = [
  { rank: 1, region: '강남구',   count: '245건', risk: '위험', delta: '38%', dir: 'up',   prog: 35 },
  { rank: 2, region: '송파구',   count: '198건', risk: '위험', delta: '32%', dir: 'up',   prog: 28 },
  { rank: 3, region: '영등포구', count: '145건', risk: '주의', delta: '15%', dir: 'up',   prog: 42 },
  { rank: 4, region: '마포구',   count: '132건', risk: '주의', delta: '12%', dir: 'up',   prog: 30 },
  { rank: 5, region: '서초구',   count: '98건',  risk: '양호', delta: '5%',  dir: 'down', prog: 60 },
];
const RISK_TONE = { '위험': 'red', '주의': 'yellow', '양호': 'green' };

export function TopRegions() {
  const cols = '42px minmax(76px, 1fr) 64px 58px 76px minmax(126px, 1.25fr)';

  return (
    <Card title="TOP 5 위험 지역" padding={0}>
      <div style={{ padding: '16px 18px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: cols,
          gap: 8, alignItems: 'center',
          fontSize: 11, fontWeight: 700, color: AD.muted,
          padding: '0 4px 10px', borderBottom: `1px solid ${AD.borderSoft}`,
          wordBreak: 'keep-all',
        }}>
          <div>순위</div><div>지역</div>
          <div style={{ textAlign: 'right' }}>민원 수</div>
          <div style={{ textAlign: 'center' }}>위험도</div>
          <div style={{ textAlign: 'center' }}>최근 증가율</div>
          <div>처리 현황</div>
        </div>
        {TOP_ROWS.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: cols,
            gap: 8, alignItems: 'center',
            padding: '14px 4px',
            borderBottom: i < TOP_ROWS.length - 1 ? `1px solid ${AD.borderSoft}` : 'none',
            fontSize: 13,
            wordBreak: 'keep-all',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 11,
              background: i < 2 ? '#FEE2E2' : i < 4 ? '#FEF3C7' : '#F1F5F9',
              color: i < 2 ? '#DC2626' : i < 4 ? '#B45309' : AD.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 11,
            }}>{r.rank}</div>
            <div style={{ fontWeight: 700, color: AD.ink, whiteSpace: 'nowrap' }}>{r.region}</div>
            <div style={{ textAlign: 'right', color: AD.text, fontWeight: 600 }}>{r.count}</div>
            <div style={{ textAlign: 'center' }}><Pill tone={RISK_TONE[r.risk]} size="sm">{r.risk}</Pill></div>
            <div style={{ textAlign: 'center' }}><Trend dir={r.dir} value={r.delta}/></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ProgressBar value={r.prog} color={AD.primary}/>
              <div style={{ fontSize: 11, color: AD.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>처리중 {r.prog}%</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: AD.primary, fontWeight: 600, cursor: 'pointer' }}>
        전체 지역 보기 ›
      </div>
    </Card>
  );
}

// ─── Org Status ───────────────────────────────────────────────────────────────
const ORG_ROWS = [
  { name: '서울교통공사',   total: '562건', done: '235건', rate: 41.8 },
  { name: '강남구청',        total: '245건', done: '98건',  rate: 40.0 },
  { name: '송파구청',        total: '198건', done: '81건',  rate: 40.9 },
  { name: '도로관리사업소',  total: '145건', done: '72건',  rate: 49.7 },
  { name: '기타 기관',      total: '98건',  done: '62건',  rate: 63.3 },
];

export function OrgStatus() {
  const cols = 'minmax(112px, 1.2fr) 58px 58px minmax(52px, .7fr) 48px';

  return (
    <Card title="기관별 민원 현황" padding={0} action={<MoreLink/>}>
      <div style={{ padding: '4px 18px 0' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: cols,
          gap: 8, alignItems: 'center',
          fontSize: 11, fontWeight: 700, color: AD.muted,
          padding: '14px 4px 10px', borderBottom: `1px solid ${AD.borderSoft}`,
          wordBreak: 'keep-all',
        }}>
          <div>기관명</div>
          <div style={{ textAlign: 'right' }}>담당</div>
          <div style={{ textAlign: 'right' }}>처리 완료</div>
          <div>처리율</div>
          <div/>
        </div>
        {ORG_ROWS.map((o, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: cols,
            gap: 8, alignItems: 'center',
            padding: '12px 4px',
            borderBottom: i < ORG_ROWS.length - 1 ? `1px solid ${AD.borderSoft}` : 'none',
            fontSize: 13,
            wordBreak: 'keep-all',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: AD.primarySoft, color: AD.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M7 7h2M7 11h2M7 15h2M13 7h2M13 11h2M13 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ color: AD.ink, fontWeight: 600, lineHeight: 1.35, wordBreak: 'keep-all' }}>{o.name}</div>
            </div>
            <div style={{ textAlign: 'right', color: AD.text, fontWeight: 600 }}>{o.total}</div>
            <div style={{ textAlign: 'right', color: AD.text, fontWeight: 600 }}>{o.done}</div>
            <ProgressBar value={o.rate} color={AD.primary}/>
            <div style={{ textAlign: 'right', color: AD.ink, fontWeight: 700 }}>{o.rate}%</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: AD.primary, fontWeight: 600, cursor: 'pointer' }}>
        전체 기관 보기 ›
      </div>
    </Card>
  );
}

// ─── Premium Card ─────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ marginRight: 3 }}>
      <path d="M5 12l5 5 9-11" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PremiumRow({ icon, title, sub, action, tone, last }) {
  const btn = tone === 'green' ? { bg: '#D1FAE5', fg: '#047857' } : { bg: AD.primarySoft, fg: AD.primary };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 0', borderBottom: last ? 'none' : `1px solid ${AD.borderSoft}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: AD.primarySoft, color: AD.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon === 'report'  && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 3h10l4 4v14H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
        {icon === 'bell'    && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8"/></svg>}
        {icon === 'compare' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h7v14H4zM13 4h7v18h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: AD.ink }}>{title}</div>
        <div style={{ fontSize: 11, color: AD.muted, marginTop: 2 }}>{sub}</div>
      </div>
      <button style={{
        background: btn.bg, color: btn.fg, border: 'none', borderRadius: 7,
        padding: '6px 11px', fontSize: 11, fontWeight: 700,
        fontFamily: AD.font, cursor: 'pointer',
        display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
      }}>{action}</button>
    </div>
  );
}

export function PremiumCard() {
  return (
    <Card padding={20}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99,102,241,0.35)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 18l3-9 6 6 6-12 3 15H3z" fill="#fff"/>
            </svg>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: AD.ink, letterSpacing: '-0.01em' }}>프리미엄 서비스</div>
        </div>
        <div style={{ background: '#0F172A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 6 }}>
          현재 플랜: 프리미엄
        </div>
      </div>
      <PremiumRow icon="report"  title="AI 월간 분석 리포트" sub="매월 1회, AI가 분석한 월간 리포트를 받아보세요." action="5월 리포트 보기" tone="primary"/>
      <PremiumRow icon="bell"    title="위험 지역 알림"      sub="위험도 상승 지역을 실시간으로 알려드려요."       action={<><CheckIcon/>설정됨</>} tone="green"/>
      <PremiumRow icon="compare" title="맞춤형 비교 분석"    sub="지역/기관별 비교 분석 데이터를 제공합니다."     action="사용하기" tone="primary" last/>
      <button style={{
        width: '100%', height: 46, marginTop: 14,
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        color: '#fff', border: 'none', borderRadius: 11,
        fontSize: 13, fontWeight: 700, fontFamily: AD.font, cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
      }}>플랜 관리 및 상세 기능 보기</button>
    </Card>
  );
}

// ─── Notification Center ──────────────────────────────────────────────────────
const NOTI_ITEMS = [
  { icon: 'plus', text: '새로운 민원이 42건 접수되었습니다.',         time: '5분 전',   tone: 'indigo' },
  { icon: 'warn', text: '강남구 위험 지역 위험도가 상승했습니다.',     time: '30분 전',  tone: 'red' },
  { icon: 'doc',  text: 'AI 월간 리포트가 업데이트되었습니다.',       time: '1시간 전', tone: 'green' },
];
const NOTI_TONES = {
  indigo: { bg: AD.primarySoft, fg: AD.primary },
  red:    { bg: '#FEE2E2', fg: '#DC2626' },
  green:  { bg: '#D1FAE5', fg: '#047857' },
};

export function NotiCenter() {
  return (
    <Card title="알림 센터" padding={20} action={<MoreLink/>}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {NOTI_ITEMS.map((n, i) => {
          const t = NOTI_TONES[n.tone];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderBottom: i < NOTI_ITEMS.length - 1 ? `1px solid ${AD.borderSoft}` : 'none',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {n.icon === 'plus' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>}
                {n.icon === 'warn' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3l11 18H1L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v5M12 17.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>}
                {n.icon === 'doc'  && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 3h10l4 4v14H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>}
              </div>
              <div style={{ flex: 1, fontSize: 12, color: AD.text, lineHeight: 1.5 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: AD.subtle, fontWeight: 500, whiteSpace: 'nowrap' }}>{n.time}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Recent Cases Table ───────────────────────────────────────────────────────
const CASE_ROWS = [
  { time: '2025-05-31 14:23', region: '강남구 역삼동',   type: '엘리베이터 고장', text: '강남 2번 출구 엘리베이터 작동 불가',  risk: '위험', channel: '사용자 앱', status: '접수',  org: '서울교통공사' },
  { time: '2025-05-31 13:58', region: '송파구 잠실동',   type: '계단/턱',         text: '잠실역 8번 출구 계단 턱 높음',       risk: '주의', channel: '사용자 앱', status: '접수',  org: '송파구청' },
  { time: '2025-05-31 13:42', region: '서초구 서초동',   type: '공사 중',         text: '교대역 9번 출구 공사로 통행 불편',    risk: '주의', channel: '웹 제보',  status: '접수',  org: '서울교통공사' },
  { time: '2025-05-31 12:18', region: '영등포구 당산동', type: '급경사',          text: '당산역 인근 인도 급경사 미끄러움',    risk: '주의', channel: '사용자 앱', status: '처리중', org: '도로관리사업소' },
  { time: '2025-05-31 11:05', region: '마포구 합정동',   type: '통행 불가',       text: '합정역 5번 출구 휠체어 통행 어려움', risk: '위험', channel: '사용자 앱', status: '처리중', org: '서울교통공사' },
];
const STAT_TONE = { '접수': 'indigo', '처리중': 'yellow', '완료': 'green' };

export function RecentCases() {
  const cols = '120px 104px 92px minmax(180px, 1fr) 56px 74px 56px 104px';

  return (
    <Card title="최근 민원 목록" padding={0} action={<MoreLink/>}>
      <div style={{ padding: '4px 18px 16px', overflowX: 'auto' }}>
        <div style={{ minWidth: 800 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: cols,
          gap: 10, alignItems: 'center',
          fontSize: 11, fontWeight: 700, color: AD.muted,
          padding: '14px 4px 10px', borderBottom: `1px solid ${AD.borderSoft}`,
          wordBreak: 'keep-all',
        }}>
          <div>접수 시간</div><div>지역</div><div>유형</div><div>내용</div>
          <div style={{ textAlign: 'center' }}>위험도</div>
          <div>접수 채널</div>
          <div style={{ textAlign: 'center' }}>상태</div>
          <div>담당 기관</div>
        </div>
        {CASE_ROWS.map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: cols,
            gap: 10, alignItems: 'center',
            padding: '12px 4px',
            borderBottom: i < CASE_ROWS.length - 1 ? `1px solid ${AD.borderSoft}` : 'none',
            fontSize: 12,
            wordBreak: 'keep-all',
          }}>
            <div style={{ color: AD.muted, fontVariantNumeric: 'tabular-nums' }}>{r.time}</div>
            <div style={{ color: AD.ink, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.region}</div>
            <div style={{ color: AD.text, whiteSpace: 'nowrap' }}>{r.type}</div>
            <div style={{ color: AD.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</div>
            <div style={{ textAlign: 'center' }}><Pill tone={RISK_TONE[r.risk]} size="sm">{r.risk}</Pill></div>
            <div style={{ color: AD.muted, whiteSpace: 'nowrap' }}>{r.channel}</div>
            <div style={{ textAlign: 'center' }}><Pill tone={STAT_TONE[r.status]} size="sm">{r.status}</Pill></div>
            <div style={{ color: AD.text, whiteSpace: 'nowrap' }}>{r.org}</div>
          </div>
        ))}
        </div>
      </div>
    </Card>
  );
}
