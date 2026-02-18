import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, BookOpen, Users, Settings } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDemoLogin = async (email) => {
        setError('');
        setLoading(true);
        try {
            const user = await login(email, 'demo');
            navigate(`/${user.role}`);
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            navigate(`/${user.role}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-main">
                <div className="auth-container">
                    <div className="auth-header">
                        <div className="auth-logo-icon">
                            <BookOpen size={24} />
                        </div>
                        <h2>FYP Management Portal</h2>
                        <p className="text-secondary">Select a role to explore the system</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="demo-role-grid">
                        <button
                            className="role-card"
                            onClick={() => handleDemoLogin('student@demo.com')}
                            disabled={loading}
                        >
                            <div className="role-icon"><BookOpen size={20} /></div>
                            <div className="role-info">
                                <h4>Student</h4>
                                <span>Submit proposals</span>
                            </div>
                        </button>

                        <button
                            className="role-card"
                            onClick={() => handleDemoLogin('prof@demo.com')}
                            disabled={loading}
                        >
                            <div className="role-icon"><Users size={20} /></div>
                            <div className="role-info">
                                <h4>Supervisor</h4>
                                <span>Review projects</span>
                            </div>
                        </button>

                        <button
                            className="role-card"
                            onClick={() => handleDemoLogin('admin@demo.com')}
                            disabled={loading}
                        >
                            <div className="role-icon"><Settings size={20} /></div>
                            <div className="role-info">
                                <h4>Admin</h4>
                                <span>Manage system</span>
                            </div>
                        </button>
                    </div>

                    <div className="divider">
                        <span>Or sign in with credentials</span>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@babcock.edu.ng"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </form>
                </div>
            </div>

            <div className="auth-sidebar">
                <div className="auth-sidebar-content">
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'white' }}>Final Year Project Portal</h3>
                    <p style={{ opacity: 0.85, lineHeight: 1.7, fontSize: '0.95rem' }}>
                        Streamline your final year project workflow. Submit proposals, track milestones, communicate with your supervisor, and manage deadlines - all in one place.
                    </p>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.85rem', opacity: 0.9 }}>
                        <strong>Demo Mode</strong> - Click any role card to explore the system with sample data.
                    </div>
                </div>
                <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>
                    Babcock University - 2026
                </div>
            </div>
        </div>
    );
}
