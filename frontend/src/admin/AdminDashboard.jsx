import { AD } from './tokens';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StatsRow, HeatMap, AIInsights, TypeDonut, TrendChart } from './Cards';
import { TopRegions, OrgStatus, PremiumCard, NotiCenter, RecentCases } from './Sections';

export function AdminDashboard() {
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
        <TopBar/>
        <div style={{
          padding: '0 clamp(16px, 2vw, 28px) 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <StatsRow/>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}>
            <div style={{ gridColumn: 'span 2', minWidth: 0 }}><HeatMap/></div>
            <div style={{ minWidth: 0 }}><AIInsights/></div>
            <div style={{ minWidth: 0 }}><TypeDonut/></div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(520px, 1.45fr) minmax(340px, 1fr) minmax(340px, 1fr)',
            gap: 14,
            alignItems: 'start',
          }}>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <TopRegions/>
              <RecentCases/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TrendChart/>
              <OrgStatus/>
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
