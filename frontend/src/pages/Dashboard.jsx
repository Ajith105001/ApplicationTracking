import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Bot,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';

const statCards = [
  { key: 'activeJobs', label: 'Active Jobs', icon: Briefcase, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-600', link: '/jobs' },
  { key: 'totalCandidates', label: 'Candidates', icon: Users, color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-600', link: '/candidates' },
  { key: 'pendingReview', label: 'Pending Review', icon: Clock, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-600', link: '/applications' },
  { key: 'upcomingInterviews', label: 'Interviews', icon: Calendar, color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-600', link: '/interviews' },
  { key: 'hired', label: 'Hired', icon: CheckCircle2, color: 'bg-green-500', lightColor: 'bg-green-50 text-green-600', link: '/applications' },
  { key: 'totalApplications', label: 'Applications', icon: FileText, color: 'bg-indigo-500', lightColor: 'bg-indigo-50 text-indigo-600', link: '/applications' },
];

const statusColors = {
  new: 'bg-gray-100 text-gray-700',
  screening: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-cyan-100 text-cyan-700',
  interview: 'bg-purple-100 text-purple-700',
  technical: 'bg-indigo-100 text-indigo-700',
  offer: 'bg-amber-100 text-amber-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getHiringFunnel()])
      .then(([d, f]) => { setData(d); setFunnel(f.funnel); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <div className="text-center text-gray-500 py-12">Failed to load dashboard</div>;

  const { overview, statusBreakdown, jobsByDepartment, sourceBreakdown } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
              <p className="text-primary-100 mt-1">Here's what's happening with your recruitment pipeline today.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                <Bot className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-200">AI Engine</p>
                  <p className="text-sm font-semibold">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
                <Activity className="w-5 h-5" />
                <div>
                  <p className="text-xs text-primary-200">Pipeline Health</p>
                  <p className="text-sm font-semibold">{overview.pendingReview > 5 ? 'Needs Review' : 'Healthy'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/pipeline" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              <Zap className="w-3.5 h-3.5" /> View Pipeline
            </Link>
            <Link to="/jobs" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              <Briefcase className="w-3.5 h-3.5" /> Post Job
            </Link>
            <Link to="/calendar" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              <Calendar className="w-3.5 h-3.5" /> Schedule Interview
            </Link>
            <Link to="/analytics" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              <Sparkles className="w-3.5 h-3.5" /> AI Insights
            </Link>
          </div>
        </div>
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, lightColor, link }) => (
          <Link key={key} to={link} className="card hover:shadow-md transition-all group hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${lightColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{overview[key] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline status */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Application Pipeline</h2>
            <Link to="/pipeline" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Open Kanban <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {statusBreakdown?.map(({ status, count }) => {
              const total = overview.totalApplications || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className={`badge ${statusColors[status] || 'bg-gray-100 text-gray-700'} w-24 justify-center capitalize`}>
                    {status}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-primary-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>

          {/* Mini funnel */}
          {funnel && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Conversion Funnel</h3>
              <div className="flex items-center justify-between">
                {funnel.filter(f => !['rejected', 'withdrawn'].includes(f.stage)).map((stage, i, arr) => (
                  <div key={stage.stage} className="flex items-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{stage.count}</div>
                      <div className="text-xs text-gray-500 capitalize">{stage.stage}</div>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-300 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          {/* AI Score */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary-600" /> Average AI Score
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {overview.averageAiScore || 'N/A'}
              </span>
              {overview.averageAiScore && <span className="text-sm text-gray-400 mb-1">/ 100</span>}
            </div>
            <div className="mt-2 bg-gray-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full transition-all ${
                (overview.averageAiScore || 0) >= 75 ? 'bg-green-500' : (overview.averageAiScore || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`} style={{ width: `${overview.averageAiScore || 0}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span>Poor Fit</span>
              <span>Excellent Fit</span>
            </div>
          </div>

          {/* Hiring Velocity */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" /> Hiring Rate
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{overview.hired}</div>
                <div className="text-xs text-gray-500">Hired</div>
              </div>
              <div className="text-center text-gray-300">/</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{overview.totalApplications}</div>
                <div className="text-xs text-gray-500">Applied</div>
              </div>
              <div className="text-center text-gray-300">=</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {overview.totalApplications ? ((overview.hired / overview.totalApplications) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-gray-500">Rate</div>
              </div>
            </div>
          </div>

          {/* Source breakdown */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Candidate Sources</h3>
            <div className="space-y-2">
              {sourceBreakdown?.map(({ source, count }) => (
                <div key={source} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-gray-700">{source?.replace('-', ' ')}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Jobs by Department</h3>
            <div className="space-y-2">
              {jobsByDepartment?.map(({ department, count }) => (
                <div key={department} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{department}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
