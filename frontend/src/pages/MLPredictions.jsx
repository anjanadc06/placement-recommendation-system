import { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

const confidenceColor = {
  High: { bg: 'rgba(67,233,123,0.1)', border: 'rgba(67,233,123,0.3)', color: '#43e97b' },
  Medium: { bg: 'rgba(249,199,79,0.1)', border: 'rgba(249,199,79,0.3)', color: '#f9c74f' },
  Low: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', color: '#ff6b6b' },
};

export default function MLPredictions() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [dashboard, setDashboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dashLoading, setDashLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    axios.get(`${API}/students/`).then(r => setStudents(r.data));
    axios.get(`${API}/ml/dashboard`)
      .then(r => setDashboard(r.data))
      .finally(() => setDashLoading(false));
  }, []);

  const analyze = async (studentId) => {
    setSelected(studentId);
    setLoading(true);
    setPrediction(null);
    setRecommendations(null);
    setActiveTab('predict');
    try {
      const [pred, rec] = await Promise.all([
        axios.get(`${API}/ml/predict/${studentId}`),
        axios.get(`${API}/ml/recommend/${studentId}`)
      ]);
      setPrediction(pred.data);
      setRecommendations(rec.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const prob = prediction?.placement_probability || 0;
  const conf = prediction?.confidence || 'Low';
  const colors = confidenceColor[conf];

  return (
    <div>
      <div className="page-header">
        <h1>ML Predictions</h1>
        <p>Random Forest placement prediction + Cosine Similarity job recommendations</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['dashboard', 'predict'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'dashboard' ? '▦ All Students' : '◉ Analyze Student'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--accent)' }}>Algorithm:</strong> Random Forest Classifier trained on 60 student records.
              Features: CGPA, 10th%, 12th%, Backlogs, Department.
              Click any student to get detailed analysis + job recommendations.
            </p>
          </div>

          {dashLoading ? <div className="loading">Running predictions...</div> : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Department</th>
                    <th>CGPA</th>
                    <th>Placement Probability</th>
                    <th>Confidence</th>
                    <th>Insight</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.map(s => {
                    const c = confidenceColor[s.confidence];
                    return (
                      <tr key={s.student_id}>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        <td><span className="badge badge-blue">{s.department}</span></td>
                        <td>{s.cgpa}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 99 }}>
                              <div style={{
                                height: '100%',
                                width: `${s.placement_probability}%`,
                                background: c.color,
                                borderRadius: 99
                              }} />
                            </div>
                            <span style={{ color: c.color, fontWeight: 600, minWidth: 40 }}>
                              {s.placement_probability}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            background: c.bg, border: `1px solid ${c.border}`,
                            color: c.color, padding: '3px 10px',
                            borderRadius: 99, fontSize: '0.75rem', fontWeight: 600
                          }}>
                            {s.confidence}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text2)', fontSize: '0.8rem', maxWidth: 200 }}>{s.message}</td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => analyze(s.student_id)}>
                            Analyze
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Predict Tab */}
      {activeTab === 'predict' && (
        <div>
          {/* Student selector */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Select Student to Analyze</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {students.map(s => (
                <button
                  key={s.student_id}
                  className={`btn ${selected === s.student_id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => analyze(s.student_id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="loading">Running ML analysis...</div>}

          {prediction && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

              {/* Placement prediction card */}
              <div className="card">
                <h3 style={{ marginBottom: 4, fontSize: '1rem' }}>Placement Prediction</h3>
                <p style={{ color: 'var(--text2)', fontSize: '0.8rem', marginBottom: 20 }}>
                  Random Forest Classifier · 100 trees · depth 6
                </p>

                {/* Big probability circle */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    border: `6px solid ${colors.color}`,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto', background: colors.bg
                  }}>
                    <div style={{ fontSize: '1.8rem', fontFamily: 'DM Serif Display', color: colors.color, fontWeight: 700 }}>
                      {prob}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: colors.color }}>chance</div>
                  </div>
                  <div style={{ marginTop: 12, fontWeight: 600, color: colors.color }}>{conf} Confidence</div>
                </div>

                <div style={{
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  borderRadius: 8, padding: '10px 14px',
                  fontSize: '0.85rem', color: colors.color, marginBottom: 16
                }}>
                  {prediction.message}
                </div>

                {/* Academics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['CGPA', prediction.academics?.cgpa],
                    ['10th %', prediction.academics?.tenth + '%'],
                    ['12th %', prediction.academics?.twelfth + '%'],
                    ['Backlogs', prediction.academics?.backlogs],
                  ].map(([label, val]) => (
                    <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 600 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature importance card */}
              <div className="card">
                <h3 style={{ marginBottom: 4, fontSize: '1rem' }}>Feature Importance</h3>
                <p style={{ color: 'var(--text2)', fontSize: '0.8rem', marginBottom: 20 }}>
                  How much each factor influences the prediction
                </p>
                {prediction.feature_importances && Object.entries(prediction.feature_importances)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, val]) => (
                    <div key={name} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.85rem' }}>{name}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>{val}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 99 }}>
                        <div style={{
                          height: '100%', width: `${val}%`,
                          background: 'var(--accent)', borderRadius: 99
                        }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Job recommendations */}
          {recommendations && !loading && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>Job Recommendations</h2>
                <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
                  Ranked by Cosine Similarity between student profile and job requirements
                </p>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Package</th>
                      <th>Match Score</th>
                      <th>Similarity</th>
                      <th>Eligible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.recommendations.map((job, i) => (
                      <tr key={job.job_id}>
                        <td>
                          <span style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: i === 0 ? 'var(--accent)' : i === 1 ? 'rgba(108,99,255,0.3)' : 'var(--surface2)',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8rem', fontWeight: 700
                          }}>
                            #{i + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{job.company_name}</td>
                        <td style={{ color: 'var(--text2)' }}>{job.role_name}</td>
                        <td style={{ color: 'var(--accent3)' }}>₹{job.package_lpa} LPA</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 5, background: 'var(--surface2)', borderRadius: 99 }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.min(job.match_score, 100)}%`,
                                background: job.eligible ? 'var(--accent3)' : 'var(--accent2)',
                                borderRadius: 99
                              }} />
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{job.match_score}%</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{job.similarity}%</td>
                        <td>
                          <span className={`badge ${job.eligible ? 'badge-green' : 'badge-red'}`}>
                            {job.eligible ? '✓ Yes' : '✗ No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!selected && !loading && (
            <div className="empty">Select a student above to run ML analysis</div>
          )}
        </div>
      )}
    </div>
  );
}
