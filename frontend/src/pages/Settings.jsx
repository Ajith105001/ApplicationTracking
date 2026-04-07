import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Bell, Shield, Palette, Globe, Database,
  Save, Moon, Sun, Monitor, Check, ChevronRight,
  Mail, Lock, Eye, EyeOff
} from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'system', label: 'System', icon: Database },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    emailNewApplication: true,
    emailInterviewReminder: true,
    emailStatusChange: true,
    emailWeeklyReport: false,
    pushNewApplication: true,
    pushInterviewReminder: true,
    pushStatusChange: false,
  });
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    department: user?.department || '',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="card lg:col-span-1 p-2 h-fit">
          <nav className="space-y-1">
            {settingsSections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeSection === id ? 'rotate-90' : ''}`} />
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-700 rounded-full text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                  <button className="text-sm text-primary-600 hover:underline mt-1">Change avatar</button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input className="input" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input className="input" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input className="input" value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} />
                </div>
              </div>
              <button onClick={handleSave} className="btn-primary mt-6 flex items-center gap-2">
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNewApplication', label: 'New application received', desc: 'Get notified when someone applies to your job postings' },
                      { key: 'emailInterviewReminder', label: 'Interview reminders', desc: 'Receive reminders before scheduled interviews' },
                      { key: 'emailStatusChange', label: 'Application status changes', desc: 'When an application moves to a new stage' },
                      { key: 'emailWeeklyReport', label: 'Weekly hiring report', desc: 'Summary of hiring activity every Monday' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(n => ({...n, [key]: !n[key]}))}
                          className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifications[key] ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Bell className="w-4 h-4" /> Push Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'pushNewApplication', label: 'New applications', desc: 'Real-time alerts for new applications' },
                      { key: 'pushInterviewReminder', label: 'Interview starting soon', desc: '15 minutes before an interview' },
                      { key: 'pushStatusChange', label: 'Pipeline movement', desc: 'When candidates move through stages' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(n => ({...n, [key]: !n[key]}))}
                          className={`relative w-11 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifications[key] ? 'translate-x-5' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSave} className="btn-primary mt-6 flex items-center gap-2">
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Preferences'}
              </button>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance</h2>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
                    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
                    { id: 'system', label: 'System', icon: Monitor, desc: 'Match OS setting' },
                  ].map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => setTheme(id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        theme === id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${theme === id ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                      {theme === id && <Check className="w-4 h-4 text-primary-600 mt-2" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Accent Color</h3>
                <div className="flex gap-3">
                  {['bg-indigo-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'].map(color => (
                    <button key={color} className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 ${color === 'bg-indigo-500' ? 'ring-indigo-500' : 'ring-transparent'} hover:scale-110 transition-transform`} />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Density</h3>
                <div className="flex gap-3">
                  {['Compact', 'Comfortable', 'Spacious'].map((d, i) => (
                    <button key={d} className={`px-4 py-2 rounded-lg text-sm font-medium border ${i === 1 ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{d}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} className="input pr-10" placeholder="Enter current password" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input" placeholder="Enter new password" />
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <input type="password" className="input" placeholder="Confirm new password" />
                </div>
              </div>
              <button onClick={handleSave} className="btn-primary mt-6 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Update Password
              </button>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Sessions</h3>
                <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Current Session</p>
                    <p className="text-xs text-gray-500">Windows • Chrome • {new Date().toLocaleDateString()}</p>
                  </div>
                  <span className="badge bg-green-100 text-green-700">Active</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">2FA is disabled</p>
                    <p className="text-xs text-gray-500">Add extra security to your account</p>
                  </div>
                  <button className="btn-secondary text-sm">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Information</h2>
              <div className="space-y-3">
                {[
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Database', value: 'SQLite (Development)' },
                  { label: 'AI Engine', value: 'Claude claude-sonnet-4-20250514' },
                  { label: 'API Endpoint', value: 'http://localhost:3001/api' },
                  { label: 'Frontend', value: 'React 18 + Vite + Tailwind CSS' },
                  { label: 'Runtime', value: 'Node.js + Express' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Management</h3>
                <div className="flex gap-3">
                  <button className="btn-secondary text-sm flex items-center gap-1">
                    <Database className="w-4 h-4" /> Export Data
                  </button>
                  <button className="btn-danger text-sm">Clear Cache</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
