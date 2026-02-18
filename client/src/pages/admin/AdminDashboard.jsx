import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, FileText, BarChart3, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.analytics()
            .then(res => setAnalytics(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;
    if (!analytics) return <div className="card"><div className="empty-state"><h3>Failed to load analytics</h3></div></div>;

    const { stats, projects_by_status, supervisor_workload, recent_activity } = analytics;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>System Overview</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Real-time analytics and monitoring</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon blue"><Users size={22} /></div>
                    <h4>Total Users</h4>
                    <div className="stat-value">{stats.total_users}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon green"><Users size={22} /></div>
                    <h4>Students</h4>
                    <div className="stat-value">{stats.total_students}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon orange"><Users size={22} /></div>
                    <h4>Supervisors</h4>
                    <div className="stat-value">{stats.total_supervisors}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon red"><FileText size={22} /></div>
                    <h4>Total Projects</h4>
                    <div className="stat-value">{stats.total_projects}</div>
                </div>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Project Status Breakdown */}
                <div className="card">
                    <div className="card-header"><h3><BarChart3 size={18} style={{ marginRight: 8 }} />Project Status</h3></div>
                    <div className="card-body">
                        {projects_by_status.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No projects yet</p>
                        ) : (
                            projects_by_status.map(ps => {
                                const pct = stats.total_projects > 0 ? Math.round((ps.count / stats.total_projects) * 100) : 0;
                                return (
                                    <div key={ps.status} style={{ marginBottom: 16 }}>
                                        <div className="flex-between mb-1">
                                            <span style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.875rem' }}>{ps.status.replace('_', ' ')}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{ps.count} ({pct}%)</span>
                                        </div>
                                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Supervisor Workload */}
                <div className="card">
                    <div className="card-header"><h3><TrendingUp size={18} style={{ marginRight: 8 }} />Supervisor Workload</h3></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {supervisor_workload.length === 0 ? (
                            <div className="empty-state" style={{ padding: 32 }}><p>No supervisors</p></div>
                        ) : (
                            supervisor_workload.map(sw => (
                                <div key={sw.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sw.first_name} {sw.last_name}</h4>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary)' }}>{sw.project_count}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>students</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card mt-3">
                <div className="card-header"><h3><Activity size={18} style={{ marginRight: 8 }} />Recent Activity</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                    {recent_activity.length === 0 ? (
                        <div className="empty-state" style={{ padding: 32 }}><p>No recent activity</p></div>
                    ) : (
                        recent_activity.slice(0, 10).map((a, i) => (
                            <div key={i} style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}></div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.title}</span>
                                    <span style={{ fontSize: '0.813rem', color: 'var(--text-muted)', marginLeft: 8 }}>— {a.first_name} {a.last_name}</span>
                                </div>
                                <span style={{ fontSize: '0.688rem', color: 'var(--text-muted)', flexShrink: 0 }}>{new Date(a.created_at).toLocaleString()}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
