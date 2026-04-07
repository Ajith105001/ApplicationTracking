import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase, Linkedin, Globe, Bot, Sparkles } from 'lucide-react';

export default function CandidateDetail() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    api.getCandidate(id)
      .then(data => {
        setCandidate(data.candidate);
        if (data.candidate.aiSummary) {
          try { setAiSummary(JSON.parse(data.candidate.aiSummary)); } catch {}
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const data = await api.generateCandidateSummary(id);
      setAiSummary(data.summary);
    } catch (err) {
      alert(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!candidate) return <div className="text-center py-12 text-gray-500">Candidate not found</div>;

  const skills = typeof candidate.skills === 'string' ? JSON.parse(candidate.skills) : (candidate.skills || []);

  return (
    <div className="space-y-6">
      <Link to="/candidates" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> Back to Candidates
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-700 rounded-full text-2xl font-semibold">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{candidate.firstName} {candidate.lastName}</h1>
                <p className="text-gray-500">{candidate.currentTitle} {candidate.currentCompany && `at ${candidate.currentCompany}`}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-gray-400" />{candidate.email}</div>
              {candidate.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{candidate.phone}</div>}
              {candidate.location && <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" />{candidate.location}</div>}
              {candidate.experienceYears && <div className="flex items-center gap-2 text-gray-600"><Briefcase className="w-4 h-4 text-gray-400" />{candidate.experienceYears} years experience</div>}
            </div>

            {skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => <span key={s} className="badge bg-primary-50 text-primary-700">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Resume */}
          {candidate.resumeText && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Resume</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{candidate.resumeText}</p>
            </div>
          )}

          {/* Applications */}
          {candidate.Applications && candidate.Applications.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Applications</h2>
              <div className="space-y-2">
                {candidate.Applications.map(app => (
                  <Link key={app.id} to={`/applications/${app.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{app.Job?.title || 'Unknown Position'}</p>
                      <p className="text-xs text-gray-500">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.aiScore && <span className="text-sm font-bold text-primary-600">{app.aiScore}%</span>}
                      <span className="badge bg-gray-100 text-gray-700 capitalize">{app.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Summary sidebar */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" /> AI Summary
              </h3>
              <button onClick={handleGenerateSummary} disabled={aiLoading} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                {aiLoading ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-3 h-3" />}
                {aiLoading ? 'Analyzing...' : 'Generate'}
              </button>
            </div>
            {aiSummary ? (
              <div className="space-y-3 text-sm">
                {aiSummary.summary && <p className="text-gray-600">{aiSummary.summary}</p>}
                {aiSummary.topSkills && aiSummary.topSkills.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {aiSummary.topSkills.map(s => <span key={s} className="badge bg-emerald-50 text-emerald-700">{s}</span>)}
                    </div>
                  </div>
                )}
                {aiSummary.experienceLevel && (
                  <div>
                    <p className="font-medium text-gray-700">Experience Level</p>
                    <p className="text-gray-600">{aiSummary.experienceLevel}</p>
                  </div>
                )}
                {aiSummary.cultureFit && (
                  <div>
                    <p className="font-medium text-gray-700">Culture Fit</p>
                    <p className="text-gray-600">{aiSummary.cultureFit}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Click "Generate" to create an AI-powered candidate summary.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
