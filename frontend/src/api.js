const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('ats_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('ats_token', token);
    } else {
      localStorage.removeItem('ats_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {};

    // Don't set Content-Type for FormData — browser sets it with boundary automatically
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    Object.assign(headers, options.headers);

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.errors?.[0]?.msg || 'Request failed');
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth
  login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  register(data) {
    return this.post('/auth/register', data);
  }

  getMe() {
    return this.get('/auth/me');
  }

  updateProfile(data) {
    return this.put('/auth/me', data);
  }

  updatePassword(data) {
    return this.put('/auth/me/password', data);
  }

  // Jobs
  getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/jobs${query ? `?${query}` : ''}`);
  }

  getJob(id) {
    return this.get(`/jobs/${id}`);
  }

  createJob(data) {
    return this.post('/jobs', data);
  }

  updateJob(id, data) {
    return this.put(`/jobs/${id}`, data);
  }

  deleteJob(id) {
    return this.delete(`/jobs/${id}`);
  }

  // Candidates
  getCandidates(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/candidates${query ? `?${query}` : ''}`);
  }

  getCandidate(id) {
    return this.get(`/candidates/${id}`);
  }

  createCandidate(data) {
    return this.post('/candidates', data);
  }

  updateCandidate(id, data) {
    return this.put(`/candidates/${id}`, data);
  }

  generateCandidateSummary(id) {
    return this.post(`/candidates/${id}/ai-summary`);
  }

  parseResume(resumeText) {
    return this.post('/candidates/parse-resume', { resumeText });
  }

  uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    return this.request('/candidates/upload-resume', {
      method: 'POST',
      body: formData,
    });
  }

  matchJobs(candidateData) {
    return this.post('/candidates/match-jobs', { candidateData });
  }

  // Applications
  getApplications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/applications${query ? `?${query}` : ''}`);
  }

  getApplication(id) {
    return this.get(`/applications/${id}`);
  }

  createApplication(data) {
    return this.post('/applications', data);
  }

  updateApplicationStatus(id, data) {
    return this.put(`/applications/${id}/status`, data);
  }

  screenApplication(id) {
    return this.post(`/applications/${id}/ai-screen`);
  }

  generateEmail(id, data) {
    return this.post(`/applications/${id}/generate-email`, data);
  }

  generateRemarks(id) {
    return this.post(`/applications/${id}/generate-remarks`);
  }

  // Interviews
  getInterviews(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/interviews${query ? `?${query}` : ''}`);
  }

  getInterview(id) {
    return this.get(`/interviews/${id}`);
  }

  createInterview(data) {
    return this.post('/interviews', data);
  }

  updateInterview(id, data) {
    return this.put(`/interviews/${id}`, data);
  }

  generateInterviewQuestions(id) {
    return this.post(`/interviews/${id}/generate-questions`);
  }

  // Analytics
  getDashboard(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/analytics/dashboard${query ? `?${query}` : ''}`);
  }

  getHiringFunnel(jobId) {
    return this.get(`/analytics/hiring-funnel${jobId ? `?jobId=${jobId}` : ''}`);
  }

  getAiInsights() {
    return this.get('/analytics/ai-insights');
  }

  // User Management (admin only)
  getUsers() {
    return this.get('/auth/users');
  }

  createUser(data) {
    return this.post('/auth/users', data);
  }

  updateUser(id, data) {
    return this.request(`/auth/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }

  // Offer Letters
  getOffers() {
    return this.get('/offers');
  }

  createOffer(data) {
    return this.post('/offers', data);
  }

  updateOffer(id, data) {
    return this.put(`/offers/${id}`, data);
  }

  deleteOffer(id) {
    return this.delete(`/offers/${id}`);
  }
}

const api = new ApiClient();
export default api;
