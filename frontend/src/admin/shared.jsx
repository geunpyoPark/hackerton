import { AD } from './tokens';

export function Card({ children, style, padding = 20, title, subtitle, action }) {
  return (
    <div style={{
      background: AD.card, borderRadius: 16,
      border: `1px solid ${AD.border}`,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
      padding,
      ...style,
    }}>
      {(title || action) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: subtitle ? 4 : 14,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: AD.ink, letterSpacing: '-0.01em' }}>{title}</div>
          {action}
        </div>
      )}
      {subtitle && <div style={{ fontSize: 12, color: AD.muted, marginBottom: 14 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

export function Pill({ tone = 'red', children, size = 'md' }) {
  const tones = {
    red:    { bg: '#FEE2E2', fg: '#DC2626' },
    yellow: { bg: '#FEF3C7', fg: '#B45309' },
    green:  { bg: '#D1FAE5', fg: '#047857' },
    blue:   { bg: '#DBEAFE', fg: '#1D4ED8' },
    indigo: { bg: '#EEF2FF', fg: '#4F46E5' },
    gray:   { bg: '#F1F5F9', fg: '#475569' },
  };
  const t = tones[tone] || tones.gray;
  const s = size === 'sm' ? { padding: '2px 7px', fontSize: 10 } : { padding: '3px 9px', fontSize: 11 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: t.bg, color: t.fg, borderRadius: 6,
      fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.005em',
      ...s,
    }}>{children}</span>
  );
}

export function Trend({ dir = 'up', value, color }) {
  const c = color || (dir === 'up' ? '#DC2626' : '#059669');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      color: c, fontSize: 12, fontWeight: 700,
    }}>
      <svg width="10" height="10" viewBox="0 0 12 12">
        {dir === 'up'
          ? <path d="M6 2 L11 9 L1 9 Z" fill="currentColor"/>
          : <path d="M6 10 L1 3 L11 3 Z" fill="currentColor"/>}
      </svg>
      {value}
    </span>
  );
}

export function ProgressBar({ value, color = AD.primary, bg = '#EEF2FF', height = 6 }) {
  return (
    <div style={{ height, width: '100%', background: bg, borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: height / 2 }}/>
    </div>
  );
}

export function MoreLink() {
  return (
    <div style={{ fontSize: 12, color: AD.muted, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
      더보기
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6" stroke={AD.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}
