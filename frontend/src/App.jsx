import { useState } from 'react';
import { AR } from './design';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RouteScreen } from './screens/RouteScreen';
import { ReportScreen } from './screens/ReportScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState('home');
  const [history, setHistory] = useState([]);

  function navigate(to) {
    setHistory(h => [...h, screen]);
    setScreen(to);
  }

  function goBack() {
    setHistory(h => {
      const prev = h[h.length - 1];
      if (prev) setScreen(prev);
      return h.slice(0, -1);
    });
  }

  const screenEl = !loggedIn
    ? <LoginScreen onLogin={() => setLoggedIn(true)}/>
    : (() => {
        switch (screen) {
          case 'home':    return <HomeScreen    onNavigate={navigate}/>;
          case 'route':   return <RouteScreen   onNavigate={navigate} onBack={goBack}/>;
          case 'report':  return <ReportScreen  onNavigate={navigate}/>;
          case 'profile': return <ProfileScreen onNavigate={navigate}/>;
          default:        return <HomeScreen    onNavigate={navigate}/>;
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
