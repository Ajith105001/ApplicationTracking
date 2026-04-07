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
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

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
  getDashboard() {
    return this.get('/analytics/dashboard');
  }

  getHiringFunnel(jobId) {
    return this.get(`/analytics/hiring-funnel${jobId ? `?jobId=${jobId}` : ''}`);
  }

  getAiInsights() {
    return this.get('/analytics/ai-insights');
  }
}

const api = new ApiClient();
export default api;
