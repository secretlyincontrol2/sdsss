import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import ProposalPage from './pages/student/ProposalPage';
import DocumentsPage from './pages/student/DocumentsPage';
import MilestonesPage from './pages/student/MilestonesPage';
import TeamPage from './pages/student/TeamPage';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import ReviewPage from './pages/supervisor/ReviewPage';
import GradingPage from './pages/supervisor/GradingPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AllocationPage from './pages/admin/AllocationPage';
import CalendarPage from './pages/admin/CalendarPage';
import AdminLogs from './pages/admin/AdminLogs';
import MessagesPage from './pages/MessagesPage';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner spinner-lg"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={`/${user.role}`} />;
    }

    return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    if (isAuthenticated) return <Navigate to={`/${user.role}`} />;
    return children;
}

export default function App() {
    return (
        <ThemeProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                {/* Student Routes */}
                <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/proposal" element={<ProtectedRoute allowedRoles={['student']}><ProposalPage /></ProtectedRoute>} />
                <Route path="/student/documents" element={<ProtectedRoute allowedRoles={['student']}><DocumentsPage /></ProtectedRoute>} />
                <Route path="/student/milestones" element={<ProtectedRoute allowedRoles={['student']}><MilestonesPage /></ProtectedRoute>} />
                <Route path="/student/team" element={<ProtectedRoute allowedRoles={['student']}><TeamPage /></ProtectedRoute>} />

                {/* Supervisor Routes */}
                <Route path="/supervisor" element={<ProtectedRoute allowedRoles={['supervisor']}><SupervisorDashboard /></ProtectedRoute>} />
                <Route path="/supervisor/review/:projectId" element={<ProtectedRoute allowedRoles={['supervisor']}><ReviewPage /></ProtectedRoute>} />
                <Route path="/supervisor/grading" element={<ProtectedRoute allowedRoles={['supervisor']}><GradingPage /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
                <Route path="/admin/allocation" element={<ProtectedRoute allowedRoles={['admin']}><AllocationPage /></ProtectedRoute>} />
                <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />
                <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['admin']}><CalendarPage /></ProtectedRoute>} />

                {/* Shared Routes */}
                <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Default */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </ThemeProvider>
    );
}
