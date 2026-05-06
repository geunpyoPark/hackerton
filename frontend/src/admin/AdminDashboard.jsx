import { useEffect, useMemo, useState } from 'react';
import { AD } from './tokens';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StatsRow, HeatMap, AIInsights, TypeDonut, TrendChart } from './Cards';
import { TopRegions, OrgStatus, PremiumCard, NotiCenter, RecentCases } from './Sections';
import { fetchPlaces, fetchReports } from '../lib/accessibility';
import { PLACES, DEMO_REPORTS } from '../data/accessibility';
import { buildAdminAnalytics } from './data';

export function AdminDashboard() {
  const [places, setPlaces] = useState(PLACES);
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [dataStatus, setDataStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      setDataStatus('loading');
      const [nextPlaces, nextReports] = await Promise.all([
        fetchPlaces(),
        fetchReports(),
      ]);

      if (cancelled) return;
      setPlaces(nextPlaces);
      setReports(nextReports);
      setDataStatus('ready');
    }

    loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  const analytics = useMemo(() => buildAdminAnalytics(reports, places), [reports, places]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: AD.bg,
      display: 'flex',
      fontFamily: AD.font,
      color: AD.ink,
      overflow: 'hidden',
    }}>
      <Sidebar/>
      <main style={{
        flex: 1,
        minWidth: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}>
        <TopBar dataStatus={dataStatus}/>
        <div style={{
          padding: '0 clamp(16px, 2vw, 28px) 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <StatsRow stats={analytics.stats}/>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}>
            <div style={{ gridColumn: 'span 2', minWidth: 0 }}><HeatMap points={analytics.heatPoints}/></div>
            <div style={{ minWidth: 0 }}><AIInsights insights={analytics.insights}/></div>
            <div style={{ minWidth: 0 }}><TypeDonut data={analytics.typeDistribution} total={analytics.stats.total}/></div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(520px, 1.45fr) minmax(340px, 1fr) minmax(340px, 1fr)',
            gap: 14,
            alignItems: 'start',
          }}>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TopRegions rows={analytics.topRegions}/>
              <RecentCases rows={analytics.recentCases}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TrendChart data={analytics.trend}/>
              <OrgStatus rows={analytics.orgRows}/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <PremiumCard/>
              <NotiCenter/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
