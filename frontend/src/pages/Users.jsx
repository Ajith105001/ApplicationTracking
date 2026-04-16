import { useState, useEffect } from 'react';
import api from '../api';
import {
  UserCog, Plus, ShieldCheck, Mail, Building, CheckCircle2,
  XCircle, Edit2, Save, X, Eye, EyeOff, RefreshCw
} from 'lucide-react';

const ROLES = [
  { value: 'admin', label: 'Admin', desc: 'Full system access + user management', color: 'bg-red-100 text-red-700' },
  { value: 'hiring_manager', label: 'Hiring Manager', desc: 'View own jobs, approve candidates, analytics', color: 'bg-purple-100 text-purple-700' },
  { value: 'recruiter', label: 'Recruiter', desc: 'Manage candidates, applications, offers', color: 'bg-blue-100 text-blue-700' },
  { value: 'viewer', label: 'Viewer', desc: 'Read-only access to pipeline & applications', color: 'bg-gray-100 text-gray-600' },
];

const PERMISSIONS = {
  admin: ['Dashboard', 'Jobs (Full CRUD)', 'Candidates', 'Applications', 'Pipeline', 'Interviews', 'Calendar', 'Offers', 'Analytics', 'Reports', 'User Management'],
  hiring_manager: ['Dashboard', 'My Jobs (View)', 'Applications (Decisions)', 'Pipeline (View)', 'Interviews (Feedback)', 'Analytics', 'Reports'],
  recruiter: ['Dashboard', 'Jobs (View)', 'Candidates (Full)', 'Applications', 'Pipeline', 'Interviews', 'Calendar', 'Offers'],
  viewer: ['Dashboard', 'Applications (View)', 'Pipeline (View)'],
};

function RoleBadge({ role }) {
  const r = ROLES.find(x => x.value === role);
  return r ? <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${r.color}`}><ShieldCheck className="w-3 h-3" />{r.label}</span> : null;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // userId being edited
  const [editData, setEditData] = useState({});
  const [showPerms, setShowPerms] = useState(null); // role being previewed
  const [saving, setSaving] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '', lastName: '', email: '', password: 'password123',
    role: 'recruiter', department: '',
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.getUsers()
      .then(data => setUsers(data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (user) => {
    setSaving(user.id);
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.updateUser(userId, { role });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (u) => {
    setEditing(u.id);
    setEditData({ firstName: u.firstName, lastName: u.lastName, department: u.department || '' });
  };

  const saveEdit = async (userId) => {
    setSaving(userId);
    try {
      await api.updateUser(userId, editData);
      setEditing(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      setError('First name, last name, and email are required.');
      return;
    }
    setCreating(true);
    try {
      await api.createUser(newUser);
      setShowAdd(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: 'password123', role: 'recruiter', department: '' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-primary-600" /> User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage team members, roles, and access permissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchUsers} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Role Permission Guide */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLES.map(role => (
          <div key={role.value}
            className={`rounded-xl border p-3 cursor-pointer transition-all ${showPerms === role.value ? 'border-primary-400 shadow-md' : 'border-gray-200 hover:border-primary-300'}`}
            onClick={() => setShowPerms(showPerms === role.value ? null : role.value)}
          >
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${role.color}`}>
              <ShieldCheck className="w-3 h-3" />{role.label}
            </div>
            <p className="text-xs text-gray-500">{role.desc}</p>
            {showPerms === role.value && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-1">Accessible pages:</p>
                <ul className="space-y-0.5">
                  {PERMISSIONS[role.value].map(p => (
                    <li key={p} className="text-xs text-gray-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add User Form */}
      {showAdd && (
        <div className="card border-2 border-primary-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} placeholder="Sarah" />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} placeholder="Johnson" />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="sarah@ciglobalsolutions.com" />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} placeholder="Engineering" />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={creating} className="btn-primary flex items-center gap-2">
              {creating ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Plus className="w-4 h-4" />}
              {creating ? 'Creating...' : 'Create User'}
            </button>
            <button onClick={() => { setShowAdd(false); setError(''); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                  <td className="py-3 px-4">
                    {editing === u.id ? (
                      <div className="flex gap-2">
                        <input className="input text-xs py-1 w-24" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} />
                        <input className="input text-xs py-1 w-24" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={u.role}
                      onChange={e => handleRoleChange(u.id, e.target.value)}
                    >
                      {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {editing === u.id ? (
                      <input className="input text-xs py-1 w-32" value={editData.department} onChange={e => setEditData({...editData, department: e.target.value})} placeholder="Department" />
                    ) : (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Building className="w-3.5 h-3.5 text-gray-400" />{u.department || '—'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.isActive ? <><CheckCircle2 className="w-3 h-3" />Active</> : <><XCircle className="w-3 h-3" />Inactive</>}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {editing === u.id ? (
                        <>
                          <button onClick={() => saveEdit(u.id)} disabled={saving === u.id} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg border border-green-200 transition-colors">
                            {saving === u.id ? <div className="animate-spin h-3.5 w-3.5 border-2 border-green-600 border-t-transparent rounded-full" /> : <Save className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => setEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(u)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg border border-gray-200 transition-colors" title="Edit name/department">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={saving === u.id}
                            className={`p-1.5 rounded-lg border transition-colors text-xs font-medium px-2 ${u.isActive ? 'text-red-500 hover:bg-red-50 border-red-200' : 'text-green-600 hover:bg-green-50 border-green-200'}`}
                            title={u.isActive ? 'Deactivate account' : 'Reactivate account'}
                          >
                            {saving === u.id
                              ? <div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                              : u.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo accounts info */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="font-semibold mb-1">Demo Account Credentials</p>
          <div className="grid sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-white/60 rounded px-2 py-1">admin@ciglobalsolutions.com / password123</div>
            <div className="bg-white/60 rounded px-2 py-1">manager@ciglobalsolutions.com / password123</div>
            <div className="bg-white/60 rounded px-2 py-1">recruiter@ciglobalsolutions.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
}
