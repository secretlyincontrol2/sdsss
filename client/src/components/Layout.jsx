import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import {
    LayoutDashboard, FileText, Upload, CheckSquare, Users, UserPlus,
    BarChart3, Calendar, MessageSquare, Bell, LogOut, Menu, X, GraduationCap, ClipboardList, Star, Settings
} from 'lucide-react';

const navConfig = {
    student: [
        { to: '/student', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/student/proposal', icon: FileText, label: 'Proposal' },
        { to: '/student/documents', icon: Upload, label: 'Documents' },
        { to: '/student/milestones', icon: CheckSquare, label: 'Milestones' },
        { to: '/student/team', icon: Users, label: 'Team' },
    ],
    supervisor: [
        { to: '/supervisor', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/supervisor/grading', icon: Star, label: 'Grading' },
    ],
    admin: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/allocation', icon: UserPlus, label: 'Allocation' },
        { to: '/admin/calendar', icon: Calendar, label: 'Calendar' },
        { to: '/admin/logs', icon: ClipboardList, label: 'System Logs' },
    ],
};

import './NotificationDropdown.css'; // Import styles

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close notifications when clicking outside (simple version: close on route change)
    useEffect(() => {
        setShowNotifications(false);
    }, [location.pathname]);

    const loadNotifications = async () => {
        try {
            const res = await notificationAPI.list();
            setNotifications(res.data.notifications || []);
            setUnreadCount(res.data.unread_count || 0);
        } catch (e) {
            // silent fail
        }
    };

    const handleMarkRead = async (id) => {
        try {
            // Optimistic update
            const target = notifications.find(n => n.id === id);
            if (target && !target.is_read) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
                await notificationAPI.markRead(id);
            }
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    const links = navConfig[user?.role] || [];
    const roleLabel = { student: 'Student Portal', supervisor: 'Supervisor Portal', admin: 'Admin Portal' };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('proposal')) return 'Proposal';
        if (path.includes('documents')) return 'Documents';
        if (path.includes('milestones')) return 'Milestones';
        if (path.includes('review')) return 'Review Project';
        if (path.includes('grading')) return 'Grading';
        if (path.includes('users')) return 'User Management';
        if (path.includes('allocation')) return 'Supervisor Allocation';
        if (path.includes('calendar')) return 'Academic Calendar';
        if (path.includes('messages')) return 'Messages';
        return 'Dashboard';
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>FYP Manager</h2>
                    <span>{roleLabel[user?.role]}</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">Main</div>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.exact}
                            className={({ isActive }) => isActive ? 'active' : ''}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon />
                            {link.label}
                        </NavLink>
                    ))}

                    <div className="sidebar-section">Communication</div>
                    <NavLink
                        to="/messages"
                        className={({ isActive }) => isActive ? 'active' : ''}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <MessageSquare />
                        Messages
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="sidebar-user-info">
                            <h4>{user?.first_name} {user?.last_name}</h4>
                            <span>{user?.role}</span>
                        </div>
                    </div>

                    <NavLink
                        to="/settings"
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500
                        }}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Settings size={20} />
                        Settings
                    </NavLink>

                    <button onClick={logout}>
                        <LogOut />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="flex gap-2" style={{ alignItems: 'center' }}>
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <X /> : <Menu />}
                        </button>
                        <h1>{getPageTitle()}</h1>
                    </div>
                    <div className="top-bar-actions">
                        <button
                            className="notification-btn"
                            title="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}

                            {/* Dropdown Menu */}
                            {showNotifications && (
                                <div className="notification-dropdown" onClick={e => e.stopPropagation()}>
                                    <div className="notification-header">
                                        <h4>Notifications</h4>
                                        <button onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="notification-empty">No notifications yet</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
                                                    onClick={() => handleMarkRead(n.id)}
                                                >
                                                    <p>{n.message}</p>
                                                    <span>{new Date(n.created_at).toLocaleString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </header>

                <div className="page-content">
                    {children}
                </div>
            </main>

            {/* Mobile overlay */}
            {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}
