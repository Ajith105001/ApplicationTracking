const express = require('express');
const { body, validationResult } = require('express-validator');
const { Candidate, Application, Job } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const claudeService = require('../services/claudeService');
const { Op } = require('sequelize');

const router = express.Router();

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

    const summary = await claudeService.summarizeCandidate(
      candidate.resumeText || 'No resume text available',
      candidate.Applications
    );

    await candidate.update({ aiSummary: JSON.stringify(summary) });
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
