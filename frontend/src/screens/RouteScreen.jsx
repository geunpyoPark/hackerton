import { useCallback, useEffect, useMemo, useState } from 'react';
import { AR } from '../design';
import { KakaoMap } from '../components/KakaoMap';
import { TabBar } from '../components/TabBar';
import { PLACES } from '../data/accessibility';
import { FACILITIES, FACILITY_LAYERS } from '../data/facilities';
import { searchSubwayRoute } from '../lib/odsay';
import { searchWalkingRoute } from '../lib/walking';
import { resolveKakaoPlaceLocation } from '../lib/kakaoPlaces';
import { fetchAccessibilitySummary } from '../lib/ai';
import {
  buildAccessibilitySummary,
  calculateReliability,
  filterReportsForPlace,
  formatRelativeDate,
  getUserTypeLabel,
} from '../lib/accessibility';

const STATION_COORDS = {
  강남: { lat: 37.497952, lng: 127.027619 },
  역삼: { lat: 37.500622, lng: 127.036456 },
  선릉: { lat: 37.504503, lng: 127.049008 },
  삼성: { lat: 37.508844, lng: 127.06316 },
  코엑스: { lat: 37.511682, lng: 127.059151 },
  압구정: { lat: 37.526485, lng: 127.028486 },
  신사: { lat: 37.516431, lng: 127.020293 },
  논현: { lat: 37.511093, lng: 127.021415 },
  학동: { lat: 37.514229, lng: 127.031656 },
  강남구청: { lat: 37.517179, lng: 127.041255 },
  청담: { lat: 37.519365, lng: 127.05335 },
  봉은사: { lat: 37.514219, lng: 127.060245 },
  삼성중앙: { lat: 37.513011, lng: 127.053282 },
  선정릉: { lat: 37.510297, lng: 127.043999 },
  한티: { lat: 37.496237, lng: 127.052873 },
  도곡: { lat: 37.490858, lng: 127.055381 },
  구룡: { lat: 37.486839, lng: 127.058856 },
  개포동: { lat: 37.489116, lng: 127.06614 },
  대치: { lat: 37.494612, lng: 127.063642 },
  수서: { lat: 37.487371, lng: 127.10188 },
  일원: { lat: 37.483681, lng: 127.08439 },
};

const LINE_2_EAST = ['강남', '역삼', '선릉', '삼성'];
const LINE_BUNDANG_GANGNAM = ['선정릉', '선릉', '한티', '도곡', '구룡', '개포동', '대모산입구', '수서'];

export function RouteScreen({
  onNavigate,
  onBack,
  userType = 'wheelchair',
  places = PLACES,
  reports: allReports = [],
  routeQuery,
}) {
  const [activeFacilityType, setActiveFacilityType] = useState(null);
  const [routeMode, setRouteMode] = useState('walk');
  const [odsayRoute, setOdsayRoute] = useState(null);
  const [routeStatus, setRouteStatus] = useState('idle');
  const [routeError, setRouteError] = useState('');
  const [walkingRoute, setWalkingRoute] = useState(null);
  const [walkingStatus, setWalkingStatus] = useState('idle');
  const [walkingError, setWalkingError] = useState('');
  const [walkingEndpoints, setWalkingEndpoints] = useState(null);
  const [selectedRouteRiskId, setSelectedRouteRiskId] = useState(null);
  const fromName = routeQuery?.from || '강남역';
  const toName = routeQuery?.to || '코엑스';
  const fromStation = normalizeStationName(fromName);
  const toStation = normalizeStationName(toName);
  const mainPlace = places.find(place => place.id === 'gangnam-exit-2') || places[0] || PLACES[0];
  const reports = useMemo(
    () => filterReportsForPlace(allReports, mainPlace.id),
    [allReports, mainPlace.id],
  );
  const reliability = calculateReliability(mainPlace, reports);
  const fallbackSummary = useMemo(
    () => buildAccessibilitySummary(mainPlace, reports, userType),
    [mainPlace, reports, userType],
  );
  const [aiSummary, setAiSummary] = useState(fallbackSummary);
  const [aiStatus, setAiStatus] = useState('idle');
  const summary = aiSummary || fallbackSummary;
  const fallbackRoutePlaces = buildRoutePlaces(fromName, toName);
  const transitRoutePlaces = odsayRoute?.stations?.length > 0
    ? buildOdsayRoutePlaces(odsayRoute.stations, fromName, toName)
    : fallbackRoutePlaces;
  const walkingRoutePlaces = buildWalkingRoutePlaces(fromName, toName);
  const routePlaces = routeMode === 'walk' ? walkingRoutePlaces : transitRoutePlaces;
  const routeRecommendation = buildRouteRecommendation(fromStation, toStation, userType);
  const walkingRecommendation = buildWalkingRecommendation(userType, walkingEndpoints);
  const walkingDistance = walkingRoute?.totalDistance;
  const timeLabel = routeMode === 'walk'
    ? walkingRoute?.totalTime
      ? `${Math.max(1, Math.round(walkingRoute.totalTime / 60))}분`
      : walkingStatus === 'loading' ? '확인 중' : '도보 경로 확인 중'
    : odsayRoute?.totalTime ? `${odsayRoute.totalTime}분` : '15분';
  const distanceLabel = routeMode === 'walk'
    ? walkingDistance ? formatDistance(walkingDistance) : '거리 확인 중'
    : odsayRoute?.totalDistance
    ? `${formatDistance(odsayRoute.totalDistance)}`
    : '1.2 km';
  const routeSummaryText = routeMode === 'walk'
    ? `${fromName}에서 ${toName}까지 보행 경로`
    : odsayRoute?.summary || routePlaces.map(place => place.name).join(' → ');
  const visibleFacilities = activeFacilityType
    ? FACILITIES.filter(facility => (
        facility.type === activeFacilityType &&
        (facility.stationName === fromStation || facility.stationName === toStation)
      ))
    : [];
  const mapRoutePath = useMemo(() => {
    if (routeMode === 'walk') {
      return walkingRoute?.path?.length > 1 ? walkingRoute.path : [];
    }

    return odsayRoute?.polyline || [];
  }, [odsayRoute, routeMode, walkingRoute]);
  const routeRiskReports = useMemo(
    () => findRouteRiskReports(allReports, mapRoutePath),
    [allReports, mapRoutePath],
  );
  const routeRiskMarkers = useMemo(
    () => routeRiskReports.map(report => ({
      id: `route-risk-${report.id}`,
      name: getReportRiskLabel(report),
      lat: Number(report.lat),
      lng: Number(report.lng),
      risk: 'red',
      routeRisk: true,
      reportId: report.id,
    })),
    [routeRiskReports],
  );
  const mapPlaces = [...routePlaces, ...visibleFacilities, ...routeRiskMarkers];
  const hasRouteRisk = routeMode === 'walk' && routeRiskReports.length > 0;
  const routeScore = hasRouteRisk
    ? Math.max(30, reliability - routeRiskReports.length * 18)
    : reliability;
  const routeRiskSummary = hasRouteRisk
    ? `현재 경로 주변 ${routeRiskReports.length}건의 위험 제보가 있어 우회 확인이 필요합니다.`
    : walkingRecommendation;
  const selectedRouteRisk = routeRiskReports.find(report => report.id === selectedRouteRiskId);
  const reportCount = reports.length + mainPlace.recent_reports_count;

  const handleMapPlaceClick = useCallback((place) => {
    if (!place.routeRisk || !place.reportId) return;
    setSelectedRouteRiskId(place.reportId);
  }, []);

  useEffect(() => {
    let canceled = false;

    if (routeMode !== 'transit') {
      queueMicrotask(() => {
        if (canceled) return;
        setOdsayRoute(null);
        setRouteStatus('idle');
        setRouteError('');
      });
      return () => {
        canceled = true;
      };
    }

    const from = STATION_COORDS[fromStation];
    const destinationStation = toStation === '코엑스' ? '삼성' : toStation;
    const to = STATION_COORDS[destinationStation];

    queueMicrotask(() => {
      if (canceled) return;
      setOdsayRoute(null);
      setRouteError('');
    });

    if (!from || !to) {
      queueMicrotask(() => {
        if (canceled) return;
        setRouteStatus('fallback');
        setRouteError('역 좌표가 아직 등록되지 않아 임시 경로를 표시 중입니다.');
      });
      return () => {
        canceled = true;
      };
    }

    queueMicrotask(() => {
      if (canceled) return;
      setRouteStatus('loading');
    });
    searchSubwayRoute({ from, to })
      .then((result) => {
        if (canceled) return;
        setOdsayRoute(result);
        setRouteStatus('ready');
      })
      .catch((error) => {
        if (canceled) return;
        console.error('ODsay route failed:', error);
        setRouteStatus('fallback');
        setRouteError('ODsay 연결 전이라 임시 지하철 경로를 표시 중입니다.');
      });

    return () => {
      canceled = true;
    };
  }, [fromStation, toStation, routeMode]);

  useEffect(() => {
    let canceled = false;

    if (routeMode !== 'walk') {
      queueMicrotask(() => {
        if (canceled) return;
        setWalkingRoute(null);
        setWalkingStatus('idle');
        setWalkingError('');
      });
      return () => {
        canceled = true;
      };
    }

    const destinationStation = toStation === '코엑스' ? '코엑스' : toStation;

    queueMicrotask(() => {
      if (canceled) return;
      setWalkingRoute(null);
      setWalkingError('');
      setWalkingEndpoints(null);
    });

    resolveWalkingEndpoints({ fromName, toName, fromStation, toStation: destinationStation, userType })
      .then(({ from, to, fromFacility, toFacility }) => {
        if (canceled) return;

        if (!from || !to) {
          setWalkingStatus('fallback');
          setWalkingError('좌표가 없어 임시 도보 경로를 표시 중입니다.');
          return null;
        }

        setWalkingEndpoints({ fromFacility, toFacility });
        setWalkingStatus('loading');
        return searchWalkingRoute({ from, to });
      })
      .then((result) => {
        if (canceled || !result) return;
        setWalkingRoute(result);
        setWalkingStatus('ready');
      })
      .catch((error) => {
        if (canceled) return;
        console.error('TMAP walking route failed:', error);
        setWalkingRoute(null);
        setWalkingStatus('fallback');
        setWalkingError(getWalkingErrorMessage(error));
      });

    return () => {
      canceled = true;
    };
  }, [fromName, fromStation, toName, toStation, routeMode, userType]);

  function handleFacilityLayerClick(type) {
    const nextType = activeFacilityType === type ? null : type;
    setActiveFacilityType(nextType);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setAiStatus('loading');
      try {
        const nextSummary = await fetchAccessibilitySummary({
          userType,
          place: mainPlace,
          reports,
        });
        if (!cancelled) {
          setAiSummary(nextSummary);
          setAiStatus(nextSummary.source === 'gemini' ? 'gemini' : 'fallback');
        }
      } catch {
        if (!cancelled) {
          setAiSummary(fallbackSummary);
          setAiStatus('fallback');
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [fallbackSummary, mainPlace, reports, userType]);

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
        <button onClick={onBack} style={{ width: 36, height: 36, border: 'none', background: 'transparent' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke={AR.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: AR.ink }}>경로 상세</div>
        <button style={{ width: 36, height: 36, border: 'none', background: 'transparent' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="6" cy="12" r="2.5" stroke={AR.ink} strokeWidth="2"/>
            <circle cx="18" cy="6" r="2.5" stroke={AR.ink} strokeWidth="2"/>
            <circle cx="18" cy="18" r="2.5" stroke={AR.ink} strokeWidth="2"/>
            <path d="M8 11l8-4M8 13l8 4" stroke={AR.ink} strokeWidth="2"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Route summary */}
        <div style={{ padding: '8px 16px 12px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: AR.ink, letterSpacing: '-0.01em' }}>{fromName}</div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M14 6l6 6-6 6" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 18, fontWeight: 800, color: AR.ink, letterSpacing: '-0.01em' }}>{toName}</div>
            </div>
            <div style={{
              background: '#EFF4FF', color: AR.blue,
              fontSize: 11, fontWeight: 700,
              padding: '4px 8px', borderRadius: 6,
            }}>{getUserTypeLabel(userType)} 모드</div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            border: `1px solid ${AR.border}`, borderRadius: 12, overflow: 'hidden',
          }}>
            <Stat label="총 거리" value={distanceLabel}/>
            <Stat label="예상 시간" value={timeLabel} border/>
            <Stat label="접근성 점수" value={`${routeScore}%`} valueColor={routeScore >= 80 ? AR.green : AR.yellow} border/>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            gap: 8,
            marginTop: 10,
          }}>
            <ModeButton active={routeMode === 'walk'} onClick={() => setRouteMode('walk')}>도보</ModeButton>
            <ModeButton active={routeMode === 'transit'} onClick={() => setRouteMode('transit')}>대중교통</ModeButton>
          </div>
        </div>

        {/* Map */}
        <div style={{ position: 'relative', height: 280, background: '#E8EEF4', overflow: 'hidden' }}>
          <KakaoMap
            places={mapPlaces}
            routePath={mapRoutePath}
            disableFallbackRoute={routeMode === 'walk' && !walkingRoute?.path?.length}
            onPlaceClick={handleMapPlaceClick}
          />
          <div style={{
            position: 'absolute', top: 12, right: 12,
            width: 38, height: 38, borderRadius: 10,
            background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 2v20M3 7l9 5 9-5" stroke={AR.ink} strokeWidth="1.6"/>
            </svg>
          </div>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 38, height: 38, borderRadius: 19,
            background: AR.blue, boxShadow: '0 4px 12px rgba(37,99,235,0.32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#fff"/>
              <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {selectedRouteRisk && (
            <RouteRiskDetail
              report={selectedRouteRisk}
              onClose={() => setSelectedRouteRiskId(null)}
            />
          )}
          {routeMode === 'walk' && !selectedRouteRisk && (
            <div style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              maxWidth: 260,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.94)',
              color: AR.ink,
              padding: '6px 9px',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
            }}>
              {walkingStatus === 'loading'
                ? 'TMAP 도보 경로 불러오는 중'
                : walkingStatus === 'ready'
                ? 'TMAP 도보 길찾기 경로를 표시합니다.'
                : walkingError || '도보 모드: 지도에 보행 경로를 표시합니다.'}
            </div>
          )}
          {routeMode === 'transit' && routeStatus !== 'ready' && (
            <div style={{
              position: 'absolute',
              left: 12,
              bottom: 12,
              maxWidth: 250,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.94)',
              color: AR.ink,
              padding: '6px 9px',
              fontSize: 11,
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(15,23,42,0.12)',
            }}>
              {routeStatus === 'loading' ? '대중교통 경로 불러오는 중' : routeError}
            </div>
          )}
        </div>

        <div style={{
          background: '#fff',
          padding: '10px 16px 12px',
          borderBottom: `1px solid ${AR.border}`,
        }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {FACILITY_LAYERS.map(layer => {
              const active = activeFacilityType === layer.type;
              return (
                <button
                  key={layer.type}
                  type="button"
                  onClick={() => handleFacilityLayerClick(layer.type)}
                  title={layer.api}
                  style={{
                    flexShrink: 0,
                    border: `1px solid ${active ? AR.blue : AR.border}`,
                    background: active ? '#EFF4FF' : '#fff',
                    color: active ? AR.blue : AR.ink,
                    borderRadius: 999,
                    padding: '8px 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: AR.font,
                    boxShadow: active ? '0 2px 8px rgba(37,99,235,0.12)' : 'none',
                  }}
                >
                  {layer.label}
                </button>
              );
            })}
          </div>
          {activeFacilityType && (
            <div style={{ marginTop: 8, fontSize: 11, color: AR.muted, fontWeight: 600 }}>
              {visibleFacilities.length > 0
                ? `${visibleFacilities.length}건 표시`
                : '아직 연결된 데이터가 없습니다'}
            </div>
          )}
        </div>

        {/* Detail cards */}
        <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Route summary card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${AR.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AR.muted, marginBottom: 10 }}>추천 경로 요약</div>
            <div style={{ fontSize: 12, color: AR.muted, fontWeight: 700, marginBottom: 8, lineHeight: 1.45 }}>
              {routeSummaryText}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: routeRecommendation.accessible ? AR.greenSoft : AR.redSoft, color: routeRecommendation.accessible ? AR.green : AR.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800,
              }}>✓</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: AR.ink }}>
                {routeMode === 'walk' ? routeRiskSummary : routeRecommendation.oneLine}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke={AR.muted} strokeWidth="1.8"/>
                <path d="M12 7v5l3 2" stroke={AR.muted} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ fontSize: 14, color: AR.ink }}>{timeLabel} 소요 ({distanceLabel})</div>
            </div>
          </div>

          {/* Risks card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${AR.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: AR.muted, marginBottom: 10 }}>위험 요소</div>
            {hasRouteRisk && (
              <div style={{ marginBottom: 10 }}>
                <RiskRow
                  severity="red"
                  title="현재 경로상 위험 제보 감지"
                  sub="공사, 통행 불가, 계단/턱 등은 우회 확인이 필요합니다"
                />
              </div>
            )}
            {(hasRouteRisk ? routeRiskReports : reports).slice(0, 3).map(report => (
              <RiskRow
                key={report.id}
                severity={getReportRiskSeverity(report)}
                title={getReportRiskLabel(report)}
                sub={formatReportRiskSub(report)}
              />
            ))}
            <div style={{ height: 8 }}/>
            <RiskRow severity="yellow" title={summary.risks} sub="공공데이터와 사용자 제보 기반"/>
          </div>

          {/* AI summary */}
          <div style={{
            background: 'linear-gradient(135deg, #EFF4FF 0%, #F0FDF4 100%)',
            borderRadius: 14, padding: 16,
            border: `1px solid ${AR.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{
                background: AR.blue, color: '#fff',
                fontSize: 10, fontWeight: 800,
                padding: '3px 7px', borderRadius: 5, letterSpacing: '0.04em',
              }}>AI</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: AR.ink }}>
                {aiStatus === 'loading' ? 'AI 추천 안내 생성 중' : 'AI 추천 안내'}
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.55 }}>
              {routeMode === 'walk' ? routeRiskSummary : routeRecommendation.oneLine}{' '}
              <span style={{ color: routeRecommendation.accessible ? AR.green : AR.red, fontWeight: 700 }}>
                {routeMode === 'walk'
                  ? hasRouteRisk
                    ? '빨간 위험 마커 위치를 피해서 이동하거나 대체 경로를 확인하세요.'
                    : 'TMAP 보행 경로이며, 휠체어 접근성은 엘리베이터 출구 데이터와 함께 확인하세요.'
                  : routeRecommendation.action}
              </span>
            </div>
          </div>

          {/* Score card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${AR.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: AR.muted }}>접근성 신뢰도</div>
              <div style={{ fontSize: 11, color: AR.muted }}>최근 제보 {reportCount}건 · {formatRelativeDate(mainPlace.last_updated)} 업데이트</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: routeScore >= 80 ? AR.green : AR.yellow, letterSpacing: '-0.02em' }}>{routeScore}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: routeScore >= 80 ? AR.green : AR.yellow }}>%</div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: routeScore >= 80 ? AR.green : AR.yellow, fontWeight: 600 }}>{routeScore >= 80 ? '높음' : '주의'}</div>
            </div>
            <div style={{ height: 8, background: AR.bg, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${routeScore}%`, height: '100%',
                background: `linear-gradient(90deg, ${routeScore >= 80 ? AR.green : AR.yellow} 0%, #34D399 100%)`,
                borderRadius: 4,
              }}/>
            </div>
          </div>
        </div>
      </div>

      <TabBar active="route" onNavigate={onNavigate}/>
    </div>
  );
}

function normalizeStationName(value) {
  const text = String(value || '').replace(/\s/g, '').trim();
  return text.endsWith('역') ? text.slice(0, -1) : text;
}

function buildWalkingRoutePlaces(fromName, toName) {
  const fromStation = normalizeStationName(fromName);
  const toStation = normalizeStationName(toName);

  return [
    {
      id: 'walk-start',
      name: fromName,
      ...(STATION_COORDS[fromStation] || { locationQuery: fromName }),
      risk: 'green',
      routeRole: 'start',
    },
    {
      id: 'walk-end',
      name: toName,
      ...(STATION_COORDS[toStation] || { locationQuery: toName }),
      risk: 'green',
      routeRole: 'end',
    },
  ];
}

function buildRoutePlaces(fromName, toName) {
  const fromStation = normalizeStationName(fromName);
  const toStation = normalizeStationName(toName) === '코엑스' ? '삼성' : normalizeStationName(toName);
  const lineRoute = getLineRoute(fromStation, toStation);

  if (lineRoute.length > 0) {
    const places = lineRoute.map((station, index) => ({
      id: `route-${station}-${index}`,
      name: `${station}역`,
      ...STATION_COORDS[station],
      risk: 'green',
      routeVia: index > 0 && index < lineRoute.length - 1,
      routeRole: index === 0 ? 'start' : undefined,
    }));

    if (normalizeStationName(toName) === '코엑스') {
      places.push({
        id: 'route-coex',
        name: '코엑스',
        ...STATION_COORDS.코엑스,
        risk: 'green',
        routeRole: 'end',
      });
    } else {
      places[places.length - 1] = {
        ...places[places.length - 1],
        name: toName,
        routeVia: false,
        routeRole: 'end',
      };
    }

    return places;
  }

  return [
    {
      id: 'route-start',
      name: fromName,
      ...(STATION_COORDS[fromStation] || { locationQuery: fromName }),
      risk: 'green',
      routeRole: 'start',
    },
    {
      id: 'route-end',
      name: toName,
      ...(STATION_COORDS[normalizeStationName(toName)] || { locationQuery: toName }),
      risk: 'green',
      routeRole: 'end',
    },
  ];
}

function getLineRoute(fromStation, toStation) {
  const lines = [LINE_2_EAST, LINE_BUNDANG_GANGNAM];

  for (const line of lines) {
    const route = getRouteFromLine(line, fromStation, toStation);
    if (route.length > 0) return route;
  }

  return [];
}

function getRouteFromLine(line, fromStation, toStation) {
  const startIndex = line.indexOf(fromStation);
  const endIndex = line.indexOf(toStation);

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  const [start, end] = startIndex <= endIndex
    ? [startIndex, endIndex]
    : [endIndex, startIndex];
  const route = line.slice(start, end + 1);

  return startIndex <= endIndex ? route : route.reverse();
}

function buildOdsayRoutePlaces(stations, fromName, toName) {
  return stations.map((station, index) => {
    const stationName = normalizeStationName(station.name);
    const coords = hasCoords(station) ? { lat: station.lat, lng: station.lng } : STATION_COORDS[stationName];
    return {
      id: `odsay-route-${stationName}-${index}`,
      name: `${stationName}역`,
      ...(coords || { locationQuery: `${stationName}역` }),
      risk: 'green',
      routeVia: index > 0 && index < stations.length - 1,
      routeRole: index === 0 ? 'start' : index === stations.length - 1 ? 'end' : undefined,
      line: station.line,
    };
  }).map((place, index, places) => {
    if (index === 0) return { ...place, name: fromName };
    if (index === places.length - 1) return { ...place, name: toName };
    return place;
  });
}

function hasCoords(station) {
  return typeof station.lat === 'number' && typeof station.lng === 'number';
}

function buildRouteRecommendation(fromStation, toStation, userType) {
  const fromFacility = findRecommendedFacility(fromStation, userType);
  const toFacility = findRecommendedFacility(toStation === '코엑스' ? '삼성' : toStation, userType);

  if (fromFacility && toFacility) {
    return {
      accessible: true,
      oneLine: `${formatFacility(fromFacility)}로 들어가서 ${formatFacility(toFacility)}로 나오세요.`,
      action: '엘리베이터 위치를 지도에서 확인하세요.',
    };
  }

  if (fromFacility || toFacility) {
    const known = fromFacility || toFacility;
    return {
      accessible: false,
      oneLine: `${formatFacility(known)}는 확인됐지만 다른 역 출입구 데이터가 부족합니다.`,
      action: '시설 버튼을 눌러 확인된 위치부터 확인하세요.',
    };
  }

  return {
    accessible: false,
    oneLine: `${fromStation}역과 ${toStation}역의 추천 출입구 데이터가 아직 부족합니다.`,
    action: '엑셀 데이터에 엘리베이터 출구를 추가하면 추천할 수 있습니다.',
  };
}

function findRecommendedFacility(stationName, userType) {
  const preferredTypes = getPreferredFacilityTypes(userType);
  return FACILITIES.find(facility => (
    facility.stationName === stationName &&
    preferredTypes.includes(facility.type) &&
    facility.risk !== 'red'
  ));
}

function getPreferredFacilityTypes(userType) {
  if (userType === 'wheelchair' || userType === 'stroller') {
    return ['elevator'];
  }

  return ['elevator', 'escalator'];
}

function formatFacility(facility) {
  const exit = facility.exitNo ? `${facility.exitNo}번 출구 ` : '';
  const label = FACILITY_LAYERS.find(layer => layer.type === facility.type)?.label || facility.name;
  return `${facility.stationName}역 ${exit}${label}`;
}

function formatDistance(meters) {
  const distance = Number(meters);
  if (!Number.isFinite(distance)) return '거리 확인 중';
  if (distance >= 1000) return `${(distance / 1000).toFixed(1)} km`;
  return `${Math.round(distance)} m`;
}

const ROUTE_RISK_DISTANCE_METERS = 60;
const HIGH_RISK_ISSUE_TYPES = new Set([
  'elevator_broken',
  'stairs',
  'curb',
  'construction',
  'blocked',
  'other',
]);
const HIGH_RISK_AI_CATEGORIES = new Set([
  '엘리베이터 고장',
  '계단/턱',
  '공사 중',
  '통행 불가',
  '급경사',
  '보도 파손',
  '장애물 적치',
  '점자블록 문제',
]);

function findRouteRiskReports(reports, routePath) {
  if (!Array.isArray(reports) || !Array.isArray(routePath) || routePath.length < 2) {
    return [];
  }

  return reports
    .filter(isRouteBlockingReport)
    .map((report) => {
      const lat = Number(report.lat);
      const lng = Number(report.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      const distance = getDistanceToRouteMeters({ lat, lng }, routePath);
      if (distance > ROUTE_RISK_DISTANCE_METERS) return null;

      return {
        ...report,
        routeDistance: distance,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.routeDistance - b.routeDistance);
}

function isRouteBlockingReport(report) {
  if (!report) return false;
  return (
    HIGH_RISK_ISSUE_TYPES.has(report.issue_type) ||
    HIGH_RISK_AI_CATEGORIES.has(report.ai_category) ||
    report.ai_severity === 'high'
  );
}

function getDistanceToRouteMeters(point, routePath) {
  return routePath.reduce((minDistance, current, index) => {
    if (index === routePath.length - 1) return minDistance;

    const next = routePath[index + 1];
    if (!hasLatLng(current) || !hasLatLng(next)) return minDistance;

    return Math.min(minDistance, getPointToSegmentDistanceMeters(point, current, next));
  }, Infinity);
}

function getPointToSegmentDistanceMeters(point, start, end) {
  const originLat = point.lat;
  const p = toMeters(point, originLat);
  const a = toMeters(start, originLat);
  const b = toMeters(end, originLat);
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }

  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  const projection = {
    x: a.x + t * dx,
    y: a.y + t * dy,
  };

  return Math.hypot(p.x - projection.x, p.y - projection.y);
}

function toMeters(point, originLat) {
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLng = 111_320 * Math.cos(originLat * Math.PI / 180);

  return {
    x: lng * metersPerDegreeLng,
    y: lat * metersPerDegreeLat,
  };
}

function hasLatLng(point) {
  return Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng));
}

function getReportRiskSeverity(report) {
  return report.ai_severity === 'high' ||
    report.issue_type === 'elevator_broken' ||
    report.issue_type === 'blocked' ||
    report.issue_type === 'construction'
    ? 'red'
    : 'yellow';
}

function getReportRiskLabel(report) {
  return report.ai_category || report.description || getIssueTypeLabel(report.issue_type);
}

function getIssueTypeLabel(issueType) {
  const labels = {
    elevator_broken: '엘리베이터 고장',
    stairs: '계단 있음',
    curb: '턱 있음',
    steep_slope: '급경사',
    slope: '경사 있음',
    construction: '공사 중',
    blocked: '통행 불가',
    other: '기타 위험',
  };

  return labels[issueType] || '접근성 위험 제보';
}

function formatReportRiskSub(report) {
  const parts = [];
  if (Number.isFinite(report.routeDistance)) {
    parts.push(`경로에서 약 ${Math.round(report.routeDistance)}m`);
  }
  if (report.responsible_agency) {
    parts.push(report.responsible_agency);
  }
  parts.push(`${formatRelativeDate(report.created_at)} 제보`);
  return parts.join(' · ');
}

async function resolveWalkingEndpoints({ fromName, toName, fromStation, toStation, userType }) {
  const fromFacility = findRecommendedFacility(fromStation, userType);
  const toFacility = findRecommendedFacility(toStation, userType);
  const [fromFacilityCoords, toFacilityCoords] = await Promise.all([
    resolveFacilityCoords(fromFacility),
    resolveFacilityCoords(toFacility),
  ]);
  const [fromPlaceCoords, toPlaceCoords] = await Promise.all([
    fromFacilityCoords ? Promise.resolve(null) : resolveRouteEndpointCoords(fromName, fromStation),
    toFacilityCoords ? Promise.resolve(null) : resolveRouteEndpointCoords(toName, toStation),
  ]);
  const from = fromFacilityCoords || fromPlaceCoords || STATION_COORDS[fromStation];
  const to = toFacilityCoords || toPlaceCoords || STATION_COORDS[toStation];

  return {
    from,
    to,
    fromFacility: fromFacility && fromFacilityCoords
      ? { ...fromFacility, ...fromFacilityCoords, routeRole: 'start' }
      : null,
    toFacility: toFacility && toFacilityCoords
      ? { ...toFacility, ...toFacilityCoords, routeRole: 'end' }
      : null,
  };
}

async function resolveRouteEndpointCoords(name, stationName) {
  if (STATION_COORDS[stationName]) return STATION_COORDS[stationName];
  if (!name) return null;

  try {
    return await withTimeout(resolveKakaoPlaceLocation(name), 1800);
  } catch (error) {
    console.error('Kakao route endpoint geocode failed:', error);
    return null;
  }
}

async function resolveFacilityCoords(facility) {
  if (!facility) return null;
  if (typeof facility.lat === 'number' && typeof facility.lng === 'number') {
    return { lat: facility.lat, lng: facility.lng };
  }
  if (!facility.locationQuery) return null;

  try {
    return await withTimeout(resolveKakaoPlaceLocation(facility.locationQuery), 1800);
  } catch (error) {
    console.error('Kakao facility geocode failed:', error);
    return null;
  }
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

function buildWalkingRecommendation(userType, endpoints) {
  const fromLabel = formatEndpointFacility(endpoints?.fromFacility);
  const toLabel = formatEndpointFacility(endpoints?.toFacility);

  if (userType === 'wheelchair' || userType === 'stroller') {
    if (fromLabel && toLabel) {
      return `${fromLabel}에서 ${toLabel}까지 TMAP 도보 경로를 표시합니다.`;
    }
    return '엘리베이터 출구를 우선 확인하고 TMAP 도보 경로를 표시합니다.';
  }

  if (fromLabel && toLabel) {
    return `${fromLabel}에서 ${toLabel}까지 TMAP 도보 경로를 표시합니다.`;
  }

  return '엘리베이터/에스컬레이터 출구를 우선 확인하고 TMAP 도보 경로를 표시합니다.';
}

function getWalkingErrorMessage(error) {
  const message = String(error?.message || '');
  if (message.includes('INVALID_API_KEY') || message.includes('tmap-walk-http-403')) {
    return 'TMAP 앱키 또는 보행자 API 권한 오류입니다. 앱키/상품 신청을 확인하세요.';
  }
  if (message.includes('tmap-walk-empty-path')) {
    return 'TMAP 응답에 도보 경로 선이 없습니다.';
  }
  if (message.includes('missing-tmap-key')) {
    return 'VITE_TMAP_API_KEY가 없습니다.';
  }
  return 'TMAP 도보 길찾기 호출에 실패했습니다.';
}

function formatEndpointFacility(facility) {
  if (!facility) return '';
  const exit = facility.exitNo ? `${facility.exitNo}번 출구` : '';
  const label = FACILITY_LAYERS.find(layer => layer.type === facility.type)?.label || facility.name;
  return `${facility.stationName}역 ${exit} ${label}`.replace(/\s+/g, ' ').trim();
}

function RouteRiskDetail({ report, onClose }) {
  return (
    <div style={{
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 12,
      zIndex: 4,
      borderRadius: 12,
      background: 'rgba(255,255,255,0.97)',
      border: `1px solid ${AR.border}`,
      boxShadow: '0 10px 24px rgba(15,23,42,0.18)',
      padding: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: AR.redSoft,
          color: AR.red,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 3l11 18H1L12 3z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
            <path d="M12 10v5M12 17.5v.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: AR.red, marginBottom: 3 }}>
            경로상 위험 제보
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: AR.ink, lineHeight: 1.35 }}>
            {getReportRiskLabel(report)}
          </div>
          {report.description && (
            <div style={{
              marginTop: 4,
              fontSize: 12,
              color: '#334155',
              lineHeight: 1.45,
              wordBreak: 'keep-all',
            }}>
              {report.description}
            </div>
          )}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px 6px',
            marginTop: 9,
          }}>
            <RiskChip>{formatReportRiskSub(report)}</RiskChip>
            {report.ai_severity && <RiskChip>{report.ai_severity === 'high' ? '높은 위험도' : '주의'}</RiskChip>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="제보 상세 닫기"
          style={{
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 14,
            background: AR.bg,
            color: AR.muted,
            fontSize: 18,
            lineHeight: '28px',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function RiskChip({ children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 999,
      background: AR.bg,
      color: AR.muted,
      padding: '4px 7px',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1.2,
    }}>
      {children}
    </span>
  );
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${active ? AR.blue : AR.border}`,
        background: active ? '#EFF4FF' : '#fff',
        color: active ? AR.blue : AR.ink,
        borderRadius: 10,
        padding: '9px 10px',
        fontSize: 13,
        fontWeight: 800,
        fontFamily: AR.font,
      }}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, valueColor, border }) {
  return (
    <div style={{
      padding: '10px 8px', textAlign: 'center',
      borderLeft: border ? `1px solid ${AR.border}` : 'none',
    }}>
      <div style={{ fontSize: 11, color: AR.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: valueColor || AR.ink, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

function RiskRow({ severity, title, sub }) {
  const sev = AR.sev[severity];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 11,
        background: sev.soft, color: sev.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 3l11 18H1L12 3z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
          <path d="M12 10v5M12 17.5v.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: AR.ink }}>{title}</div>
        <div style={{ fontSize: 12, color: AR.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}
