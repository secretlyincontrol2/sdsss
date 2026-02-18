import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, milestoneAPI, notificationAPI, calendarAPI } from '../../services/api';
import { FileText, Upload, CheckSquare, Clock, AlertCircle, ArrowRight, Bell } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load independent data in parallel without blocking each other
        loadProjects();
        loadNotifications();
        loadEvents();
    }, []);

    const loadProjects = async () => {
        try {
            const res = await projectAPI.list();
            if (res.data.projects.length > 0) {
                const proj = res.data.projects[0];
                setProject(proj);
                // Fetch milestones after project is loaded
                loadMilestones(proj.id);
            }
        } catch (e) {
            console.error("Failed to load projects", e);
        } finally {
            setLoading(false); // Stop main loading spinner once project (main view) is attempted
        }
    };

    const loadMilestones = async (projectId) => {
        try {
            const res = await milestoneAPI.getByProject(projectId);
            setMilestones(res.data.milestones);
        } catch (e) { console.error(e); }
    };

    const loadNotifications = async () => {
        try {
            const res = await notificationAPI.list();
            setNotifications(res.data.notifications.slice(0, 5));
        } catch (e) { console.error(e); }
    };

    const loadEvents = async () => {
        try {
            const res = await calendarAPI.list();
            setEvents(res.data.events);
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    const pendingMilestones = milestones.filter(m => m.status === 'pending' || m.status === 'in_progress');
    const completedMilestones = milestones.filter(m => m.status === 'completed');
    const progress = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : 0;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome back, {user.first_name}</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Here's your project overview</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon blue"><FileText size={22} /></div>
                    <h4>Project Status</h4>
                    <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                        <span className={`badge badge-${project?.status || 'pending'}`}>{project?.status || 'No Project'}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green"><CheckSquare size={22} /></div>
                    <h4>Progress</h4>
                    <div className="stat-value">{progress}%</div>
                    <div className="progress-bar mt-1"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon orange"><Clock size={22} /></div>
                    <h4>Pending Tasks</h4>
                    <div className="stat-value">{pendingMilestones.length}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon red"><Bell size={22} /></div>
                    <h4>Notifications</h4>
                    <div className="stat-value">{notifications.filter(n => !n.is_read).length}</div>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Project Info */}
                <div className="card">
                    <div className="card-header">
                        <h3>My Project</h3>
                    </div>
                    <div className="card-body">
                        {project ? (
                            <>
                                <h4 style={{ fontWeight: 600, marginBottom: 8 }}>{project.title}</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{project.description || 'No description'}</p>
                                {project.supervisor_first && (
                                    <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>
                                        Supervisor: <strong>{project.supervisor_first} {project.supervisor_last}</strong>
                                    </p>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <Link to="/student/proposal" className="btn btn-primary btn-sm">
                                        <FileText size={14} /> Proposal
                                    </Link>
                                    <Link to="/student/documents" className="btn btn-secondary btn-sm">
                                        <Upload size={14} /> Documents
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <AlertCircle size={40} />
                                <h3>No Project Yet</h3>
                                <p>Create a project and submit your proposal to get started.</p>
                                <Link to="/student/proposal" className="btn btn-primary btn-sm">Get Started <ArrowRight size={14} /></Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Milestones */}
                <div className="card">
                    <div className="card-header">
                        <h3>Upcoming Tasks</h3>
                        <Link to="/student/milestones" style={{ fontSize: '0.813rem' }}>View All</Link>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {pendingMilestones.length === 0 ? (
                            <div className="empty-state" style={{ padding: 32 }}>
                                <p>No pending tasks</p>
                            </div>
                        ) : (
                            pendingMilestones.slice(0, 4).map(m => (
                                <div key={m.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m.title}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {new Date(m.due_date).toLocaleDateString()}</span>
                                    </div>
                                    <span className={`badge badge-${m.status}`}>{m.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="card mt-3">
                <div className="card-header">
                    <h3>Recent Notifications</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {notifications.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}><p>No notifications yet</p></div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, alignItems: 'start', opacity: n.is_read ? 0.6 : 1 }}>
                                <Bell size={16} style={{ marginTop: 2, color: 'var(--accent)', flexShrink: 0 }} />
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{n.title}</h4>
                                    <p style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                                    <span style={{ fontSize: '0.688rem', color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
