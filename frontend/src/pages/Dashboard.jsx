import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const placementRate = stats
    ? ((stats.placed / (stats.students || 1)) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of the Placement Recommendation System</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{stats?.students ?? '—'}</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-label">Companies</div>
          <div className="stat-value">{stats?.companies ?? '—'}</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-label">Job Roles</div>
          <div className="stat-value">{stats?.jobs ?? '—'}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-label">Applications</div>
          <div className="stat-value">{stats?.applications ?? '—'}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Placed Students</div>
          <div className="stat-value">{stats?.placed ?? '—'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Placement Rate</h3>
          <div style={{ fontSize: '3rem', fontFamily: 'DM Serif Display, serif', color: 'var(--accent3)' }}>
            {placementRate}%
          </div>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: 8 }}>
            {stats?.placed} out of {stats?.students} students placed
          </p>
          <div style={{ marginTop: 16, height: 8, background: 'var(--surface2)', borderRadius: 99 }}>
            <div style={{
              height: '100%',
              width: `${placementRate}%`,
              background: 'linear-gradient(90deg, var(--accent), var(--accent3))',
              borderRadius: 99,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>Top Companies by Applications</h3>
          {stats?.top_companies?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.top_companies.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text)', fontSize: '0.875rem' }}>{c.company_name}</span>
                  <span className="badge badge-blue">{c.applicants} applicants</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>No application data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
