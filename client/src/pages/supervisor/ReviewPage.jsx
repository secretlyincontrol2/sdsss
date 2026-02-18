import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectAPI, proposalAPI, documentAPI, milestoneAPI, gradeAPI } from '../../services/api';
import { FileText, CheckCircle, XCircle, Upload, MessageSquare, Send, Plus, Clock, Star } from 'lucide-react';

export default function ReviewPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [grades, setGrades] = useState(null);
    const [activeTab, setActiveTab] = useState('proposals');
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [showMilestoneForm, setShowMilestoneForm] = useState(false);
    const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' });
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => { loadData(); }, [projectId]);

    const loadData = async () => {
        try {
            const [projRes, propRes, docRes, msRes, gradeRes] = await Promise.all([
                projectAPI.get(projectId),
                proposalAPI.getByProject(projectId),
                documentAPI.getByProject(projectId),
                milestoneAPI.getByProject(projectId),
                gradeAPI.getByProject(projectId),
            ]);
            setProject(projRes.data.project);
            setProposals(propRes.data.proposals);
            setDocuments(docRes.data.documents);
            setMilestones(msRes.data.milestones);
            setGrades(gradeRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const reviewProposal = async (id, status) => {
        try {
            await proposalAPI.review(id, { status, feedback });
            setFeedback('');
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const createMilestone = async (e) => {
        e.preventDefault();
        try {
            await milestoneAPI.create({ ...milestoneForm, project_id: parseInt(projectId) });
            setMilestoneForm({ title: '', description: '', due_date: '' });
            setShowMilestoneForm(false);
            loadData();
        } catch (e) {
            console.error(e);
        }
    };

    const loadComments = async (doc) => {
        setSelectedDoc(doc);
        const res = await documentAPI.getComments(doc.id);
        setComments(res.data.comments);
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        await documentAPI.addComment(selectedDoc.id, { comment: newComment });
        setNewComment('');
        loadComments(selectedDoc);
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;
    if (!project) return <div className="card"><div className="empty-state"><h3>Project not found</h3></div></div>;

    const tabs = [
        { id: 'proposals', label: 'Proposals', icon: FileText },
        { id: 'documents', label: 'Documents', icon: Upload },
        { id: 'milestones', label: 'Tasks', icon: Clock },
        { id: 'grades', label: 'Grades', icon: Star },
    ];

    return (
        <div>
            {/* Project Header */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="flex-between">
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{project.title || 'Untitled Project'}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                                Student: <strong>{project.student_first} {project.student_last}</strong> ({project.matric_number || 'N/A'})
                            </p>
                        </div>
                        <span className={`badge badge-${project.status}`}>{project.status}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-3">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setActiveTab(t.id)}
                    >
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Proposals Tab */}
            {activeTab === 'proposals' && (
                <div>
                    {proposals.length === 0 ? (
                        <div className="card"><div className="empty-state"><h3>No proposals submitted yet</h3></div></div>
                    ) : proposals.map(p => (
                        <div key={p.id} className="card mb-2">
                            <div className="card-body">
                                <div className="flex-between mb-2">
                                    <h3 style={{ fontWeight: 700 }}>{p.title}</h3>
                                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                                </div>
                                {p.abstract && <div style={{ marginBottom: 12 }}><strong style={{ fontSize: '0.813rem' }}>Abstract</strong><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.abstract}</p></div>}
                                {p.objectives && <div style={{ marginBottom: 12 }}><strong style={{ fontSize: '0.813rem' }}>Objectives</strong><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{p.objectives}</p></div>}
                                {p.methodology && <div style={{ marginBottom: 12 }}><strong style={{ fontSize: '0.813rem' }}>Methodology</strong><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{p.methodology}</p></div>}
                                {p.status === 'pending' && (
                                    <div style={{ marginTop: 16, padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                                        <div className="form-group">
                                            <label>Feedback</label>
                                            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Provide feedback..." />
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="btn btn-success btn-sm" onClick={() => reviewProposal(p.id, 'approved')}><CheckCircle size={14} /> Approve</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => reviewProposal(p.id, 'rejected')}><XCircle size={14} /> Reject</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
                <div className="card">
                    {documents.length === 0 ? (
                        <div className="empty-state"><h3>No documents uploaded</h3></div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead><tr><th>Type</th><th>File</th><th>Version</th><th>Uploaded</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {documents.map(d => (
                                        <tr key={d.id}>
                                            <td><span className="badge badge-approved">{d.document_type.replace('_', ' ')}</span></td>
                                            <td>{d.file_name}</td>
                                            <td>v{d.version}</td>
                                            <td style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{new Date(d.uploaded_at).toLocaleDateString()}</td>
                                            <td><button className="btn btn-secondary btn-sm" onClick={() => loadComments(d)}><MessageSquare size={14} /> Comment</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
                <div>
                    <div className="flex-between mb-2">
                        <h3 style={{ fontWeight: 600 }}>Assigned Tasks</h3>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowMilestoneForm(true)}><Plus size={14} /> Add Task</button>
                    </div>
                    {showMilestoneForm && (
                        <div className="card mb-2">
                            <div className="card-body">
                                <form onSubmit={createMilestone}>
                                    <div className="form-group"><label>Title</label><input type="text" value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} required /></div>
                                    <div className="form-group"><label>Description</label><textarea value={milestoneForm.description} onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })} /></div>
                                    <div className="form-group"><label>Due Date</label><input type="date" value={milestoneForm.due_date} onChange={e => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })} required /></div>
                                    <div className="flex gap-1">
                                        <button type="submit" className="btn btn-primary btn-sm">Create</button>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMilestoneForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    {milestones.map(m => (
                        <div key={m.id} className="card mb-2">
                            <div className="card-body" style={{ padding: 16 }}>
                                <div className="flex-between">
                                    <h4 style={{ fontWeight: 600 }}>{m.title}</h4>
                                    <span className={`badge badge-${m.status}`}>{m.status}</span>
                                </div>
                                {m.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>{m.description}</p>}
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {new Date(m.due_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && grades && (
                <div className="card">
                    <div className="card-body">
                        {grades.grades.length > 0 && (
                            <div className="flex-between mb-3" style={{ padding: 16, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                                <div><strong>Total Score</strong></div>
                                <div><strong>{grades.summary.total_score}/{grades.summary.total_max} ({grades.summary.percentage}%)</strong></div>
                            </div>
                        )}
                        {grades.grades.length === 0 ? (
                            <div className="empty-state"><Star size={48} /><h3>No grades yet</h3><p>Use the grading page to grade this project.</p></div>
                        ) : (
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Component</th><th>Score</th><th>Max</th><th>Remarks</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {grades.grades.map(g => (
                                            <tr key={g.id}>
                                                <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{g.component.replace('_', ' ')}</td>
                                                <td><strong>{g.score}</strong></td>
                                                <td>{g.max_score}</td>
                                                <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{g.remarks || '—'}</td>
                                                <td style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{new Date(g.graded_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            {selectedDoc && (
                <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Feedback — {selectedDoc.document_type.replace('_', ' ')} v{selectedDoc.version}</h2>
                            <button className="modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {comments.map(c => (
                                <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                    <div className="flex-between"><strong style={{ fontSize: '0.813rem' }}>{c.first_name} {c.last_name} <span className="badge" style={{ fontSize: '0.625rem' }}>{c.role}</span></strong><span style={{ fontSize: '0.688rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleString()}</span></div>
                                    <p style={{ fontSize: '0.875rem', marginTop: 4 }}>{c.comment}</p>
                                </div>
                            ))}
                            {comments.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No feedback yet</p>}
                            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add feedback..." style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--font)' }} onKeyDown={e => e.key === 'Enter' && addComment()} />
                                <button className="btn btn-primary btn-sm" onClick={addComment}><Send size={14} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
