import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bot, Eye, EyeOff, Shield, Users, Briefcase,
  Sparkles, ArrowRight, CheckCircle2, BarChart3,
  Brain, Zap, Lock, Crown, UserCheck, Settings
} from 'lucide-react';

/* ─── Role account definitions ────────────────────────────────── */
const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    email: 'admin@ats.com',
    icon: Crown,
    gradient: 'from-violet-600 to-indigo-600',
    hoverGlow: 'hover:shadow-violet-200',
    ring: 'ring-violet-500',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    iconBg: 'bg-violet-100',
    name: 'Sarah Johnson',
    dept: 'Human Resources',
    description: 'Full system access — manage jobs, users, candidates, and all settings',
    permissions: ['Manage all users', 'Delete jobs', 'System settings', 'Full analytics'],
  },
  {
    id: 'recruiter',
    label: 'Recruiter',
    email: 'recruiter@ats.com',
    icon: UserCheck,
    gradient: 'from-blue-600 to-cyan-600',
    hoverGlow: 'hover:shadow-blue-200',
    ring: 'ring-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
    name: 'Mike Chen',
    dept: 'Talent Acquisition',
    description: 'Screen candidates, manage pipeline, schedule interviews, AI tools',
    permissions: ['AI screening', 'Schedule interviews', 'Email generation', 'Pipeline mgmt'],
  },
  {
    id: 'manager',
    label: 'Hiring Manager',
    email: 'manager@ats.com',
    icon: Settings,
    gradient: 'from-emerald-600 to-teal-600',
    hoverGlow: 'hover:shadow-emerald-200',
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    name: 'Emily Davis',
    dept: 'Engineering',
    description: 'Create job postings, review shortlisted candidates, interview feedback',
    permissions: ['Create jobs', 'Review candidates', 'Interview feedback', 'Team analytics'],
  },
];

/* ─── Floating particles for left panel ──────────────────────── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-particle ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Animated counter ──────────────────────────────────────── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [end, duration]);

  return <>{count}{suffix}</>;
}

/* ─── Live pipeline animation ───────────────────────────────── */
function LivePipeline() {
  const stages = [
    { label: 'Applied', count: 2847, color: 'bg-blue-400' },
    { label: 'Screened', count: 1923, color: 'bg-cyan-400' },
    { label: 'Interview', count: 856, color: 'bg-purple-400' },
    { label: 'Offered', count: 234, color: 'bg-amber-400' },
    { label: 'Hired', count: 189, color: 'bg-emerald-400' },
  ];
  const max = stages[0].count;

  return (
    <div className="space-y-2.5">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3" style={{ animation: `slide-in-right 0.5s ease-out forwards`, animationDelay: `${i * 0.1 + 1}s`, opacity: 0 }}>
          <span className="text-xs text-white/60 w-16 text-right">{s.label}</span>
          <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${s.color}`}
              style={{
                width: `${(s.count / max) * 100}%`,
                animation: `grow-width 1.5s ease-out forwards`,
                animationDelay: `${i * 0.15 + 1.2}s`,
                transform: 'scaleX(0)',
                transformOrigin: 'left',
              }}
            />
          </div>
          <span className="text-xs font-semibold text-white/80 w-12">
            <AnimatedCounter end={s.count} duration={2000 + i * 200} />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Login Component ──────────────────────────────────── */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      setLoginSuccess(true);
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'} ${loginSuccess ? 'scale-[1.01] opacity-0 transition-all duration-500' : ''}`}>

      {/* ═══════════ LEFT PANEL — Brand showcase ═══════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden text-white">
        {/* Gradient background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-primary-800 to-violet-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.2),transparent_50%)]" />
        <FloatingParticles />

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div style={{ animation: 'fade-in-down 0.6s ease-out forwards' }}>
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg shadow-indigo-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">ATS Platform</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-white/60 font-medium">Powered by Claude AI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main hero text */}
          <div className="space-y-6">
            <div style={{ animation: 'fade-in-up 0.8s ease-out 0.2s forwards', opacity: 0 }}>
              <p className="text-sm font-semibold text-violet-300 tracking-wider uppercase mb-3">Next-Generation Recruitment</p>
              <h2 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] tracking-tight">
                Hire the best,<br />
                <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                  powered by AI.
                </span>
              </h2>
              <p className="text-base text-white/50 max-w-md mt-4 leading-relaxed">
                Transform your recruitment with intelligent resume screening, automated workflows, and data-driven insights.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2" style={{ animation: 'fade-in-up 0.8s ease-out 0.5s forwards', opacity: 0 }}>
              {[
                { icon: Brain, label: 'AI Resume Screening' },
                { icon: Zap, label: 'Instant Scoring' },
                { icon: BarChart3, label: 'Smart Analytics' },
                { icon: Lock, label: 'Enterprise Security' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-white/80">
                  <Icon className="w-3 h-3 text-violet-300" />
                  {label}
                </span>
              ))}
            </div>

            {/* Live pipeline preview */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5" style={{ animation: 'fade-in-up 0.8s ease-out 0.7s forwards', opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Live Pipeline</span>
                </div>
                <span className="text-xs text-white/40">Last 30 days</span>
              </div>
              <LivePipeline />
            </div>
          </div>

          {/* Bottom stats */}
          <div className="flex gap-6" style={{ animation: 'fade-in-up 0.8s ease-out 0.9s forwards', opacity: 0 }}>
            {[
              { value: 85, suffix: '%', label: 'Faster Screening', icon: Zap },
              { value: 3, suffix: 'x', label: 'More Efficient', icon: Sparkles },
              { value: 92, suffix: '%', label: 'Satisfaction', icon: CheckCircle2 },
              { value: 10, suffix: 'k+', label: 'Hires Made', icon: Users },
            ].map(({ value, suffix, label, icon: Icon }) => (
              <div key={label} className="group">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-violet-300 group-hover:text-cyan-300 transition-colors" />
                  <span className="text-2xl font-bold tracking-tight">
                    <AnimatedCounter end={value} suffix={suffix} duration={2500} />
                  </span>
                </div>
                <p className="text-[11px] text-white/40 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL — Login form ═══════════ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-gradient-to-b from-gray-50 to-white relative overflow-y-auto">
        {/* Subtle decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6" style={{ animation: 'fade-in-down 0.5s ease-out forwards' }}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-violet-600 rounded-xl shadow-lg shadow-primary-200">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ATS Platform</h1>
              <p className="text-xs text-gray-400">AI-Powered Hiring</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6" style={{ animation: 'fade-in-up 0.5s ease-out 0.1s forwards', opacity: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-400 text-sm">Choose a role to explore the platform</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm border border-red-100 flex items-center gap-2" style={{ animation: 'shake 0.4s ease-in-out' }}>
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* ── Role Selection Cards ─────────────────── */}
          <div className="space-y-3 mb-6" style={{ animation: 'fade-in-up 0.6s ease-out 0.2s forwards', opacity: 0 }}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Role</label>
            <div className="grid gap-3">
              {ROLES.map((role, i) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`group relative w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? `border-transparent ring-2 ${role.ring} bg-white shadow-xl ${role.hoverGlow} shadow-lg`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                    style={{ animation: `fade-in-up 0.5s ease-out ${0.3 + i * 0.1}s forwards`, opacity: 0 }}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center shadow-lg`} style={{ animation: 'pop-in 0.3s ease-out forwards' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isSelected ? `bg-gradient-to-br ${role.gradient} shadow-lg` : `${role.iconBg}`
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-white' : role.text}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className={`font-semibold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                            {role.label}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isSelected ? `${role.bg} ${role.text}` : 'bg-gray-100 text-gray-500'}`}>
                            {role.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{role.description}</p>

                        {/* Permissions — show only when selected */}
                        {isSelected && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5" style={{ animation: 'fade-in-up 0.3s ease-out forwards' }}>
                            {role.permissions.map((perm) => (
                              <span key={perm} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${role.bg} ${role.text}`}>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {perm}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <ArrowRight className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                        isSelected ? `${role.text} translate-x-0 opacity-100` : 'text-gray-300 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Login Form ───────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: 'fade-in-up 0.6s ease-out 0.6s forwards', opacity: 0 }}>
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  className="input pl-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSelectedRole(null); }}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
                </div>
                {selectedRole && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLES.find(r => r.id === selectedRole)?.bg} ${ROLES.find(r => r.id === selectedRole)?.text}`}>
                      {ROLES.find(r => r.id === selectedRole)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-10 pr-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
              <button type="button" className="text-xs text-primary-600 hover:text-primary-700 font-medium">Forgot password?</button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email}
              className={`w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                selectedRole
                  ? `bg-gradient-to-r ${ROLES.find(r => r.id === selectedRole)?.gradient} text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0`
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg`}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Sign in{selectedRole ? ` as ${ROLES.find(r => r.id === selectedRole)?.label}` : ''}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400" style={{ animation: 'fade-in-up 0.6s ease-out 0.8s forwards', opacity: 0 }}>
            <Lock className="w-3 h-3" />
            <span>Secured with 256-bit encryption</span>
            <span className="mx-1">•</span>
            <span>SOC 2 Compliant</span>
            <span className="mx-1">•</span>
            <span>GDPR Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
