import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  Plus, Search, Mail, MapPin, Building, Briefcase, Bot, Sparkles, Target,
  FileText, CheckCircle2, Loader2, ChevronRight,
  Users, Zap, AlertCircle, X, Upload, File, Trash2
} from 'lucide-react';

const sourceColors = {
  website: 'bg-blue-100 text-blue-700',
  linkedin: 'bg-sky-100 text-sky-700',
  referral: 'bg-green-100 text-green-700',
  'job-board': 'bg-purple-100 text-purple-700',
  agency: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

const DEMO_RESUME = `John Carter
Senior Full Stack Developer
john.carter@techmail.com | +91 99887 76655 | Hyderabad, India
LinkedIn: linkedin.com/in/johncarter

SUMMARY
Experienced full-stack developer with 6 years of expertise in building scalable web applications. Proficient in React, Node.js, TypeScript, and cloud platforms. Strong background in agile development and cross-functional collaboration.

EXPERIENCE
Senior Software Engineer — Infosys, Hyderabad (2021 – Present)
- Led development of customer-facing React dashboards used by 50,000+ users
- Built REST APIs with Node.js and Express; deployed on AWS Lambda
- Reduced page load time by 40% through code splitting and lazy loading

Software Developer — Wipro Technologies (2019 – 2021)
- Developed Angular/React frontends for banking application
- Integrated PostgreSQL and MongoDB databases

EDUCATION
B.Tech Computer Science — JNTU Hyderabad, 2019

SKILLS
React, TypeScript, Node.js, Express, PostgreSQL, MongoDB, AWS, Docker, Git, REST APIs, GraphQL, Python`;

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

function getFileExt(filename) {
  return filename ? '.' + filename.split('.').pop().toLowerCase() : '';
}

function isAcceptedFile(file) {
  const ext = getFileExt(file.name);
  return ACCEPTED_EXTENSIONS.includes(ext);
}

function getFileLabel(file) {
  return getFileExt(file.name).replace('.', '').toUpperCase();
}

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
    </div>
  );
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'manual'

  // File upload state
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'paste'
  const [resumeText, setResumeText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState('');
  const [matching, setMatching] = useState(false);
  const [jobMatches, setJobMatches] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Manual form state
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

  const runJobMatching = async (parsedData, text) => {
    setMatching(true);
    try {
      const { matches } = await api.matchJobs({
        skills: parsedData.skills,
        currentTitle: parsedData.currentTitle,
        experienceYears: parsedData.experienceYears,
        resumeSummary: parsedData.resumeSummary,
      });
      setJobMatches(matches);
    } catch { /* non-critical */ }
    setMatching(false);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!isAcceptedFile(file)) {
      setParseError('Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setParseError('File too large. Maximum size is 5MB.');
      return;
    }
    setSelectedFile(file);
    setParseError('');
    setParsed(null);
    setJobMatches(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleParseFile = async () => {
    if (!selectedFile) return;
    setParsing(true);
    setParsed(null);
    setJobMatches(null);
    setParseError('');
    try {
      const { parsed: data, extractedText } = await api.uploadResume(selectedFile);
      setParsed(data);
      setResumeText(extractedText || '');
      await runJobMatching(data, extractedText);
    } catch (err) {
      setParseError(err.message || 'Failed to parse the file. Try pasting the text instead.');
    } finally {
      setParsing(false);
    }
  };

  const handleParseText = async (text) => {
    const input = text || resumeText;
    if (!input.trim()) return;
    setParsing(true);
    setParsed(null);
    setJobMatches(null);
    setParseError('');
    try {
      const { parsed: data } = await api.parseResume(input);
      setParsed(data);
      await runJobMatching(data, input);
    } catch (err) {
      setParseError(err.message || 'Parsing failed. Please try again.');
    } finally {
      setParsing(false);
    }
  };

  const handleDemoResume = () => {
    setUploadMode('paste');
    setResumeText(DEMO_RESUME);
    handleParseText(DEMO_RESUME);
  };

  const handleAddParsed = async () => {
    if (!parsed) return;
    setSubmitting(true);
    try {
      await api.createCandidate({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location,
        currentTitle: parsed.currentTitle,
        currentCompany: parsed.currentCompany,
        experienceYears: parsed.experienceYears,
        skills: parsed.skills,
        linkedinUrl: parsed.linkedinUrl,
        resumeText: resumeText,
        source: 'website',
        // Persist AI-generated summary to DB immediately
        aiSummary: parsed.resumeSummary
          ? JSON.stringify({ summary: parsed.resumeSummary, topSkills: parsed.skills || [], experienceLevel: `${parsed.experienceYears || 0}+ years`, cultureFit: 'Assessed via AI resume parse' })
          : undefined,
      });
      resetForm();
      fetchCandidates();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setParsed(null);
    setSelectedFile(null);
    setResumeText('');
    setJobMatches(null);
    setParseError('');
    setUploadMode('file');
    setActiveTab('ai');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total candidates</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Candidate
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search candidates by name, email, company..." className="input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Add Candidate Panel */}
      {showForm && (
        <div className="card border-2 border-primary-100 shadow-lg">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Candidate</h2>
                <p className="text-xs text-gray-500">Use AI to parse a resume or enter details manually</p>
              </div>
            </div>
            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'ai' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sparkles className="w-4 h-4" /> AI Resume Parser
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'manual' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText className="w-4 h-4" /> Manual Entry
            </button>
          </div>

          {/* AI PARSER TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-5">
              {!parsed && (
                <>
                  {/* Upload / Paste toggle */}
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit text-sm">
                    <button
                      onClick={() => { setUploadMode('file'); setParseError(''); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${uploadMode === 'file' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    <button
                      onClick={() => { setUploadMode('paste'); setParseError(''); }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${uploadMode === 'paste' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <FileText className="w-3.5 h-3.5" /> Paste Text
                    </button>
                  </div>

                  {/* FILE UPLOAD MODE */}
                  {uploadMode === 'file' && (
                    <div className="space-y-4">
                      {/* Drop zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-primary-400 bg-primary-50 scale-[1.01]' : selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/40'}`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                        />

                        {!selectedFile ? (
                          <>
                            <div className="flex justify-center mb-4">
                              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center">
                                <Upload className="w-8 h-8 text-primary-500" />
                              </div>
                            </div>
                            <p className="text-base font-semibold text-gray-700">Drag & drop your resume here</p>
                            <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                              {['PDF', 'DOC', 'DOCX', 'TXT'].map(fmt => (
                                <span key={fmt} className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600 shadow-sm">{fmt}</span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Maximum file size: 5MB</p>
                          </>
                        ) : (
                          <div className="flex items-center justify-center gap-4">
                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <File className="w-7 h-7 text-green-600" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-800 truncate max-w-xs">{selectedFile.name}</p>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {getFileLabel(selectedFile)} · {(selectedFile.size / 1024).toFixed(1)} KB
                              </p>
                              <p className="text-xs text-green-600 mt-1 font-medium">✓ Ready to parse</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setParseError(''); }}
                              className="ml-auto p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Supported formats info */}
                      {!selectedFile && (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { fmt: 'PDF', desc: 'Adobe PDF', color: 'bg-red-50 border-red-200 text-red-700' },
                            { fmt: 'DOC', desc: 'Microsoft Word', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                            { fmt: 'DOCX', desc: 'Word (.docx)', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                            { fmt: 'TXT', desc: 'Plain Text', color: 'bg-gray-50 border-gray-200 text-gray-600' },
                          ].map(({ fmt, desc, color }) => (
                            <div key={fmt} className={`flex flex-col items-center gap-1 p-3 border rounded-xl text-center ${color}`}>
                              <span className="text-lg font-bold">{fmt}</span>
                              <span className="text-xs opacity-70">{desc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {parseError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {parseError}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleParseFile}
                          disabled={parsing || !selectedFile}
                          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {parsing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> AI is reading your resume...</>
                          ) : (
                            <><Bot className="w-4 h-4" /> Parse Resume with AI</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleDemoResume}
                          disabled={parsing}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" /> Demo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PASTE TEXT MODE */}
                  {uploadMode === 'paste' && (
                    <div className="space-y-3">
                      <textarea
                        className="input h-48 font-mono text-sm resize-none"
                        placeholder="Paste resume content here... (name, email, phone, work experience, skills etc.)"
                        value={resumeText}
                        onChange={e => setResumeText(e.target.value)}
                      />
                      {parseError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {parseError}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleParseText()}
                          disabled={parsing || !resumeText.trim()}
                          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                        >
                          {parsing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> AI is parsing...</>
                          ) : (
                            <><Bot className="w-4 h-4" /> Parse with AI</>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleDemoResume}
                          disabled={parsing}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg border border-primary-200 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" /> Demo
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Parsed Result */}
              {parsed && (
                <div className="space-y-5">
                  {/* Success header */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800">Resume parsed successfully!</p>
                      <p className="text-xs text-green-600 mt-0.5">Review the extracted data below before adding to the system.</p>
                    </div>
                    <button onClick={() => { setParsed(null); setJobMatches(null); setResumeText(''); }} className="text-xs text-green-700 underline hover:no-underline">Re-parse</button>
                  </div>

                  {/* Parsed data grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { label: 'First Name', key: 'firstName' },
                      { label: 'Last Name', key: 'lastName' },
                      { label: 'Email', key: 'email' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Location', key: 'location' },
                      { label: 'Current Title', key: 'currentTitle' },
                      { label: 'Current Company', key: 'currentCompany' },
                      { label: 'Years of Experience', key: 'experienceYears' },
                      { label: 'LinkedIn URL', key: 'linkedinUrl' },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="label">{label}</label>
                        <input
                          className="input"
                          value={parsed[key] || ''}
                          onChange={e => setParsed({ ...parsed, [key]: e.target.value })}
                        />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="label">Skills (extracted)</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[48px]">
                        {(parsed.skills || []).map((skill, i) => (
                          <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            {skill}
                            <button onClick={() => setParsed({ ...parsed, skills: parsed.skills.filter((_, idx) => idx !== i) })} className="hover:text-red-500 ml-0.5">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    {parsed.resumeSummary && (
                      <div className="md:col-span-2">
                        <label className="label flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-primary-500" /> AI-Generated Summary</label>
                        <div className="p-3 bg-primary-50 border border-primary-100 rounded-lg text-sm text-gray-700 italic">{parsed.resumeSummary}</div>
                      </div>
                    )}
                  </div>

                  {/* Job Matching Results */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                      <Target className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Auto Job Matching</p>
                        <p className="text-xs text-gray-500">AI matched this candidate against all open positions</p>
                      </div>
                      {matching && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                    </div>
                    <div className="divide-y divide-gray-100">
                      {matching && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                          Finding best job matches...
                        </div>
                      )}
                      {!matching && jobMatches && jobMatches.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">No open positions to match against.</div>
                      )}
                      {!matching && jobMatches && jobMatches.map((match, i) => (
                        <div key={i} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${match.matchScore >= 80 ? 'bg-green-100 text-green-700' : match.matchScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-medium text-sm text-gray-900 truncate">{match.job?.title || 'Unknown Job'}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${match.matchScore >= 80 ? 'bg-green-100 text-green-700' : match.matchScore >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                                  {match.matchScore}% match
                                </span>
                              </div>
                              <ScoreBar score={match.matchScore} />
                              {match.reasons && match.reasons.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {match.reasons.map((r, ri) => (
                                    <p key={ri} className="text-xs text-gray-500 flex items-start gap-1.5">
                                      <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" /> {r}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {match.missingSkills && match.missingSkills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="text-xs text-gray-400">Missing:</span>
                                  {match.missingSkills.map((s, si) => (
                                    <span key={si} className="text-xs px-1.5 py-0.5 bg-red-50 text-red-500 rounded border border-red-100">{s}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleAddParsed}
                      disabled={submitting}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {submitting ? 'Adding...' : 'Add Candidate to System'}
                    </button>
                    <button type="button" onClick={resetForm} className="btn-secondary px-6">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANUAL ENTRY TAB */}
          {activeTab === 'manual' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="label">First Name *</label><input required className="input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                <div><label className="label">Last Name *</label><input required className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                <div><label className="label">Email *</label><input required type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><label className="label">Location</label><input className="input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
                <div><label className="label">Current Title</label><input className="input" value={form.currentTitle} onChange={e => setForm({...form, currentTitle: e.target.value})} /></div>
                <div><label className="label">Current Company</label><input className="input" value={form.currentCompany} onChange={e => setForm({...form, currentCompany: e.target.value})} /></div>
                <div><label className="label">Years of Experience</label><input type="number" step="0.5" className="input" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} /></div>
                <div><label className="label">Skills (comma-separated)</label><input className="input" placeholder="React, Node.js, TypeScript..." value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} /></div>
                <div><label className="label">Source</label>
                  <select className="input" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="job-board">Job Board</option>
                    <option value="agency">Agency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Resume Text</label><textarea className="input h-24" value={form.resumeText} onChange={e => setForm({...form, resumeText: e.target.value})} placeholder="Paste resume content here..." /></div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? 'Adding...' : 'Add Candidate'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Candidates List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No candidates found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first candidate using the AI Resume Parser</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {candidates.map(c => (
            <Link key={c.id} to={`/candidates/${c.id}`} className="card hover:shadow-md hover:border-primary-200 border border-transparent transition-all group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-100 to-indigo-100 text-primary-700 rounded-xl text-lg font-bold flex-shrink-0">
                    {c.firstName[0]}{c.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{c.firstName} {c.lastName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                      {c.currentTitle && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{c.currentTitle}</span>}
                      {c.currentCompany && <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{c.currentCompany}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{c.location}</span>}
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{c.email}</span>
                    </div>
                    {c.skills && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills).slice(0, 5).map(skill => (
                          <span key={skill} className="badge bg-gray-100 text-gray-600 text-xs">{skill}</span>
                        ))}
                        {(typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills).length > 5 && (
                          <span className="badge bg-gray-100 text-gray-400 text-xs">+{(typeof c.skills === 'string' ? JSON.parse(c.skills) : c.skills).length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`badge ${sourceColors[c.source] || 'bg-gray-100 text-gray-700'} capitalize text-xs`}>{c.source?.replace('-', ' ')}</span>
                  {c.experienceYears && <span className="text-xs text-gray-500 font-medium">{c.experienceYears} yrs exp</span>}
                  {c.Applications && c.Applications.length > 0 && (
                    <span className="text-xs text-primary-600 font-medium">{c.Applications.length} application{c.Applications.length > 1 ? 's' : ''}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
