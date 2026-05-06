import { AR } from '../design';

export function WheelchairIcon({ size = 24, color = AR.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="4" r="2" fill={color}/>
      <path d="M9 7v6h5l2 5 2-1-2-5h-5V9h4V7H9z" fill={color}/>
      <circle cx="11" cy="17" r="4.5" stroke={color} strokeWidth="1.6" fill="none"/>
      <circle cx="11" cy="17" r="1.2" fill={color}/>
    </svg>
  );
}

export function StrollerIcon({ size = 24, color = AR.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h2l3 8h10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 14a8 8 0 0 1 12-4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14 6v4" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="18" r="1.6" stroke={color} strokeWidth="1.6"/>
      <circle cx="17" cy="18" r="1.6" stroke={color} strokeWidth="1.6"/>
    </svg>
  );
}

export function ElderlyIcon({ size = 24, color = AR.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="4" r="2" fill={color}/>
      <path d="M11 7l-3 5 3 1v8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 13l4-2 1 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 21l-1-4M16 7v14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function CrutchIcon({ size = 24, color = AR.ink }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M9 3h6M12 3v8M9 11h6M9 11l-3 10M15 11l3 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function AppLogo({ size = 44, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="16" cy="10" r="4" fill={color}/>
      <path d="M14 16 L14 26 L22 26 L26 36 L31 34 L27 24 L20 24 L20 19 L26 19 L26 15 L14 15 Z" fill={color}/>
      <circle cx="16" cy="32" r="6" stroke={color} strokeWidth="2.5" fill="none"/>
    </svg>
  );
}
