import { AD } from './tokens';

const MAIN_ITEMS = [
  { id: 'dash',   label: '대시보드',   icon: 'grid',     active: true },
  { id: 'cases',  label: '민원 관리',  icon: 'inbox',    badge: '12' },
  { id: 'ai',     label: 'AI 분석',    icon: 'sparkle' },
  { id: 'region', label: '지역별 통계', icon: 'chart' },
  { id: 'org',    label: '기관별 현황', icon: 'building' },
  { id: 'report', label: '리포트',     icon: 'file' },
];

const SETTINGS_ITEMS = [
  { id: 'noti', label: '알림 설정',  icon: 'bell' },
  { id: 'acc',  label: '계정 관리',  icon: 'user' },
  { id: 'svc',  label: '서비스 설정', icon: 'gear' },
];

function NavIcon({ name, color }) {
  const sw = 1.8;
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' };
  if (name === 'grid') return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw}/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw}/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw}/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw}/></svg>;
  if (name === 'inbox') return <svg {...p}><path d="M3 13l3-9h12l3 9v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/><path d="M3 13h5l1 3h6l1-3h5" stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>;
  if (name === 'sparkle') return <svg {...p}><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" fill={color}/></svg>;
  if (name === 'chart') return <svg {...p}><path d="M4 20V8M10 20V4M16 20v-9M22 20H2" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
  if (name === 'building') return <svg {...p}><rect x="3" y="3" width="8" height="18" rx="1.5" stroke={color} strokeWidth={sw}/><rect x="13" y="9" width="8" height="12" rx="1.5" stroke={color} strokeWidth={sw}/><path d="M6 7h2M6 11h2M6 15h2M16 13h2M16 17h2" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
  if (name === 'file') return <svg {...p}><path d="M5 3h9l5 5v13H5V3z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/><path d="M14 3v5h5M9 13h6M9 17h4" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
  if (name === 'bell') return <svg {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" stroke={color} strokeWidth={sw} strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={sw}/></svg>;
  if (name === 'user') return <svg {...p}><circle cx="12" cy="9" r="3.5" stroke={color} strokeWidth={sw}/><path d="M5 20c.7-4 3.5-6 7-6s6.3 2 7 6" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
  if (name === 'gear') return <svg {...p}><circle cx="12" cy="12" r="3" stroke={color} strokeWidth={sw}/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19 5l-2 2M7 17l-2 2M19 19l-2-2M7 7L5 5" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>;
  return null;
}

function NavItem({ label, icon, active, badge }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 10px', borderRadius: 9,
      background: active ? 'linear-gradient(90deg, #6366F1, #818CF8)' : 'transparent',
      color: active ? '#fff' : '#94A3B8',
      fontSize: 13, fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      boxShadow: active ? '0 4px 12px rgba(99,102,241,0.35)' : 'none',
    }}>
      <NavIcon name={icon} color={active ? '#fff' : '#94A3B8'}/>
      <div style={{ flex: 1 }}>{label}</div>
      {badge && (
        <div style={{
          background: active ? 'rgba(255,255,255,0.25)' : '#EF4444',
          color: '#fff', fontSize: 10, fontWeight: 700,
          padding: '1px 6px', borderRadius: 8, minWidth: 18, textAlign: 'center',
        }}>{badge}</div>
      )}
    </div>
  );
}

function NavGroup({ title, items }) {
  return (
    <div>
      <div style={{
        fontSize: 10, color: '#475569', fontWeight: 700,
        letterSpacing: '0.08em', padding: '0 10px 6px',
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => <NavItem key={it.id} {...it}/>)}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside style={{
      width: 208, flexShrink: 0,
      background: AD.navBg,
      color: AD.navText,
      display: 'flex', flexDirection: 'column',
      padding: '18px 12px 14px',
      fontFamily: AD.font,
      borderRight: '1px solid #1E293B',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px 18px' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          <svg width="18" height="18" viewBox="0 0 44 44" fill="none">
            <circle cx="16" cy="10" r="4" fill="#fff"/>
            <path d="M14 16 L14 26 L22 26 L26 36 L31 34 L27 24 L20 24 L20 19 L26 19 L26 15 L14 15 Z" fill="#fff"/>
            <circle cx="16" cy="32" r="6" stroke="#fff" strokeWidth="2.5" fill="none"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>AbleRoute</div>
          <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600, letterSpacing: '0.04em' }}>ADMIN CONSOLE</div>
        </div>
      </div>

      <NavGroup title="MAIN" items={MAIN_ITEMS}/>
      <div style={{ height: 10 }}/>
      <NavGroup title="설정" items={SETTINGS_ITEMS}/>

      <div style={{ flex: 1 }}/>

      {/* Premium card */}
      <div style={{
        borderRadius: 14,
        background: 'linear-gradient(160deg, #4F46E5 0%, #7C3AED 100%)',
        padding: 16, position: 'relative', overflow: 'hidden', marginBottom: 14,
      }}>
        <div style={{ position: 'absolute', top: -16, right: -16, width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.12)' }}/>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10, position: 'relative',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 18l3-9 6 6 6-12 3 15H3z" fill="#FCD34D" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>프리미엄 플랜</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 4, lineHeight: 1.5 }}>
          AI 분석 고급 기능과<br/>무제한 리포트를<br/>이용해보세요.
        </div>
        <button style={{
          marginTop: 12, width: '100%', height: 32,
          background: 'rgba(255,255,255,0.16)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8,
          fontSize: 12, fontWeight: 700, fontFamily: AD.font, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
          플랜 업그레이드
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Help */}
      <div style={{
        padding: '12px 12px',
        background: 'rgba(255,255,255,0.04)', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: 'rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 5a2 2 0 0 1 2-2h2l2 4-2 1c1 3 2 4 5 5l1-2 4 2v2a2 2 0 0 1-2 2A14 14 0 0 1 3 7V5z" stroke="#94A3B8" strokeWidth="1.6" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>도움이 필요하신가요?</div>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, marginTop: 2 }}>02-1234-5678</div>
        </div>
      </div>
    </aside>
  );
}
