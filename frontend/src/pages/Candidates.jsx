import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Mail, MapPin, Building, Briefcase } from 'lucide-react';

const sourceColors = {
  website: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-sky-100 text-sky-700',
  referral: 'bg-green-100 text-green-700',
  'job-board': 'bg-purple-100 text-purple-700',
  agency: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', location: '',
    currentTitle: '', currentCompany: '', experienceYears: '',
    skills: '', source: 'website', resumeText: '', linkedinUrl: ''
  });

  const fetchCandidates = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    api.getCandidates(params)
      .then(data => { setCandidates(data.candidates); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCandidates(); }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        experienceYears: form.experienceYears ? parseFloat(form.experienceYears) : undefined,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [],
      };
      await api.createCandidate(data);
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', location: '', currentTitle: '', currentCompany: '', experienceYears: '', skills: '', source: 'website', resumeText: '', linkedinUrl: '' });
      fetchCandidates();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total candidates</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search candidates..." className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <h2 className="text-lg font-semibold">Add New Candidate</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">First Name *</label><input required className="input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="label">Last Name *</label><input required className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
            <div><label className="label">Email *</label><input required type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
            <div><label className="label">Current Title</label><input className="input" value={form.currentTitle} onChange={e => setForm({...form, currentTitle: e.target.value})} /></div>
            <div><label className="label">Current Company</label><input className="input" value={form.currentCompany} onChange={e => setForm({...form, currentCompany: e.target.value})} /></div>
            <div><label className="label">Years of Experience</label><input type="number" step="0.5" className="input" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} /></div>
            <div><label className="label">Skills (comma-separated)</label><input className="input" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} /></div>
            <div><label className="label">Source</label>
              <select className="input" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                <option value="website">Website</option><option value="linkedin">LinkedIn</option><option value="referral">Referral</option><option value="job-board">Job Board</option><option value="agency">Agency</option><option value="other">Other</option>
              </select>
            </div>
          </div>
          <div><label className="label">Resume Text</label><textarea className="input h-24" value={form.resumeText} onChange={e => setForm({...form, resumeText: e.target.value})} placeholder="Paste resume content here..." /></div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Add Candidate</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No candidates found</div>
      ) : (
        <div className="grid gap-4">
          {candidates.map(c => (
            <Link key={c.id} to={`/candidates/${c.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-700 rounded-full text-lg font-semibold">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.firstName} {c.lastName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                      {c.currentTitle && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{c.currentTitle}</span>}
                      {c.currentCompany && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{c.currentCompany}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{c.location}</span>}
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{c.email}</span>
                    </div>
                    {c.skills && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills).slice(0,5).map(skill => (
                          <span key={skill} className="badge bg-gray-100 text-gray-600">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${sourceColors[c.source] || 'bg-gray-100 text-gray-700'} capitalize`}>{c.source?.replace('-', ' ')}</span>
                  {c.experienceYears && <span className="text-xs text-gray-500">{c.experienceYears} yrs exp</span>}
                  {c.Applications && <span className="text-xs text-gray-500">{c.Applications.length} application(s)</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
