import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Bot, Star, GripVertical, ArrowRight, Sparkles, Filter } from 'lucide-react';

const columns = [
  { id: 'new', label: 'New', color: 'bg-gray-400', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' },
  { id: 'screening', label: 'Screening', color: 'bg-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-cyan-500', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-300' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
  { id: 'technical', label: 'Technical', color: 'bg-indigo-500', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-300' },
  { id: 'offer', label: 'Offer', color: 'bg-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-300' },
  { id: 'hired', label: 'Hired', color: 'bg-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
];

function ScoreBadge({ score }) {
  if (!score) return null;
  let color = 'text-red-600 bg-red-50 border-red-200';
  if (score >= 80) color = 'text-green-600 bg-green-50 border-green-200';
  else if (score >= 60) color = 'text-amber-600 bg-amber-50 border-amber-200';
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold border ${color}`}><Bot className="w-3 h-3" />{score}%</span>;
}

export default function Pipeline() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [moving, setMoving] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { limit: 200 };
    if (selectedJob) params.jobId = selectedJob;
    Promise.all([
      api.getApplications(params),
      api.getJobs({ limit: 50 }),
    ])
      .then(([appData, jobData]) => {
        setApplications(appData.applications);
        setJobs(jobData.jobs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedJob]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getColumnApps = (status) => applications.filter(a => a.status === status);

  const handleDragStart = (e, app) => {
    setDragItem(app);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', app.id);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!dragItem || dragItem.status === newStatus) return;

    // Optimistic update
    setApplications(prev =>
      prev.map(a => a.id === dragItem.id ? { ...a, status: newStatus } : a)
    );
    setMoving(dragItem.id);

    try {
      await api.updateApplicationStatus(dragItem.id, { status: newStatus });
    } catch (err) {
      // Revert on failure
      setApplications(prev =>
        prev.map(a => a.id === dragItem.id ? { ...a, status: dragItem.status } : a)
      );
    } finally {
      setDragItem(null);
      setMoving(null);
    }
  };

  const moveToNext = async (app) => {
    const currentIdx = columns.findIndex(c => c.id === app.status);
    if (currentIdx >= columns.length - 1) return;
    const nextStatus = columns[currentIdx + 1].id;

    setApplications(prev =>
      prev.map(a => a.id === app.id ? { ...a, status: nextStatus } : a)
    );
    setMoving(app.id);
    try {
      await api.updateApplicationStatus(app.id, { status: nextStatus });
    } catch {
      setApplications(prev =>
        prev.map(a => a.id === app.id ? { ...a, status: app.status } : a)
      );
    } finally {
      setMoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hiring Pipeline</h1>
          <p className="text-gray-500 text-sm mt-1">Drag & drop candidates through your hiring stages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">{applications.length} candidates</span>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="input pl-9 pr-4 w-auto min-w-[180px]"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {columns.map(col => {
          const colApps = getColumnApps(col.id);
          const isDragOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              className={`flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all duration-200 ${
                isDragOver ? `${col.borderColor} ${col.bgColor} shadow-lg scale-[1.01]` : 'border-gray-200 bg-gray-50/50'
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <h3 className="text-sm font-semibold text-gray-900">{col.label}</h3>
                </div>
                <span className="flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {colApps.map(app => (
                  <div
                    key={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app)}
                    className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                      moving === app.id ? 'opacity-60 scale-95' : ''
                    } ${dragItem?.id === app.id ? 'opacity-40 rotate-1' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                          {app.Candidate?.firstName?.[0]}{app.Candidate?.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/applications/${app.id}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600 truncate block">
                            {app.Candidate?.firstName} {app.Candidate?.lastName}
                          </Link>
                          <p className="text-xs text-gray-400 truncate">{app.Candidate?.currentTitle}</p>
                        </div>
                      </div>
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-2">{app.Job?.title}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ScoreBadge score={app.aiScore} />
                        {app.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />{app.rating}
                          </span>
                        )}
                      </div>
                      {col.id !== 'hired' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); moveToNext(app); }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-all"
                          title={`Move to ${columns[columns.findIndex(c => c.id === col.id) + 1]?.label}`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg">
                    Drop here
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
