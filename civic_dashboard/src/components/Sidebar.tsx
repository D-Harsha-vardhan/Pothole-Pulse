import { LayoutDashboard, Map, FileText, Settings, ShieldAlert, Activity } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="flex items-center gap-2" style={{ marginBottom: '3rem' }}>
        <div className="stat-icon" style={{ background: 'var(--accent-color)', color: 'white', marginBottom: 0 }}>
          <ShieldAlert size={24} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>CivicSight</h1>
      </div>

      <nav className="flex-col gap-2">
        <a href="#" className="btn w-full" style={{ justifyContent: 'flex-start' }}>
          <LayoutDashboard size={18} /> Dashboard
        </a>
        <a href="#" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}>
          <Map size={18} /> Live Map
        </a>
        <a href="#" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}>
          <FileText size={18} /> Repair Orders
        </a>
        <a href="#" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}>
          <Activity size={18} /> Sensor Logs
        </a>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <a href="#" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}>
          <Settings size={18} /> Settings
        </a>
      </div>
    </aside>
  );
}
