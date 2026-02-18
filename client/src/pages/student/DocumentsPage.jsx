import { useState, useEffect, useRef } from 'react';
import { projectAPI, documentAPI } from '../../services/api';
import { Upload, File, Download, History, MessageSquare, Send } from 'lucide-react';

const DOC_TYPES = [
    { value: 'chapter_1', label: 'Chapter 1 — Introduction' },
    { value: 'chapter_2', label: 'Chapter 2 — Literature Review' },
    { value: 'chapter_3', label: 'Chapter 3 — Methodology' },
    { value: 'chapter_4', label: 'Chapter 4 — Implementation' },
    { value: 'chapter_5', label: 'Chapter 5 — Conclusion' },
    { value: 'full_report', label: 'Full Project Report' },
    { value: 'other', label: 'Other Document' },
];

export default function DocumentsPage() {
    const [project, setProject] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState('chapter_1');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileRef = useRef();

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await projectAPI.list();
            if (res.data.projects.length > 0) {
                const proj = res.data.projects[0];
                setProject(proj);
                const docRes = await documentAPI.getByProject(proj.id);
                setDocuments(docRes.data.documents);
            }
        } catch (e) {
            setError('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file) => {
        if (!file || !project) return;
        if (file.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit');
            return;
        }
        setUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('project_id', project.id);
            fd.append('document_type', docType);
            await documentAPI.upload(fd);
            setSuccess(`${docType.replace('_', ' ')} uploaded successfully!`);
            loadData();
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const loadComments = async (doc) => {
        setSelectedDoc(doc);
        try {
            const res = await documentAPI.getComments(doc.id);
            setComments(res.data.comments);
        } catch (e) {
            console.error(e);
        }
    };

    const submitComment = async () => {
        if (!newComment.trim()) return;
        try {
            await documentAPI.addComment(selectedDoc.id, { comment: newComment });
            setNewComment('');
            loadComments(selectedDoc);
        } catch (e) {
            console.error(e);
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    if (!project) return (
        <div className="card"><div className="empty-state"><h3>No Project</h3><p>Create a project first from the Proposal page.</p></div></div>
    );

    return (
        <div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Upload Section */}
            <div className="card mb-3">
                <div className="card-header"><h3>Upload Document</h3></div>
                <div className="card-body">
                    <div className="form-group" style={{ maxWidth: 300 }}>
                        <label>Document Type</label>
                        <select value={docType} onChange={e => setDocType(e.target.value)}>
                            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div
                        className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
                        onClick={() => fileRef.current?.click()}
                    >
                        {uploading ? (
                            <div className="spinner spinner-lg"></div>
                        ) : (
                            <>
                                <Upload size={40} />
                                <h4>Drop your file here or click to browse</h4>
                                <p>PDF, DOCX, DOC up to 50MB. Version control is automatic.</p>
                            </>
                        )}
                    </div>
                    <input type="file" ref={fileRef} hidden accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => handleUpload(e.target.files[0])} />
                </div>
            </div>

            {/* Document List */}
            <div className="card">
                <div className="card-header"><h3>My Documents</h3></div>
                {documents.length === 0 ? (
                    <div className="empty-state"><File size={48} /><h3>No Documents</h3><p>Upload your first document above.</p></div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>File Name</th>
                                    <th>Version</th>
                                    <th>Size</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(doc => (
                                    <tr key={doc.id}>
                                        <td><span className="badge badge-approved">{doc.document_type.replace('_', ' ')}</span></td>
                                        <td style={{ fontWeight: 500 }}>{doc.file_name}</td>
                                        <td>v{doc.version}</td>
                                        <td>{formatSize(doc.file_size)}</td>
                                        <td style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex gap-1">
                                                <button className="btn btn-secondary btn-sm" onClick={() => loadComments(doc)} title="Comments">
                                                    <MessageSquare size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Comments Modal */}
            {selectedDoc && (
                <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Comments — {selectedDoc.document_type.replace('_', ' ')} v{selectedDoc.version}</h2>
                            <button className="modal-close" onClick={() => setSelectedDoc(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {comments.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No comments yet</p>
                            ) : (
                                <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                                    {comments.map(c => (
                                        <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                            <div className="flex-between">
                                                <strong style={{ fontSize: '0.813rem' }}>{c.first_name} {c.last_name}</strong>
                                                <span style={{ fontSize: '0.688rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleString()}</span>
                                            </div>
                                            <p style={{ fontSize: '0.875rem', marginTop: 4 }}>{c.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    style={{ flex: 1, padding: '10px 14px', border: '2px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--font)', fontSize: '0.875rem' }}
                                    onKeyDown={e => e.key === 'Enter' && submitComment()}
                                />
                                <button className="btn btn-primary btn-sm" onClick={submitComment}><Send size={14} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
