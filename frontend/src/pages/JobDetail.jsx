import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, MapPin, DollarSign, Clock, Users, Edit, Briefcase } from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  'on-hold': 'bg-amber-100 text-amber-700',
};

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.getJob(id)
      .then(data => setJob(data.job))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const { job: updated } = await api.updateJob(id, { status: newStatus });
      setJob(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>;

  const skills = typeof job.skills === 'string' ? JSON.parse(job.skills) : (job.skills || []);

  return (
    <div className="space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`badge ${statusColors[job.status]}`}>{job.status}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span>{job.department}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
              <span className="capitalize">{job.type}</span>
              {job.experience && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.experience}</span>}
              {(job.salaryMin || job.salaryMax) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salaryMin && `$${(job.salaryMin/1000).toFixed(0)}k`}
                  {job.salaryMin && job.salaryMax && ' - '}
                  {job.salaryMax && `$${(job.salaryMax/1000).toFixed(0)}k`}
                </span>
              )}
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicationCount} applications</span>
            </div>
          </div>
          <div className="flex gap-2">
            {job.status === 'draft' && <button onClick={() => handleStatusChange('published')} className="btn-primary text-sm">Publish</button>}
            {job.status === 'published' && <button onClick={() => handleStatusChange('closed')} className="btn-secondary text-sm">Close</button>}
            {job.status === 'closed' && <button onClick={() => handleStatusChange('published')} className="btn-secondary text-sm">Reopen</button>}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.map(skill => (
              <span key={skill} className="badge bg-primary-50 text-primary-700">{skill}</span>
            ))}
          </div>
        )}

        {job.hiringManager && (
          <p className="text-sm text-gray-500 mb-6">
            Hiring Manager: <span className="font-medium text-gray-700">{job.hiringManager.firstName} {job.hiringManager.lastName}</span>
          </p>
        )}

        <div className="space-y-6">
          {job.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{job.requirements}</p>
            </div>
          )}
          {job.responsibilities && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Responsibilities</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}
        </div>
      </div>

      {/* Applications for this job */}
      {job.Applications && job.Applications.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications ({job.Applications.length})</h2>
          <div className="grid gap-3">
            {job.Applications.map(app => (
              <Link key={app.id} to={`/applications/${app.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-primary-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {app.Candidate?.firstName?.[0]}{app.Candidate?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                      {app.Candidate?.firstName} {app.Candidate?.lastName}
                    </p>
                    {app.Candidate?.currentTitle && (
                      <p className="text-xs text-gray-500">{app.Candidate.currentTitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {app.aiScore && <span className="text-sm font-bold text-primary-600">{app.aiScore}%</span>}
                  <span className={`badge capitalize text-xs ${
                    app.status === 'hired' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'offer' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{app.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
