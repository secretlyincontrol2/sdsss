import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, BookOpen } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            {/* Left Side - Form */}
            <div className="auth-main">
                <div className="auth-container">
                    <div className="auth-header">
                        <div className="auth-logo-icon">
                            <BookOpen size={24} />
                        </div>
                        <h2>FYP Portal</h2>
                        <p className="text-secondary">Select a role to continue (Demo Mode)</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <div className="demo-role-grid">
                        <button
                            className="role-card student"
                            onClick={() => login('student@demo.com', 'demo')}
                            disabled={loading}
                        >
                            <div className="role-icon">🎓</div>
                            <div className="role-info">
                                <h4>Student</h4>
                                <span>Submit proposals & milestones</span>
                            </div>
                        </button>

                        <button
                            className="role-card supervisor"
                            onClick={() => login('prof@demo.com', 'demo')}
                            disabled={loading}
                        >
                            <div className="role-icon">👨‍🏫</div>
                            <div className="role-info">
                                <h4>Supervisor</h4>
                                <span>Review & Grade projects</span>
                            </div>
                        </button>

                        <button
                            className="role-card admin"
                            onClick={() => login('admin@demo.com', 'demo')}
                            disabled={loading}
                        >
                            <div className="role-icon">⚙️</div>
                            <div className="role-info">
                                <h4>Admin</h4>
                                <span>Manage users & system</span>
                            </div>
                        </button>
                    </div>

                    <div className="divider">
                        <span>Or sign in with email</span>
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

            {/* Right Side - Decor */}
            <div className="auth-sidebar">
                <div className="auth-pattern"></div>
                <div className="auth-sidebar-content">
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Academic Excellence</h3>
                    <p style={{ opacity: 0.9, lineHeight: 1.6 }}>"The function of education is to teach one to think intensely and to think critically. Intelligence plus character - that is the goal of true education."</p>
                    <div className="mt-4 flex gap-2" style={{ opacity: 0.7 }}>
                        <div style={{ width: 40, height: 4, background: 'white', borderRadius: 2 }}></div>
                        <div style={{ width: 10, height: 4, background: 'white', borderRadius: 2 }}></div>
                    </div>
                </div>
                <div style={{ opacity: 0.6, fontSize: '0.875rem' }}>
                    © 2026 Babcock University
                </div>
            </div>
        </div>
    );
}
