import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Candidates from './pages/Candidates';
import CandidateDetail from './pages/CandidateDetail';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Interviews from './pages/Interviews';
import Analytics from './pages/Analytics';
import Pipeline from './pages/Pipeline';
import CalendarView from './pages/CalendarView';
import Offers from './pages/Offers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';

// Requires authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

// Requires specific roles — redirects to dashboard if not allowed
function RoleGuard({ roles, children }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            {/* Jobs — all roles can view; recruiter/admin/hiring_manager */}
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            {/* Candidates — admin and recruiter only */}
            <Route path="candidates" element={<RoleGuard roles={['admin', 'recruiter']}><Candidates /></RoleGuard>} />
            <Route path="candidates/:id" element={<RoleGuard roles={['admin', 'recruiter']}><CandidateDetail /></RoleGuard>} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="interviews" element={<Interviews />} />
            {/* Calendar — admin and recruiter only */}
            <Route path="calendar" element={<RoleGuard roles={['admin', 'recruiter']}><CalendarView /></RoleGuard>} />
            {/* Offers — admin and recruiter only */}
            <Route path="offers" element={<RoleGuard roles={['admin', 'recruiter']}><Offers /></RoleGuard>} />
            {/* Analytics — admin and hiring_manager only */}
            <Route path="analytics" element={<RoleGuard roles={['admin', 'hiring_manager']}><Analytics /></RoleGuard>} />
            {/* Reports — admin and hiring_manager only */}
            <Route path="reports" element={<RoleGuard roles={['admin', 'hiring_manager']}><Reports /></RoleGuard>} />
            <Route path="settings" element={<Settings />} />
            {/* User Management — admin only */}
            <Route path="users" element={<RoleGuard roles={['admin']}><Users /></RoleGuard>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
