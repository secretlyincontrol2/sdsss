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
                        <h2>Welcome Back</h2>
                        <p className="text-secondary">Sign in to manage your FYP journey</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@babcock.edu.ng"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex-between mb-3">
                            <label className="flex-center gap-1" style={{ fontSize: '0.875rem' }}>
                                <input type="checkbox" /> Remember me
                            </label>
                            <Link to="#" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>Forgot password?</Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </form>

                    <p className="text-center mt-3" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create one</Link>
                    </p>
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
