import { useState } from 'react';
import { AR } from '../design';
import { KakaoMap } from '../components/KakaoMap';
import { TabBar } from '../components/TabBar';
import { PLACES, REPORT_TYPES as BASE_REPORT_TYPES } from '../data/accessibility';
import { getStoredReports, saveStoredReport } from '../lib/accessibility';

const REPORT_TYPES = [
  { id: 'elevator_broken', label: '엘리베이터 고장', color: 'red',    icon: 'elev' },
  { id: 'stairs',          label: '계단 있음',       color: 'yellow', icon: 'stair' },
  { id: 'curb',            label: '턱 있음',         color: 'yellow', icon: 'bump' },
  { id: 'steep_slope',     label: '급경사',          color: 'purple', icon: 'slope' },
  { id: 'construction',    label: '공사 중',         color: 'gray',   icon: 'const' },
  { id: 'blocked',         label: '통행 불가',       color: 'gray',   icon: 'etc' },
];

const PALETTE = {
  red:    { soft: '#FEE2E2', fg: '#DC2626', border: '#FCA5A5' },
  yellow: { soft: '#FEF3C7', fg: '#D97706', border: '#FCD34D' },
  purple: { soft: '#EDE9FE', fg: '#7C3AED', border: '#C4B5FD' },
  gray:   { soft: '#F1F5F9', fg: '#475569', border: '#CBD5E1' },
};

export function ReportScreen({ onNavigate }) {
  const [selected, setSelected] = useState(BASE_REPORT_TYPES[0].id);
  const [placeId, setPlaceId] = useState(PLACES[0].id);
  const [description, setDescription] = useState('');
  const [imageName, setImageName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [myReportsCount, setMyReportsCount] = useState(() => getStoredReports().length);
  const selectedPlace = PLACES.find(place => place.id === placeId) || PLACES[0];

  function handleSubmit() {
    const report = {
      id: `local-${Date.now()}`,
      place_id: placeId,
      user_id: 'local-user',
      issue_type: selected,
      description: description.trim() || REPORT_TYPES.find(type => type.id === selected)?.label || '접근성 제보',
      image_url: imageName ? `local://${imageName}` : '',
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      created_at: new Date().toISOString(),
      status: 'active',
      verified_count: 0,
    };
    saveStoredReport(report);
    setSubmitted(true);
    setDescription('');
    setImageName('');
    setMyReportsCount(getStoredReports().length);
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: AR.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: AR.font, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px 12px', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button style={{ width: 36, height: 36, border: 'none', background: 'transparent' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={AR.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: AR.ink }}>제보하기</div>
        <div style={{ width: 36 }}/>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 20px' }}>
        {/* Place */}
        <Section title="장소 선택">
          <select value={placeId} onChange={event => setPlaceId(event.target.value)} style={{
            background: '#fff', borderRadius: 12,
            padding: '12px 14px', border: `1px solid ${AR.border}`,
            width: '100%', fontSize: 14, color: AR.ink, fontFamily: AR.font,
          }}>
            {PLACES.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
          </select>
          <div style={{
            marginTop: 8, height: 110, borderRadius: 12, overflow: 'hidden',
            position: 'relative', border: `1px solid ${AR.border}`,
          }}>
            <KakaoMap places={[{ ...selectedPlace, risk: 'red' }]}/>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <svg width="32" height="38" viewBox="0 0 24 28" fill="none">
                <path d="M12 1C6.5 1 2 5.5 2 11c0 7 10 16 10 16s10-9 10-16c0-5.5-4.5-10-10-10z"
                      fill={AR.blue} stroke="#fff" strokeWidth="2"/>
                <circle cx="12" cy="11" r="3.5" fill="#fff"/>
              </svg>
            </div>
          </div>
          <div style={{
            marginTop: 8, padding: '10px 14px',
            background: '#fff', borderRadius: 12,
            border: `1px solid ${AR.border}`,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink }}>{selectedPlace.name}</div>
            <div style={{ fontSize: 12, color: AR.muted, marginTop: 2 }}>{selectedPlace.line_name} · {selectedPlace.station_name} {selectedPlace.exit_no}번 출구</div>
          </div>
        </Section>

        {/* Type select */}
        <Section title="제보 유형 선택">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {REPORT_TYPES.map(t => (
              <TypeButton key={t.id} t={t} active={selected === t.id} onClick={() => setSelected(t.id)}/>
            ))}
          </div>
        </Section>

        {/* Details */}
        <Section title="상세 내용">
          <textarea value={description} onChange={event => setDescription(event.target.value.slice(0, 200))} placeholder="상세 내용을 입력해주세요. (최대 200자)" style={{
            background: '#fff', borderRadius: 12,
            border: `1px solid ${AR.border}`,
            padding: '12px 14px', minHeight: 100,
            width: '100%', resize: 'none', outline: 'none',
            fontSize: 14, color: AR.ink,
          }}/>
          <div style={{ fontSize: 11, color: AR.muted, textAlign: 'right', marginTop: 4 }}>{description.length}/200</div>
        </Section>

        {/* Photo */}
        <Section title="사진 첨부 (선택)">
          <label style={{
            background: '#fff',
            border: `1.5px dashed ${AR.borderStrong}`,
            borderRadius: 12, padding: '20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 22,
              background: AR.bg, color: AR.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l3-4h12l3 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="14" r="3.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div style={{ fontSize: 13, color: AR.muted, fontWeight: 500 }}>{imageName || '사진 추가하기'}</div>
            <input type="file" accept="image/*" onChange={event => setImageName(event.target.files?.[0]?.name || '')} style={{ display: 'none' }}/>
          </label>
        </Section>

        {submitted && (
          <div style={{
            marginTop: 6,
            padding: '10px 12px',
            borderRadius: 10,
            background: AR.greenSoft,
            color: AR.green,
            fontSize: 13,
            fontWeight: 700,
          }}>제보가 기기에 저장되었습니다. MVP에서는 localStorage에 저장됩니다.</div>
        )}

        <button onClick={handleSubmit} style={{
          marginTop: 16, width: '100%', height: 54,
          background: AR.blue, color: '#fff',
          border: 'none', borderRadius: 14,
          fontSize: 16, fontWeight: 700,
          fontFamily: AR.font,
          boxShadow: '0 4px 12px rgba(37,99,235,0.24)',
        }}>제출하기</button>

        {/* My reports */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink }}>내 제보 현황</div>
          <div style={{ fontSize: 12, color: AR.muted }}>더보기 ›</div>
        </div>
        <div style={{
          marginTop: 10, background: '#fff',
          borderRadius: 14, padding: 4,
          border: `1px solid ${AR.border}`,
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        }}>
          <Mini label="내 제보" value={`${myReportsCount}건`}/>
          <Mini label="채택률" value="92%" highlight/>
          <Mini label="도움 받은 사용자" value="82명"/>
        </div>
      </div>

      <TabBar active="report" onNavigate={onNavigate}/>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function TypeButton({ t, active, onClick }) {
  const pal = PALETTE[t.color];
  return (
    <button onClick={onClick} style={{
      background: active ? pal.soft : '#fff',
      border: `1.5px solid ${active ? pal.border : AR.border}`,
      borderRadius: 12,
      padding: '14px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: AR.font, textAlign: 'left',
    }}>
      <div style={{ color: pal.fg, display: 'flex' }}>
        {t.icon === 'elev' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 3v18M9 9l-2 2 2 2M15 13l2-2-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        {t.icon === 'stair' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 21h4v-4h4v-4h4V9h4V5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>}
        {t.icon === 'bump' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M2 18h4l3-8 3 14 3-10 3 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        {t.icon === 'slope' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 19L21 5M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
        {t.icon === 'const' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 21h18M5 21V11l7-5 7 5v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2"/>
        </svg>}
        {t.icon === 'etc' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="12" r="1.6" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.6" fill="currentColor"/>
          <circle cx="18" cy="12" r="1.6" fill="currentColor"/>
        </svg>}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: AR.ink }}>{t.label}</div>
    </button>
  );
}

function Mini({ label, value, highlight }) {
  return (
    <div style={{
      padding: '12px 8px', textAlign: 'center',
      background: highlight ? '#EFF4FF' : 'transparent',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, color: AR.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: highlight ? AR.blue : AR.ink, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}
