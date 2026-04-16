const express = require('express');
const { body, validationResult } = require('express-validator');
const { Application, Job, Candidate, Interview } = require('../models');
const { authenticate } = require('../middleware/auth');
const claudeService = require('../services/claudeService');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/applications
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    // Hiring managers only see applications for their own jobs
    const jobInclude = { model: Job, attributes: ['id', 'title', 'department', 'location'] };
    if (req.user.role === 'hiring_manager') {
      jobInclude.where = { hiringManagerId: req.user.id };
      jobInclude.required = true; // INNER JOIN filters out other jobs' applications
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: applications, count: total } = await Application.findAndCountAll({
      where,
      include: [
        jobInclude,
        { model: Candidate, attributes: ['id', 'firstName', 'lastName', 'email', 'currentTitle', 'currentCompany'] },
        { model: Interview },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ applications, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Job },
        { model: Candidate },
        { model: Interview },
      ],
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications
router.post('/',
  authenticate,
  body('jobId').notEmpty(),
  body('candidateId').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const job = await Job.findByPk(req.body.jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const candidate = await Candidate.findByPk(req.body.candidateId);
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

      const existing = await Application.findOne({
        where: { jobId: req.body.jobId, candidateId: req.body.candidateId },
      });
      if (existing) {
        return res.status(409).json({ error: 'Candidate already applied for this job' });
      }

      const application = await Application.create(req.body);

      // Update application count
      await job.update({ applicationCount: job.applicationCount + 1 });

      // Auto AI screen if candidate has resume text
      if (candidate.resumeText || candidate.skills) {
        try {
          const result = await claudeService.screenResume(
            candidate.resumeText || `${candidate.firstName} ${candidate.lastName} - ${candidate.currentTitle} at ${candidate.currentCompany}. Skills: ${(typeof candidate.skills === 'string' ? JSON.parse(candidate.skills) : candidate.skills || []).join(', ')}`,
            job.description || job.title,
            job.requirements || ''
          );
          await application.update({
            status: 'screening',
            aiScore: result.score,
            aiAnalysis: { score: result.score, summary: result.summary, recommendation: result.recommendation },
            aiStrengths: result.strengths || [],
            aiWeaknesses: result.weaknesses || [],
          });
        } catch { /* non-blocking */ }
      }

      res.status(201).json({ application });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/applications/:id/status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    await application.update({
      status: req.body.status,
      recruiterNotes: req.body.recruiterNotes || application.recruiterNotes,
      rejectionReason: req.body.rejectionReason,
      rating: req.body.rating || application.rating,
    });

    res.json({ application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications/:id/ai-screen
router.post('/:id/ai-screen', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job }, { model: Candidate }],
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const result = await claudeService.screenResume(
      application.Candidate.resumeText || `${application.Candidate.firstName} ${application.Candidate.lastName} - ${application.Candidate.currentTitle} at ${application.Candidate.currentCompany}. Skills: ${(application.Candidate.skills || []).join(', ')}`,
      application.Job.description,
      application.Job.requirements
    );

    // Move status to screening (or keep existing stage if already further in pipeline)
    const TERMINAL = ['hired', 'rejected', 'withdrawn'];
    const ADVANCED = ['shortlisted', 'interview', 'technical', 'offer'];
    const shouldAdvance = !TERMINAL.includes(application.status) && !ADVANCED.includes(application.status);
    await application.update({
      ...(shouldAdvance ? { status: 'screening' } : {}),
      aiScore: result.score,
      aiAnalysis: { score: result.score, summary: result.summary, recommendation: result.recommendation },
      aiStrengths: result.strengths || [],
      aiWeaknesses: result.weaknesses || [],
    });

    // Reload with associations for complete response
    const updated = await Application.findByPk(application.id, {
      include: [{ model: Job }, { model: Candidate }],
    });
    res.json({ screening: result, application: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications/:id/generate-remarks
router.post('/:id/generate-remarks', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job }, { model: Candidate }],
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const analysis = application.aiAnalysis || {};
    const context = {
      candidateName: `${application.Candidate.firstName} ${application.Candidate.lastName}`,
      jobTitle: application.Job.title,
      jobDepartment: application.Job.department,
      status: application.status,
      aiScore: application.aiScore,
      aiStrengths: application.aiStrengths || [],
      aiWeaknesses: application.aiWeaknesses || [],
      aiSummary: analysis.summary || '',
      aiRecommendation: analysis.recommendation || '',
      recruiterNotes: application.recruiterNotes || '',
    };

    const result = await claudeService.generateRemarks(context);
    res.json({ remarks: result.remarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications/:id/generate-email
router.post('/:id/generate-email', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job }, { model: Candidate }, { model: Interview }],
    });
    if (!application) return res.status(404).json({ error: 'Application not found' });

    const candidate = application.Candidate;
    const job = application.Job;

    // Build rich context so AI (or mock) can personalize the email
    const richContext = {
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      candidateEmail: candidate.email,
      candidateTitle: candidate.currentTitle || '',
      candidateCompany: candidate.currentCompany || '',
      jobTitle: job.title,
      jobDepartment: job.department,
      jobLocation: job.location,
      applicationStatus: application.status,
      aiScore: application.aiScore || null,
      aiStrengths: application.aiStrengths || [],
      aiWeaknesses: application.aiWeaknesses || [],
      aiRecommendation: application.aiAnalysis?.recommendation || '',
      upcomingInterview: application.Interviews?.find(i => i.status === 'scheduled') || null,
      recruiterNotes: application.recruiterNotes || '',
      extraContext: req.body.context || '',
    };

    const email = await claudeService.generateEmail(req.body.type || 'rejection', richContext);

    res.json({ email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
