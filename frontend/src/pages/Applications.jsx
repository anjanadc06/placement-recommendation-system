import { useEffect, useState, useCallback } from 'react';
import { getApplications, getStudents, getJobs, createApplication, updateApplicationStatus, deleteApplication } from '../api';
import Toast from '../components/Toast';

const STATUS_COLORS = {
  Pending: 'badge-yellow',
  Applied: 'badge-blue',
  Shortlisted: 'badge-blue',
  Selected: 'badge-green',
  Rejected: 'badge-red',
  'Under Review': 'badge-gray',
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [statusModal, setStatusModal] = useState(null);
  const [form, setForm] = useState({ student_id: '', job_id: '', resume_link: '' });
  const [statusForm, setStatusForm] = useState({ status: '', result: '', round_no: '' });
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getApplications(), getStudents(), getJobs()]).then(([a, s, j]) => {
      setApps(a.data); setFiltered(a.data);
      setStudents(s.data); setJobs(j.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(apps.filter(a =>
      a.student_name?.toLowerCase().includes(q) ||
      a.company_name?.toLowerCase().includes(q) ||
      a.role_name?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    ));
  }, [search, apps]);

  const handleAdd = async () => {
    try {
      await createApplication({ ...form, student_id: parseInt(form.student_id), job_id: parseInt(form.job_id) });
      setToast({ message: 'Application submitted!', type: 'success' });
      setAddModal(false);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.detail || 'Error — check eligibility criteria', type: 'error' });
    }
  };

  const openStatus = (app) => {
    setStatusModal(app.application_id);
    setStatusForm({ status: app.status, result: app.result || '', round_no: app.round_no || '' });
  };

  const handleStatusUpdate = async () => {
    try {
      await updateApplicationStatus(statusModal, { ...statusForm, round_no: statusForm.round_no ? parseInt(statusForm.round_no) : null });
      setToast({ message: 'Status updated!', type: 'success' });
      setStatusModal(null);
      load();
    } catch (e) {
      setToast({ message: 'Update failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await deleteApplication(id);
      setToast({ message: 'Application deleted', type: 'success' });
      load();
    } catch (e) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Applications</h1>
        <p>Track and manage all student job applications</p>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Search by student, company, role, status..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setForm({ student_id: '', job_id: '', resume_link: '' }); setAddModal(true); }}>+ New Application</button>
      </div>

      {loading ? <div className="loading">Loading applications...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Status</th>
                <th>Result</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No applications found</td></tr>
              ) : filtered.map(a => (
                <tr key={a.application_id}>
                  <td style={{ fontWeight: 500 }}>{a.student_name}</td>
                  <td><span className="badge badge-blue">{a.department}</span></td>
                  <td>{a.company_name}</td>
                  <td style={{ color: 'var(--text2)' }}>{a.role_name}</td>
                  <td style={{ color: 'var(--accent3)' }}>₹{a.package_lpa} LPA</td>
                  <td><span className={`badge ${STATUS_COLORS[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                  <td>{a.result ? <span className={`badge ${a.result === 'Pass' ? 'badge-green' : 'badge-red'}`}>{a.result}</span> : '—'}</td>
                  <td style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>{a.apply_date?.slice(0, 10) || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openStatus(a)}>Status</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.application_id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addModal && (
        <div className="modal-backdrop" onClick={() => setAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Application</h2>
            <div className="form-group">
              <label>Student</label>
              <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Select student...</option>
                {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name} ({s.roll_no})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Job Role</label>
              <select value={form.job_id} onChange={e => setForm({ ...form, job_id: e.target.value })}>
                <option value="">Select job...</option>
                {jobs.map(j => <option key={j.job_id} value={j.job_id}>{j.company_name} — {j.role_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Resume Link</label>
              <input value={form.resume_link} onChange={e => setForm({ ...form, resume_link: e.target.value })} placeholder="e.g. resume_v2.pdf" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 8 }}>
              ⚠ Application will be rejected if student doesn't meet eligibility criteria.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Submit Application</button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div className="modal-backdrop" onClick={() => setStatusModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Update Status</h2>
            <div className="form-group">
              <label>Status</label>
              <select value={statusForm.status} onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}>
                {['Pending', 'Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Result</label>
                <select value={statusForm.result} onChange={e => setStatusForm({ ...statusForm, result: e.target.value })}>
                  <option value="">—</option>
                  <option>Pass</option>
                  <option>Fail</option>
                </select>
              </div>
              <div className="form-group">
                <label>Round No.</label>
                <input type="number" min="1" value={statusForm.round_no} onChange={e => setStatusForm({ ...statusForm, round_no: e.target.value })} placeholder="e.g. 2" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setStatusModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
