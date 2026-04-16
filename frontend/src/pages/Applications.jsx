import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Search, Bot, Star, ArrowUpRight, Plus, Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';

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

function ScoreBadge({ score }) {
  if (!score) return null;
  let color = 'text-red-600 bg-red-50';
  if (score >= 80) color = 'text-green-600 bg-green-50';
  else if (score >= 60) color = 'text-amber-600 bg-amber-50';
  return <span className={`badge ${color} font-bold`}>{score}%</span>;
}

export default function Applications() {
  const { user } = useAuth();
  const canCreate = ['admin', 'recruiter'].includes(user?.role);

  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [screeningId, setScreeningId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ candidateId: '', jobId: '', status: 'new' });
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.getApplications(params)
      .then(data => { setApplications(data.applications); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, [statusFilter]);

  const handleQuickScreen = async (e, appId) => {
    e.preventDefault();
    e.stopPropagation();
    setScreeningId(appId);
    try {
      await api.screenApplication(appId);
      fetchApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setScreeningId(null);
    }
  };

  const openForm = async () => {
    setShowForm(true);
    const [cData, jData] = await Promise.all([
      api.getCandidates({ limit: 100 }),
      api.getJobs({ limit: 50 }),
    ]);
    setCandidates(cData.candidates);
    setJobs(jData.jobs);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createApplication(form);
      setShowForm(false);
      setForm({ candidateId: '', jobId: '', status: 'new' });
      fetchApplications();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total applications</p>
        </div>
        {canCreate && (
          <button onClick={openForm} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Application
          </button>
        )}
      </div>

      {/* Create Application Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4 border-2 border-primary-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">New Application</h2>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Candidate *</label>
              <select required className="input" value={form.candidateId} onChange={e => setForm({...form, candidateId: e.target.value})}>
                <option value="">Select candidate...</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.currentTitle || c.email}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Job Position *</label>
              <select required className="input" value={form.jobId} onChange={e => setForm({...form, jobId: e.target.value})}>
                <option value="">Select job...</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.department}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Initial Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Creating...' : 'Create & AI Screen'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('')} className={`badge cursor-pointer px-3 py-1.5 ${!statusFilter ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {Object.keys(statusColors).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`badge cursor-pointer px-3 py-1.5 capitalize ${statusFilter === s ? statusColors[s] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No applications found</div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const aiAnalysis = typeof app.aiAnalysis === 'string' ? JSON.parse(app.aiAnalysis || '{}') : (app.aiAnalysis || {});
            const remark = app.recruiterNotes || aiAnalysis.recommendation || '';
            return (
            <Link key={app.id} to={`/applications/${app.id}`} className="card hover:shadow-md transition-shadow block group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold flex-shrink-0">
                    {app.Candidate?.firstName?.[0]}{app.Candidate?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{app.Candidate?.firstName} {app.Candidate?.lastName}</h3>
                      <span className={`badge ${statusColors[app.status]} capitalize`}>{app.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span>{app.Job?.title}</span>
                      <span className="text-gray-300">·</span>
                      <span>{app.Job?.department}</span>
                      {app.Candidate?.currentTitle && <><span className="text-gray-300">·</span><span>{app.Candidate.currentTitle}</span></>}
                    </div>
                    {remark && (
                      <div className="flex items-start gap-1 mt-1.5">
                        <Bot className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 line-clamp-1">{remark}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {app.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{app.rating}/5</span>
                    </div>
                  )}
                  <ScoreBadge score={app.aiScore} />
                  {!app.aiScore ? (
                    <button
                      onClick={(e) => handleQuickScreen(e, app.id)}
                      disabled={screeningId === app.id}
                      title="Run AI Screening"
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
                    >
                      {screeningId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Screen
                    </button>
                  ) : (
                    <Bot className="w-4 h-4 text-primary-400" title="AI Screened" />
                  )}
                  <ArrowUpRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
