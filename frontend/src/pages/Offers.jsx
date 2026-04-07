import { useState, useEffect } from 'react';
import api from '../api';
import {
  FileText, DollarSign, Calendar, Send, CheckCircle2, XCircle,
  Clock, Bot, Sparkles, Plus, User, Briefcase, Download
} from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
  negotiating: 'bg-purple-100 text-purple-700',
};

const statusIcons = {
  draft: FileText,
  sent: Send,
  accepted: CheckCircle2,
  rejected: XCircle,
  expired: Clock,
  negotiating: DollarSign,
};

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    applicationId: '',
    salary: '',
    currency: 'USD',
    startDate: '',
    benefits: '',
    content: '',
  });

  useEffect(() => {
    Promise.all([
      api.getApplications({ status: 'offer', limit: 100 }),
      api.getApplications({ limit: 200 }),
    ])
      .then(([offerData, allApps]) => {
        // Create offer objects from applications in "offer" status
        const offerApps = offerData.applications.map(app => ({
          id: app.id,
          applicationId: app.id,
          candidate: app.Candidate,
          job: app.Job,
          status: 'draft',
          salary: app.Job?.salaryMax || 0,
          currency: 'USD',
          startDate: null,
          createdAt: app.updatedAt,
          Application: app,
        }));
        setOffers(offerApps);
        setApplications(allApps.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateOffer = async () => {
    if (!form.applicationId) return;
    setGenerating(true);
    try {
      const app = applications.find(a => a.id === form.applicationId);
      if (app) {
        const emailData = await api.generateEmail(form.applicationId, { type: 'offer' });
        setForm(f => ({
          ...f,
          content: `${emailData.email.subject}\n\n${emailData.email.body}`,
        }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleMoveToOffer = async (appId) => {
    try {
      await api.updateApplicationStatus(appId, { status: 'offer' });
      // Refresh
      const data = await api.getApplications({ status: 'offer', limit: 100 });
      const offerApps = data.applications.map(app => ({
        id: app.id, applicationId: app.id, candidate: app.Candidate, job: app.Job,
        status: 'draft', salary: app.Job?.salaryMax || 0, currency: 'USD',
        startDate: null, createdAt: app.updatedAt, Application: app,
      }));
      setOffers(offerApps);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAccept = async (appId) => {
    try {
      await api.updateApplicationStatus(appId, { status: 'hired' });
      setOffers(prev => prev.filter(o => o.id !== appId));
    } catch (err) {
      alert(err.message);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Management</h1>
          <p className="text-gray-500 text-sm mt-1">{offers.length} active offers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><FileText className="w-4 h-4" /> Pending Offers</div>
          <div className="text-3xl font-bold text-gray-900">{offers.length}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Send className="w-4 h-4" /> Sent</div>
          <div className="text-3xl font-bold text-blue-600">{offers.filter(o => o.status === 'sent').length}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><CheckCircle2 className="w-4 h-4" /> Accepted</div>
          <div className="text-3xl font-bold text-green-600">0</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><DollarSign className="w-4 h-4" /> Avg Salary</div>
          <div className="text-3xl font-bold text-primary-600">
            ${offers.length > 0 ? Math.round(offers.reduce((acc, o) => acc + (o.salary || 0), 0) / offers.length / 1000) : 0}k
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Create New Offer</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Application *</label>
              <select className="input" value={form.applicationId} onChange={e => setForm({...form, applicationId: e.target.value})}>
                <option value="">Select candidate...</option>
                {applications.filter(a => ['shortlisted', 'interview', 'technical', 'offer'].includes(a.status)).map(a => (
                  <option key={a.id} value={a.id}>{a.Candidate?.firstName} {a.Candidate?.lastName} - {a.Job?.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Salary (Annual)</label>
              <input type="number" className="input" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="150000" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}>
                <option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="INR">INR</option>
              </select>
            </div>
            <div>
              <label className="label">Start Date</label>
              <input type="date" className="input" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="label">Benefits</label>
            <textarea className="input h-20" value={form.benefits} onChange={e => setForm({...form, benefits: e.target.value})} placeholder="Health insurance, 401k, PTO, etc." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Offer Letter Content</label>
              <button onClick={handleGenerateOffer} disabled={generating || !form.applicationId} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 disabled:opacity-50">
                {generating ? <div className="animate-spin h-3 w-3 border-2 border-primary-500 border-t-transparent rounded-full" /> : <Sparkles className="w-3.5 h-3.5" />}
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea className="input h-40" value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Offer letter content..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { if (form.applicationId) handleMoveToOffer(form.applicationId); setShowForm(false); }} className="btn-primary">Create Offer</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Offers list */}
      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No active offers. Move candidates to "Offer" stage to create offers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => (
            <div key={offer.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-700 rounded-full">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {offer.candidate?.firstName} {offer.candidate?.lastName}
                      </h3>
                      <span className="badge bg-amber-100 text-amber-700">Offer Pending</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{offer.job?.title}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${(offer.salary / 1000).toFixed(0)}k/yr</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(offer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleAccept(offer.id)} className="btn-primary text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Mark Hired
                  </button>
                  <button onClick={() => {
                    api.updateApplicationStatus(offer.id, { status: 'rejected' });
                    setOffers(prev => prev.filter(o => o.id !== offer.id));
                  }} className="btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
