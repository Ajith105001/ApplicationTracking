import { useState, useEffect } from 'react';
import api from '../api';
import {
  Download, FileText, BarChart3, TrendingUp, Calendar,
  Users, Briefcase, Filter, Table, PieChart, Bot, Sparkles
} from 'lucide-react';

export default function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getHiringFunnel()])
      .then(([d, f]) => { setDashboard(d); setFunnel(f.funnel); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

      {/* Report type selector */}
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
      </div>

      {/* Report content */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{o.totalJobs}</p>
              <p className="text-xs text-green-600 mt-1">{o.activeJobs} active</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{o.totalApplications}</p>
              <p className="text-xs text-amber-600 mt-1">{o.pendingReview} pending</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Hired</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{o.hired}</p>
              <p className="text-xs text-gray-500 mt-1">{o.totalApplications ? ((o.hired / o.totalApplications) * 100).toFixed(1) : 0}% rate</p>
            </div>
            <div className="card text-center">
              <p className="text-sm text-gray-500">Avg AI Score</p>
              <p className="text-3xl font-bold text-primary-600 mt-1">{o.averageAiScore || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">out of 100</p>
            </div>
          </div>

          {/* Detailed table */}
          <div className="card overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-primary-600" /> Recruitment Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Count</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Total Jobs', count: o.totalJobs },
                    { metric: 'Active Jobs', count: o.activeJobs },
                    { metric: 'Total Candidates', count: o.totalCandidates },
                    { metric: 'Total Applications', count: o.totalApplications },
                    { metric: 'Pending Review', count: o.pendingReview },
                    { metric: 'In Interview', count: o.inInterview },
                    { metric: 'Hired', count: o.hired },
                    { metric: 'Rejected', count: o.rejected },
                    { metric: 'Upcoming Interviews', count: o.upcomingInterviews },
                  ].map(({ metric, count }) => (
                    <tr key={metric} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{metric}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">{count || 0}</td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        {o.totalApplications ? ((count / o.totalApplications) * 100).toFixed(1) : '-'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'funnel' && funnel && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Hiring Funnel Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stage</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Visual</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {funnel.map((stage, i) => {
                  const maxCount = Math.max(...funnel.map(f => f.count), 1);
                  const prevCount = i > 0 ? funnel[i - 1].count : stage.count;
                  const conversion = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(1) : '-';
                  return (
                    <tr key={stage.stage} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 capitalize font-medium text-gray-900">{stage.stage}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">{stage.count}</td>
                      <td className="py-3 px-4">
                        <div className="bg-gray-100 rounded-full h-4 w-48">
                          <div className="bg-primary-500 h-4 rounded-full transition-all" style={{ width: `${(stage.count / maxCount) * 100}%` }} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">{conversion}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'sources' && dashboard?.sourceBreakdown && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" /> Candidate Source Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Candidates</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Distribution</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">%</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.sourceBreakdown.map(({ source, count }) => {
                  const total = o.totalCandidates || 1;
                  const pct = ((count / total) * 100).toFixed(1);
                  return (
                    <tr key={source} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 capitalize font-medium text-gray-900">{source?.replace('-', ' ')}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">{count}</td>
                      <td className="py-3 px-4">
                        <div className="bg-gray-100 rounded-full h-4 w-48">
                          <div className="bg-primary-500 h-4 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
