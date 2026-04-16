import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import {
  FileText, DollarSign, Calendar, Send, CheckCircle2, XCircle,
  Clock, Bot, Sparkles, Plus, Briefcase, Loader2
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
  draft: FileText, sent: Send, accepted: CheckCircle2,
  rejected: XCircle, expired: Clock, negotiating: DollarSign,
};

export default function Offers() {
  const [searchParams] = useSearchParams();
  const prefilledAppId = searchParams.get('applicationId') || '';

  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    applicationId: prefilledAppId,
    salary: '',
    currency: 'USD',
    startDate: '',
    benefits: '',
    content: '',
  });

  const fetchOffers = () => {
    setLoading(true);
    Promise.all([
      api.getOffers(),
      api.getApplications({ limit: 200 }),
    ])
      .then(([offerData, appData]) => {
        setOffers(offerData.offers);
        setApplications(appData.applications);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOffers(); }, []);

  // Auto-open form if navigated from Pipeline with applicationId
  useEffect(() => {
    if (prefilledAppId) {
      setForm(f => ({ ...f, applicationId: prefilledAppId }));
      setShowForm(true);
    }
  }, [prefilledAppId]);

  const handleGenerateOffer = async () => {
    if (!form.applicationId) return;
    setGenerating(true);
    try {
      const emailData = await api.generateEmail(form.applicationId, { type: 'offer' });
      setForm(f => ({
        ...f,
        content: `${emailData.email.subject}\n\n${emailData.email.body}`,
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!form.applicationId) { alert('Please select an application.'); return; }
    setSubmitting(true);
    try {
      await api.createOffer(form);
      setShowForm(false);
      setForm({ applicationId: '', salary: '', currency: 'USD', startDate: '', benefits: '', content: '' });
      fetchOffers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (offerId, status) => {
    try {
      await api.updateOffer(offerId, { status });
      fetchOffers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (offerId) => {
    try {
      await api.deleteOffer(offerId);
      setOffers(prev => prev.filter(o => o.id !== offerId));
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

  const acceptedCount = offers.filter(o => o.status === 'accepted').length;
  const sentCount = offers.filter(o => o.status === 'sent').length;
  const pendingCount = offers.filter(o => ['draft', 'sent', 'negotiating'].includes(o.status)).length;
  const avgSalary = offers.filter(o => o.salary).length > 0
    ? Math.round(offers.filter(o => o.salary).reduce((acc, o) => acc + o.salary, 0) / offers.filter(o => o.salary).length / 1000)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Management</h1>
          <p className="text-gray-500 text-sm mt-1">{offers.length} total offers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><FileText className="w-4 h-4" /> Pending</div>
          <div className="text-3xl font-bold text-gray-900">{pendingCount}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Send className="w-4 h-4" /> Sent</div>
          <div className="text-3xl font-bold text-blue-600">{sentCount}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><CheckCircle2 className="w-4 h-4" /> Accepted</div>
          <div className="text-3xl font-bold text-green-600">{acceptedCount}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><DollarSign className="w-4 h-4" /> Avg Salary</div>
          <div className="text-3xl font-bold text-primary-600">${avgSalary}k</div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card space-y-4 border-2 border-primary-100">
          <h2 className="text-lg font-semibold">Create New Offer</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Application *</label>
              <select className="input" value={form.applicationId} onChange={e => setForm({...form, applicationId: e.target.value})}>
                <option value="">Select candidate...</option>
                {applications
                  .filter(a => ['screening', 'shortlisted', 'interview', 'technical', 'offer'].includes(a.status))
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      {a.Candidate?.firstName} {a.Candidate?.lastName} — {a.Job?.title} ({a.status})
                    </option>
                  ))
                }
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
            <button onClick={handleCreate} disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? 'Saving...' : 'Create & Save Offer'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Offers list */}
      {offers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No offers yet. Create an offer or move candidates to "Offer" stage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map(offer => {
            const StatusIcon = statusIcons[offer.status] || FileText;
            const candidate = offer.Application?.Candidate;
            const job = offer.Application?.Job;
            return (
              <div key={offer.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {candidate?.firstName} {candidate?.lastName}
                        </h3>
                        <span className={`badge ${statusColors[offer.status] || 'bg-gray-100 text-gray-700'} capitalize`}>
                          <StatusIcon className="w-3 h-3 mr-1 inline" />{offer.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job?.title}</span>
                        {offer.salary && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{offer.currency} {(offer.salary / 1000).toFixed(0)}k/yr</span>}
                        {offer.startDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Start: {new Date(offer.startDate).toLocaleDateString()}</span>}
                        <span className="flex items-center gap-1 text-gray-400"><Clock className="w-3.5 h-3.5" />Created {new Date(offer.createdAt).toLocaleDateString()}</span>
                      </div>
                      {offer.benefits && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-sm">{offer.benefits}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {offer.status === 'draft' && (
                      <button onClick={() => handleStatusUpdate(offer.id, 'sent')} className="btn-secondary text-xs px-2.5 py-1 flex items-center gap-1">
                        <Send className="w-3 h-3" /> Send
                      </button>
                    )}
                    {['draft', 'sent', 'negotiating'].includes(offer.status) && (
                      <>
                        <button onClick={() => handleStatusUpdate(offer.id, 'accepted')} className="btn-primary text-xs px-2.5 py-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Accept
                        </button>
                        <button onClick={() => handleStatusUpdate(offer.id, 'rejected')} className="text-xs px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Decline
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(offer.id)} className="text-xs px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete offer">
                      ✕
                    </button>
                  </div>
                </div>
                {offer.content && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 line-clamp-2">{offer.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

