import { useState, useEffect } from 'react';
import { projectAPI, gradeAPI } from '../../services/api';
import { Star, CheckCircle } from 'lucide-react';

const COMPONENTS = [
    { value: 'proposal', label: 'Proposal', max: 10 },
    { value: 'chapter_1', label: 'Chapter 1 — Introduction', max: 15 },
    { value: 'chapter_2', label: 'Chapter 2 — Literature Review', max: 15 },
    { value: 'chapter_3', label: 'Chapter 3 — Methodology', max: 15 },
    { value: 'chapter_4', label: 'Chapter 4 — Implementation', max: 20 },
    { value: 'chapter_5', label: 'Chapter 5 — Conclusion', max: 10 },
    { value: 'defense', label: 'Project Defense', max: 15 },
];

export default function GradingPage() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [grades, setGrades] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gradeForm, setGradeForm] = useState({ component: 'proposal', score: '', max_score: 10, remarks: '' });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { loadProjects(); }, []);

    const loadProjects = async () => {
        try {
            const res = await projectAPI.list();
            setProjects(res.data.projects);
            if (res.data.projects.length > 0) {
                selectProject(res.data.projects[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const selectProject = async (proj) => {
        setSelectedProject(proj);
        try {
            const res = await gradeAPI.getByProject(proj.id);
            setGrades(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const submitGrade = async (e) => {
        e.preventDefault();
        setError('');
        if (!gradeForm.score || parseFloat(gradeForm.score) < 0) {
            setError('Please enter a valid score');
            return;
        }
        try {
            await gradeAPI.create({ ...gradeForm, project_id: selectedProject.id, score: parseFloat(gradeForm.score) });
            setSuccess('Grade submitted!');
            setGradeForm({ ...gradeForm, score: '', remarks: '' });
            selectProject(selectedProject);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit');
        }
    };

    if (loading) return <div className="flex-center mt-4"><div className="spinner spinner-lg"></div></div>;

    return (
        <div>
            {success && <div className="alert alert-success"><CheckCircle size={16} /> {success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Student Selection */}
                <div>
                    <div className="card mb-3">
                        <div className="card-header"><h3>Select Student</h3></div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {projects.map(p => (
                                <div
                                    key={p.id}
                                    className={`conversation-item ${selectedProject?.id === p.id ? 'active' : ''}`}
                                    onClick={() => selectProject(p)}
                                >
                                    <h4>{p.student_first} {p.student_last}</h4>
                                    <p>{p.title || 'Untitled'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grading Form */}
                <div>
                    {selectedProject && (
                        <>
                            <div className="card mb-3">
                                <div className="card-header"><h3>Submit Grade</h3></div>
                                <div className="card-body">
                                    <form onSubmit={submitGrade}>
                                        <div className="form-group">
                                            <label>Component</label>
                                            <select
                                                value={gradeForm.component}
                                                onChange={e => {
                                                    const comp = COMPONENTS.find(c => c.value === e.target.value);
                                                    setGradeForm({ ...gradeForm, component: e.target.value, max_score: comp?.max || 100 });
                                                }}
                                            >
                                                {COMPONENTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Score</label>
                                                <input type="number" step="0.5" min="0" max={gradeForm.max_score} value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Max Score</label>
                                                <input type="number" value={gradeForm.max_score} onChange={e => setGradeForm({ ...gradeForm, max_score: parseFloat(e.target.value) })} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Remarks</label>
                                            <textarea value={gradeForm.remarks} onChange={e => setGradeForm({ ...gradeForm, remarks: e.target.value })} placeholder="Optional feedback..." />
                                        </div>
                                        <button type="submit" className="btn btn-primary"><Star size={16} /> Submit Grade</button>
                                    </form>
                                </div>
                            </div>

                            {/* Grade Summary */}
                            {grades && grades.grades.length > 0 && (
                                <div className="card">
                                    <div className="card-header">
                                        <h3>Grade Summary</h3>
                                        <strong style={{ color: 'var(--primary)' }}>{grades.summary.percentage}%</strong>
                                    </div>
                                    <div className="table-container">
                                        <table>
                                            <thead><tr><th>Component</th><th>Score</th><th>Max</th><th>Remarks</th></tr></thead>
                                            <tbody>
                                                {grades.grades.map(g => (
                                                    <tr key={g.id}>
                                                        <td style={{ textTransform: 'capitalize' }}>{g.component.replace('_', ' ')}</td>
                                                        <td><strong>{g.score}</strong></td>
                                                        <td>{g.max_score}</td>
                                                        <td style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>{g.remarks || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card-footer flex-between">
                                        <strong>Total</strong>
                                        <strong>{grades.summary.total_score} / {grades.summary.total_max}</strong>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
