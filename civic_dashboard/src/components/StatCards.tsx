import { AlertTriangle, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function StatCards() {
  return (
    <div className="stat-cards">
      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-color)' }}>
          <AlertTriangle size={24} />
        </div>
        <div className="stat-value">142</div>
        <div className="stat-label">Critical Potholes</div>
      </div>
      
      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-color)' }}>
          <MapPin size={24} />
        </div>
        <div className="stat-value">8,439</div>
        <div className="stat-label">Total Clusters Logged</div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-color)' }}>
          <CheckCircle size={24} />
        </div>
        <div className="stat-value">28</div>
        <div className="stat-label">Repairs Ordered Today</div>
      </div>

      <div className="glass-panel stat-card">
        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-color)' }}>
          <Clock size={24} />
        </div>
        <div className="stat-value">4.2h</div>
        <div className="stat-label">Avg Agent Response</div>
      </div>
    </div>
  );
}
