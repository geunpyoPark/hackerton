import { useEffect, useRef, useState } from 'react';
import { AR } from './design';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RouteScreen } from './screens/RouteScreen';
import { ReportScreen } from './screens/ReportScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminDashboard } from './admin/AdminDashboard';
import { DEMO_REPORTS, PLACES } from './data/accessibility';
import {
  ensureLocalProfile,
  fetchPlaces,
  fetchProfile,
  fetchReports,
  getKakaoProfileId,
  getLocalUserId,
  setLocalUserId,
  updateProfile,
  updateUserType,
} from './lib/accessibility';
import { exchangeKakaoCode, startKakaoLogin } from './lib/kakaoAuth';

const ROUTES = ['login', 'home', 'route', 'report', 'profile', 'admin'];

function getInitialScreen() {
  const route = window.location.pathname.split('/').filter(Boolean)[0] || 'login';
  return ROUTES.includes(route) ? route : 'login';
}

function getStoredKakaoUser() {
  try {
    return JSON.parse(localStorage.getItem('ableRouteKakaoUser') || 'null');
  } catch {
    return null;
  }
}

function getInitialUserId() {
  const kakaoProfileId = getKakaoProfileId(getStoredKakaoUser());
  return kakaoProfileId || getLocalUserId();
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('ableRouteLoggedIn') === 'true');
  const [screen, setScreen] = useState(getInitialScreen);
  const [userType, setUserTypeState] = useState(() => localStorage.getItem('ableRouteUserType') || 'wheelchair');
  const [routeQuery, setRouteQuery] = useState(() => ({
    from: localStorage.getItem('ableRouteRouteFrom') || '강남역',
    to: localStorage.getItem('ableRouteRouteTo') || '코엑스',
  }));
  const [userId, setUserId] = useState(getInitialUserId);
  const [profile, setProfile] = useState(null);
  const [places, setPlaces] = useState(PLACES);
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [dataStatus, setDataStatus] = useState('loading');
  const [loginError, setLoginError] = useState('');
  const [, setHistory] = useState([]);
  const kakaoLoginCalled = useRef(false); // ✅ 중복 호출 방지

  useEffect(() => {
    const onPopState = () => setScreen(getInitialScreen());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) return;
    if (kakaoLoginCalled.current) return; // ✅ 이미 호출됐으면 무시
    kakaoLoginCalled.current = true; // ✅ 호출 표시

    async function completeKakaoLogin() {
      try {
        const kakaoUser = await exchangeKakaoCode(code);

        localStorage.setItem('ableRouteLoggedIn', 'true');
        localStorage.setItem('ableRouteLoginMethod', 'kakao');
        localStorage.setItem('ableRouteKakaoUser', JSON.stringify(kakaoUser));
        const nextUserId = getKakaoProfileId(kakaoUser) || getLocalUserId();
        setLocalUserId(nextUserId);
        setUserId(nextUserId);
        const nextProfile = await ensureLocalProfile(userType, {
          userId: nextUserId,
          nickname: kakaoUser.name || 'able_user01',
        });

        setProfile({ ...nextProfile, picture: kakaoUser.picture });

        setLoggedIn(true);
        setScreen('home');
        setLoginError('');
        window.history.replaceState({}, '', '/home');
      } catch (error) {
        setLoggedIn(false);
        setScreen('login');
        setLoginError(error.message);
        window.history.replaceState({}, '', '/login');
      }
    }

    completeKakaoLogin();
  }, [userType]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      if (!loggedIn) {
        setDataStatus('ready');
        return;
      }

      setDataStatus('loading');
      const kakaoUser = getStoredKakaoUser();
      const [nextProfile, nextPlaces, nextReports] = await Promise.all([
        ensureLocalProfile(userType, {
          userId,
          nickname: kakaoUser?.name || 'able_user01',
        }),
        fetchPlaces(),
        fetchReports(),
      ]);

      if (cancelled) return;
      setProfile(nextProfile);
      setUserTypeState(nextProfile?.user_type || userType);
      setPlaces(nextPlaces);
      setReports(nextReports);
      setDataStatus('ready');
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, userId, userType]);

  async function refreshData(nextUserId = userId, nextUserType = userType) {
    const [nextProfile, nextPlaces, nextReports] = await Promise.all([
      fetchProfile(nextUserId, nextUserType),
      fetchPlaces(),
      fetchReports(),
    ]);
    setProfile(nextProfile);
    setPlaces(nextPlaces);
    setReports(nextReports);
    return { profile: nextProfile, places: nextPlaces, reports: nextReports };
  }

  function navigate(to) {
    if (!ROUTES.includes(to)) return;
    setHistory(h => [...h, screen]);
    setScreen(to);
    window.history.pushState({}, '', `/${to}`);
  }

  function goBack() {
    setHistory(h => {
      const prev = h[h.length - 1];
      if (prev) {
        setScreen(prev);
        window.history.pushState({}, '', `/${prev}`);
      }
      return h.slice(0, -1);
    });
  }

  async function setUserType(nextType) {
    setUserTypeState(nextType);
    localStorage.setItem('ableRouteUserType', nextType);
    const nextProfile = await updateUserType(nextType, userId);
    setProfile(nextProfile);
  }

  async function handleProfileUpdate(profileInput) {
    const nextProfile = await updateProfile(userId, {
      ...profileInput,
      user_type: userType,
    });
    setProfile(nextProfile);

    const kakaoUser = getStoredKakaoUser();
    if (kakaoUser) {
      localStorage.setItem('ableRouteKakaoUser', JSON.stringify({
        ...kakaoUser,
        name: nextProfile.nickname,
        picture: nextProfile.picture,
      }));
    }

    return nextProfile;
  }

  function handleLogin(method = 'demo') {
    if (method === 'kakao') {
      try {
        setLoginError('');
        startKakaoLogin();
      } catch (error) {
        setLoginError(error.message);
      }
      return;
    }

    if (method === 'admin') {
      localStorage.setItem('ableRouteAdminLoggedIn', 'true');
      setLoginError('');
      setScreen('admin');
      window.history.pushState({}, '', '/admin');
      return;
    }

    localStorage.setItem('ableRouteLoggedIn', 'true');
    localStorage.setItem('ableRouteLoginMethod', method);
    const nextUserId = getLocalUserId();
    setUserId(nextUserId);
    setLoggedIn(true);
    navigate('home');
  }

  function handleLogout() {
    localStorage.removeItem('ableRouteLoggedIn');
    localStorage.removeItem('ableRouteLoginMethod');
    localStorage.removeItem('ableRouteKakaoUser'); // ✅ 추가
    localStorage.removeItem('ableRouteAdminLoggedIn');
    setLoggedIn(false);
    setProfile(null); // ✅ 추가
    navigate('login');
  }

  function handleRouteSearch(nextRoute) {
    const from = nextRoute.from.trim() || '강남역';
    const to = nextRoute.to.trim() || '코엑스';
    localStorage.setItem('ableRouteRouteFrom', from);
    localStorage.setItem('ableRouteRouteTo', to);
    setRouteQuery({ from, to });
    navigate('route');
  }

  // Admin dashboard rendered full-screen outside the phone shell
  if (screen === 'admin') {
    return <AdminDashboard/>;
  }

  const screenEl = !loggedIn || screen === 'login'
    ? <LoginScreen onLogin={handleLogin} loginError={loginError}/>
    : (() => {
        switch (screen) {
          case 'home':    return <HomeScreen    onNavigate={navigate} userType={userType} onUserTypeChange={setUserType} places={places} reports={reports} dataStatus={dataStatus} routeQuery={routeQuery} onRouteSearch={handleRouteSearch}/>;
          case 'route':   return <RouteScreen   onNavigate={navigate} onBack={goBack} userType={userType} places={places} reports={reports} routeQuery={routeQuery}/>;
          case 'report':  return <ReportScreen  onNavigate={navigate} userType={userType} userId={userId} places={places} reports={reports} onDataChange={refreshData}/>;
          case 'profile': return <ProfileScreen onNavigate={navigate} userType={userType} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} profile={profile} reports={reports} userId={userId}/>;
          default:        return <HomeScreen    onNavigate={navigate} userType={userType} onUserTypeChange={setUserType} places={places} reports={reports} dataStatus={dataStatus} routeQuery={routeQuery} onRouteSearch={handleRouteSearch}/>;
        }
      })();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '100%', height: '100dvh',
      background: '#f0eee9',
    }}>
      <div style={{
        width: 390,
        height: 844,
        maxWidth: '100vw',
        maxHeight: '100dvh',
        background: '#fff',
        borderRadius: 'clamp(0px, 44px, 44px)',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: AR.font,
      }}>
        {/* iOS status bar */}
        <div style={{
          height: 44,
          background: !loggedIn ? '#EFF4FF' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px 0 20px',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: AR.ink }}>9:41</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
              <rect x="0" y="4" width="3" height="8" rx="1" fill={AR.ink}/>
              <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={AR.ink}/>
              <rect x="9" y="1" width="3" height="11" rx="1" fill={AR.ink}/>
              <rect x="13.5" y="0" width="3" height="12" rx="1" fill={AR.ink} fillOpacity="0.3"/>
            </svg>
            <svg width="16" height="12" viewBox="0 0 20 14" fill="none">
              <path d="M1 5C4 2 7.5 0.5 10 0.5S16 2 19 5" stroke={AR.ink} strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M3.5 8C5.5 6 7.5 5 10 5S14.5 6 16.5 8" stroke={AR.ink} strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="10" cy="12" r="1.5" fill={AR.ink}/>
            </svg>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
              <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke={AR.ink} strokeOpacity="0.35"/>
              <rect x="2" y="2" width="17" height="8" rx="2" fill={AR.ink}/>
              <path d="M24 4v4a2 2 0 0 0 0-4z" fill={AR.ink} fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {screenEl}
        </div>
      </div>
    </div>
  );
}
