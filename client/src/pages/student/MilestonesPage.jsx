import { useState, useEffect } from 'react';
import { projectAPI, milestoneAPI } from '../../services/api';
import { CheckSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MilestonesPage() {
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await projectAPI.list();
            if (res.data.projects.length > 0) {
                const proj = res.data.projects[0];
                setProject(proj);
                const msRes = await milestoneAPI.getByProject(proj.id);
                setMilestones(msRes.data.milestones);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await milestoneAPI.update(id, { status });
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    if (!project) return (
        <div className="card"><div className="empty-state"><h3>No Project</h3><p>Create a project first.</p></div></div>
    );

    const statusConfig = {
        pending: { icon: <Clock size={16} />, color: 'var(--warning)' },
        in_progress: { icon: <CheckSquare size={16} />, color: 'var(--accent)' },
        completed: { icon: <CheckCircle size={16} />, color: 'var(--success)' },
        overdue: { icon: <AlertTriangle size={16} />, color: 'var(--danger)' },
    };

    const completed = milestones.filter(m => m.status === 'completed').length;
    const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

    return (
        <div>
            <div className="card mb-3">
                <div className="card-body">
                    <div className="flex-between">
                        <div>
                            <h3 style={{ fontWeight: 700 }}>Overall Progress</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{completed} of {milestones.length} tasks completed</p>
                        </div>
                        <div className="stat-value">{progress}%</div>
                    </div>
                    <div className="progress-bar mt-2"><div className="progress-fill" style={{ width: `${progress}%` }}></div></div>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3>Tasks & Milestones</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                    {milestones.length === 0 ? (
                        <div className="empty-state"><CheckSquare size={48} /><h3>No Tasks Assigned</h3><p>Your supervisor will assign tasks here.</p></div>
                    ) : (
                        <div className="timeline" style={{ padding: '24px 24px 24px 48px' }}>
                            {milestones.map(m => {
                                const isOverdue = new Date(m.due_date) < new Date() && m.status !== 'completed';
                                const cfg = statusConfig[isOverdue ? 'overdue' : m.status];
                                return (
                                    <div key={m.id} className={`timeline-item ${m.status === 'completed' ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}>
                                        <div className="card" style={{ marginBottom: 0 }}>
                                            <div className="card-body" style={{ padding: 16 }}>
                                                <div className="flex-between">
                                                    <h4 style={{ fontWeight: 600 }}>{m.title}</h4>
                                                    <span className={`badge badge-${isOverdue ? 'overdue' : m.status}`} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                                        {cfg.icon} {isOverdue ? 'Overdue' : m.status}
                                                    </span>
                                                </div>
                                                {m.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '8px 0' }}>{m.description}</p>}
                                                <div className="flex-between mt-1">
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        Due: {new Date(m.due_date).toLocaleDateString()}
                                                        {m.assigned_by_first && ` • Assigned by: ${m.assigned_by_first} ${m.assigned_by_last}`}
                                                    </span>
                                                    {m.status !== 'completed' && (
                                                        <div className="flex gap-1">
                                                            {m.status === 'pending' && (
                                                                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(m.id, 'in_progress')}>Start</button>
                                                            )}
                                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(m.id, 'completed')}>Complete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
