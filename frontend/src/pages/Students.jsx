import { useEffect, useState, useCallback } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api';
import Toast from '../components/Toast';

const EMPTY_FORM = { roll_no: '', name: '', department: '', email: '', dob: '' };
const DEPTS = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getStudents().then(r => {
      setStudents(r.data);
      setFiltered(r.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.roll_no?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    ));
  }, [search, students]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (s) => {
    setEditing(s.student_id);
    setForm({ roll_no: s.roll_no, name: s.name, department: s.department, email: s.email, dob: s.dob || '' });
    setModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) await updateStudent(editing, form);
      else await createStudent(form);
      setToast({ message: editing ? 'Student updated!' : 'Student added!', type: 'success' });
      setModal(false);
      load();
    } catch (e) {
      setToast({ message: e.response?.data?.detail || 'Error occurred', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      await deleteStudent(id);
      setToast({ message: 'Student deleted', type: 'success' });
      load();
    } catch (e) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <p>Manage student profiles and academic records</p>
      </div>

      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Search by name, roll no, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={openAdd}>+ Add Student</button>
      </div>

      {loading ? <div className="loading">Loading students...</div> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>CGPA</th>
                <th>10th %</th>
                <th>12th %</th>
                <th>Backlogs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.student_id}>
                  <td><span className="mono">{s.roll_no}</span></td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-blue">{s.department}</span></td>
                  <td style={{ color: 'var(--text2)' }}>{s.email}</td>
                  <td>
                    <span className={`badge ${s.cgpa >= 8 ? 'badge-green' : s.cgpa >= 7 ? 'badge-yellow' : 'badge-red'}`}>
                      {s.cgpa ?? '—'}
                    </span>
                  </td>
                  <td>{s.tenth_percentage ?? '—'}%</td>
                  <td>{s.twelfth_percentage ?? '—'}%</td>
                  <td>
                    <span className={`badge ${s.backlogs === 0 ? 'badge-green' : 'badge-red'}`}>
                      {s.backlogs ?? 0}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.student_id)}>Del</button>
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
            <h2>{editing ? 'Edit Student' : 'Add Student'}</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Roll Number</label>
                <input value={form.roll_no} onChange={e => setForm({ ...form, roll_no: e.target.value })} placeholder="RA2411003011XXX" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Student Name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select...</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@srmist.edu.in" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>{editing ? 'Update' : 'Add'} Student</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
