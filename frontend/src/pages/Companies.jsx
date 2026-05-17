import { useEffect, useState, useCallback } from 'react';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../api';
import Toast from '../components/Toast';

const EMPTY_FORM = { company_name: '', location: '', industry: '', category: '', package_lpa: '' };

export default function Companies() {
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
    getCompanies().then(r => {
      setCompanies(r.data);
      setFiltered(r.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(companies.filter(c =>
      c.company_name?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    ));
  }, [search, companies]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (c) => {
    setEditing(c.company_id);
    setForm({ company_name: c.company_name, location: c.location || '', industry: c.industry || '', category: c.category, package_lpa: c.package_lpa });
    setModal(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, package_lpa: parseFloat(form.package_lpa) };
      if (editing) await updateCompany(editing, payload);
      else await createCompany(payload);
      setToast({ message: editing ? 'Company updated!' : 'Company added!', type: 'success' });
      setModal(false);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.detail || 'Error occurred', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company?')) return;
    try {
      await deleteCompany(id);
      setToast({ message: 'Company deleted', type: 'success' });
      load();
    } catch (e) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  const categoryBadge = (cat) => {
    if (cat === 'Product Based') return 'badge-green';
    if (cat === 'Service Based') return 'badge-blue';
    return 'badge-gray';
  };

  return (
    <div>
      <div className="page-header">
        <h1>Companies</h1>
        <p>Manage recruiting companies and their details</p>
      </div>

      <div className="search-bar">
        <input className="search-input" placeholder="Search by name, location, category..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Company</button>
      </div>

      {loading ? <div className="loading">Loading companies...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Location</th>
                <th>Industry</th>
                <th>Category</th>
                <th>Package (LPA)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No companies found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.company_id}>
                  <td style={{ fontWeight: 500 }}>{c.company_name}</td>
                  <td style={{ color: 'var(--text2)' }}>{c.location || '—'}</td>
                  <td style={{ color: 'var(--text2)' }}>{c.industry || '—'}</td>
                  <td><span className={`badge ${categoryBadge(c.category)}`}>{c.category}</span></td>
                  <td><span style={{ color: 'var(--accent3)', fontWeight: 600 }}>₹{c.package_lpa} LPA</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.company_id)}>Del</button>
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
            <h2>{editing ? 'Edit Company' : 'Add Company'}</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Google" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Industry</label>
                <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Technology" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select...</option>
                  <option>Product Based</option>
                  <option>Service Based</option>
                  <option>Core</option>
                  <option>Startup</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Package (LPA)</label>
              <input type="number" step="0.1" value={form.package_lpa} onChange={e => setForm({ ...form, package_lpa: e.target.value })} placeholder="e.g. 12.5" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add'} Company</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
