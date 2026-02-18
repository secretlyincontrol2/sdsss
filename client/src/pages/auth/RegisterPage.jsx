import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, BookOpen } from 'lucide-react';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', password: '',
        role: 'student', department: '', matric_number: '', staff_id: '', phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const user = await register(form);
            navigate(`/${user.role}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <div className="auth-layout">
            {/* Left Side - Form */}
            <div className="auth-main">
                <div className="auth-container" style={{ maxWidth: 520 }}>
                    <div className="auth-header">
                        <div className="auth-logo-icon">
                            <BookOpen size={24} />
                        </div>
                        <h2>Create Account</h2>
                        <p className="text-secondary">Join the academic community</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" value={form.first_name} onChange={set('first_name')} required />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" value={form.last_name} onChange={set('last_name')} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="you@babcock.edu.ng" value={form.email} onChange={set('email')} required />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Role</label>
                                <select value={form.role} onChange={set('role')}>
                                    <option value="student">Student</option>
                                    <option value="supervisor">Supervisor</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" placeholder="e.g. Computer Science" value={form.department} onChange={set('department')} />
                            </div>
                        </div>

                        {form.role === 'student' && (
                            <div className="form-group">
                                <label>Matric Number</label>
                                <input type="text" placeholder="e.g. 20/1234" value={form.matric_number} onChange={set('matric_number')} />
                            </div>
                        )}

                        {form.role === 'supervisor' && (
                            <div className="form-group">
                                <label>Staff ID</label>
                                <input type="text" placeholder="e.g. STAFF001" value={form.staff_id} onChange={set('staff_id')} />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Phone (Optional)</label>
                            <input type="tel" value={form.phone} onChange={set('phone')} />
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? <span className="spinner"></span> : <><UserPlus size={18} /> Create Account</>}
                        </button>
                    </form>

                    <p className="text-center mt-3" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Decor */}
            <div className="auth-sidebar">
                <div className="auth-pattern"></div>
                <div className="auth-sidebar-content">
                    <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Start Your Journey</h3>
                    <p style={{ opacity: 0.9, lineHeight: 1.6 }}>"Every great project begins with a single step. We provide the tools you need to turn your ideas into impactful academic research."</p>
                    <div className="mt-4 flex gap-2" style={{ opacity: 0.7 }}>
                        <div style={{ width: 10, height: 4, background: 'white', borderRadius: 2 }}></div>
                        <div style={{ width: 40, height: 4, background: 'white', borderRadius: 2 }}></div>
                    </div>
                </div>
                <div style={{ opacity: 0.6, fontSize: '0.875rem' }}>
                    © 2026 Babcock University
                </div>
            </div>
        </div>
    );
}
