const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Job, Application, User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// GET /api/jobs - List all jobs with filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, department, type, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (department) where.department = department;
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows: jobs, count: total } = await Job.findAndCountAll({
      where,
      include: [{ model: User, as: 'hiringManager', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ jobs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { model: User, as: 'hiringManager', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Application },
      ],
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/jobs
router.post('/',
  authenticate,
  authorize('admin', 'recruiter', 'hiring_manager'),
  body('title').trim().notEmpty(),
  body('department').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('description').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const job = await Job.create({
        ...req.body,
        hiringManagerId: req.user.id,
        publishedAt: req.body.status === 'published' ? new Date() : null,
      });

      res.status(201).json({ job });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// PUT /api/jobs/:id
router.put('/:id',
  authenticate,
  authorize('admin', 'recruiter', 'hiring_manager'),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });

      if (req.body.status === 'published' && job.status !== 'published') {
        req.body.publishedAt = new Date();
      }

      await job.update(req.body);
      res.json({ job });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/jobs/:id
router.delete('/:id',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      await job.destroy();
      res.json({ message: 'Job deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
