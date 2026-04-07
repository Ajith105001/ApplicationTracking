/*==========================================================================
 *  ATS — AI-Powered Application Tracking System
 *  COMPLETE DEMO PRESENTATION GUIDE
 *  ─────────────────────────────────────────────────────────────────
 *  Date   : April 2026
 *  Stack  : React 18 + Vite + Tailwind │ Node/Express │ SQLite │ Claude AI
 *  URLs   : Frontend → http://localhost:5173
 *           Backend  → http://localhost:3001/api
 *=========================================================================*/

/*──────────────────────────────────────────────────────────────────────────
 *  TABLE OF CONTENTS
 *──────────────────────────────────────────────────────────────────────────
 *
 *  PART 0  — Project Overview & Architecture
 *  PART 1  — How to Start the Application
 *  PART 2  — DEMO FLOW: Authentication & Role-Based Access
 *  PART 3  — DEMO FLOW: Dashboard Overview
 *  PART 4  — DEMO FLOW: Job Posting Management
 *  PART 5  — DEMO FLOW: Candidate Management
 *  PART 6  — DEMO FLOW: Application Tracking & AI Screening
 *  PART 7  — DEMO FLOW: Interview Scheduling & AI Questions
 *  PART 8  — DEMO FLOW: Analytics & AI Insights
 *  PART 9  — DEMO FLOW: Email Generation (AI)
 *  PART 10 — Technical Architecture Deep-Dive
 *  PART 11 — Security Features
 *  PART 12 — Deployment with Docker
 *  PART 13 — Claude AI Integration Details
 *  PART 14 — Database Schema & Relationships
 *  PART 15 — API Reference (All Endpoints)
 *
 *─────────────────────────────────────────────────────────────────────────*/


// ═══════════════════════════════════════════════════════════════════════════
// PART 0 — PROJECT OVERVIEW & ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT IS THIS APPLICATION?
// ─────────────────────────
// This is a full-stack, AI-powered Applicant Tracking System (ATS) that
// helps HR teams manage the entire recruitment lifecycle:
//
//   1. Post job openings
//   2. Receive and track candidate applications
//   3. AI-screen resumes automatically (Claude AI scores 0–100)
//   4. Schedule interviews with AI-generated questions
//   5. Move candidates through a hiring pipeline
//   6. Generate professional emails (rejection, offer, follow-up)
//   7. View analytics dashboards with AI-powered hiring insights
//
//
// PROJECT FOLDER STRUCTURE
// ────────────────────────
//
//   D:\ATS\
//   │
//   ├── backend\                    ← Node.js + Express API Server
//   │   ├── config\
//   │   │   ├── database.js         ← Sequelize DB configuration
//   │   │   └── seed.js             ← Seeds demo data (users, jobs, candidates)
//   │   ├── middleware\
//   │   │   └── auth.js             ← JWT authentication + role authorization
//   │   ├── models\
//   │   │   ├── User.js             ← User model (admin, recruiter, hiring_manager)
//   │   │   ├── Job.js              ← Job posting model
//   │   │   ├── Candidate.js        ← Candidate profile model
//   │   │   ├── Application.js      ← Application (links candidate ↔ job)
//   │   │   ├── Interview.js        ← Interview scheduling model
//   │   │   └── index.js            ← Model associations (relationships)
//   │   ├── routes\
//   │   │   ├── auth.js             ← Login, Register, Get Profile
//   │   │   ├── jobs.js             ← CRUD for job postings
//   │   │   ├── candidates.js       ← CRUD for candidates + AI summary
//   │   │   ├── applications.js     ← Application tracking + AI screening + emails
//   │   │   ├── interviews.js       ← Interview scheduling + AI questions
//   │   │   └── analytics.js        ← Dashboard metrics + funnel + AI insights
//   │   ├── services\
//   │   │   └── claudeService.js    ← Claude AI integration (all AI features)
//   │   ├── server.js               ← Express app entry point
//   │   ├── .env                    ← Environment variables
//   │   └── package.json
//   │
//   ├── frontend\                   ← React + Vite + Tailwind CSS
//   │   ├── src\
//   │   │   ├── context\
//   │   │   │   └── AuthContext.jsx  ← Authentication state management
//   │   │   ├── components\
//   │   │   │   └── Layout.jsx       ← Sidebar navigation + responsive layout
//   │   │   ├── pages\
//   │   │   │   ├── Login.jsx        ← Login page with demo credentials
//   │   │   │   ├── Dashboard.jsx    ← Overview metrics + pipeline chart
//   │   │   │   ├── Jobs.jsx         ← Job listing + create form
//   │   │   │   ├── JobDetail.jsx    ← Single job view + status management
//   │   │   │   ├── Candidates.jsx   ← Candidate listing + add form
//   │   │   │   ├── CandidateDetail.jsx ← Profile + AI summary
//   │   │   │   ├── Applications.jsx ← Application list + status filter
//   │   │   │   ├── ApplicationDetail.jsx ← AI screening + email gen + pipeline
//   │   │   │   ├── Interviews.jsx   ← Interview list + AI questions
//   │   │   │   └── Analytics.jsx    ← Charts + funnel + AI insights
//   │   │   ├── api.js              ← API client (all HTTP calls)
//   │   │   ├── App.jsx             ← React Router setup
//   │   │   ├── main.jsx            ← App entry point
//   │   │   └── index.css           ← Tailwind + custom styles
//   │   ├── index.html
//   │   ├── vite.config.js
//   │   ├── tailwind.config.js
//   │   └── package.json
//   │
//   ├── Dockerfile                  ← Production Docker image
//   ├── docker-compose.yml          ← Full-stack with PostgreSQL
//   ├── .gitignore
//   └── README.md


// ═══════════════════════════════════════════════════════════════════════════
// PART 1 — HOW TO START THE APPLICATION
// ═══════════════════════════════════════════════════════════════════════════
//
// STEP 1: Open TWO terminals
//
// STEP 2: Terminal 1 — Start Backend
//   cd D:\ATS\backend
//   npm install          ← (first time only)
//   npm run seed         ← Seeds database with demo data (first time only)
//   npm run dev          ← Starts Express server on port 3001
//
//   You should see:
//     ⚠ Claude AI: No valid API key. AI features will return mock data.
//     📦 Database connected & synced.
//     🚀 ATS Server running on http://localhost:3001
//
// STEP 3: Terminal 2 — Start Frontend
//   cd D:\ATS\frontend
//   npm install          ← (first time only)
//   npm run dev          ← Starts Vite dev server on port 5173
//
//   You should see:
//     VITE v5.x ready in ~500 ms
//     ➜ Local: http://localhost:5173/
//
// STEP 4: Open browser → http://localhost:5173
//
//
// ┌────────────────────────────────────────────────────┐
// │  NOTE: AI features work with MOCK DATA by default. │
// │  To use real Claude AI, add your Anthropic API key  │
// │  to backend/.env:                                   │
// │    ANTHROPIC_API_KEY=sk-ant-xxxxx                   │
// └────────────────────────────────────────────────────┘


// ═══════════════════════════════════════════════════════════════════════════
// PART 2 — DEMO FLOW: AUTHENTICATION & ROLE-BASED ACCESS
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// The login page features a split-screen design:
//   LEFT  → Brand panel with stats (85% faster screening, 3x efficient, 92% satisfaction)
//   RIGHT → Login form with pre-filled demo credentials
//
// DEMO ACCOUNTS (pre-seeded):
// ┌──────────────────┬────────────────────┬─────────────┬──────────────────────────────┐
// │ Role             │ Email              │ Password    │ Permissions                  │
// ├──────────────────┼────────────────────┼─────────────┼──────────────────────────────┤
// │ Admin            │ admin@ats.com      │ password123 │ Full access (CRUD + delete)  │
// │ Recruiter        │ recruiter@ats.com  │ password123 │ Manage jobs, screen, schedule │
// │ Hiring Manager   │ manager@ats.com    │ password123 │ Manage jobs, view candidates  │
// └──────────────────┴────────────────────┴─────────────┴──────────────────────────────┘
//
// DEMO STEPS:
//   1. Open http://localhost:5173 → login page appears
//   2. Show the demo credentials box at the bottom
//   3. Click "Sign in" with default admin@ats.com / password123
//   4. → Redirects to Dashboard
//   5. Point out: sidebar shows user name + role at bottom
//   6. Click logout (LogOut icon) → returns to login
//   7. Login as recruiter@ats.com → show same dashboard but different role label
//
// HOW AUTH WORKS (technical):
//   • POST /api/auth/login → returns JWT token
//   • Token stored in localStorage as 'ats_token'
//   • Every API call includes Authorization: Bearer <token>
//   • Backend middleware validates JWT, loads user, checks role
//   • Passwords hashed with bcrypt (12 rounds)


// ═══════════════════════════════════════════════════════════════════════════
// PART 3 — DEMO FLOW: DASHBOARD OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// After login, the dashboard gives a complete hiring overview at a glance.
//
// DEMO STEPS:
//   1. After login → you land on Dashboard (default route "/")
//   2. TOP ROW — 6 Stat Cards (clickable, link to respective pages):
//      ┌──────────────────┬────────────────┬──────────────────┐
//      │ Active Jobs: 4   │ Candidates: 6  │ Pending Review: 1│
//      ├──────────────────┼────────────────┼──────────────────┤
//      │ Upcoming Int.: 3 │ Hired: 0       │ Applications: 6  │
//      └──────────────────┴────────────────┴──────────────────┘
//
//   3. MIDDLE SECTION — Application Pipeline (bar chart):
//      Shows how many applications are in each stage:
//      • new → screening → shortlisted → interview → technical → offer → hired → rejected
//      • Each bar has a progress indicator showing % of total
//
//   4. RIGHT SIDEBAR:
//      • Average AI Score (e.g., 82.2 / 100) with progress bar
//      • Candidate Sources breakdown (LinkedIn, Referral, Website, Job Board)
//      • Jobs by Department (Engineering: 2, Data: 1, Design: 1, etc.)
//
//   5. Point out the "AI Active" badge in the header — shows Claude is integrated
//
// KEY TALKING POINTS:
//   • "One glance tells you the health of your entire hiring pipeline"
//   • "AI Score shows average candidate quality — higher means better applicant pool"
//   • "Click any card to drill into details"


// ═══════════════════════════════════════════════════════════════════════════
// PART 4 — DEMO FLOW: JOB POSTING MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// Full job lifecycle: create → publish → manage → close
//
// DEMO STEPS:
//
// (A) VIEW JOB LISTINGS:
//   1. Click "Jobs" in sidebar
//   2. Shows 5 pre-seeded jobs with:
//      • Title, status badge (published/draft), priority badge
//      • Location, type, experience, salary range
//      • Skill tags (React, TypeScript, etc.)
//      • Application count
//   3. Use search box → type "Engineer" → filters to matching jobs
//   4. Use status dropdown → select "Published" → shows only published jobs
//
// (B) CREATE A NEW JOB:
//   1. Click blue "+ New Job" button (top right)
//   2. Form opens inline with fields:
//      • Title: "Machine Learning Engineer"
//      • Department: "AI/ML"
//      • Location: "Remote"
//      • Type: "Full-time"
//      • Experience: "3+ years"
//      • Skills: "Python, PyTorch, TensorFlow, MLOps"
//      • Salary Min: 140000, Max: 200000
//      • Description: "Build and deploy ML models..."
//      • Status: "Published" (to make it live immediately)
//      • Priority: "High"
//   3. Click "Create Job"
//   4. New job appears in the list with "published" badge
//
// (C) VIEW JOB DETAIL:
//   1. Click on "Senior Frontend Engineer" card
//   2. Detail page shows:
//      • Full job description, requirements, responsibilities
//      • Skill tags
//      • Hiring Manager name
//      • Action buttons: "Publish" / "Close" / "Reopen"
//      • List of applications for this job
//   3. Click "Close" → status changes to "closed"
//   4. Click "Reopen" → status changes back to "published"
//
// KEY TALKING POINTS:
//   • "Recruiters can create and publish jobs in under 60 seconds"
//   • "Status management (draft → published → closed) prevents stale listings"
//   • "Skills are searchable and displayed as tags for quick scanning"


// ═══════════════════════════════════════════════════════════════════════════
// PART 5 — DEMO FLOW: CANDIDATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// Centralized candidate database with profiles, skills, AI summaries
//
// DEMO STEPS:
//
// (A) VIEW CANDIDATE LIST:
//   1. Click "Candidates" in sidebar
//   2. Shows 6 pre-seeded candidates with:
//      • Avatar circle (initials), name
//      • Current title + company
//      • Location, email
//      • Skill badges
//      • Source badge (LinkedIn, Referral, Website, Job Board)
//      • Years of experience
//      • Number of applications
//   3. Use search → type "Priya" → filters to Priya Sharma
//
// (B) ADD A NEW CANDIDATE:
//   1. Click "+ Add Candidate" button
//   2. Fill the form:
//      • First Name: "James"
//      • Last Name: "Wilson"
//      • Email: "james@example.com"
//      • Phone: "+1-555-9999"
//      • Location: "Denver, CO"
//      • Current Title: "Full Stack Developer"
//      • Company: "StartupXYZ"
//      • Years of Experience: 3
//      • Skills: "React, Node.js, PostgreSQL, Docker"
//      • Source: "Referral"
//      • Resume Text: (paste a resume summary)
//   3. Click "Add Candidate" → appears in list
//
// (C) VIEW CANDIDATE DETAIL + AI SUMMARY:
//   1. Click on "David Kim" (Staff Engineer, 10 yrs experience)
//   2. Detail page shows:
//      • Large avatar + name + title
//      • Contact info (email, phone, location)
//      • Skills as tags
//      • Full resume text
//      • Application history (links to each application)
//   3. RIGHT SIDEBAR — AI Summary Panel:
//      • Click "Generate" button (with sparkle icon)
//      • AI analyzes the resume and returns:
//        ─ Summary paragraph
//        ─ Top Skills
//        ─ Experience Level
//        ─ Culture Fit assessment
//      • This is saved to the database for future reference
//
// KEY TALKING POINTS:
//   • "Every candidate has a single profile — no matter how many jobs they apply to"
//   • "AI Summary saves recruiters 5-10 minutes of manual resume reading per candidate"
//   • "Source tracking shows which channels bring the best candidates"


// ═══════════════════════════════════════════════════════════════════════════
// PART 6 — DEMO FLOW: APPLICATION TRACKING & AI SCREENING ⭐ KEY FEATURE
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// This is the CORE of the ATS — the hiring pipeline with AI-powered screening.
//
// DEMO STEPS:
//
// (A) VIEW ALL APPLICATIONS:
//   1. Click "Applications" in sidebar
//   2. Shows 6 pre-seeded applications with:
//      • Candidate avatar + name
//      • Status badge (new, screening, interview, offer, etc.)
//      • Job title + department
//      • Star rating (1-5)
//      • AI Score badge (colored: green ≥80, amber ≥60, red <60)
//      • Bot icon (indicates AI has screened this application)
//   3. FILTER BY STATUS:
//      • Click status pills at top: All | new | screening | shortlisted | interview | ...
//      • Click "interview" → shows only applications in interview stage
//      • Click "offer" → shows David Kim (95% AI score)
//
// (B) VIEW APPLICATION DETAIL (the most feature-rich page):
//   1. Click on "Alex Thompson" application (88% AI score)
//   2. HEADER shows:
//      • Candidate name, title, company
//      • Job they applied for (clickable link)
//      • Current status badge
//      • AI Score pill (88%)
//
//   3. STATUS PIPELINE (interactive):
//      ┌─────┬───────────┬─────────────┬───────────┬───────────┬───────┬───────┬──────────┐
//      │ new │ screening │ shortlisted │ interview │ technical │ offer │ hired │ rejected │
//      └─────┴───────────┴─────────────┴───────────┴───────────┴───────┴───────┴──────────┘
//      • Click any stage → moves candidate to that stage instantly
//      • Current stage is highlighted in blue
//      • Past stages are in light blue
//      • DEMO: Click "shortlisted" → "interview" → "technical" → "offer"
//      • DEMO: Click "rejected" to show rejection flow
//
//   4. AI SCREENING PANEL ⭐:
//      • Click "Screen with AI" button (sparkle icon)
//      • AI analyzes resume against job description
//      • Returns:
//        ─ Fit Score: 88/100 (large number with progress bar)
//        ─ Recommendation: "Recommended for next round"
//        ─ Summary: 2-3 sentence analysis
//        ─ Strengths (green checkmarks):
//          ✓ Strong React/TS skills
//          ✓ Performance optimization experience
//          ✓ Component library experience
//        ─ Weaknesses (red X marks):
//          ✗ Could have more leadership experience
//      • Click "Re-screen" to run again (e.g., after job desc changes)
//
//   5. RIGHT SIDEBAR:
//      • Star Rating: Click stars to rate 1-5
//      • Recruiter Notes: Type notes, click "Save Notes"
//      • Candidate Info: Quick view of contact details
//      • Interviews: List of scheduled interviews
//
// (C) COMPARE CANDIDATES:
//   1. Go back to Applications list
//   2. Filter by "offer" → David Kim (95%)
//   3. Filter by "screening" → Sophie Martinez (52%)
//   4. Point out: "AI helps objectively compare candidates"
//      • David Kim (95%): 10 yrs exp, leadership, architecture → "Strong Hire"
//      • Sophie Martinez (52%): 2 yrs exp, no TypeScript → "Not recommended"
//
// KEY TALKING POINTS:
//   • "AI screening takes seconds, not hours"
//   • "Objective scoring reduces unconscious bias"
//   • "Pipeline view lets you track exactly where every candidate is"
//   • "Strengths/weaknesses give recruiters actionable context"


// ═══════════════════════════════════════════════════════════════════════════
// PART 7 — DEMO FLOW: INTERVIEW SCHEDULING & AI QUESTIONS
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// Schedule interviews and get AI-generated questions tailored to each role.
//
// DEMO STEPS:
//
// (A) VIEW INTERVIEWS:
//   1. Click "Interviews" in sidebar
//   2. Shows 3 pre-seeded interviews:
//      • Each card shows:
//        ─ Interview type icon (Video, Technical, Phone)
//        ─ Type label + status badge (scheduled/completed/cancelled)
//        ─ Candidate name + job title
//        ─ Date, time, duration
//        ─ Action buttons: Complete | Cancel
//   3. FILTER: Click "scheduled" to see only upcoming interviews
//
// (B) SCHEDULE A NEW INTERVIEW:
//   1. Click "+ Schedule Interview" button
//   2. Form opens:
//      • Application: Select from dropdown (shows "Candidate - Job Title")
//      • Type: Video / Phone / Onsite / Technical / Panel / Final
//      • Date & Time: Pick a future date
//      • Duration: 60 minutes
//      • Meeting Link: https://meet.example.com/interview-new
//   3. Click "Schedule" → new interview appears
//   4. The associated application automatically moves to "interview" status
//
// (C) AI INTERVIEW QUESTIONS ⭐:
//   1. Find "Technical Interview — Alex Thompson" card
//   2. At the bottom of the card, see "AI Interview Questions" section
//   3. Click "Generate Questions" (sparkle icon)
//   4. AI generates 5 role-specific questions:
//      ┌───┬──────────────────────────────────────────────────────────────────┬──────────┐
//      │ # │ Question                                                         │ Category │
//      ├───┼──────────────────────────────────────────────────────────────────┼──────────┤
//      │ 1 │ Describe a challenging project where you learned new tech fast   │ adapt.   │
//      │ 2 │ How do you approach code reviews and giving feedback?            │ collab.  │
//      │ 3 │ Walk through debugging a complex production issue                │ problem  │
//      │ 4 │ How do you prioritize tasks across multiple projects?            │ time mgt │
//      │ 5 │ Describe experience with CI/CD pipelines and deployment          │ tech     │
//      └───┴──────────────────────────────────────────────────────────────────┴──────────┘
//   5. Questions are saved and persist — no need to regenerate
//   6. Click "Regenerate" to get a fresh set
//
// (D) MANAGE INTERVIEW STATUS:
//   1. Click "Complete" on an interview → status changes to "completed"
//   2. Click "Cancel" → status changes to "cancelled"
//
// KEY TALKING POINTS:
//   • "AI questions are tailored to the specific job description and skills"
//   • "Interviewers get consistent, high-quality questions every time"
//   • "No more scrambling to prepare — questions ready in seconds"


// ═══════════════════════════════════════════════════════════════════════════
// PART 8 — DEMO FLOW: ANALYTICS & AI INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// Data-driven hiring decisions with visual charts and AI-powered insights.
//
// DEMO STEPS:
//
// (A) VIEW ANALYTICS PAGE:
//   1. Click "Analytics" in sidebar
//   2. TOP ROW — 4 KPI Cards:
//      ┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
//      │ Active Jobs: 4  │ Applications: 6 │ Hired: 0        │ Avg AI Score    │
//      └─────────────────┴─────────────────┴─────────────────┴─────────────────┘
//
// (B) HIRING FUNNEL (visual chart):
//   1. Shows horizontal bar chart of the full pipeline:
//      new         ████████░░░░░ 1
//      screening   ████░░░░░░░░░ 1
//      shortlisted ████░░░░░░░░░ 1
//      interview   ████████░░░░░ 2
//      technical   ████░░░░░░░░░ 1
//      offer       ████░░░░░░░░░ 1
//   2. Point out bottlenecks: "If interview bar is much wider than offer,
//      we have a conversion problem"
//
// (C) CANDIDATE SOURCES:
//   1. Shows percentage breakdown:
//      • LinkedIn: 1 (17%)
//      • Referral: 2 (33%)
//      • Website: 2 (33%)
//      • Job Board: 1 (17%)
//   2. "Referral and Website are our top channels"
//
// (D) JOBS BY DEPARTMENT:
//   1. Grid cards showing:
//      • Engineering: 2
//      • Data: 1
//      • Design: 1
//      • Infrastructure: 1
//      • Marketing: 1
//
// (E) AI HIRING INSIGHTS ⭐:
//   1. Scroll to bottom "AI Hiring Insights" section
//   2. Click "Generate Insights" button
//   3. AI analyzes all hiring data and returns THREE columns:
//
//      💡 Key Insights          │ ⚠ Bottlenecks           │ 🎯 Recommendations
//      ─────────────────────────┼──────────────────────────┼──────────────────────────
//      • Pipeline has active    │ • No hires completed     │ • Accelerate offer stage
//        candidates             │   yet                    │ • Improve screening speed
//      • Good source diversity  │ • Interview → Offer      │ • Add more sourcing
//      • Strong AI scores       │   conversion is low      │   channels
//
//   4. Click "Refresh Insights" to regenerate
//
// KEY TALKING POINTS:
//   • "Data-driven decisions replace gut feelings"
//   • "Funnel analysis shows exactly where candidates drop off"
//   • "AI insights highlight problems you might not notice manually"
//   • "Source tracking shows ROI of each recruitment channel"


// ═══════════════════════════════════════════════════════════════════════════
// PART 9 — DEMO FLOW: AI EMAIL GENERATION
// ═══════════════════════════════════════════════════════════════════════════
//
// WHAT TO SHOW:
// ─────────────
// AI generates professional, personalized emails for any stage of hiring.
//
// DEMO STEPS:
//   1. Go to Applications → click any application detail
//   2. Scroll to "Email Generator" section
//   3. Four email types available:
//
//      ┌──────────────────┬──────────────────────────────────────────────────┐
//      │ Button           │ What it generates                                │
//      ├──────────────────┼──────────────────────────────────────────────────┤
//      │ Rejection Email  │ Polite, empathetic rejection with encouragement  │
//      │ Offer Email      │ Enthusiastic offer with next steps               │
//      │ Interview Invite │ Professional scheduling request                  │
//      │ Follow-up        │ Check-in email with timeline update              │
//      └──────────────────┴──────────────────────────────────────────────────┘
//
//   4. Click "Rejection Email" → AI generates:
//      Subject: "Update Regarding Your Application"
//      Body:    "Thank you for your interest in the [Position] and for
//               taking the time to interview with our team. After careful
//               consideration, we have decided to move forward with other
//               candidates whose experience more closely aligns with our
//               current needs. We were impressed with your qualifications
//               and encourage you to apply for future positions..."
//
//   5. Click "Offer Email" → generates different email
//   6. Emails are personalized with candidate name and job title
//
// KEY TALKING POINTS:
//   • "Saves 10+ minutes per email"
//   • "Consistent, professional tone across all communications"
//   • "Personalized — not generic template emails"


// ═══════════════════════════════════════════════════════════════════════════
// PART 10 — TECHNICAL ARCHITECTURE DEEP-DIVE
// ═══════════════════════════════════════════════════════════════════════════
//
// FRONTEND ARCHITECTURE:
// ──────────────────────
// • React 18 with functional components and hooks
// • Vite for fast builds (500ms cold start)
// • Tailwind CSS for utility-first styling
// • React Router v6 for client-side routing
// • Lucide React for consistent iconography
// • Custom AuthContext for global auth state
// • API client class (api.js) — single interface for all backend calls
//
// How Frontend Auth Works:
//   1. User submits login form
//   2. POST /api/auth/login → returns { user, token }
//   3. Token saved to localStorage
//   4. AuthContext.user set → triggers re-render
//   5. ProtectedRoute component checks user state
//   6. Every API call automatically includes Bearer token
//
//
// BACKEND ARCHITECTURE:
// ─────────────────────
// • Express.js REST API (Node.js)
// • Sequelize ORM with model associations
// • SQLite for development (zero-config)
// • PostgreSQL-ready for production
// • JWT-based authentication
// • Role-based authorization middleware
// • Express Validator for input validation
// • express-rate-limit for API throttling
// • Helmet.js for security headers
// • Morgan for request logging
//
// Request Flow:
//   Client → CORS Check → Rate Limit → JSON Parse → Route Match →
//   Auth Middleware (JWT verify) → Role Check → Controller Logic →
//   Sequelize Query → Response
//
//
// AI LAYER ARCHITECTURE:
// ──────────────────────
// • claudeService.js — singleton service class
// • Structured system prompts for each use case
// • JSON response formatting for predictable parsing
// • Graceful fallback to mock data when API key not configured
// • Error handling with fallback responses
// • Model: claude-sonnet-4-20250514 (configurable)


// ═══════════════════════════════════════════════════════════════════════════
// PART 11 — SECURITY FEATURES
// ═══════════════════════════════════════════════════════════════════════════
//
// IMPLEMENTED SECURITY MEASURES:
//
//   1. AUTHENTICATION:
//      • JWT tokens with expiration (7 days)
//      • Passwords hashed with bcrypt (12 salt rounds)
//      • Token required for all API endpoints (except login/register)
//
//   2. AUTHORIZATION:
//      • Role-based access control (admin, recruiter, hiring_manager, viewer)
//      • Only admins can delete jobs
//      • authorize() middleware checks user role per route
//
//   3. INPUT VALIDATION:
//      • express-validator on all POST/PUT routes
//      • Email format validation
//      • Required field checks
//      • SQL injection prevented by Sequelize parameterized queries
//
//   4. RATE LIMITING:
//      • 200 requests per 15 minutes per IP
//      • Prevents brute-force login attempts
//
//   5. SECURITY HEADERS:
//      • Helmet.js sets: X-Content-Type-Options, X-Frame-Options,
//        Strict-Transport-Security, X-XSS-Protection, etc.
//
//   6. CORS CONFIGURATION:
//      • Only frontend origin (localhost:5173) allowed
//      • Credentials enabled for cookie support
//
//   7. DATA PROTECTION:
//      • Password field excluded from all API responses (User.toJSON)
//      • Request body size limited to 10MB
//
//   8. API KEY SECURITY:
//      • Anthropic API key stored in .env (not committed to git)
//      • .gitignore excludes .env files


// ═══════════════════════════════════════════════════════════════════════════
// PART 12 — DEPLOYMENT WITH DOCKER
// ═══════════════════════════════════════════════════════════════════════════
//
// OPTION 1: Docker Compose (Full Stack)
//   cd D:\ATS
//   docker-compose up --build
//
//   This starts:
//   • PostgreSQL 16 on port 5432
//   • ATS app (backend + built frontend) on port 3001
//   • Data persisted in Docker volume "pgdata"
//
// OPTION 2: Dockerfile (App Only)
//   docker build -t ats-platform .
//   docker run -p 3001:3001 -e ANTHROPIC_API_KEY=sk-ant-xxx ats-platform
//
// Multi-stage build:
//   Stage 1: Build frontend (Vite production build)
//   Stage 2: Copy backend + frontend dist → Node.js Alpine image
//   Result: ~150MB production image


// ═══════════════════════════════════════════════════════════════════════════
// PART 13 — CLAUDE AI INTEGRATION DETAILS
// ═══════════════════════════════════════════════════════════════════════════
//
// File: backend/services/claudeService.js
//
// The ClaudeService class provides 5 AI capabilities:
//
// ┌─────────────────────────┬──────────────────────────────────────────────┐
// │ Method                  │ What it does                                 │
// ├─────────────────────────┼──────────────────────────────────────────────┤
// │ screenResume()          │ Scores resume 0-100 against job description  │
// │                         │ Returns: score, strengths, weaknesses,       │
// │                         │ summary, recommendation                     │
// ├─────────────────────────┼──────────────────────────────────────────────┤
// │ generateInterviewQs()   │ Creates role-specific interview questions    │
// │                         │ Returns: 5 questions with category/difficulty│
// ├─────────────────────────┼──────────────────────────────────────────────┤
// │ generateEmail()         │ Drafts professional emails                   │
// │                         │ Types: rejection, offer, invite, follow-up   │
// ├─────────────────────────┼──────────────────────────────────────────────┤
// │ summarizeCandidate()    │ Creates concise candidate profile            │
// │                         │ Returns: summary, topSkills, experienceLevel │
// ├─────────────────────────┼──────────────────────────────────────────────┤
// │ analyzeHiringTrends()   │ Analyzes pipeline for insights               │
// │                         │ Returns: insights, bottlenecks, recommend.   │
// └─────────────────────────┴──────────────────────────────────────────────┘
//
// PROMPT ENGINEERING APPROACH:
//   • Each method uses a carefully crafted system prompt
//   • System prompt specifies exact JSON response format
//   • User message contains the actual data (resume, job description, etc.)
//   • Responses are parsed from JSON with fallback handling
//   • Mock responses provided when API key is missing
//
// EXAMPLE — Resume Screening Prompt:
//   System: "You are an expert HR recruiter AI. Analyze the resume against
//           the job description. Return JSON with: score (0-100), strengths
//           (array), weaknesses (array), summary (string), recommendation."
//   User:   "## Job Description\n{desc}\n## Resume\n{resume}"


// ═══════════════════════════════════════════════════════════════════════════
// PART 14 — DATABASE SCHEMA & RELATIONSHIPS
// ═══════════════════════════════════════════════════════════════════════════
//
// ENTITY RELATIONSHIP DIAGRAM:
//
//   ┌──────────┐       ┌──────────────┐       ┌────────────┐
//   │   User   │───1:N─│     Job      │───1:N─│ Application│
//   │          │       │              │       │            │
//   │ id (PK)  │       │ id (PK)      │       │ id (PK)    │
//   │ firstName│       │ title        │       │ status     │
//   │ lastName │       │ department   │       │ aiScore    │
//   │ email    │       │ location     │       │ aiAnalysis │
//   │ password │       │ type         │       │ aiStrengths│
//   │ role     │       │ salaryMin/Max│       │ aiWeakness │
//   │ dept     │       │ description  │       │ rating     │
//   └──────────┘       │ requirements │       │ notes      │
//                      │ skills []    │       └─────┬──────┘
//                      │ status       │             │
//                      │ priority     │             │ 1:N
//                      └──────────────┘             ▼
//                                           ┌─────────────┐
//   ┌───────────────┐                       │  Interview   │
//   │   Candidate   │──────1:N──────────────│              │
//   │               │    (via Application)  │ type         │
//   │ id (PK)       │                       │ scheduledAt  │
//   │ firstName     │                       │ duration     │
//   │ lastName      │                       │ meetingLink  │
//   │ email         │                       │ interviewers │
//   │ phone         │                       │ status       │
//   │ currentTitle  │                       │ aiQuestions  │
//   │ currentCompany│                       │ feedback     │
//   │ skills []     │                       │ rating       │
//   │ resumeText    │                       └──────────────┘
//   │ source        │
//   │ aiSummary     │
//   └───────────────┘
//
// RELATIONSHIPS:
//   • User (hiringManager) → has many → Jobs
//   • Job → has many → Applications
//   • Candidate → has many → Applications
//   • Application → has many → Interviews
//   • Interview → belongs to → User (scheduler)


// ═══════════════════════════════════════════════════════════════════════════
// PART 15 — API REFERENCE (ALL ENDPOINTS)
// ═══════════════════════════════════════════════════════════════════════════
//
// BASE URL: http://localhost:3001/api
//
// ┌────────┬──────────────────────────────────────┬─────────────────────────────────┐
// │ Method │ Endpoint                             │ Description                     │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │        │ AUTHENTICATION                       │                                 │
// │ POST   │ /auth/register                       │ Create new user account          │
// │ POST   │ /auth/login                          │ Login → returns JWT token        │
// │ GET    │ /auth/me                             │ Get current user profile         │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │        │ JOBS                                 │                                 │
// │ GET    │ /jobs                                │ List all jobs (with filters)     │
// │ GET    │ /jobs/:id                            │ Get single job + applications    │
// │ POST   │ /jobs                                │ Create new job posting           │
// │ PUT    │ /jobs/:id                            │ Update job                       │
// │ DELETE │ /jobs/:id                            │ Delete job (admin only)          │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │        │ CANDIDATES                           │                                 │
// │ GET    │ /candidates                          │ List all candidates              │
// │ GET    │ /candidates/:id                      │ Get candidate + applications     │
// │ POST   │ /candidates                          │ Add new candidate                │
// │ PUT    │ /candidates/:id                      │ Update candidate                 │
// │ POST   │ /candidates/:id/ai-summary           │ 🤖 Generate AI profile summary  │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │        │ APPLICATIONS                         │                                 │
// │ GET    │ /applications                        │ List all applications            │
// │ GET    │ /applications/:id                    │ Get application details          │
// │ POST   │ /applications                        │ Create new application           │
// │ PUT    │ /applications/:id/status             │ Update status/rating/notes       │
// │ POST   │ /applications/:id/ai-screen          │ 🤖 AI resume screening          │
// │ POST   │ /applications/:id/generate-email     │ 🤖 Generate email (any type)    │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │        │ INTERVIEWS                           │                                 │
// │ GET    │ /interviews                          │ List all interviews              │
// │ GET    │ /interviews/:id                      │ Get interview details            │
// │ POST   │ /interviews                          │ Schedule new interview           │
// │ PUT    │ /interviews/:id                      │ Update interview                 │
// │ POST   │ /interviews/:id/generate-questions   │ 🤖 AI interview questions       │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │        │ ANALYTICS                            │                                 │
// │ GET    │ /analytics/dashboard                 │ All dashboard metrics            │
// │ GET    │ /analytics/hiring-funnel             │ Pipeline funnel data             │
// │ GET    │ /analytics/ai-insights               │ 🤖 AI hiring trend analysis     │
// ├────────┼──────────────────────────────────────┼─────────────────────────────────┤
// │ GET    │ /health                              │ Server health check              │
// └────────┴──────────────────────────────────────┴─────────────────────────────────┘


// ═══════════════════════════════════════════════════════════════════════════
// 🎬 RECOMMENDED DEMO PRESENTATION ORDER (15-20 minutes)
// ═══════════════════════════════════════════════════════════════════════════
//
// MINUTE 0-2:  Introduction
//   "This is an AI-powered ATS that automates the most time-consuming
//    parts of recruitment — resume screening, interview prep, and
//    candidate communication."
//
// MINUTE 2-3:  Login (show role-based access)
//   Login as admin@ats.com → show dashboard
//
// MINUTE 3-5:  Dashboard
//   Walk through stats, pipeline chart, AI score, sources
//
// MINUTE 5-7:  Job Management
//   Show job list → create a new job → publish it
//
// MINUTE 7-9:  Candidate Management
//   Show candidate list → click into a profile → generate AI summary
//
// MINUTE 9-13: Application Tracking & AI Screening ⭐ (key demo)
//   Show applications → click into detail → demonstrate:
//     a. AI Screening (score + strengths/weaknesses)
//     b. Pipeline status changes (drag through stages)
//     c. Star rating + recruiter notes
//     d. Email generation (rejection email)
//
// MINUTE 13-15: Interview Scheduling
//   Show upcoming interviews → generate AI questions
//
// MINUTE 15-17: Analytics
//   Show funnel chart → source breakdown → generate AI insights
//
// MINUTE 17-20: Technical Overview & Q&A
//   Brief architecture mention → security → Docker deployment
//   "Questions?"
//
// ═══════════════════════════════════════════════════════════════════════════

module.exports = {};
