import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, proposalAPI } from '../../services/api';
import { Send, FileText, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

export default function ProposalPage() {
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [projectForm, setProjectForm] = useState({ title: '', description: '' });
    const [form, setForm] = useState({ title: '', abstract: '', objectives: '', methodology: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await projectAPI.list();
            if (res.data.projects.length > 0) {
                const proj = res.data.projects[0];
                setProject(proj);
                const propRes = await proposalAPI.getByProject(proj.id);
                setProposals(propRes.data.proposals);
            } else {
                setShowProjectForm(true);
            }
        } catch (e) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const createProject = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await projectAPI.create(projectForm);
            setProject(res.data.project);
            setShowProjectForm(false);
            setSuccess('Project created! Now submit your proposal.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create project');
        } finally {
            setSubmitting(false);
        }
    };

    const submitProposal = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await proposalAPI.create({ ...form, project_id: project.id });
            setSuccess('Proposal submitted successfully!');
            setShowForm(false);
            setForm({ title: '', abstract: '', objectives: '', methodology: '' });
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit proposal');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    const statusIcon = { pending: <Clock size={16} />, approved: <CheckCircle size={16} />, rejected: <XCircle size={16} /> };

    return (
        <div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Create Project First */}
            {showProjectForm && !project && (
                <div className="card">
                    <div className="card-header"><h3>Create Your Project</h3></div>
                    <div className="card-body">
                        <p style={{ marginBottom: 20, color: 'var(--text-secondary)' }}>Before submitting a proposal, you need to create your project.</p>
                        <form onSubmit={createProject}>
                            <div className="form-group">
                                <label>Project Title</label>
                                <input type="text" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="e.g. Web-Based FYP Management System" required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Brief description of your project..." />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? <span className="spinner"></span> : <><Plus size={16} /> Create Project</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Proposals List */}
            {project && (
                <>
                    <div className="flex-between mb-3">
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Proposals</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Project: {project.title}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                            <Send size={16} /> New Proposal
                        </button>
                    </div>

                    {/* Submit Form Modal */}
                    {showForm && (
                        <div className="modal-overlay" onClick={() => setShowForm(false)}>
                            <div className="modal" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h2>Submit Proposal</h2>
                                    <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
                                </div>
                                <form onSubmit={submitProposal}>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label>Proposal Title</label>
                                            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Abstract</label>
                                            <textarea value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} placeholder="Summarize your project..." />
                                        </div>
                                        <div className="form-group">
                                            <label>Objectives</label>
                                            <textarea value={form.objectives} onChange={e => setForm({ ...form, objectives: e.target.value })} placeholder="List your project objectives..." />
                                        </div>
                                        <div className="form-group">
                                            <label>Methodology</label>
                                            <textarea value={form.methodology} onChange={e => setForm({ ...form, methodology: e.target.value })} placeholder="Describe your approach..." />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                                            {submitting ? <span className="spinner"></span> : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Proposals */}
                    {proposals.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <FileText size={48} />
                                <h3>No Proposals Yet</h3>
                                <p>Submit your first proposal for supervisor review.</p>
                                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>Submit Proposal</button>
                            </div>
                        </div>
                    ) : (
                        proposals.map(p => (
                            <div key={p.id} className="card mb-2">
                                <div className="card-body">
                                    <div className="flex-between mb-2">
                                        <h3 style={{ fontSize: '1.063rem', fontWeight: 700 }}>{p.title}</h3>
                                        <span className={`badge badge-${p.status}`}>{statusIcon[p.status]} {p.status}</span>
                                    </div>
                                    {p.abstract && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{p.abstract}</p>}
                                    {p.objectives && (
                                        <div style={{ marginBottom: 12 }}>
                                            <strong style={{ fontSize: '0.813rem' }}>Objectives:</strong>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{p.objectives}</p>
                                        </div>
                                    )}
                                    {p.feedback && (
                                        <div className="alert alert-info mt-2">
                                            <strong>Supervisor Feedback:</strong> {p.feedback}
                                        </div>
                                    )}
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                        Submitted: {new Date(p.submitted_at).toLocaleString()}
                                        {p.reviewed_at && ` • Reviewed: ${new Date(p.reviewed_at).toLocaleString()}`}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </>
            )}
        </div>
    );
}
