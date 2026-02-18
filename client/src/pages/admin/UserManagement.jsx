import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { UserPlus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editUser, setEditUser] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => { loadUsers(); }, []);
    useEffect(() => { filterUsers(); }, [search, roleFilter, users]);

    const loadUsers = async () => {
        try {
            const res = await adminAPI.listUsers();
            setUsers(res.data.users);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let result = users;
        if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(u =>
                u.first_name.toLowerCase().includes(s) ||
                u.last_name.toLowerCase().includes(s) ||
                u.email.toLowerCase().includes(s) ||
                (u.matric_number && u.matric_number.toLowerCase().includes(s))
            );
        }
        setFiltered(result);
    };

    const updateUser = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(editUser.id, editUser);
            setEditUser(null);
            setSuccess('User updated successfully');
            loadUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleActive = async (user) => {
        try {
            await adminAPI.updateUser(user.id, { is_active: !user.is_active });
            loadUsers();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    return (
        <div>
            {success && <div className="alert alert-success"><CheckCircle size={16} /> {success}</div>}

            <div className="card">
                <div className="card-header">
                    <h3>Users ({filtered.length})</h3>
                    <div className="flex gap-2">
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 36, padding: '8px 12px 8px 36px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--font)', fontSize: '0.813rem', width: 200 }}
                            />
                        </div>
                        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '8px 12px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--font)', fontSize: '0.813rem' }}>
                            <option value="all">All Roles</option>
                            <option value="student">Students</option>
                            <option value="supervisor">Supervisors</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th>ID</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</td>
                                    <td style={{ fontSize: '0.813rem' }}>{u.email}</td>
                                    <td><span className={`badge badge-${u.role === 'admin' ? 'approved' : u.role === 'supervisor' ? 'pending' : 'in_progress'}`}>{u.role}</span></td>
                                    <td>{u.department || '—'}</td>
                                    <td style={{ fontSize: '0.813rem' }}>{u.matric_number || u.staff_id || '—'}</td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${u.is_active ? 'btn-success' : 'btn-danger'}`}
                                            onClick={() => toggleActive(u)}
                                            style={{ padding: '4px 10px', fontSize: '0.688rem' }}
                                        >
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditUser({ ...u })} style={{ padding: '6px 10px' }}>
                                            <Edit2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editUser && (
                <div className="modal-overlay" onClick={() => setEditUser(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit User</h2>
                            <button className="modal-close" onClick={() => setEditUser(null)}>✕</button>
                        </div>
                        <form onSubmit={updateUser}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group"><label>First Name</label><input type="text" value={editUser.first_name} onChange={e => setEditUser({ ...editUser, first_name: e.target.value })} /></div>
                                    <div className="form-group"><label>Last Name</label><input type="text" value={editUser.last_name} onChange={e => setEditUser({ ...editUser, last_name: e.target.value })} /></div>
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                                        <option value="student">Student</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Department</label><input type="text" value={editUser.department || ''} onChange={e => setEditUser({ ...editUser, department: e.target.value })} /></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setEditUser(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
