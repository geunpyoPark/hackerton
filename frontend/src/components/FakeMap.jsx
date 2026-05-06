import { AR } from '../design';

export function FakeMap() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 360 280" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <rect width="360" height="280" fill="#EEF2F4"/>
      <g fill="#F7F8FA">
        <rect x="20" y="20" width="100" height="80" rx="3"/>
        <rect x="140" y="20" width="80" height="50" rx="3"/>
        <rect x="240" y="20" width="100" height="60" rx="3"/>
        <rect x="20" y="120" width="60" height="60" rx="3"/>
        <rect x="100" y="120" width="100" height="40" rx="3"/>
        <rect x="220" y="100" width="60" height="80" rx="3"/>
        <rect x="300" y="100" width="50" height="80" rx="3"/>
        <rect x="20" y="200" width="80" height="60" rx="3"/>
        <rect x="120" y="180" width="80" height="80" rx="3"/>
        <rect x="220" y="200" width="120" height="60" rx="3"/>
      </g>
      <g stroke="#fff" strokeWidth="6" fill="none">
        <path d="M0 110 L360 110"/>
        <path d="M0 190 L360 190"/>
        <path d="M130 0 L130 280"/>
        <path d="M210 0 L210 280"/>
      </g>
      <path d="M0 250 Q90 240 180 248 T360 245" stroke="#CFE3F0" strokeWidth="14" fill="none" opacity="0.6"/>
      <rect x="240" y="210" width="40" height="40" rx="4" fill="#DDF0E0"/>

      <path
        d="M55 50 L55 110 L130 110 L130 150 L165 150 L165 190 L210 190 L210 230 L295 230"
        stroke={AR.blue} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path
        d="M55 50 L55 110 L130 110 L130 150 L165 150 L165 190 L210 190 L210 230 L295 230"
        stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="0 8"
      />

      <g transform="translate(55,50)">
        <circle r="14" fill={AR.blue}/>
        <circle r="14" fill="none" stroke="#fff" strokeWidth="2.5"/>
        <text textAnchor="middle" y="4" fontSize="10" fontWeight="800" fill="#fff" fontFamily="-apple-system,system-ui">출발</text>
      </g>

      <g transform="translate(130,110)">
        <circle r="13" fill={AR.red} stroke="#fff" strokeWidth="2.5"/>
        <text textAnchor="middle" y="4" fontSize="14" fontWeight="800" fill="#fff" fontFamily="-apple-system,system-ui">!</text>
      </g>
      <g transform="translate(165,150)">
        <circle r="11" fill={AR.yellow} stroke="#fff" strokeWidth="2.5"/>
        <text textAnchor="middle" y="4" fontSize="12" fontWeight="800" fill="#fff" fontFamily="-apple-system,system-ui">!</text>
      </g>
      <g transform="translate(210,190)">
        <circle r="11" fill={AR.yellow} stroke="#fff" strokeWidth="2.5"/>
        <text textAnchor="middle" y="4" fontSize="12" fontWeight="800" fill="#fff" fontFamily="-apple-system,system-ui">!</text>
      </g>

      <g transform="translate(295,230)">
        <circle r="14" fill={AR.red}/>
        <circle r="14" fill="none" stroke="#fff" strokeWidth="2.5"/>
        <text textAnchor="middle" y="4" fontSize="10" fontWeight="800" fill="#fff" fontFamily="-apple-system,system-ui">도착</text>
      </g>

      <g fontFamily="-apple-system,system-ui" fontSize="9" fill="#94A3B8">
        <text x="60" y="138">강남대로</text>
        <text x="220" y="138">테헤란로</text>
        <text x="60" y="220">언주로</text>
      </g>
    </svg>
  );
}
