import { AD } from './tokens';
import { Card, Trend, MoreLink } from './shared';

// ─── KPI Stats Row ───────────────────────────────────────────────────────────
function StatCard({ label, value, unit, trend, dir, icon, tone }) {
  const tones = {
    indigo: { bg: '#EEF2FF', fg: '#6366F1' },
    green:  { bg: '#D1FAE5', fg: '#059669' },
    blue:   { bg: '#DBEAFE', fg: '#2563EB' },
    orange: { bg: '#FFEDD5', fg: '#EA580C' },
    red:    { bg: '#FEE2E2', fg: '#DC2626' },
  };
  const t = tones[tone];
  return (
    <Card padding={20}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: t.bg, color: t.fg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: AD.muted, fontWeight: 600 }}>{label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 4 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: AD.ink, letterSpacing: '-0.02em' }}>{value}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: AD.text }}>{unit}</div>
          </div>
          <div style={{ fontSize: 11, color: AD.muted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            지난 달 대비 <Trend dir={dir} value={trend}/>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function StatsRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
      <StatCard label="전체 민원 수"   value="1,248" unit="건" trend="28%" dir="up"   tone="indigo"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 3h10l4 4v14H5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 3v5h5M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}/>
      <StatCard label="신규 민원 수"   value="342"   unit="건" trend="18%" dir="up"   tone="green"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}/>
      <StatCard label="처리 완료 민원" value="657"   unit="건" trend="35%" dir="up"   tone="blue"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}/>
      <StatCard label="평균 처리 시간" value="4.2"   unit="일" trend="0.8일" dir="down" tone="orange"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}/>
      <StatCard label="위험 지역 수"   value="23"    unit="곳" trend="15%" dir="up"   tone="red"
        icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l11 18H1L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 10v5M12 17.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}/>
    </div>
  );
}

// ─── Heat Map ─────────────────────────────────────────────────────────────────
const HEAT_POINTS = [
  { x: 380, y: 120, r: 38, c: '#F59E0B', label: '마포구' },
  { x: 460, y: 140, r: 30, c: '#10B981', label: '서대문구' },
  { x: 530, y: 170, r: 26, c: '#10B981', label: '중구' },
  { x: 590, y: 165, r: 30, c: '#10B981', label: '성동구' },
  { x: 650, y: 200, r: 22, c: '#10B981', label: '광진구' },
  { x: 720, y: 200, r: 24, c: '#10B981', label: '강동구' },
  { x: 270, y: 200, r: 22, c: '#10B981', label: '양천구' },
  { x: 340, y: 230, r: 24, c: '#F59E0B', label: '영등포구' },
  { x: 590, y: 280, r: 60, c: '#EF4444', label: '강남구' },
  { x: 720, y: 270, r: 44, c: '#EF4444', label: '송파구' },
  { x: 660, y: 320, r: 36, c: '#EF4444', label: '서초구' },
  { x: 480, y: 320, r: 34, c: '#10B981', label: '관악구' },
  { x: 540, y: 330, r: 22, c: '#F59E0B', label: '동작구' },
  { x: 380, y: 320, r: 18, c: '#F59E0B', label: '금천구' },
  { x: 290, y: 290, r: 18, c: '#10B981', label: '구로구' },
];

export function HeatMap() {
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '18px 20px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: AD.ink, letterSpacing: '-0.01em' }}>지역별 위험도 현황</div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={AD.subtle} strokeWidth="1.6"/>
            <path d="M12 8v.5M12 11v5" stroke={AD.subtle} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{
          display: 'flex', background: '#F1F5F9', borderRadius: 9, padding: 3, gap: 2,
          fontSize: 12, fontWeight: 600,
        }}>
          <div style={{ padding: '5px 12px', borderRadius: 7, background: '#fff', color: AD.primary, boxShadow: '0 1px 2px rgba(15,23,42,0.06)' }}>위험도</div>
          <div style={{ padding: '5px 12px', borderRadius: 7, color: AD.muted }}>민원 밀집도</div>
        </div>
      </div>
      <div style={{ position: 'relative', height: 'clamp(260px, 34vh, 340px)', background: '#F8FAFC' }}>
        <svg width="100%" height="100%" viewBox="0 0 900 400" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
          <path d="M0 240 Q150 220 280 230 Q400 245 520 235 Q640 220 780 235 Q860 240 900 235 L900 260 Q820 270 740 258 Q620 248 500 260 Q380 268 280 258 Q150 250 0 265 Z" fill="#CFE3F0" opacity="0.7"/>
          <g stroke="#E2E8F0" strokeWidth="1.2" fill="#F1F5F9" opacity="0.7">
            <path d="M250 80 L450 80 L470 200 L260 220 Z"/>
            <path d="M450 80 L640 70 L650 200 L470 200 Z"/>
            <path d="M640 70 L800 80 L800 220 L650 200 Z"/>
            <path d="M260 220 L520 240 L500 380 L240 360 Z"/>
            <path d="M520 240 L800 220 L760 380 L500 380 Z"/>
          </g>
          {HEAT_POINTS.map((p, i) => (
            <g key={i} opacity={p.muted ? 0.5 : 1}>
              <circle cx={p.x} cy={p.y} r={p.r * 1.7} fill={p.c} opacity="0.12"/>
              <circle cx={p.x} cy={p.y} r={p.r * 1.2} fill={p.c} opacity="0.22"/>
              <circle cx={p.x} cy={p.y} r={p.r * 0.7} fill={p.c} opacity="0.55"/>
              <circle cx={p.x} cy={p.y} r={p.r * 0.4} fill={p.c}/>
              <text x={p.x} y={p.y + p.r * 0.4 + 14} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F172A" fontFamily="Pretendard,system-ui">{p.label}</text>
            </g>
          ))}
        </svg>
        <div style={{
          position: 'absolute', top: 16, left: 16,
          background: '#fff', borderRadius: 10, padding: '10px 12px',
          boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
          border: `1px solid ${AD.border}`, fontSize: 12,
        }}>
          <div style={{ fontSize: 11, color: AD.muted, fontWeight: 700, marginBottom: 6 }}>위험도</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['#EF4444','위험'],['#F59E0B','주의'],['#10B981','양호']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: c }}/>
                <div style={{ fontSize: 12, color: AD.text, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <button style={{
          position: 'absolute', bottom: 16, left: 16,
          background: '#fff', border: `1px solid ${AD.border}`, borderRadius: 10,
          padding: '8px 12px', fontSize: 12, fontWeight: 600, color: AD.text,
          fontFamily: AD.font, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" stroke={AD.text} strokeWidth="2" strokeLinecap="round"/></svg>
          전체 지역 보기
        </button>
      </div>
    </Card>
  );
}

// ─── AI Insights ──────────────────────────────────────────────────────────────
const INSIGHT_ITEMS = [
  { icon: 'trend',  tone: 'red',    text: <>강남역 주변 <b>엘리베이터 고장</b> 관련 민원이<br/>최근 2주 사이 <b style={{color:'#DC2626'}}>42% 증가</b>했어요.</> },
  { icon: 'arrow',  tone: 'orange', text: <>송파구 <b>경사/턱</b> 관련 민원이<br/>지속적으로 증가하는 추세에요.</> },
  { icon: 'repeat', tone: 'indigo', text: <>반복 민원이 가장 많은 지역은 <b>강남구</b>이며,<br/>주요 유형은 <b>&#39;계단/턱&#39;</b>이에요.</> },
];

function Insight({ icon, tone, text }) {
  const tones = {
    red:    { bg: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', fg: '#DC2626' },
    orange: { bg: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', fg: '#D97706' },
    indigo: { bg: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', fg: '#4F46E5' },
  };
  const t = tones[tone];
  return (
    <div style={{
      padding: '12px 14px', background: t.bg, borderRadius: 11,
      border: `1px solid ${AD.borderSoft}`,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9,
        background: '#fff', color: t.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon === 'trend'  && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 17l6-6 4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 6h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
        {icon === 'arrow'  && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v6M12 16v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>}
        {icon === 'repeat' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0 1 16-5M21 12a9 9 0 0 1-16 5M19 3v4h-4M5 21v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{ fontSize: 13, color: AD.text, lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

export function AIInsights() {
  return (
    <Card title="AI 인사이트" padding={20} action={<MoreLink/>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {INSIGHT_ITEMS.map((it, i) => <Insight key={i} {...it}/>)}
      </div>
    </Card>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DONUT_DATA = [
  { label: '엘리베이터 고장', val: 35, count: 436, color: AD.c1 },
  { label: '계단/턱',         val: 25, count: 312, color: AD.c2 },
  { label: '급경사',          val: 15, count: 187, color: AD.c3 },
  { label: '통행 불가',       val: 10, count: 125, color: AD.c4 },
  { label: '공사 중',         val: 8,  count: 100, color: AD.c5 },
  { label: '기타',            val: 7,  count: 88,  color: AD.c6 },
];

export function TypeDonut() {
  const total = DONUT_DATA.reduce((s, d) => s + d.val, 0);
  const r = 60, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  return (
    <Card title="민원 유형 분석" padding={20} action={<MoreLink/>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth="22"/>
          {DONUT_DATA.map((d, i) => {
            const len = (d.val / total) * circ;
            const offset = DONUT_DATA
              .slice(0, i)
              .reduce((sum, item) => sum + (item.val / total) * circ, 0);
            const dasharray = `${len} ${circ - len}`;
            const dashoffset = circ - offset;
            return (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                stroke={d.color} strokeWidth="22"
                strokeDasharray={dasharray} strokeDashoffset={dashoffset}
                transform={`rotate(-90 ${cx} ${cy})`}/>
            );
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill={AD.muted} fontFamily="Pretendard,system-ui">전체</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fontWeight="800" fill={AD.ink} fontFamily="Pretendard,system-ui" letterSpacing="-0.5">1,248건</text>
        </svg>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {DONUT_DATA.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: d.color }}/>
              <div style={{ flex: 1, color: AD.text, fontWeight: 500 }}>{d.label}</div>
              <div style={{ color: AD.ink, fontWeight: 700 }}>{d.val}%</div>
              <div style={{ color: AD.muted, fontSize: 11, width: 42, textAlign: 'right' }}>({d.count})</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Trend Chart ──────────────────────────────────────────────────────────────
const TOTAL_DATA = [180,210,200,235,225,260,245,275,300,290,310,295,320,330,315,340,325,355,365,350,380,370,390,405,395,420,415,440,425,455,470];
const FRESH_DATA  = [60,75,70,90,85,100,95,110,120,115,130,125,140,145,140,155,150,165,170,165,180,175,185,200,195,210,205,220,215,230,240];

function Tag({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: AD.text, fontWeight: 600 }}>
      <div style={{ width: 8, height: 8, borderRadius: 4, background: color }}/>
      {label}
    </div>
  );
}

function SelectSmall({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', background: '#F8FAFC',
      border: `1px solid ${AD.border}`, borderRadius: 8,
      fontSize: 12, color: AD.text, fontWeight: 600, cursor: 'pointer',
    }}>
      {label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke={AD.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function TrendChart() {
  const W = 720, H = 200, pad = { l: 38, r: 16, t: 16, b: 28 };
  const max = 500;
  const stepX = (W - pad.l - pad.r) / (TOTAL_DATA.length - 1);
  const yScale = v => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const pathD = arr => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${pad.l + i * stepX} ${yScale(v)}`).join(' ');
  const areaD = arr => `${pathD(arr)} L${pad.l + (arr.length - 1) * stepX} ${H - pad.b} L${pad.l} ${H - pad.b} Z`;
  const yTicks = [0, 100, 200, 300, 400];

  return (
    <Card padding={20} title="기간별 민원 추이" action={
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Tag color={AD.primary} label="전체 민원"/>
          <Tag color={AD.green}   label="신규 민원"/>
        </div>
        <SelectSmall label="일별"/>
      </div>
    }>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AD.primary} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={AD.primary} stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="gradFresh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AD.green} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={AD.green} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yScale(v)} x2={W - pad.r} y2={yScale(v)} stroke="#F1F5F9" strokeWidth="1"/>
            <text x={pad.l - 8} y={yScale(v) + 4} fontSize="10" fill={AD.subtle} textAnchor="end" fontFamily="Pretendard,system-ui">{v}</text>
          </g>
        ))}
        <path d={areaD(TOTAL_DATA)} fill="url(#gradTotal)"/>
        <path d={areaD(FRESH_DATA)}  fill="url(#gradFresh)"/>
        <path d={pathD(TOTAL_DATA)} fill="none" stroke={AD.primary} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d={pathD(FRESH_DATA)}  fill="none" stroke={AD.green}   strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx={pad.l + (TOTAL_DATA.length - 1) * stepX} cy={yScale(TOTAL_DATA[TOTAL_DATA.length - 1])} r="4" fill="#fff" stroke={AD.primary} strokeWidth="2.5"/>
        <circle cx={pad.l + (FRESH_DATA.length  - 1) * stepX} cy={yScale(FRESH_DATA[FRESH_DATA.length  - 1])} r="4" fill="#fff" stroke={AD.green}   strokeWidth="2.5"/>
        {[0,5,10,15,20,25,30].map((d, i) => (
          <text key={i} x={pad.l + d * stepX} y={H - 8} fontSize="10" fill={AD.subtle} textAnchor="middle" fontFamily="Pretendard,system-ui">5.{d+1}</text>
        ))}
      </svg>
    </Card>
  );
}
