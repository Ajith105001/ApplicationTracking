import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
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
  ArrowUpRight
} from 'lucide-react';

const statCards = [
  { key: 'activeJobs', label: 'Active Jobs', icon: Briefcase, color: 'bg-blue-500', link: '/jobs' },
  { key: 'totalCandidates', label: 'Total Candidates', icon: Users, color: 'bg-emerald-500', link: '/candidates' },
  { key: 'pendingReview', label: 'Pending Review', icon: Clock, color: 'bg-amber-500', link: '/applications' },
  { key: 'upcomingInterviews', label: 'Upcoming Interviews', icon: Calendar, color: 'bg-purple-500', link: '/interviews' },
  { key: 'hired', label: 'Hired', icon: CheckCircle2, color: 'bg-green-500', link: '/applications' },
  { key: 'totalApplications', label: 'Applications', icon: FileText, color: 'bg-indigo-500', link: '/applications' },
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

  useEffect(() => {
    api.getDashboard()
      .then(setData)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your recruitment pipeline</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
          <Bot className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">AI Active</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ key, label, icon: Icon, color, link }) => (
          <Link key={key} to={link} className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg text-white ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{overview[key] ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pipeline status */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h2>
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
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          {/* AI Score */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average AI Score</h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {overview.averageAiScore || 'N/A'}
              </span>
              {overview.averageAiScore && <span className="text-sm text-gray-400 mb-1">/ 100</span>}
            </div>
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${overview.averageAiScore || 0}%` }} />
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
