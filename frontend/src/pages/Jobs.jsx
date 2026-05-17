import { useEffect, useState, useCallback } from 'react';
import { getJobs, getCompanies, createJob, updateJob, deleteJob } from '../api';
import Toast from '../components/Toast';

const EMPTY_FORM = { company_id: '', role_name: '', job_type: '', min_cgpa: '', min_10th: '', min_12th: '', openings: 1 };

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getJobs(), getCompanies()]).then(([j, c]) => {
      setJobs(j.data);
      setFiltered(j.data);
      setCompanies(c.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(jobs.filter(j =>
      j.role_name?.toLowerCase().includes(q) ||
      j.company_name?.toLowerCase().includes(q) ||
      j.job_type?.toLowerCase().includes(q)
    ));
  }, [search, jobs]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (j) => {
    setEditing(j.job_id);
    setForm({ company_id: j.company_id, role_name: j.role_name, job_type: j.job_type || '', min_cgpa: j.min_cgpa, min_10th: j.min_10th, min_12th: j.min_12th, openings: j.openings });
    setModal(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, company_id: parseInt(form.company_id), min_cgpa: parseFloat(form.min_cgpa), min_10th: parseFloat(form.min_10th), min_12th: parseFloat(form.min_12th), openings: parseInt(form.openings) };
      if (editing) await updateJob(editing, payload);
      else await createJob(payload);
      setToast({ message: editing ? 'Job updated!' : 'Job added!', type: 'success' });
      setModal(false);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.detail || 'Error occurred', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job role?')) return;
    try {
      await deleteJob(id);
      setToast({ message: 'Job deleted', type: 'success' });
      load();
    } catch (e) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Job Roles</h1>
        <p>View and manage job openings with eligibility criteria</p>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Search by role, company..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Job Role</button>
      </div>

      {loading ? <div className="loading">Loading jobs...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Company</th>
                <th>Type</th>
                <th>Package</th>
                <th>Min CGPA</th>
                <th>Min 10th</th>
                <th>Min 12th</th>
                <th>Openings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No jobs found</td></tr>
              ) : filtered.map(j => (
                <tr key={j.job_id}>
                  <td style={{ fontWeight: 500 }}>{j.role_name}</td>
                  <td>{j.company_name}</td>
                  <td><span className="badge badge-gray">{j.job_type || '—'}</span></td>
                  <td style={{ color: 'var(--accent3)' }}>₹{j.package_lpa} LPA</td>
                  <td><span className="badge badge-yellow">{j.min_cgpa}</span></td>
                  <td>{j.min_10th}%</td>
                  <td>{j.min_12th}%</td>
                  <td>{j.openings}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(j)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(j.job_id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editing ? 'Edit Job Role' : 'Add Job Role'}</h2>
            <div className="form-group">
              <label>Company</label>
              <select value={form.company_id} onChange={e => setForm({ ...form, company_id: e.target.value })}>
                <option value="">Select company...</option>
                {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.company_name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Role Name</label>
                <input value={form.role_name} onChange={e => setForm({ ...form, role_name: e.target.value })} placeholder="e.g. Software Engineer" />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}>
                  <option value="">Select...</option>
                  <option>Full-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Min CGPA</label>
                <input type="number" step="0.1" min="0" max="10" value={form.min_cgpa} onChange={e => setForm({ ...form, min_cgpa: e.target.value })} placeholder="e.g. 7.5" />
              </div>
              <div className="form-group">
                <label>Openings</label>
                <input type="number" min="1" value={form.openings} onChange={e => setForm({ ...form, openings: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Min 10th %</label>
                <input type="number" step="0.1" value={form.min_10th} onChange={e => setForm({ ...form, min_10th: e.target.value })} placeholder="e.g. 75" />
              </div>
              <div className="form-group">
                <label>Min 12th %</label>
                <input type="number" step="0.1" value={form.min_12th} onChange={e => setForm({ ...form, min_12th: e.target.value })} placeholder="e.g. 75" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add'} Job</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
