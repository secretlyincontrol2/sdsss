import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { UserPlus, ArrowRight, CheckCircle } from 'lucide-react';

export default function AllocationPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedSupervisor, setSelectedSupervisor] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        adminAPI.listUsers()
            .then(res => setUsers(res.data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const students = users.filter(u => u.role === 'student');
    const supervisors = users.filter(u => u.role === 'supervisor');

    const allocate = async () => {
        if (!selectedStudent || !selectedSupervisor) {
            setError('Select both a student and supervisor');
            return;
        }
        setError('');
        try {
            await adminAPI.allocate({ student_id: parseInt(selectedStudent), supervisor_id: parseInt(selectedSupervisor) });
            setSuccess('Supervisor allocated successfully!');
            setSelectedStudent('');
            setSelectedSupervisor('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Allocation failed');
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    return (
        <div>
            {success && <div className="alert alert-success"><CheckCircle size={16} /> {success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="card">
                <div className="card-header"><h3><UserPlus size={18} style={{ marginRight: 8 }} />Assign Supervisor to Student</h3></div>
                <div className="card-body">
                    <p style={{ marginBottom: 24, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Select a student and a supervisor to create or update the project supervision assignment.</p>

                    <div style={{ display: 'flex', alignItems: 'end', gap: 16, flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                            <label>Student</label>
                            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                                <option value="">Select a student...</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.matric_number || s.email})</option>
                                ))}
                            </select>
                        </div>

                        <ArrowRight size={24} style={{ color: 'var(--text-muted)', flexShrink: 0, marginBottom: 4 }} />

                        <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
                            <label>Supervisor</label>
                            <select value={selectedSupervisor} onChange={e => setSelectedSupervisor(e.target.value)}>
                                <option value="">Select a supervisor...</option>
                                {supervisors.map(s => (
                                    <option key={s.id} value={s.id}>Dr. {s.first_name} {s.last_name} ({s.department || 'N/A'})</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn btn-primary" onClick={allocate} style={{ flexShrink: 0 }}>
                            <UserPlus size={16} /> Allocate
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Allocations */}
            <div className="grid-2 mt-3" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header"><h3>Students ({students.length})</h3></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {students.map(s => (
                            <div key={s.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-light)' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{s.first_name} {s.last_name}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.matric_number || s.email} • {s.department || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h3>Supervisors ({supervisors.length})</h3></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {supervisors.map(s => (
                            <div key={s.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-light)' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dr. {s.first_name} {s.last_name}</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.staff_id || s.email} • {s.department || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
