import { List } from 'lucide-react';

export default function IncidentTable() {
  const incidents = [
    { id: 'INC-8492', location: 'Main St & 4th Ave', severity: 94, status: 'Critical', reports: 12, time: '2m ago' },
    { id: 'INC-8491', location: 'Oak Rd (Block 2)', severity: 88, status: 'Critical', reports: 8, time: '14m ago' },
    { id: 'INC-8488', location: 'Pine St & 5th Ave', severity: 65, status: 'Warning', reports: 4, time: '1h ago' },
    { id: 'INC-8475', location: 'Highway 9 South', severity: 42, status: 'Resolved', reports: 24, time: '4h ago' },
    { id: 'INC-8472', location: 'Elm Street', severity: 55, status: 'Warning', reports: 3, time: '5h ago' },
  ];

  return (
    <div className="glass-panel table-container">
      <div className="panel-header">
        <h2 className="panel-title"><List size={20} style={{ color: 'var(--accent-color)' }} /> Recent Clustered Incidents</h2>
      </div>
      <div className="panel-content" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Location</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reports Clustered</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{inc.id}</td>
                <td style={{ fontWeight: 500 }}>{inc.location}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ 
                        height: '100%', 
                        width: `${inc.severity}%`,
                        background: inc.status === 'Critical' ? 'var(--danger-color)' : inc.status === 'Warning' ? 'var(--warning-color)' : 'var(--success-color)'
                      }}></div>
                    </div>
                    <span>{inc.severity}/100</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${inc.status === 'Critical' ? 'badge-critical' : inc.status === 'Warning' ? 'badge-warning' : 'badge-resolved'}`}>
                    {inc.status}
                  </span>
                </td>
                <td>{inc.reports} logs</td>
                <td style={{ color: 'var(--text-secondary)' }}>{inc.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
