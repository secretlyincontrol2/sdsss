import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, User, Lock, Bell } from 'lucide-react';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <div className="page-content">
            <h2 className="mb-4">Settings</h2>

            <div className="card mb-4" style={{ maxWidth: 800 }}>
                <div className="card-header">
                    <h3>Appearance</h3>
                </div>
                <div className="card-body">
                    <div className="flex-between">
                        <div>
                            <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>Dark Mode</h4>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                Toggle between light and dark themes
                            </p>
                        </div>
                        <button
                            className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? <><Moon size={18} /> Dark</> : <><Sun size={18} /> Light</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="card mb-4" style={{ maxWidth: 800 }}>
                <div className="card-header">
                    <h3>Profile Information</h3>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={`${user.first_name} ${user.last_name}`} disabled />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={user.email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input type="text" value={user.role} disabled style={{ textTransform: 'capitalize' }} />
                    </div>
                    {user.matric_number && (
                        <div className="form-group">
                            <label>Matric Number</label>
                            <input type="text" value={user.matric_number} disabled />
                        </div>
                    )}
                </div>
            </div>

            <div className="card" style={{ maxWidth: 800, opacity: 0.6 }}>
                <div className="card-header">
                    <h3>Notifications (Coming Soon)</h3>
                </div>
                <div className="card-body">
                    <div className="flex-between mb-3">
                        <span>Email Notifications</span>
                        <input type="checkbox" checked readOnly />
                    </div>
                    <div className="flex-between">
                        <span>Browser Notifications</span>
                        <input type="checkbox" checked readOnly />
                    </div>
                </div>
            </div>
        </div>
    );
}
