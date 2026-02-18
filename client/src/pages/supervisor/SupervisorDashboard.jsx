import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI } from '../../services/api';
import { Users, FileText, Clock, CheckCircle, Eye, ArrowRight } from 'lucide-react';

export default function SupervisorDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await projectAPI.list();
            setProjects(res.data.projects);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    const statusCounts = projects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Hello, Dr. {user.last_name} 👋</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>You have {projects.length} assigned student{projects.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon blue"><Users size={22} /></div>
                    <h4>Total Students</h4>
                    <div className="stat-value">{projects.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon orange"><Clock size={22} /></div>
                    <h4>Pending</h4>
                    <div className="stat-value">{statusCounts.pending || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green"><FileText size={22} /></div>
                    <h4>In Progress</h4>
                    <div className="stat-value">{statusCounts.in_progress || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon blue"><CheckCircle size={22} /></div>
                    <h4>Completed</h4>
                    <div className="stat-value">{statusCounts.completed || 0}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Assigned Students</h3>
                </div>
                {projects.length === 0 ? (
                    <div className="empty-state"><Users size={48} /><h3>No Students Assigned</h3><p>Students will appear here once the admin assigns them to you.</p></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Matric No.</th>
                                    <th>Project Title</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 600 }}>{p.student_first} {p.student_last}</td>
                                        <td>{p.matric_number || '—'}</td>
                                        <td style={{ maxWidth: 250 }} className="truncate">{p.title || 'Untitled'}</td>
                                        <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                                        <td>
                                            <Link to={`/supervisor/review/${p.id}`} className="btn btn-primary btn-sm">
                                                <Eye size={14} /> Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
