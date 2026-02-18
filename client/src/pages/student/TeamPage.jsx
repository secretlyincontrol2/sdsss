import { useState, useEffect } from 'react';
import { projectAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, Trash2, Shield, User } from 'lucide-react';

export default function TeamPage() {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const res = await projectAPI.list();
            if (res.data.projects.length > 0) {
                // Students usually have one active project
                const pid = res.data.projects[0].id;
                const details = await projectAPI.get(pid);
                setProject(details.data.project);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setAdding(true);
        setError(null);
        setSuccess(null);

        try {
            await projectAPI.addMember(project.id, { email });
            setSuccess('Member added successfully');
            setEmail('');
            loadProject(); // Reload to show new member
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;

        try {
            await projectAPI.removeMember(project.id, userId);
            loadProject();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to remove member');
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    if (!project) {
        return (
            <div className="empty-state">
                <Users size={48} />
                <h3>No Active Project</h3>
                <p>You need to create a project proposal first before managing a team.</p>
            </div>
        );
    }

    const isLeader = project.student_id === user.id;

    return (
        <div className="page-content">
            <h2 className="mb-4">Team Management</h2>

            <div className="card mb-4">
                <div className="card-header">
                    <h3>{project.title}</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            <h4 className="mb-3">Project Members</h4>
                            <div className="list-group">
                                {project.members && project.members.map(member => (
                                    <div key={member.id} className="list-group-item flex-between" style={{ padding: '16px', borderBottom: '1px solid var(--border-light)' }}>
                                        <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                            <div className="avatar" style={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: 'var(--primary-light)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                            }}>
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <h5 style={{ fontSize: '0.938rem', marginBottom: 2 }}>
                                                    {member.first_name} {member.last_name}
                                                    {member.id === user.id && <span className="badge badge-primary ml-2" style={{ fontSize: '0.65rem' }}>YOU</span>}
                                                </h5>
                                                <p className="text-muted" style={{ fontSize: '0.75rem' }}>{member.matric_number || member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3" style={{ alignItems: 'center' }}>
                                            <span className={`badge ${member.role === 'leader' ? 'badge-primary' : 'badge-secondary'}`}>
                                                {member.role === 'leader' ? <Shield size={12} className="mr-1" /> : <User size={12} className="mr-1" />}
                                                {member.role}
                                            </span>
                                            {isLeader && member.id !== user.id && (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    title="Remove Member"
                                                    style={{ padding: 6 }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isLeader && (
                            <div className="col-md-4 mt-4 mt-md-0">
                                <div className="card bg-light" style={{ border: 'none', background: 'var(--bg)' }}>
                                    <div className="card-body">
                                        <h4>Add Member</h4>
                                        <p className="text-secondary mb-3" style={{ fontSize: '0.875rem' }}>
                                            Invite other students to join your project group. They must not be in another active project.
                                        </p>

                                        {error && <div className="alert alert-danger mb-3">{error}</div>}
                                        {success && <div className="alert alert-success mb-3">{success}</div>}

                                        <form onSubmit={handleAddMember}>
                                            <div className="form-group">
                                                <label>Student Email</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    placeholder="Enter student email"
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-block" disabled={adding}>
                                                {adding ? 'Adding...' : <><UserPlus size={16} /> Add Member</>}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
