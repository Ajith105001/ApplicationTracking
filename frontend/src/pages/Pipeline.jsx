import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  Bot, Star, Sparkles, Filter, CheckCircle2, XCircle,
  Lock, RefreshCw, Calendar, DollarSign, Zap, Clock,
  ArrowRight, Users, Briefcase
} from 'lucide-react';

const STAGES = [
  {
    id: 'new', label: 'New', dot: 'bg-gray-400', bg: 'bg-gray-50',
    border: 'border-gray-200', header: 'bg-gray-100',
    desc: 'Just applied',
    autoTrigger: 'AI Screen ? moves to Screening',
    actionLabel: 'AI Screen', actionIcon: Sparkles,
    actionColor: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  {
    id: 'screening', label: 'Screening', dot: 'bg-blue-500', bg: 'bg-blue-50',
    border: 'border-blue-200', header: 'bg-blue-100',
    desc: 'AI screened',
    autoTrigger: 'Shortlist ? moves to Shortlisted',
    actionLabel: 'Shortlist', actionIcon: CheckCircle2,
    actionColor: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
  },
  {
    id: 'shortlisted', label: 'Shortlisted', dot: 'bg-cyan-500', bg: 'bg-cyan-50',
    border: 'border-cyan-200', header: 'bg-cyan-100',
    desc: 'Ready for interview',
    autoTrigger: 'Schedule Interview ? auto-moves to Interview',
    actionLabel: 'Schedule Interview', actionIcon: Calendar,
    actionColor: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
  },
  {
    id: 'interview', label: 'Interview', dot: 'bg-purple-500', bg: 'bg-purple-50',
    border: 'border-purple-200', header: 'bg-purple-100',
    desc: 'Interview in progress',
    autoTrigger: 'Complete Interview ? move to Technical',
    actionLabel: 'Technical Round', actionIcon: Zap,
    actionColor: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
  },
  {
    id: 'technical', label: 'Technical', dot: 'bg-indigo-500', bg: 'bg-indigo-50',
    border: 'border-indigo-200', header: 'bg-indigo-100',
    desc: 'Technical assessment',
    autoTrigger: 'Create Offer ? auto-moves to Offer',
    actionLabel: 'Create Offer', actionIcon: DollarSign,
    actionColor: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
  },
  {
    id: 'offer', label: 'Offer', dot: 'bg-amber-500', bg: 'bg-amber-50',
    border: 'border-amber-200', header: 'bg-amber-100',
    desc: 'Offer extended',
    autoTrigger: 'Accept Offer ? auto-moves to Hired',
    actionLabel: 'Mark Hired', actionIcon: CheckCircle2,
    actionColor: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
  },
  {
    id: 'hired', label: 'Hired', dot: 'bg-green-500', bg: 'bg-green-50',
    border: 'border-green-300', header: 'bg-green-100',
    desc: 'Joined — complete',
    autoTrigger: null, actionLabel: null,
  },
];

function ScoreBadge({ score }) {
  if (!score) return null;
  const c = score >= 80 ? 'text-green-700 bg-green-50 border-green-200'
    : score >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold border ${c}`}>
      <Bot className="w-3 h-3" />{score}%
    </span>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [actioning, setActioning] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  const fetchData = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    const params = { limit: 200 };
    if (selectedJob) params.jobId = selectedJob;
    Promise.all([
      api.getApplications(params),
      api.getJobs({ limit: 50 }),
    ])
      .then(([appData, jobData]) => {
        setApplications(appData.applications);
        setJobs(jobData.jobs);
        setLastRefresh(new Date());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedJob]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => fetchData(true), 30000);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, fetchData]);

  const handleStageAction = async (app, stage) => {
    setActioning(app.id);
    try {
      if (stage.id === 'new') {
        await api.screenApplication(app.id);
      } else if (stage.id === 'screening') {
        await api.updateApplicationStatus(app.id, { status: 'shortlisted' });
      } else if (stage.id === 'shortlisted') {
        navigate(`/interviews?applicationId=${app.id}`);
        return;
      } else if (stage.id === 'interview') {
        await api.updateApplicationStatus(app.id, { status: 'technical' });
      } else if (stage.id === 'technical') {
        navigate(`/offers?applicationId=${app.id}`);
        return;
      } else if (stage.id === 'offer') {
        await api.updateApplicationStatus(app.id, { status: 'hired' });
      }
      fetchData(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (app) => {
    setActioning(app.id);
    try {
      await api.updateApplicationStatus(app.id, { status: 'rejected' });
      fetchData(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setActioning(null);
    }
  };

  const activeCount = applications.filter(a => !['hired','rejected','withdrawn'].includes(a.status)).length;
  const hiredCount = applications.filter(a => a.status === 'hired').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">
            Live view — stages update <strong>automatically</strong> when you schedule interviews, create offers, or run AI screening
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
            <Users className="w-4 h-4" />{activeCount} active
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg text-sm font-medium text-green-700">
            <CheckCircle2 className="w-4 h-4" />{hiredCount} hired
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-lg text-sm font-medium text-red-500">
            <XCircle className="w-4 h-4" />{rejectedCount} rejected
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="input pl-9 pr-4 w-auto min-w-[180px] text-sm"
              value={selectedJob}
              onChange={e => setSelectedJob(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
          </div>
          <button
            onClick={() => setAutoRefresh(r => !r)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`}
              style={autoRefresh ? { animationDuration: '8s' } : {}} />
            {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh off'}
          </button>
          <button onClick={() => fetchData(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh now
          </button>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      </div>

      <div className="flex items-start gap-3 p-3 bg-primary-50 border border-primary-100 rounded-xl text-xs text-primary-700">
        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
        <span>
          <strong>Fully automatic tracking:</strong> Scheduling an interview moves candidate to <em>Interview</em>. Creating an offer moves them to <em>Offer</em>. Accepting an offer marks them <em>Hired</em>. Use action buttons on each card to trigger the next step — no manual drag needed.
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 300px)' }}>
        {STAGES.map(stage => {
          const stageApps = applications.filter(a => a.status === stage.id);
          const isHired = stage.id === 'hired';
          const ActionIcon = stage.actionIcon;

          return (
            <div key={stage.id} className={`flex-shrink-0 w-72 flex flex-col rounded-xl border-2 ${stage.border}`}>
              <div className={`px-4 py-3 ${stage.header} rounded-t-xl border-b ${stage.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                    <h3 className="text-sm font-bold text-gray-900">{stage.label}</h3>
                    {isHired && <Lock className="w-3.5 h-3.5 text-green-600" />}
                  </div>
                  <span className="w-6 h-6 rounded-full bg-white/70 text-gray-700 text-xs font-bold flex items-center justify-center border border-gray-200">
                    {stageApps.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 ml-4">{stage.desc}</p>
                {stage.autoTrigger && (
                  <p className="text-xs text-primary-600 mt-1 ml-4 italic flex items-center gap-1">
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />{stage.autoTrigger}
                  </p>
                )}
              </div>

              <div className={`flex-1 overflow-y-auto p-2 space-y-2 ${stage.bg}`}>
                {stageApps.map(app => {
                  const isActioning = actioning === app.id;
                  return (
                    <div
                      key={app.id}
                      className={`bg-white rounded-xl border shadow-sm p-3 transition-all ${
                        isHired ? 'border-green-200' : 'border-gray-200 hover:shadow-md hover:border-primary-200'
                      } ${isActioning ? 'opacity-60 scale-95' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isHired ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                        }`}>
                          {isHired
                            ? <CheckCircle2 className="w-4 h-4" />
                            : <>{(app.Candidate?.firstName || '?')[0]}{(app.Candidate?.lastName || '')[0]}</>
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/applications/${app.id}`}
                            className={`text-sm font-semibold truncate block hover:underline ${
                              isHired ? 'text-green-800' : 'text-gray-900 hover:text-primary-600'
                            }`}
                          >
                            {app.Candidate?.firstName} {app.Candidate?.lastName}
                          </Link>
                          <p className="text-xs text-gray-400 truncate">{app.Candidate?.currentTitle || 'No title'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2.5">
                        <Briefcase className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{app.Job?.title || 'Unknown job'}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-2.5">
                        <ScoreBadge score={app.aiScore} />
                        {app.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{app.rating}/5
                          </span>
                        )}
                        {!app.aiScore && !isHired && (
                          <span className="text-xs text-gray-300 italic">Not screened</span>
                        )}
                      </div>

                      {isHired && (
                        <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium py-1 px-2 bg-green-50 rounded-lg border border-green-100">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Hired — pipeline complete
                        </div>
                      )}

                      {!isHired && (
                        <div className="flex items-center gap-1.5 mt-1 pt-2 border-t border-gray-100">
                          {stage.actionLabel && ActionIcon && (
                            <button
                              onClick={() => handleStageAction(app, stage)}
                              disabled={isActioning}
                              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${stage.actionColor}`}
                            >
                              {isActioning
                                ? <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                                : <ActionIcon className="w-3.5 h-3.5" />
                              }
                              {isActioning ? 'Working...' : stage.actionLabel}
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(app)}
                            disabled={isActioning}
                            title="Reject candidate"
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/applications/${app.id}`}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-200 transition-colors"
                            title="View details"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}

                {stageApps.length === 0 && (
                  <div className={`flex flex-col items-center justify-center h-24 text-xs border border-dashed rounded-xl ${
                    isHired ? 'border-green-300 text-green-400' : 'border-gray-300 text-gray-400'
                  }`}>
                    {isHired
                      ? <><CheckCircle2 className="w-5 h-5 mb-1 text-green-300" />No hires yet</>
                      : <><Users className="w-5 h-5 mb-1 text-gray-300" />No candidates here</>
                    }
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
