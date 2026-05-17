import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/auth/login', {
        email: form.email,
        password: form.password,
      });
      const user = res.data.user;

      // Check role matches selection
      if (user.role !== form.role) {
        setError(`This account is registered as a ${user.role}, not ${form.role}`);
        setLoading(false);
        return;
      }

      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>P</div>
          <div>
            <div style={styles.logoTitle}>Placement System</div>
            <div style={styles.logoSub}>SRM Institute</div>
          </div>
        </div>

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subheading}>Sign in to your account to continue</p>

        {/* Role Toggle */}
        <div style={styles.roleToggle}>
          {['student', 'admin'].map(role => (
            <button
              key={role}
              style={{ ...styles.roleBtn, ...(form.role === role ? styles.roleBtnActive : {}) }}
              onClick={() => setForm({ ...form, role })}
            >
              {role === 'student' ? '◉ Student' : '▦ Admin'}
            </button>
          ))}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@srmist.edu.in"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {form.role === 'student' && (
          <p style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Register here</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f0f13',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: '#1a1a22',
    border: '1px solid #2e2e3e',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 420,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: '#6c63ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif',
    fontSize: '1.2rem',
  },
  logoTitle: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '1rem',
    color: '#e8e8f0',
  },
  logoSub: {
    fontSize: '0.7rem',
    color: '#55556a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heading: {
    fontFamily: 'DM Serif Display, serif',
    fontSize: '1.6rem',
    color: '#e8e8f0',
    marginBottom: 6,
  },
  subheading: {
    color: '#9090a8',
    fontSize: '0.875rem',
    marginBottom: 24,
  },
  roleToggle: {
    display: 'flex',
    background: '#22222e',
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  roleBtn: {
    flex: 1,
    padding: '8px 0',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    color: '#9090a8',
    fontSize: '0.875rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  roleBtnActive: {
    background: '#6c63ff',
    color: '#fff',
  },
  formGroup: { marginBottom: 16 },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#9090a8',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#22222e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    color: '#e8e8f0',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    background: 'rgba(255,107,107,0.1)',
    border: '1px solid rgba(255,107,107,0.3)',
    color: '#ff6b6b',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: '0.85rem',
    marginBottom: 16,
  },
  btn: {
    width: '100%',
    padding: '11px',
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: '0.95rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '0.85rem',
    color: '#9090a8',
  },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 600 },
};
