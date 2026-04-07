import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search, Bot, Star, ArrowUpRight } from 'lucide-react';

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
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total applications</p>
      </div>

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
          {applications.map(app => (
            <Link key={app.id} to={`/applications/${app.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-11 h-11 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {app.Candidate?.firstName?.[0]}{app.Candidate?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{app.Candidate?.firstName} {app.Candidate?.lastName}</h3>
                      <span className={`badge ${statusColors[app.status]} capitalize`}>{app.status}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span>{app.Job?.title}</span>
                      <span>{app.Job?.department}</span>
                      {app.Candidate?.currentTitle && <span>{app.Candidate.currentTitle}</span>}
                    </div>
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
                  {app.aiScore && <Bot className="w-4 h-4 text-primary-400" title="AI Screened" />}
                  <ArrowUpRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
