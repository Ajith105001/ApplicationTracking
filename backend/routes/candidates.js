const express = require('express');
const { body, validationResult } = require('express-validator');
const { Candidate, Application, Job } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const claudeService = require('../services/claudeService');
const { Op } = require('sequelize');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const router = express.Router();

// Multer — memory storage (no disk write), 5MB limit, only PDF/DOC/DOCX/TXT
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/octet-stream', // some browsers send this
      'application/zip',          // some DOCX files show as zip
    ];
    if (ALLOWED_EXTENSIONS.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

// Helper: extract plain text from uploaded buffer
async function extractText(file) {
  const ext = '.' + file.originalname.split('.').pop().toLowerCase();
  if (ext === '.pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }
  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  // .txt or fallback
  return file.buffer.toString('utf-8');
}

// GET /api/candidates
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, source, page = 1, limit = 20 } = req.query;
    const where = {};

    if (source) where.source = source;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { currentTitle: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: candidates, count: total } = await Candidate.findAndCountAll({
      where,
      include: [{ model: Application, include: [{ model: Job, attributes: ['id', 'title'] }] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ candidates, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/candidates/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id, {
      include: [{ model: Application, include: [{ model: Job }] }],
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    res.json({ candidate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/candidates
router.post('/',
  authenticate,
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const existing = await Candidate.findOne({ where: { email: req.body.email } });
      if (existing) {
        return res.status(409).json({ error: 'Candidate with this email already exists', candidate: existing });
      }

      const candidate = await Candidate.create(req.body);
      res.status(201).json({ candidate });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/candidates/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    await candidate.update(req.body);
    res.json({ candidate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/candidates/:id/ai-summary
router.post('/:id/ai-summary', authenticate, async (req, res) => {
  try {
    const candidate = await Candidate.findByPk(req.params.id, {
      include: [{ model: Application, include: [{ model: Job }] }],
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    // Build the best possible resume text from available data
    const skills = typeof candidate.skills === 'string' ? JSON.parse(candidate.skills || '[]') : (candidate.skills || []);
    const fallbackText = [
      `${candidate.firstName} ${candidate.lastName}`,
      candidate.currentTitle && `Title: ${candidate.currentTitle}`,
      candidate.currentCompany && `Company: ${candidate.currentCompany}`,
      candidate.location && `Location: ${candidate.location}`,
      candidate.experienceYears && `Experience: ${candidate.experienceYears} years`,
      skills.length > 0 && `Skills: ${skills.join(', ')}`,
      candidate.resumeSummary && `Summary: ${candidate.resumeSummary}`,
    ].filter(Boolean).join('\n');

    const resumeText = candidate.resumeText && candidate.resumeText.trim().length > 50
      ? candidate.resumeText
      : fallbackText;

    const summary = await claudeService.summarizeCandidate(resumeText, candidate.Applications);

    await candidate.update({ aiSummary: JSON.stringify(summary) });
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/candidates/upload-resume  (file upload → AI parse)
router.post('/upload-resume', authenticate, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF, DOC, DOCX, or TXT file.' });
    }
    const text = await extractText(req.file);
    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract readable text from the file. Please try a different format or paste the resume text manually.' });
    }
    const parsed = await claudeService.parseResume(text.trim());
    res.json({ parsed, extractedText: text.trim() });
  } catch (error) {
    if (error.message && error.message.includes('Only PDF')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/candidates/parse-resume  (AI resume parser — plain text)
router.post('/parse-resume', authenticate, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide at least 50 characters of resume text.' });
    }
    const parsed = await claudeService.parseResume(resumeText.trim());
    res.json({ parsed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/candidates/match-jobs  (AI job matching)
router.post('/match-jobs', authenticate, async (req, res) => {
  try {
    const { candidateData } = req.body;
    if (!candidateData) return res.status(400).json({ error: 'candidateData is required' });

    const jobs = await Job.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'department', 'description', 'requirements', 'skills', 'experience'],
      limit: 10,
    });

    if (jobs.length === 0) return res.json({ matches: [] });

    const jobList = jobs.map(j => ({
      id: j.id,
      title: j.title,
      department: j.department,
      requirements: j.requirements,
      skills: typeof j.skills === 'string' ? JSON.parse(j.skills) : j.skills,
      experience: j.experience,
    }));

    const matches = await claudeService.matchJobs(candidateData, jobList);

    // Attach job details to each match
    const enriched = matches.map(m => {
      const job = jobs.find(j => j.id === m.jobId);
      return { ...m, job: job ? { id: job.id, title: job.title, department: job.department } : null };
    }).filter(m => m.job);

    res.json({ matches: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;