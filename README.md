# ATS - AI-Powered Application Tracking System

A high-performance, web-based HR Application Tracking System powered by Claude AI. Built with React, Node.js/Express, and Tailwind CSS.

## Features

### Core Modules
- **Job Posting Management** — Create, edit, and publish job openings
- **Candidate Tracking** — Centralized dashboard for resumes and profiles
- **AI-Powered Screening** — Claude AI resume parsing, scoring, and recommendations
- **Interview Scheduling** — Schedule interviews with AI-generated questions
- **Analytics & Reporting** — Hiring funnel metrics, source analysis, AI insights

### Claude AI Integration
- **Resume Screening** — Automated fit scoring (0-100) with strengths/weaknesses analysis
- **Interview Questions** — Role-specific questions generated for each interview
- **Email Generation** — Rejection, offer, and follow-up emails with personalized tone
- **Candidate Summarization** — AI-powered profile summaries
- **Hiring Insights** — Trend analysis and bottleneck detection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Lucide Icons |
| Backend | Node.js, Express, Sequelize ORM |
| Database | SQLite (dev) / PostgreSQL (production) |
| AI | Claude AI (Anthropic API) |
| Deployment | Docker, Docker Compose |

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# Seed database with sample data
cd backend && npm run seed && cd ..

# Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Open http://localhost:5173

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ats.com | password123 |
| Recruiter | recruiter@ats.com | password123 |
| Hiring Manager | manager@ats.com | password123 |

### Claude AI Setup
1. Get an API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `backend/.env`: `ANTHROPIC_API_KEY=your-key`
3. AI features work with mock data when no key is configured

## Docker Deployment

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |
| GET | /api/jobs | List jobs |
| POST | /api/jobs | Create job |
| GET | /api/candidates | List candidates |
| POST | /api/candidates/:id/ai-summary | Generate AI summary |
| GET | /api/applications | List applications |
| POST | /api/applications/:id/ai-screen | AI resume screening |
| POST | /api/applications/:id/generate-email | AI email generation |
| GET | /api/interviews | List interviews |
| POST | /api/interviews/:id/generate-questions | AI interview questions |
| GET | /api/analytics/dashboard | Dashboard metrics |
| GET | /api/analytics/hiring-funnel | Funnel data |
| GET | /api/analytics/ai-insights | AI-powered insights |

## Architecture

```
ATS/
├── backend/
│   ├── config/          # Database config, seed data
│   ├── middleware/       # Auth middleware (JWT, RBAC)
│   ├── models/          # Sequelize models (User, Job, Candidate, Application, Interview)
│   ├── routes/          # Express route handlers
│   ├── services/        # Claude AI service layer
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Layout, shared components
│   │   ├── context/     # Auth context provider
│   │   ├── pages/       # Dashboard, Jobs, Candidates, Applications, Interviews, Analytics
│   │   ├── api.js       # API client
│   │   └── App.jsx      # Router setup
│   └── index.html
├── Dockerfile
└── docker-compose.yml
```
