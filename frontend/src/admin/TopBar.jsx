import { AD } from './tokens';

function DateRangePicker() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', background: '#fff',
      border: `1px solid ${AD.border}`, borderRadius: 10,
      fontSize: 13, color: AD.text, fontWeight: 600, cursor: 'pointer',
    }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke={AD.text} strokeWidth="1.8"/>
        <path d="M3 10h18M8 3v4M16 3v4" stroke={AD.text} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
      2025.05.01 ~ 2025.05.31
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke={AD.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function SelectFilter({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', background: '#fff',
      border: `1px solid ${AD.border}`, borderRadius: 10,
      fontSize: 13, color: AD.text, fontWeight: 600, cursor: 'pointer',
    }}>
      {label}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke={AD.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function TopBar({ dataStatus = 'ready' }) {
  return (
    <div style={{
      padding: '18px clamp(16px, 2vw, 28px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: AD.ink, letterSpacing: '-0.02em' }}>대시보드</div>
        <div style={{ fontSize: 13, color: AD.muted, marginTop: 4 }}>
          접근성 민원 현황을 한눈에 확인하고 효율적으로 관리하세요.
          {dataStatus === 'loading' ? ' 데이터를 불러오는 중입니다.' : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <DateRangePicker/>
        <SelectFilter label="전체 지역"/>
        <button style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#fff', border: `1px solid ${AD.border}`,
          position: 'relative', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" stroke={AD.text} strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M10 19a2 2 0 0 0 4 0" stroke={AD.text} strokeWidth="1.8"/>
          </svg>
          <div style={{
            position: 'absolute', top: 6, right: 6,
            background: '#EF4444', color: '#fff',
            fontSize: 9, fontWeight: 800, padding: '1px 4px', borderRadius: 6, lineHeight: 1.2,
          }}>12</div>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 10px 6px 6px',
          background: '#fff', border: `1px solid ${AD.border}`, borderRadius: 999,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 15,
            background: 'linear-gradient(135deg, #DBEAFE, #EDE9FE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="12" r="5" fill="#94A3B8"/>
              <path d="M5 28c1-6 6-9 11-9s10 3 11 9" fill="#94A3B8"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: AD.ink, lineHeight: 1.2 }}>관리자님</div>
            <div style={{ fontSize: 10, color: AD.muted, lineHeight: 1.3 }}>서울시 교통정책과</div>
          </div>
        </div>
      </div>
    </div>
  );
}
