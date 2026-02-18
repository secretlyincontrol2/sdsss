import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Clock, Search, Filter, Shield, User, FileText } from 'lucide-react';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const res = await adminAPI.getLogs();
            setLogs(res.data.logs);
        } catch (e) {
            console.error("Failed to load logs", e);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('LOGIN')) return 'success';
        if (action.includes('DELETE')) return 'danger';
        if (action.includes('CREATE')) return 'primary';
        if (action.includes('UPDATE')) return 'warning';
        return 'secondary';
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(filter.toLowerCase())) ||
        (log.email && log.email.toLowerCase().includes(filter.toLowerCase()))
    );

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    return (
        <div className="page-content">
            <div className="flex-between mb-4">
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>System Logs</h2>
                    <p className="text-secondary">Audit trail of system activities</p>
                </div>
                <div className="input-with-icon" style={{ width: 300 }}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">No logs found</td>
                                </tr>
                            ) : (
                                filteredLogs.map(log => (
                                    <tr key={log.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            {log.user_id ? (
                                                <div className="flex gap-2" style={{ alignItems: 'center' }}>
                                                    <div className="avatar sm" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                                        {log.first_name?.[0]}{log.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{log.first_name} {log.last_name}</div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{log.email}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted">System / Deleted User</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>
                                            <code style={{ fontSize: '0.75rem', background: 'var(--bg)', padding: '4px 8px', borderRadius: 4, display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                                                {log.details || '-'}
                                            </code>
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                                            {log.ip_address}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
