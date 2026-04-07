@echo off
echo.
echo  ╔═══════════════════════════════════════════════════════════════════╗
echo  ║     ATS - AI-Powered Application Tracking System                ║
echo  ║     QUICK START GUIDE                                           ║
echo  ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo  STEP 1: Start Backend
echo  ───────────────────────
echo    cd D:\ATS\backend
echo    npm run seed         (first time only - seeds demo data)
echo    npm run dev          (starts server on port 3001)
echo.
echo  STEP 2: Start Frontend (new terminal)
echo  ────────────────────────────────────────
echo    cd D:\ATS\frontend
echo    npm run dev          (starts on port 5173)
echo.
echo  STEP 3: Open Browser
echo  ──────────────────────
echo    http://localhost:5173
echo.
echo  DEMO ACCOUNTS:
echo  ┌──────────────────┬────────────────────┬─────────────┐
echo  │ Role             │ Email              │ Password    │
echo  ├──────────────────┼────────────────────┼─────────────┤
echo  │ Admin            │ admin@ats.com      │ password123 │
echo  │ Recruiter        │ recruiter@ats.com  │ password123 │
echo  │ Hiring Manager   │ manager@ats.com    │ password123 │
echo  └──────────────────┴────────────────────┴─────────────┘
echo.
echo  AI FEATURES (work with mock data by default):
echo    - Resume Screening     (Applications → Detail → "Screen with AI")
echo    - Interview Questions   (Interviews → "Generate Questions")
echo    - Email Generation      (Applications → Detail → Email Generator)
echo    - Candidate Summary     (Candidates → Detail → "Generate")
echo    - Hiring Insights       (Analytics → "Generate Insights")
echo.
echo  For live AI, add your key to backend\.env:
echo    ANTHROPIC_API_KEY=sk-ant-xxxxx
echo.
pause
