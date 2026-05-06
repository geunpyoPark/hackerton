import { AR } from '../design';
import { AppLogo } from '../components/Icons';

export function LoginScreen({ onLogin }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #EFF4FF 0%, #FFFFFF 45%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: AR.font,
      padding: '60px 24px 40px',
    }}>
      {/* Logo */}
      <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 24,
          background: AR.blue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 12px 32px rgba(37,99,235,0.32)',
          marginBottom: 20,
        }}>
          <AppLogo size={44} color="#fff"/>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: AR.ink, letterSpacing: '-0.02em' }}>AbleRoute</div>
        <div style={{ fontSize: 14, color: AR.muted, marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>
          누구나 안전하게 이동할 수 있는<br/>접근성 경로 안내
        </div>
      </div>

      {/* Feature list */}
      <div style={{
        marginTop: 36,
        background: '#fff',
        borderRadius: 20,
        padding: '20px 18px',
        border: `1px solid ${AR.border}`,
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
      }}>
        <FeatureRow
          icon={<span style={{ fontSize: 18, fontWeight: 700 }}>✓</span>}
          iconBg={AR.greenSoft} iconColor={AR.green}
          title="실시간 접근성 정보"
          desc="엘리베이터·경사·턱 정보를 즉시 확인"
        />
        <div style={{ height: 1, background: AR.border, margin: '4px 0' }} />
        <FeatureRow
          icon={<span style={{ fontSize: 16, fontWeight: 700 }}>AI</span>}
          iconBg="#EFF4FF" iconColor={AR.blue}
          title="AI 경로 분석"
          desc="위험 요소를 요약해 안전한 경로 추천"
        />
        <div style={{ height: 1, background: AR.border, margin: '4px 0' }} />
        <FeatureRow
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          }
          iconBg="#FFF7ED" iconColor="#C2410C"
          title="함께 만드는 지도"
          desc="사용자 제보로 더 정확해지는 정보"
        />
      </div>

      <div style={{ flex: 1, minHeight: 32 }} />

      {/* Login buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => onLogin?.('kakao')} style={{
          height: 54, borderRadius: 14, border: 'none',
          background: '#FEE500', color: '#191919',
          fontSize: 16, fontWeight: 700,
          fontFamily: AR.font,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.2 4.6 6.6L5.5 21l3.8-2.5c.9.1 1.8.2 2.7.2 5.5 0 10-3.6 10-8.2S17.5 3 12 3z"/>
          </svg>
          카카오로 시작하기
        </button>
        <button onClick={() => onLogin?.('email')} style={{
          height: 54, borderRadius: 14, border: `1px solid ${AR.border}`,
          background: '#fff', color: AR.ink,
          fontSize: 16, fontWeight: 600,
          fontFamily: AR.font,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7z" stroke={AR.ink} strokeWidth="2"/>
            <path d="M4 7l8 6 8-6" stroke={AR.ink} strokeWidth="2"/>
          </svg>
          이메일로 로그인
        </button>
        <div style={{ textAlign: 'center', fontSize: 13, color: AR.muted, marginTop: 8 }}>
          처음이신가요? <span style={{ color: AR.blue, fontWeight: 600 }}>회원가입</span>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, iconBg, iconColor, title, desc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 4px',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: AR.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: AR.muted, marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  );
}
