import { AR } from '../design';

function TabIcon({ name, color, filled }) {
  if (name === 'home') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9z"
            stroke={color} strokeWidth="2" strokeLinejoin="round"
            fill={filled ? color : 'none'} fillOpacity={filled ? 0.12 : 0}/>
    </svg>
  );
  if (name === 'route') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M16 3l5 2-2 6-6-3 3-5z" stroke={color} strokeWidth="2" strokeLinejoin="round"
            fill={filled ? color : 'none'} fillOpacity={filled ? 0.12 : 0}/>
      <path d="M13 8l-9 13" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === 'report') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"
            stroke={color} strokeWidth="2" strokeLinejoin="round"
            fill={filled ? color : 'none'} fillOpacity={filled ? 0.12 : 0}/>
      <path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth="2"/>
    </svg>
  );
  if (name === 'profile') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="3.5" stroke={color} strokeWidth="2"
              fill={filled ? color : 'none'} fillOpacity={filled ? 0.12 : 0}/>
      <path d="M5 20c.7-4 3.5-6 7-6s6.3 2 7 6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  return null;
}

export function TabBar({ active, onNavigate }) {
  const tabs = [
    { id: 'home',    label: '홈',    icon: 'home' },
    { id: 'route',   label: '경로',  icon: 'route' },
    { id: 'report',  label: '제보',  icon: 'report' },
    { id: 'profile', label: '내정보', icon: 'profile' },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${AR.border}`,
      background: '#fff',
      padding: '8px 0 18px',
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        const c = on ? AR.blue : '#94A3B8';
        return (
          <div key={t.id} onClick={() => onNavigate?.(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: c, cursor: 'pointer',
          }}>
            <TabIcon name={t.icon} color={c} filled={on}/>
            <div style={{ fontSize: 11, fontWeight: on ? 700 : 500 }}>{t.label}</div>
          </div>
        );
      })}
    </div>
  );
}
