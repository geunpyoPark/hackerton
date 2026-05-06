import { useState } from 'react';
import { AR } from '../design';
import { KakaoMap } from '../components/KakaoMap';
import { TabBar } from '../components/TabBar';
import { PLACES, REPORT_TYPES as BASE_REPORT_TYPES } from '../data/accessibility';
import { createReport, getStoredReports } from '../lib/accessibility';
import { classifyReport } from '../lib/ai';
import { uploadReportImage } from '../lib/cloudinary';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

const REPORT_TYPES = [
  { id: 'elevator_broken', label: '엘리베이터 고장', color: 'red',    icon: 'elev' },
  { id: 'stairs',          label: '계단 있음',       color: 'yellow', icon: 'stair' },
  { id: 'curb',            label: '턱 있음',         color: 'yellow', icon: 'bump' },
  { id: 'steep_slope',     label: '급경사',          color: 'purple', icon: 'slope' },
  { id: 'construction',    label: '공사 중',         color: 'gray',   icon: 'const' },
  { id: 'other',           label: '기타',            color: 'gray',   icon: 'etc' },
];

const PALETTE = {
  red:    { soft: '#FEE2E2', fg: '#DC2626', border: '#FCA5A5' },
  yellow: { soft: '#FEF3C7', fg: '#D97706', border: '#FCD34D' },
  purple: { soft: '#EDE9FE', fg: '#7C3AED', border: '#C4B5FD' },
  gray:   { soft: '#F1F5F9', fg: '#475569', border: '#CBD5E1' },
};

const ISSUE_LABEL = {
  elevator_broken: '엘리베이터 고장',
  stairs: '계단 있음',
  curb: '턱 있음',
  steep_slope: '급경사',
  construction: '공사 중',
  blocked: '기타',
};

export function ReportScreen({ onNavigate, userType = 'wheelchair', userId, places = PLACES, reports = [], onDataChange }) {
  const [selected, setSelected] = useState(BASE_REPORT_TYPES[0].id);
  const [placeId, setPlaceId] = useState((places[0] || PLACES[0]).id);
  const [description, setDescription] = useState('');
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitState, setSubmitState] = useState('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [showMyReports, setShowMyReports] = useState(false);
  const [myReportList, setMyReportList] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const myReportsCount = reports.filter(report => report.user_id === userId).length;
  const effectivePlaceId = places.some(place => place.id === placeId) ? placeId : (places[0] || PLACES[0]).id;
  const selectedPlace = places.find(place => place.id === effectivePlaceId) || places[0] || PLACES[0];

  async function handleMoreClick() {
    setShowMyReports(prev => !prev);
    if (showMyReports) return;

    setLoadingReports(true);
    try {
      let myReports = [];

      if (hasSupabaseConfig && supabase) {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data?.length) {
          myReports = data;
        } else {
          myReports = getStoredReports().filter(r => r.user_id === userId);
        }
      } else {
        myReports = getStoredReports().filter(r => r.user_id === userId);
      }

      setMyReportList(myReports);
    } catch (error) {
      console.warn('내 제보 불러오기 실패:', error);
      setMyReportList(getStoredReports().filter(r => r.user_id === userId));
    } finally {
      setLoadingReports(false);
    }
  }

  async function handleSubmit() {
    try {
      setSubmitState('saving');
      setSubmitMessage('');
      const imageUrl = imageFile ? await uploadReportImage(imageFile) : '';
      const reportInput = {
        place_id: effectivePlaceId,
        user_id: userId,
        issue_type: selected,
        description: description.trim() || REPORT_TYPES.find(type => type.id === selected)?.label || '접근성 제보',
        image_url: imageUrl,
        lat: selectedPlace.lat,
        lng: selectedPlace.lng,
      };
      let classification = null;

      try {
        classification = await classifyReport({ userType, place: selectedPlace, report: reportInput });
      } catch (error) {
        console.warn('AI report classification skipped:', error.message);
      }

      const result = await createReport({ ...reportInput, ...(classification || {}) });

      setDescription('');
      setImageName('');
      setImageFile(null);
      await onDataChange?.();
      setSubmitState(result.source === 'supabase' ? 'saved' : 'fallback');
      setSubmitMessage(result.source === 'supabase'
        ? (classification ? 'AI 분류와 제보가 저장되었습니다.' : (imageUrl ? '사진과 제보가 저장되었습니다.' : '제보가 Supabase에 저장되었습니다.'))
        : 'Supabase 연결이 없어 기기에 임시 저장했습니다.');

      if (showMyReports) handleMoreClick();
    } catch (error) {
      setSubmitState('error');
      setSubmitMessage(error.message || '제보 저장 중 오류가 발생했습니다.');
    }
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
          <select value={effectivePlaceId} onChange={event => setPlaceId(event.target.value)} style={{
            background: '#fff', borderRadius: 12,
            padding: '12px 14px', border: `1px solid ${AR.border}`,
            width: '100%', fontSize: 14, color: AR.ink, fontFamily: AR.font,
          }}>
            {places.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
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
            <input type="file" accept="image/*" onChange={event => {
              const file = event.target.files?.[0] || null;
              setImageFile(file);
              setImageName(file?.name || '');
            }} style={{ display: 'none' }}/>
          </label>
        </Section>

        {submitState !== 'idle' && submitState !== 'saving' && (
          <div style={{
            marginTop: 6, padding: '10px 12px', borderRadius: 10,
            background: submitState === 'saved' ? AR.greenSoft : submitState === 'error' ? AR.redSoft : AR.yellowSoft,
            color: submitState === 'saved' ? AR.green : submitState === 'error' ? AR.red : AR.yellow,
            fontSize: 13, fontWeight: 700,
          }}>{submitMessage}</div>
        )}

        <button onClick={handleSubmit} disabled={submitState === 'saving'} style={{
          marginTop: 16, width: '100%', height: 54,
          background: submitState === 'saving' ? AR.muted : AR.blue, color: '#fff',
          border: 'none', borderRadius: 14,
          fontSize: 16, fontWeight: 700, fontFamily: AR.font,
          boxShadow: '0 4px 12px rgba(37,99,235,0.24)',
        }}>{submitState === 'saving' ? '보내는 중...' : '제출하기'}</button>

        {/* My reports */}
        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: AR.ink }}>내 제보 현황</div>
          <div
            onClick={handleMoreClick}
            style={{ fontSize: 12, color: AR.blue, cursor: 'pointer', fontWeight: 600 }}
          >
            {showMyReports ? '접기 ∧' : '더보기 ›'}
          </div>
        </div>
        <div style={{
          marginTop: 10, background: '#fff', borderRadius: 14, padding: 4,
          border: `1px solid ${AR.border}`,
          display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', // ✅ 2칸으로 변경
        }}>
          <Mini label="내 제보" value={`${myReportsCount}건`}/>
          <Mini label="채택률" value="92%" highlight/>
          {/* ✅ 도움 받은 사용자 제거 */}
        </div>

        {/* 내 제보 목록 */}
        {showMyReports && (
          <div style={{ marginTop: 12 }}>
            {loadingReports
              ? <div style={{ textAlign: 'center', color: AR.muted, fontSize: 13, padding: 16 }}>
                  불러오는 중...
                </div>
              : myReportList.length === 0
                ? <div style={{
                    textAlign: 'center', color: AR.muted,
                    fontSize: 13, padding: 16,
                    background: '#fff', borderRadius: 12,
                    border: `1px solid ${AR.border}`,
                  }}>
                    아직 제보한 내용이 없어요 😊
                  </div>
                : myReportList.map(report => (
                    <div key={report.id} style={{
                      background: '#fff', borderRadius: 12,
                      padding: '12px 14px', marginBottom: 8,
                      border: `1px solid ${AR.border}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: AR.ink }}>
                          {ISSUE_LABEL[report.issue_type] || report.issue_type}
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600,
                          color: report.status === 'active' ? AR.green : AR.muted,
                          background: report.status === 'active' ? AR.greenSoft : AR.bg,
                          padding: '2px 8px', borderRadius: 6,
                        }}>
                          {report.status === 'active' ? '접수완료' : '처리중'}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: AR.muted, marginTop: 4, lineHeight: 1.5 }}>
                        {report.description}
                      </div>
                      {report.image_url && (
                        <img src={report.image_url} alt="제보 사진"
                          style={{ marginTop: 8, width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 120 }}
                        />
                      )}
                      <div style={{ fontSize: 11, color: AR.muted, marginTop: 6 }}>
                        {report.created_at?.slice(0, 10)}
                      </div>
                    </div>
                  ))
            }
          </div>
        )}
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
      borderRadius: 12, padding: '14px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: AR.font, textAlign: 'left',
    }}>
      <div style={{ color: pal.fg, display: 'flex' }}>
        {t.icon === 'elev' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="1.5" stroke="currentColor" strokeWidth="2"/><path d="M12 3v18M9 9l-2 2 2 2M15 13l2-2-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {t.icon === 'stair' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 21h4v-4h4v-4h4V9h4V5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>}
        {t.icon === 'bump' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M2 18h4l3-8 3 14 3-10 3 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {t.icon === 'slope' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 19L21 5M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        {t.icon === 'const' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V11l7-5 7 5v10" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2"/></svg>}
        {t.icon === 'etc' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/></svg>}
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