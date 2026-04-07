import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Search, MapPin, DollarSign, Clock, Users } from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
  'on-hold': 'bg-amber-100 text-amber-700',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', department: '', location: '', type: 'full-time',
    experience: '', salaryMin: '', salaryMax: '', description: '',
    requirements: '', responsibilities: '', skills: '',
    status: 'draft', priority: 'medium', closingDate: ''
  });

  const fetchJobs = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.getJobs(params)
      .then(data => { setJobs(data.jobs); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [search, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const jobData = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [],
      };
      await api.createJob(jobData);
      setShowForm(false);
      setForm({ title: '', department: '', location: '', type: 'full-time', experience: '', salaryMin: '', salaryMax: '', description: '', requirements: '', responsibilities: '', skills: '', status: 'draft', priority: 'medium', closingDate: '' });
      fetchJobs();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total jobs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <h2 className="text-lg font-semibold">Create New Job</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Title *</label><input required className="input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><label className="label">Department *</label><input required className="input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
            <div><label className="label">Location *</label><input required className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option><option value="remote">Remote</option>
              </select>
            </div>
            <div><label className="label">Experience</label><input className="input" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} placeholder="e.g. 3+ years" /></div>
            <div><label className="label">Skills (comma-separated)</label><input className="input" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="React, TypeScript, Node.js" /></div>
            <div><label className="label">Min Salary</label><input type="number" className="input" value={form.salaryMin} onChange={e => setForm({...form, salaryMin: e.target.value})} /></div>
            <div><label className="label">Max Salary</label><input type="number" className="input" value={form.salaryMax} onChange={e => setForm({...form, salaryMax: e.target.value})} /></div>
          </div>
          <div><label className="label">Description *</label><textarea required className="input h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div><label className="label">Requirements</label><textarea className="input h-20" value={form.requirements} onChange={e => setForm({...form, requirements: e.target.value})} /></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="draft">Draft</option><option value="published">Published</option></select>
            </div>
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Create Job</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Job list */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No jobs found</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge ${statusColors[job.status]}`}>{job.status}</span>
                    <span className={`badge ${priorityColors[job.priority]}`}>{job.priority}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    <span className="capitalize">{job.type}</span>
                    {job.experience && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.experience}</span>}
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salaryMin && `${(job.salaryMin/1000).toFixed(0)}k`}
                        {job.salaryMin && job.salaryMax && ' - '}
                        {job.salaryMax && `${(job.salaryMax/1000).toFixed(0)}k`}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{job.applicationCount || 0} applications</span>
                  </div>
                  {job.skills && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(typeof job.skills === 'string' ? JSON.parse(job.skills) : job.skills).slice(0,5).map(skill => (
                        <span key={skill} className="badge bg-primary-50 text-primary-700">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
