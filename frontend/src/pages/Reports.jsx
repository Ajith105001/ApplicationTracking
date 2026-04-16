import { useState, useEffect } from 'react';
import api from '../api';
import {
  Download, FileText, BarChart3, TrendingUp, Calendar,
  Users, Briefcase, CheckCircle2, XCircle, Bot, Clock
} from 'lucide-react';

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  const fetchData = () => {
    setLoading(true);
    const params = dateRange !== 'all' ? { days: dateRange } : {};
    Promise.all([api.getDashboard(params), api.getHiringFunnel()])
      .then(([d, f]) => { setDashboard(d); setFunnel(f.funnel); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [dateRange]);

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] ?? ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (reportType === 'funnel' && funnel) {
      exportCSV(funnel.map(f => ({ Stage: f.stage, Count: f.count })), 'hiring_funnel');
    } else if (reportType === 'sources' && dashboard?.sourceBreakdown) {
      exportCSV(dashboard.sourceBreakdown.map(s => ({ Source: s.source, Count: s.count })), 'candidate_sources');
    } else if (reportType === 'departments' && dashboard?.jobsByDepartment) {
      exportCSV(dashboard.jobsByDepartment.map(d => ({ Department: d.department, Jobs: d.count })), 'jobs_by_department');
    } else if (dashboard) {
      const o = dashboard.overview;
      exportCSV([{
        'Total Jobs': o.totalJobs, 'Active Jobs': o.activeJobs,
        'Total Candidates': o.totalCandidates, 'Total Applications': o.totalApplications,
        'Pending Review': o.pendingReview, 'In Interview': o.inInterview,
        'Hired': o.hired, 'Rejected': o.rejected,
        'Avg AI Score': o.averageAiScore || 'N/A',
      }], 'recruitment_overview');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const o = dashboard?.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and download recruitment reports</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'funnel', label: 'Hiring Funnel', icon: TrendingUp },
          { id: 'sources', label: 'Sources', icon: Users },
          { id: 'departments', label: 'Departments', icon: Briefcase },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setReportType(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              reportType === id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        <select className="input w-auto text-sm ml-auto" value={dateRange} onChange={e => setDateRange(e.target.value)}>
          <option value="30">Last 30 days</option>
          <option value="60">Last 60 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Report content */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{o.totalJobs ?? 0}</p>
              <p className="text-xs text-green-600 mt-1">{o.activeJobs ?? 0} active</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{o.totalApplications ?? 0}</p>
              <p className="text-xs text-amber-600 mt-1">{o.pendingReview ?? 0} pending</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Hired</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{o.hired ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">{o.totalApplications ? ((o.hired / o.totalApplications) * 100).toFixed(1) : 0}% rate</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Avg AI Score</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{o.averageAiScore || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">out of 100</p>
            </div>
          </div>

          {/* Metrics grid — no table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" /> Recruitment Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Jobs', count: o.totalJobs, icon: Briefcase, color: 'text-blue-600 bg-blue-50' },
                { label: 'Active Jobs', count: o.activeJobs, icon: Briefcase, color: 'text-green-600 bg-green-50' },
                { label: 'Total Candidates', count: o.totalCandidates, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Total Applications', count: o.totalApplications, icon: FileText, color: 'text-primary-600 bg-primary-50' },
                { label: 'Pending Review', count: o.pendingReview, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                { label: 'In Interview', count: o.inInterview, icon: Users, color: 'text-purple-600 bg-purple-50' },
                { label: 'Hired', count: o.hired, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
                { label: 'Rejected', count: o.rejected, icon: XCircle, color: 'text-red-600 bg-red-50' },
                { label: 'Upcoming Interviews', count: o.upcomingInterviews, icon: Calendar, color: 'text-cyan-600 bg-cyan-50' },
              ].map(({ label, count, icon: Icon, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{count ?? 0}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportType === 'funnel' && funnel && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Hiring Funnel Report
          </h3>
          <div className="space-y-3">
            {funnel.map((stage, i) => {
              const maxCount = Math.max(...funnel.map(f => f.count), 1);
              const prevCount = i > 0 ? funnel[i - 1].count : stage.count;
              const conversion = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '100';
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="capitalize font-medium text-gray-700 w-28">{stage.stage}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-900 w-8 text-right">{stage.count}</span>
                      <span className="text-xs text-gray-400 w-20 text-right">{conversion}% conv.</span>
                    </div>
                  </div>
                  <div className="h-9 bg-gray-100 rounded-xl overflow-hidden">
                    <div
                      className="h-9 bg-primary-500 rounded-xl flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${Math.max((stage.count / maxCount) * 100, stage.count > 0 ? 6 : 0)}%` }}
                    >
                      {stage.count > 0 && <span className="text-white text-xs font-bold">{stage.count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportType === 'sources' && dashboard?.sourceBreakdown && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" /> Candidate Source Report
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {dashboard.sourceBreakdown.map(({ source, count }) => {
              const total = o.totalCandidates || 1;
              const pct = ((count / total) * 100).toFixed(1);
              return (
                <div key={source} className="bg-gray-50 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700 capitalize">{source?.replace('-', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                      <span className="badge bg-primary-50 text-primary-700">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-2.5 bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportType === 'departments' && dashboard?.jobsByDepartment && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary-600" /> Jobs by Department
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {dashboard.jobsByDepartment.map(({ department, count }) => (
              <div key={department} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-primary-600 mb-2">{count}</div>
                <div className="text-sm font-medium text-gray-700">{department}</div>
                <div className="text-xs text-gray-500 mt-1">job postings</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
