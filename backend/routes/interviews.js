const express = require('express');
const { body, validationResult } = require('express-validator');
const { Interview, Application, Candidate, Job } = require('../models');
const { authenticate } = require('../middleware/auth');
const claudeService = require('../services/claudeService');

const router = express.Router();

// GET /api/interviews
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    const where = {};
    const { Op } = require('sequelize');

    if (status) where.status = status;
    if (startDate && endDate) {
      where.scheduledAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.scheduledAt = { [Op.gte]: new Date(startDate) };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: interviews, count: total } = await Interview.findAndCountAll({
      where,
      include: [{
        model: Application,
        include: [
          { model: Candidate, attributes: ['id', 'firstName', 'lastName', 'email', 'currentTitle'] },
          { model: Job, attributes: ['id', 'title', 'department'] },
        ],
      }],
      order: [['scheduledAt', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ interviews, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/interviews/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [{
        model: Application,
        include: [{ model: Candidate }, { model: Job }],
      }],
    });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/interviews
router.post('/',
  authenticate,
  body('applicationId').notEmpty(),
  body('scheduledAt').isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const application = await Application.findByPk(req.body.applicationId);
      if (!application) return res.status(404).json({ error: 'Application not found' });

      const interview = await Interview.create({
        ...req.body,
        scheduledBy: req.user.id,
      });

      // Update application status to interview (unless already at interview stage or beyond)
      const TERMINAL_STATUSES = ['interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn'];
      if (!TERMINAL_STATUSES.includes(application.status)) {
        await application.update({ status: 'interview' });
      }

      res.status(201).json({ interview });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/interviews/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    await interview.update(req.body);
    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/interviews/:id/generate-questions
router.post('/:id/generate-questions', authenticate, async (req, res) => {
  try {
    const interview = await Interview.findByPk(req.params.id, {
      include: [{
        model: Application,
        include: [{ model: Job }, { model: Candidate }],
      }],
    });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const result = await claudeService.generateInterviewQuestions(
      interview.Application.Job.title,
      interview.Application.Job.description,
      interview.Application.Job.skills || [],
      interview.type
    );

    await interview.update({ aiQuestions: result.questions });
    res.json({ questions: result.questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
