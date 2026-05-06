import { AR } from '../design';
import { TabBar } from '../components/TabBar';
import { USER_TYPES } from '../data/accessibility';
import { getStoredReports, getUserTypeLabel } from '../lib/accessibility';

export function ProfileScreen({ onNavigate, userType = 'wheelchair', onUserTypeChange, onLogout }) {
  const localReports = getStoredReports();
  const points = localReports.reduce((total, report) => total + 10 + (report.image_url ? 20 : 0), 1240);
  const level = Math.max(1, Math.floor(points / 500) + 1);

  return (
    <div style={{
      width: '100%', height: '100%', background: AR.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: AR.font, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px 12px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: AR.ink }}>내 정보</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 20px' }}>
        {/* User card */}
        <div style={{
          background: '#fff', borderRadius: 16,
          padding: 16, border: `1px solid ${AR.border}`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'linear-gradient(135deg, #DBEAFE, #EDE9FE)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${AR.border}`,
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="12" r="5" fill="#94A3B8"/>
                <path d="M5 28c1-6 6-9 11-9s10 3 11 9" fill="#94A3B8"/>
              </svg>
            </div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 22, height: 22, borderRadius: 11,
              background: '#fff', border: `1px solid ${AR.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l3-4h12l3 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" stroke={AR.muted} strokeWidth="2"/>
                <circle cx="12" cy="14" r="3.5" stroke={AR.muted} strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: AR.ink, letterSpacing: '-0.01em' }}>able_user01</div>
              <div style={{
                background: AR.blue, color: '#fff',
                fontSize: 10, fontWeight: 800,
                padding: '2px 6px', borderRadius: 4, letterSpacing: '0.02em',
              }}>Lv.{level}</div>
            </div>
            <div style={{ fontSize: 12, color: AR.muted, marginTop: 4 }}>{getUserTypeLabel(userType)} 사용자</div>
            <button style={{
              marginTop: 6,
              background: '#fff', color: AR.ink,
              border: `1px solid ${AR.border}`,
              borderRadius: 8, fontSize: 11, fontWeight: 600,
              padding: '5px 10px',
              fontFamily: AR.font,
            }}>프로필 수정</button>
          </div>
        </div>

        {/* Level card */}
        <div style={{
          marginTop: 12,
          background: `linear-gradient(120deg, ${AR.blue} 0%, #4F46E5 100%)`,
          borderRadius: 16, padding: 18,
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -10, right: -10, width: 110, height: 110, borderRadius: 55, background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ position: 'absolute', bottom: -30, right: -30, width: 110, height: 110, borderRadius: 55, background: 'rgba(255,255,255,0.06)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: '0.02em' }}>접근성 서포터</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2, letterSpacing: '-0.01em' }}>Level {level}</div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>{points % 500} / 500 XP</div>
              <div style={{ marginTop: 6, height: 6, width: 160, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${(points % 500) / 5}%`, height: '100%', background: '#fff', borderRadius: 3 }}/>
              </div>
            </div>
            <div style={{
              width: 60, height: 60, borderRadius: 30,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" fill="#FCD34D" stroke="#fff" strokeWidth="1.5"/>
                <path d="M5 6H3a3 3 0 0 0 4 3M19 6h2a3 3 0 0 1-4 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M9 14h6v2H9zM8 18h8v2H8z" fill="#fff"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div style={{ marginTop: 18, fontSize: 14, fontWeight: 700, color: AR.ink, marginBottom: 8 }}>내 활동</div>
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${AR.border}`, padding: '4px 14px' }}>
          <ActivityRow icon="report" label="제보한 정보"       value={`${24 + localReports.length}건`}/>
          <ActivityRow icon="users"  label="도움 받은 사용자"  value="82명"/>
          <ActivityRow icon="check"  label="채택된 제보"       value="22건"/>
          <ActivityRow icon="point"  label="포인트"            value={`${points.toLocaleString()} P`} last/>
        </div>

        {/* Badges */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink }}>최근 뱃지</div>
          <div style={{ fontSize: 12, color: AR.muted }}>더보기 ›</div>
        </div>
        <div style={{
          marginTop: 10, background: '#fff',
          borderRadius: 14, padding: 16,
          border: `1px solid ${AR.border}`,
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
        }}>
          <Badge color="#3B82F6" name="첫 제보"   lv="LV.1" type="shield"/>
          <Badge color="#F59E0B" name="도움왕"    lv="LV.2" type="medal"/>
          <Badge color="#EF4444" name="열정 활동" lv="LV.3" type="flame"/>
        </div>

        {/* Settings */}
        <div style={{ marginTop: 18, fontSize: 14, fontWeight: 700, color: AR.ink, marginBottom: 8 }}>설정</div>
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${AR.border}`, padding: '4px 14px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 8,
            padding: '12px 0',
            borderBottom: `1px solid ${AR.border}`,
          }}>
            {USER_TYPES.map(type => {
              const active = type.id === userType;
              return (
                <button key={type.id} onClick={() => onUserTypeChange?.(type.id)} style={{
                  minHeight: 38,
                  borderRadius: 10,
                  border: `1.5px solid ${active ? AR.blue : AR.border}`,
                  background: active ? '#EFF4FF' : '#fff',
                  color: active ? AR.blue : AR.ink,
                  fontSize: 13,
                  fontWeight: 700,
                }}>{type.label}</button>
              );
            })}
          </div>
          <SettingRow icon="bell"   label="알림 설정"/>
          <SettingRow icon="chat"   label="문의하기"/>
          <button onClick={onLogout} style={{ width: '100%', border: 'none', background: 'transparent', padding: 0, textAlign: 'left' }}>
            <SettingRow icon="logout" label="로그아웃" last danger/>
          </button>
        </div>
      </div>

      <TabBar active="profile" onNavigate={onNavigate}/>
    </div>
  );
}

function ActivityRow({ icon, label, value, last }) {
  const icons = {
    report: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 3h10l4 4v14H5V3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    users:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="2"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M16 14c2.5 0 5 1.5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    check:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 6L9 18l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    point:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v10M9 10h4a2 2 0 0 1 0 4H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: last ? 'none' : `1px solid ${AR.border}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: AR.bg, color: AR.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icons[icon]}</div>
      <div style={{ flex: 1, fontSize: 14, color: AR.ink, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink }}>{value}</div>
    </div>
  );
}

function SettingRow({ icon, label, value, last, danger }) {
  const icons = {
    user:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="2"/><path d="M5 20c.7-4 3.5-6 7-6s6.3 2 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
    bell:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2"/></svg>,
    chat:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v12H8l-4 4V5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>,
    logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 4h5v16h-5M9 8l-4 4 4 4M5 12h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: last ? 'none' : `1px solid ${AR.border}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        color: danger ? AR.red : AR.muted,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icons[icon]}</div>
      <div style={{ flex: 1, fontSize: 14, color: danger ? AR.red : AR.ink, fontWeight: 500 }}>{label}</div>
      {value && <div style={{ fontSize: 13, color: AR.blue, fontWeight: 600 }}>{value}</div>}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M9 6l6 6-6 6" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function Badge({ color, name, lv, type }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 56, height: 56, borderRadius: 28,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 16px ${color}55`,
      }}>
        {type === 'shield' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l8 3v7c0 5-4 8-8 10-4-2-8-5-8-10V5l8-3z" fill="#fff" fillOpacity="0.95"/>
          <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        {type === 'medal' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="6" fill="#fff" fillOpacity="0.95"/>
          <path d="M8 4l4 6 4-6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M12 11l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 17l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4L12 11z" fill={color}/>
        </svg>}
        {type === 'flame' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-3-2-3-2-6 0 0-3 1-3-4z" fill="#fff" fillOpacity="0.95"/>
          <path d="M12 11c0 2-2 2-2 4a2 2 0 0 0 4 0c0-2-2-2-2-4z" fill={color}/>
        </svg>}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: AR.ink, marginTop: 2 }}>{name}</div>
      <div style={{ fontSize: 10, color: AR.muted, fontWeight: 600, letterSpacing: '0.04em' }}>{lv}</div>
    </div>
  );
}
