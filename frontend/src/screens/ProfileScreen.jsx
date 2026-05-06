import { useState } from 'react';
import { AR } from '../design';
import { TabBar } from '../components/TabBar';
import { getUserTypeLabel } from '../lib/accessibility';

export function ProfileScreen({ onNavigate, userType = 'wheelchair', onLogout, onProfileUpdate, profile, reports = [], userId }) {
  const myReports = reports.filter(report => report.user_id === userId);
  const points = profile?.points ?? myReports.reduce((total, report) => total + 10 + (report.image_url ? 20 : 0), 0);
  const level = profile?.level ?? Math.max(1, Math.floor(points / 500) + 1);
  const nickname = profile?.nickname || 'able_user01';
  const picture = profile?.picture || null;
  const [isEditing, setIsEditing] = useState(false);
  const [draftNickname, setDraftNickname] = useState(nickname);
  const [draftPicture, setDraftPicture] = useState(picture || '');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  function openEditor() {
    setDraftNickname(nickname);
    setDraftPicture(picture || '');
    setEditError('');
    setIsEditing(true);
  }

  function handlePictureFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDraftPicture(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    if (!draftNickname.trim()) {
      setEditError('이름을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      setEditError('');
      await onProfileUpdate?.({
        nickname: draftNickname.trim(),
        picture: draftPicture || null,
      });
      setIsEditing(false);
    } catch (error) {
      setEditError(error.message || '프로필 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: AR.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: AR.font, overflow: 'hidden', position: 'relative',
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
              overflow: 'hidden',
            }}>
              {picture
                ? <img src={picture} alt="프로필" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                : <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="12" r="5" fill="#94A3B8"/>
                    <path d="M5 28c1-6 6-9 11-9s10 3 11 9" fill="#94A3B8"/>
                  </svg>
              }
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
              <div style={{ fontSize: 16, fontWeight: 800, color: AR.ink, letterSpacing: '-0.01em' }}>{nickname}</div>
              <div style={{
                background: AR.blue, color: '#fff',
                fontSize: 10, fontWeight: 800,
                padding: '2px 6px', borderRadius: 4, letterSpacing: '0.02em',
              }}>Lv.{level}</div>
            </div>
            <div style={{ fontSize: 12, color: AR.muted, marginTop: 4 }}>{getUserTypeLabel(userType)} 사용자</div>
            <button onClick={openEditor} style={{
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
          <ActivityRow icon="report" label="제보한 정보"      value={`${myReports.length}건`}/>
          <ActivityRow icon="check"  label="채택된 제보"      value="22건"/>
          <ActivityRow icon="point"  label="포인트"           value={`${points.toLocaleString()} P`} last/>
        </div>

        {/* Settings */}
        <div style={{ marginTop: 18, fontSize: 14, fontWeight: 700, color: AR.ink, marginBottom: 8 }}>설정</div>
        <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${AR.border}`, padding: '4px 14px' }}>
          <SettingRow icon="bell"   label="알림 설정"/>
          <SettingRow icon="chat"   label="문의하기"/>
          <button onClick={onLogout} style={{ width: '100%', border: 'none', background: 'transparent', padding: 0, textAlign: 'left' }}>
            <SettingRow icon="logout" label="로그아웃" last danger/>
          </button>
        </div>
      </div>

      {isEditing && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.38)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 10,
        }}>
          <div style={{
            width: '100%',
            background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '18px 18px 24px',
            boxShadow: '0 -16px 40px rgba(15,23,42,0.18)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: AR.ink }}>프로필 수정</div>
              <button onClick={() => setIsEditing(false)} style={{
                width: 32, height: 32,
                border: 'none',
                borderRadius: 16,
                background: AR.bg,
                color: AR.muted,
                fontSize: 20,
                lineHeight: '32px',
              }}>×</button>
            </div>

            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: 32,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #DBEAFE, #EDE9FE)',
                border: `1px solid ${AR.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {draftPicture
                  ? <img src={draftPicture} alt="프로필 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                  : <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
                      <circle cx="16" cy="12" r="5" fill="#94A3B8"/>
                      <path d="M5 28c1-6 6-9 11-9s10 3 11 9" fill="#94A3B8"/>
                    </svg>
                }
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 34,
                  padding: '0 12px',
                  borderRadius: 9,
                  border: `1px solid ${AR.border}`,
                  color: AR.ink,
                  fontSize: 13,
                  fontWeight: 700,
                }}>
                  사진 선택
                  <input type="file" accept="image/*" onChange={handlePictureFile} style={{ display: 'none' }}/>
                </label>
                {draftPicture && (
                  <button onClick={() => setDraftPicture('')} style={{
                    marginLeft: 8,
                    height: 34,
                    border: 'none',
                    background: 'transparent',
                    color: AR.red,
                    fontSize: 13,
                    fontWeight: 700,
                  }}>삭제</button>
                )}
              </div>
            </div>

            <label style={{ display: 'block', marginTop: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: AR.muted, marginBottom: 6 }}>이름</div>
              <input
                value={draftNickname}
                onChange={event => setDraftNickname(event.target.value)}
                maxLength={20}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 11,
                  border: `1px solid ${AR.borderStrong}`,
                  padding: '0 12px',
                  fontSize: 15,
                  fontWeight: 600,
                  color: AR.ink,
                  fontFamily: AR.font,
                  boxSizing: 'border-box',
                }}
              />
            </label>

            {editError && (
              <div style={{ marginTop: 10, color: AR.red, fontSize: 12, fontWeight: 600 }}>{editError}</div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button onClick={() => setIsEditing(false)} style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                border: `1px solid ${AR.border}`,
                background: '#fff',
                color: AR.ink,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: AR.font,
              }}>취소</button>
              <button onClick={saveProfile} disabled={isSaving} style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                border: 'none',
                background: isSaving ? AR.borderStrong : AR.blue,
                color: '#fff',
                fontSize: 15,
                fontWeight: 800,
                fontFamily: AR.font,
              }}>{isSaving ? '저장 중' : '저장'}</button>
            </div>
          </div>
        </div>
      )}

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
