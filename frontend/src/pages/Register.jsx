import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', student_id: '' });
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/auth/students-list')
      .then(r => setStudents(r.data))
      .catch(() => {});
  }, []);

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8000/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        role: 'student',
        student_id: form.student_id ? parseInt(form.student_id) : null,
      });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed');
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

        <h2 style={styles.heading}>Create account</h2>
        <p style={styles.subheading}>Register as a student to track your applications</p>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              placeholder="e.g. aarav123"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@srmist.edu.in"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Link to Student Profile (optional)</label>
          <select
            style={styles.input}
            value={form.student_id}
            onChange={e => setForm({ ...form, student_id: e.target.value })}
          >
            <option value="">Select your name from the database...</option>
            {students.map(s => (
              <option key={s.student_id} value={s.student_id}>
                {s.name} — {s.roll_no} ({s.department})
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <button style={styles.btn} onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
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
    maxWidth: 520,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: '#6c63ff', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'DM Serif Display, serif', fontSize: '1.2rem',
  },
  logoTitle: { fontFamily: 'DM Serif Display, serif', fontSize: '1rem', color: '#e8e8f0' },
  logoSub: { fontSize: '0.7rem', color: '#55556a', textTransform: 'uppercase', letterSpacing: 1 },
  heading: { fontFamily: 'DM Serif Display, serif', fontSize: '1.6rem', color: '#e8e8f0', marginBottom: 6 },
  subheading: { color: '#9090a8', fontSize: '0.875rem', marginBottom: 24 },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  formGroup: { marginBottom: 16 },
  label: { display: 'block', fontSize: '0.8rem', color: '#9090a8', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 14px',
    background: '#22222e', border: '1px solid #2e2e3e',
    borderRadius: 10, color: '#e8e8f0',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box',
  },
  error: {
    background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
    color: '#ff6b6b', borderRadius: 8, padding: '10px 14px',
    fontSize: '0.85rem', marginBottom: 16,
  },
  successBox: {
    background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)',
    color: '#43e97b', borderRadius: 8, padding: '10px 14px',
    fontSize: '0.85rem', marginBottom: 16,
  },
  btn: {
    width: '100%', padding: 11, background: '#6c63ff',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: '0.95rem', fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  footer: { textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#9090a8' },
  link: { color: '#6c63ff', textDecoration: 'none', fontWeight: 600 },
};
