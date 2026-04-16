import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Briefcase, Users, FileText, Calendar,
  BarChart3, LogOut, Bot, Menu, X, Kanban, CalendarDays,
  Gift, FileBarChart, Settings, UserCog, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

// Role badge styling
const ROLE_BADGE = {
  admin: { label: 'Admin', cls: 'bg-red-100 text-red-700' },
  hiring_manager: { label: 'Manager', cls: 'bg-purple-100 text-purple-700' },
  recruiter: { label: 'Recruiter', cls: 'bg-blue-100 text-blue-700' },
  viewer: { label: 'Viewer', cls: 'bg-gray-100 text-gray-600' },
};

// Define per-role navigation
const NAV_BY_ROLE = {
  admin: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/candidates', label: 'Candidates', icon: Users },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/pipeline', label: 'Pipeline', icon: Kanban },
    { path: '/interviews', label: 'Interviews', icon: Calendar },
    { path: '/calendar', label: 'Calendar', icon: CalendarDays },
    { path: '/offers', label: 'Offers', icon: Gift },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileBarChart },
    { path: '/users', label: 'User Management', icon: UserCog },
  ],
  hiring_manager: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'My Jobs', icon: Briefcase },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/pipeline', label: 'Pipeline', icon: Kanban },
    { path: '/interviews', label: 'Interviews', icon: Calendar },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/reports', label: 'Reports', icon: FileBarChart },
  ],
  recruiter: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/candidates', label: 'Candidates', icon: Users },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/pipeline', label: 'Pipeline', icon: Kanban },
    { path: '/interviews', label: 'Interviews', icon: Calendar },
    { path: '/calendar', label: 'Calendar', icon: CalendarDays },
    { path: '/offers', label: 'Offers', icon: Gift },
  ],
  viewer: [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/applications', label: 'Applications', icon: FileText },
    { path: '/pipeline', label: 'Pipeline', icon: Kanban },
  ],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE.viewer;
  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.viewer;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ATS</h1>
              <p className="text-xs text-gray-500">CI Global Solutions</p>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role indicator */}
          <div className={`mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${roleBadge.cls}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            {roleBadge.label} Access
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User footer */}
          <div className="p-4 border-t border-gray-200">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-3 ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-5 h-5" />
              Settings
            </NavLink>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center h-14 px-4 bg-white border-b border-gray-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <Bot className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-gray-900">ATS</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
