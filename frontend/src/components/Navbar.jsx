import { NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: '▦' },
    { to: '/students', label: 'Students', icon: '◉' },
    { to: '/companies', label: 'Companies', icon: '⬡' },
    { to: '/jobs', label: 'Job Roles', icon: '◈' },
    { to: '/applications', label: 'Applications', icon: '◎' },
    { to: '/recommendations', label: 'Recommendations', icon: '✦' },
    { to: '/ml', label: 'ML Predictions', icon: '⬢' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Placement<br />System</h2>
        <span>SRM Institute</span>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid #2e2e3e', padding: '16px 20px', marginTop: 'auto' }}>
        <div style={{ fontSize: '0.8rem', color: '#9090a8', marginBottom: 4 }}>Logged in as</div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e8e8f0', marginBottom: 6 }}>
          {user.username || 'User'}
        </div>
        <div style={{ marginBottom: 12 }}>
          <span style={{
            background: user.role === 'admin' ? 'rgba(108,99,255,0.15)' : 'rgba(67,233,123,0.1)',
            color: user.role === 'admin' ? '#6c63ff' : '#43e97b',
            padding: '2px 8px', borderRadius: 99,
            fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
          }}>
            {user.role || 'student'}
          </span>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px 0',
          background: 'rgba(255,107,107,0.1)',
          border: '1px solid rgba(255,107,107,0.2)',
          borderRadius: 8, color: '#ff6b6b',
          fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
          cursor: 'pointer', fontWeight: 500,
        }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
