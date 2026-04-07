import { useState, useEffect } from 'react';
import api from '../api';
import {
  Calendar, Clock, Video, Phone, MapPin, Users, Bot, Sparkles,
  CheckCircle2, XCircle, Plus
} from 'lucide-react';

const typeIcons = {
  phone: Phone,
  video: Video,
  onsite: MapPin,
  technical: Bot,
  panel: Users,
  final: CheckCircle2,
};

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-amber-100 text-amber-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(null);
  const [questions, setQuestions] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState({
    applicationId: '', type: 'video', scheduledAt: '',
    duration: 60, meetingLink: '', location: ''
  });

  const fetchInterviews = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    api.getInterviews(params)
      .then(data => setInterviews(data.interviews))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInterviews(); }, [statusFilter]);

  const handleGenerateQuestions = async (intId) => {
    setGeneratingQuestions(intId);
    try {
      const data = await api.generateInterviewQuestions(intId);
      setQuestions(q => ({ ...q, [intId]: data.questions }));
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingQuestions(null);
    }
  };

  const handleStatusUpdate = async (intId, status) => {
    try {
      await api.updateInterview(intId, { status });
      fetchInterviews();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.createInterview(form);
      setShowForm(false);
      setForm({ applicationId: '', type: 'video', scheduledAt: '', duration: 60, meetingLink: '', location: '' });
      fetchInterviews();
    } catch (err) {
      alert(err.message);
    }
  };

  const loadApplications = () => {
    if (applications.length === 0) {
      api.getApplications({ limit: 100 }).then(data => setApplications(data.applications)).catch(console.error);
    }
    setShowForm(!showForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-500 text-sm mt-1">{interviews.length} interviews</p>
        </div>
        <button onClick={loadApplications} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Interview
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('')} className={`badge cursor-pointer px-3 py-1.5 ${!statusFilter ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {Object.keys(statusColors).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`badge cursor-pointer px-3 py-1.5 capitalize ${statusFilter === s ? statusColors[s] : 'bg-gray-100 text-gray-600'}`}>
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSchedule} className="card space-y-4">
          <h2 className="text-lg font-semibold">Schedule New Interview</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Application *</label>
              <select required className="input" value={form.applicationId} onChange={e => setForm({...form, applicationId: e.target.value})}>
                <option value="">Select application...</option>
                {applications.map(a => (
                  <option key={a.id} value={a.id}>{a.Candidate?.firstName} {a.Candidate?.lastName} - {a.Job?.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="phone">Phone</option><option value="video">Video</option><option value="onsite">Onsite</option><option value="technical">Technical</option><option value="panel">Panel</option><option value="final">Final</option>
              </select>
            </div>
            <div>
              <label className="label">Date & Time *</label>
              <input required type="datetime-local" className="input" value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input type="number" className="input" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="label">Meeting Link</label>
              <input className="input" value={form.meetingLink} onChange={e => setForm({...form, meetingLink: e.target.value})} placeholder="https://meet.example.com/..." />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Schedule</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No interviews found</div>
      ) : (
        <div className="space-y-4">
          {interviews.map(iv => {
            const Icon = typeIcons[iv.type] || Video;
            const ivQuestions = questions[iv.id] || (typeof iv.aiQuestions === 'string' ? JSON.parse(iv.aiQuestions) : iv.aiQuestions) || [];

            return (
              <div key={iv.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-xl">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 capitalize">{iv.type} Interview</h3>
                        <span className={`badge ${statusColors[iv.status]} capitalize`}>{iv.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {iv.Application?.Candidate?.firstName} {iv.Application?.Candidate?.lastName} — {iv.Application?.Job?.title}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(iv.scheduledAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{iv.duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {iv.status === 'scheduled' && (
                      <>
                        <button onClick={() => handleStatusUpdate(iv.id, 'completed')} className="btn-secondary text-xs px-2 py-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                        <button onClick={() => handleStatusUpdate(iv.id, 'cancelled')} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Questions */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-primary-600" /> AI Interview Questions
                    </h4>
                    <button
                      onClick={() => handleGenerateQuestions(iv.id)}
                      disabled={generatingQuestions === iv.id}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      {generatingQuestions === iv.id ? (
                        <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {generatingQuestions === iv.id ? 'Generating...' : ivQuestions.length > 0 ? 'Regenerate' : 'Generate Questions'}
                    </button>
                  </div>
                  {ivQuestions.length > 0 ? (
                    <div className="space-y-2">
                      {ivQuestions.map((q, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-gray-700">{q.question}</p>
                            <div className="flex gap-2 mt-1">
                              {q.category && <span className="badge bg-gray-100 text-gray-500">{q.category}</span>}
                              {q.difficulty && <span className="badge bg-gray-100 text-gray-500">{q.difficulty}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Generate AI-powered interview questions tailored to this role.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
