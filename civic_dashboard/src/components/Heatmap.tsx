import { Map as MapIcon, Maximize2 } from 'lucide-react';

export default function Heatmap() {
  return (
    <div className="glass-panel map-container">
      <div className="panel-header">
        <h2 className="panel-title"><MapIcon size={20} style={{ color: 'var(--accent-color)' }} /> Live Incident Heatmap</h2>
        <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
          <Maximize2 size={16} />
        </button>
      </div>
      
      <div className="panel-content" style={{ padding: 0, position: 'relative' }}>
        <div className="map-bg">
          {/* Mock Heatmap Points */}
          <div className="heatmap-point" style={{ top: '30%', left: '40%', transform: 'scale(1.5)' }}>
             <div className="live-indicator" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
          </div>
          <div className="heatmap-point" style={{ top: '45%', left: '60%', transform: 'scale(2.5)' }}></div>
          <div className="heatmap-point warning" style={{ top: '20%', left: '70%', transform: 'scale(1.2)' }}></div>
          <div className="heatmap-point warning" style={{ top: '70%', left: '30%', transform: 'scale(2)' }}></div>
          <div className="heatmap-point" style={{ top: '60%', left: '80%', transform: 'scale(1.8)' }}></div>
        </div>
      </div>
    </div>
  );
}
