import { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart3, TrendingUp, Bot, Sparkles, Users, Briefcase,
  ArrowDown, ArrowRight, Lightbulb, AlertTriangle, Target
} from 'lucide-react';

const funnelColors = {
  new: '#94a3b8',
  screening: '#3b82f6',
  shortlisted: '#06b6d4',
  interview: '#8b5cf6',
  technical: '#6366f1',
  offer: '#f59e0b',
  hired: '#22c55e',
  rejected: '#ef4444',
  withdrawn: '#6b7280',
};

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getDashboard(),
      api.getHiringFunnel(),
    ])
      .then(([d, f]) => {
        setDashboard(d);
        setFunnel(f.funnel);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await api.getAiInsights();
      setInsights(data.insights);
    } catch (err) {
      alert(err.message);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  const maxFunnel = funnel ? Math.max(...funnel.map(f => f.count), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="text-gray-500 text-sm mt-1">Hiring metrics, funnel analysis, and AI insights</p>
        </div>
      </div>

      {/* KPI Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Briefcase className="w-4 h-4" /> Active Jobs</div>
            <div className="text-3xl font-bold text-gray-900">{dashboard.overview.activeJobs}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Users className="w-4 h-4" /> Total Applications</div>
            <div className="text-3xl font-bold text-gray-900">{dashboard.overview.totalApplications}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><TrendingUp className="w-4 h-4" /> Hired</div>
            <div className="text-3xl font-bold text-green-600">{dashboard.overview.hired}</div>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><BarChart3 className="w-4 h-4" /> Avg AI Score</div>
            <div className="text-3xl font-bold text-primary-600">{dashboard.overview.averageAiScore || 'N/A'}</div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" /> Hiring Funnel
          </h2>
          {funnel && (
            <div className="space-y-3">
              {funnel.filter(f => f.count > 0).map((stage, i) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-gray-700">{stage.stage}</span>
                    <span className="font-bold" style={{ color: funnelColors[stage.stage] }}>{stage.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${Math.max((stage.count / maxFunnel) * 100, 8)}%`,
                        backgroundColor: funnelColors[stage.stage],
                      }}
                    >
                      <span className="text-white text-xs font-medium">{stage.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source Distribution */}
        {dashboard && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" /> Candidate Sources
            </h2>
            <div className="space-y-4">
              {dashboard.sourceBreakdown?.map(({ source, count }) => {
                const total = dashboard.overview.totalCandidates || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{source?.replace('-', ' ')}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-3">
                      <div className="bg-primary-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Jobs by Department</h3>
              <div className="grid grid-cols-2 gap-3">
                {dashboard.jobsByDepartment?.map(({ department, count }) => (
                  <div key={department} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-500">{department}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-600" /> AI Hiring Insights
          </h2>
          <button onClick={loadInsights} disabled={insightsLoading} className="btn-primary text-sm flex items-center gap-1.5">
            {insightsLoading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
            {insightsLoading ? 'Analyzing...' : insights ? 'Refresh Insights' : 'Generate Insights'}
          </button>
        </div>

        {insights ? (
          <div className="grid md:grid-cols-3 gap-6">
            {insights.insights && insights.insights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Key Insights
                </h3>
                <ul className="space-y-2">
                  {insights.insights.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {insights.bottlenecks && insights.bottlenecks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Bottlenecks
                </h3>
                <ul className="space-y-2">
                  {insights.bottlenecks.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-500" /> Recommendations
                </h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Click "Generate Insights" to get AI-powered analysis of your hiring pipeline.</p>
          </div>
        )}
      </div>
    </div>
  );
}
