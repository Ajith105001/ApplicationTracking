import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import {
  ArrowLeft, Bot, Sparkles, Star, Mail, CheckCircle2, XCircle,
  ThumbsUp, ThumbsDown, MessageSquare, Send
} from 'lucide-react';

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

const statusFlow = ['new', 'screening', 'shortlisted', 'interview', 'technical', 'offer', 'hired'];

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiScreening, setAiScreening] = useState(false);
  const [emailGen, setEmailGen] = useState(false);
  const [email, setEmail] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    api.getApplication(id)
      .then(data => {
        setApp(data.application);
        setNotes(data.application.recruiterNotes || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const { application } = await api.updateApplicationStatus(id, { status, recruiterNotes: notes });
      setApp(application);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAiScreen = async () => {
    setAiScreening(true);
    try {
      const data = await api.screenApplication(id);
      setApp(data.application);
    } catch (err) {
      alert(err.message);
    } finally {
      setAiScreening(false);
    }
  };

  const handleGenerateEmail = async (type) => {
    setEmailGen(true);
    try {
      const data = await api.generateEmail(id, { type });
      setEmail(data.email);
    } catch (err) {
      alert(err.message);
    } finally {
      setEmailGen(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await api.updateApplicationStatus(id, { status: app.status, recruiterNotes: notes });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!app) return <div className="text-center py-12 text-gray-500">Application not found</div>;

  const analysis = app.aiAnalysis;
  const strengths = typeof app.aiStrengths === 'string' ? JSON.parse(app.aiStrengths) : (app.aiStrengths || []);
  const weaknesses = typeof app.aiWeaknesses === 'string' ? JSON.parse(app.aiWeaknesses) : (app.aiWeaknesses || []);

  return (
    <div className="space-y-6">
      <Link to="/applications" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-primary-100 text-primary-700 rounded-full text-xl font-semibold">
              {app.Candidate?.firstName?.[0]}{app.Candidate?.lastName?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{app.Candidate?.firstName} {app.Candidate?.lastName}</h1>
              <p className="text-gray-500">{app.Candidate?.currentTitle} {app.Candidate?.currentCompany && `at ${app.Candidate.currentCompany}`}</p>
              <p className="text-sm text-gray-400 mt-1">Applied for: <Link to={`/jobs/${app.Job?.id}`} className="text-primary-600 hover:underline font-medium">{app.Job?.title}</Link></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge text-sm px-3 py-1 ${statusColors[app.status]} capitalize`}>{app.status}</span>
            {app.aiScore && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 rounded-full">
                <Bot className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-bold text-primary-700">{app.aiScore}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Status pipeline */}
        <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-2">
          {statusFlow.map((s, i) => {
            const isActive = app.status === s;
            const isPast = statusFlow.indexOf(app.status) > i;
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : isPast ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            );
          })}
          <button onClick={() => handleStatusChange('rejected')} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${app.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'}`}>
            Rejected
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Screening */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" /> AI Screening
              </h2>
              <button onClick={handleAiScreen} disabled={aiScreening} className="btn-primary text-sm flex items-center gap-1.5">
                {aiScreening ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
                {aiScreening ? 'Analyzing...' : app.aiScore ? 'Re-screen' : 'Screen with AI'}
              </button>
            </div>

            {app.aiScore ? (
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary-600">{app.aiScore}</div>
                    <div className="text-xs text-gray-500">Fit Score</div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-3">
                      <div className={`h-3 rounded-full transition-all ${app.aiScore >= 80 ? 'bg-green-500' : app.aiScore >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${app.aiScore}%` }} />
                    </div>
                    {analysis?.recommendation && <p className="text-sm text-gray-600 mt-2">{analysis.recommendation}</p>}
                  </div>
                </div>

                {analysis?.summary && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{analysis.summary}</p>}

                <div className="grid sm:grid-cols-2 gap-4">
                  {strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> Strengths</h4>
                      <ul className="space-y-1">
                        {strengths.map((s, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1"><ThumbsDown className="w-3.5 h-3.5" /> Weaknesses</h4>
                      <ul className="space-y-1">
                        {weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Run AI screening to get automated resume analysis and scoring.</p>
            )}
          </div>

          {/* Email Generator */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary-600" /> Email Generator
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => handleGenerateEmail('rejection')} disabled={emailGen} className="btn-secondary text-sm">Rejection Email</button>
              <button onClick={() => handleGenerateEmail('offer')} disabled={emailGen} className="btn-secondary text-sm">Offer Email</button>
              <button onClick={() => handleGenerateEmail('interview invitation')} disabled={emailGen} className="btn-secondary text-sm">Interview Invite</button>
              <button onClick={() => handleGenerateEmail('follow-up')} disabled={emailGen} className="btn-secondary text-sm">Follow-up</button>
            </div>
            {emailGen && <div className="flex items-center gap-2 text-sm text-gray-500"><div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />Generating email...</div>}
            {email && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Subject: {email.subject}</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{email.body}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Rating */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Rating</h3>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={async() => {
                  try { const { application } = await api.updateApplicationStatus(id, { status: app.status, rating: star }); setApp(application); } catch {}
                }} className="p-0.5">
                  <Star className={`w-6 h-6 ${(app.rating || 0) >= star ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">{app.rating || 0}/5</span>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Recruiter Notes
            </h3>
            <textarea
              className="input h-32 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this candidate..."
            />
            <button onClick={handleSaveNotes} className="btn-secondary text-sm mt-2 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Save Notes
            </button>
          </div>

          {/* Candidate info */}
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Candidate Info</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{app.Candidate?.email}</p>
              {app.Candidate?.phone && <p>{app.Candidate.phone}</p>}
              {app.Candidate?.location && <p>{app.Candidate.location}</p>}
              {app.Candidate?.currentCompany && <p>{app.Candidate.currentTitle} at {app.Candidate.currentCompany}</p>}
            </div>
            <Link to={`/candidates/${app.Candidate?.id}`} className="text-sm text-primary-600 hover:underline mt-3 block">View full profile →</Link>
          </div>

          {/* Interviews */}
          {app.Interviews && app.Interviews.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Interviews</h3>
              <div className="space-y-2">
                {app.Interviews.map(iv => (
                  <Link key={iv.id} to={`/interviews`} className="block p-2 rounded-lg hover:bg-gray-50 text-sm">
                    <p className="font-medium capitalize">{iv.type} Interview</p>
                    <p className="text-xs text-gray-500">{new Date(iv.scheduledAt).toLocaleString()}</p>
                    <span className="badge bg-gray-100 text-gray-600 mt-1 capitalize">{iv.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
