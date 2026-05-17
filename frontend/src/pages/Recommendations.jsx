import { useEffect, useState, useCallback } from 'react';
import { getRecommendations, getStudents, getEligibleJobs } from '../api';

const PRIORITY_COLORS = { High: 'badge-green', Medium: 'badge-yellow', Low: 'badge-gray' };

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [students, setStudents] = useState([]);
  const [eligible, setEligible] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [eligibleLoading, setEligibleLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getRecommendations(), getStudents()]).then(([r, s]) => {
      setRecs(r.data);
      setStudents(s.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadEligible = (studentId) => {
    setSelectedStudent(studentId);
    if (!studentId) { setEligible([]); return; }
    setEligibleLoading(true);
    getEligibleJobs(studentId).then(r => setEligible(r.data)).finally(() => setEligibleLoading(false));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Recommendations</h1>
        <p>System-generated job recommendations and eligibility checker</p>
      </div>

      {/* Eligibility Checker */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Eligible Jobs Finder</h3>
        <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 16 }}>
          Select a student to see all job roles they qualify for based on CGPA and academic criteria.
        </p>
        <select
          value={selectedStudent}
          onChange={e => loadEligible(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.875rem', marginBottom: 16, width: 300 }}
        >
          <option value="">Select a student...</option>
          {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} — {s.department}</option>)}
        </select>

        {eligibleLoading && <div style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>Checking eligibility...</div>}

        {!eligibleLoading && selectedStudent && (
          eligible.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>No eligible jobs found for this student's academic profile.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {eligible.map(j => (
                <div key={j.job_id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{j.role_name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: 10 }}>{j.company_name} · {j.location}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-green">₹{j.package_lpa} LPA</span>
                    <span className="badge badge-blue">{j.category}</span>
                    <span className="badge badge-gray">Min {j.min_cgpa} CGPA</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Recommendations Table */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.3rem' }}>All Recommendations</h2>
      </div>

      {loading ? <div className="loading">Loading recommendations...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Priority</th>
                <th>App Status</th>
                <th>Suggestion</th>
                <th>Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recs.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No recommendations yet</td></tr>
              ) : recs.map(r => (
                <tr key={r.rec_id}>
                  <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                  <td>{r.company_name}</td>
                  <td style={{ color: 'var(--text2)' }}>{r.role_name}</td>
                  <td style={{ color: 'var(--accent3)' }}>₹{r.package_lpa} LPA</td>
                  <td><span className={`badge ${PRIORITY_COLORS[r.priority] || 'badge-gray'}`}>{r.priority}</span></td>
                  <td><span className="badge badge-blue">{r.status}</span></td>
                  <td style={{ maxWidth: 200, color: 'var(--text2)', fontSize: '0.8rem' }}>{r.suggestion}</td>
                  <td><span className="badge badge-gray">{r.rec_type}</span></td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{r.rec_date?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
