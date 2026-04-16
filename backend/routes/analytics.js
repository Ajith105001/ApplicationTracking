const express = require('express');
const { Application, Job, Candidate, Interview } = require('../models');
const { authenticate } = require('../middleware/auth');
const claudeService = require('../services/claudeService');
const sequelize = require('../config/database');
const { Op, fn, col, literal } = require('sequelize');

const router = express.Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const { days } = req.query;
    const dateFilter = days && days !== 'all'
      ? { createdAt: { [Op.gte]: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000) } }
      : {};

    const totalJobs = await Job.count({ where: dateFilter });
    const activeJobs = await Job.count({ where: { status: 'published', ...dateFilter } });
    const totalCandidates = await Candidate.count({ where: dateFilter });
    const totalApplications = await Application.count({ where: dateFilter });
    const pendingReview = await Application.count({ where: { status: 'new', ...dateFilter } });
    const inInterview = await Application.count({ where: { status: 'interview', ...dateFilter } });
    const hired = await Application.count({ where: { status: 'hired', ...dateFilter } });
    const rejected = await Application.count({ where: { status: 'rejected', ...dateFilter } });
    const upcomingInterviews = await Interview.count({
      where: { scheduledAt: { [Op.gte]: new Date() }, status: 'scheduled' },
    });

    // Application status breakdown (respects dateFilter)
    const statusBreakdown = await Application.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      where: dateFilter,
      group: ['status'],
      raw: true,
    });

    // Jobs by department (respects dateFilter)
    const jobsByDepartment = await Job.findAll({
      attributes: ['department', [fn('COUNT', col('id')), 'count']],
      where: dateFilter,
      group: ['department'],
      raw: true,
    });

    // Recent applications grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentApplications = await Application.findAll({
      attributes: [
        [fn('DATE', col('appliedAt')), 'date'],
        [fn('COUNT', col('id')), 'count'],
      ],
      where: { appliedAt: { [Op.gte]: thirtyDaysAgo } },
      group: [fn('DATE', col('appliedAt'))],
      order: [[fn('DATE', col('appliedAt')), 'ASC']],
      raw: true,
    });

    // Average AI score (respects dateFilter)
    const avgScore = await Application.findOne({
      attributes: [[fn('AVG', col('aiScore')), 'avgScore']],
      where: { aiScore: { [Op.ne]: null }, ...dateFilter },
      raw: true,
    });

    // Source breakdown (respects dateFilter)
    const sourceBreakdown = await Candidate.findAll({
      attributes: ['source', [fn('COUNT', col('id')), 'count']],
      where: dateFilter,
      group: ['source'],
      raw: true,
    });

    res.json({
      overview: {
        totalJobs,
        activeJobs,
        totalCandidates,
        totalApplications,
        pendingReview,
        inInterview,
        hired,
        rejected,
        upcomingInterviews,
        averageAiScore: avgScore?.avgScore ? parseFloat(avgScore.avgScore).toFixed(1) : null,
      },
      statusBreakdown,
      jobsByDepartment,
      recentApplications,
      sourceBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/hiring-funnel
router.get('/hiring-funnel', authenticate, async (req, res) => {
  try {
    const { jobId } = req.query;
    const where = jobId ? { jobId } : {};

    const stages = ['new', 'screening', 'shortlisted', 'interview', 'technical', 'offer', 'hired', 'rejected', 'withdrawn'];
    const funnel = [];

    for (const stage of stages) {
      const count = await Application.count({ where: { ...where, status: stage } });
      funnel.push({ stage, count });
    }

    res.json({ funnel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/ai-insights
router.get('/ai-insights', authenticate, async (req, res) => {
  try {
    // Calculate actual average time in pipeline for hired applications
    const hiredApps = await Application.findAll({
      where: { status: 'hired' },
      attributes: ['appliedAt', 'updatedAt'],
      raw: true,
    });
    let averageTimeInPipeline = 'N/A';
    if (hiredApps.length > 0) {
      const totalDays = hiredApps.reduce((sum, a) => {
        if (a.appliedAt && a.updatedAt) {
          const d = Math.max(0, Math.round((new Date(a.updatedAt) - new Date(a.appliedAt)) / (1000 * 60 * 60 * 24)));
          return sum + d;
        }
        return sum;
      }, 0);
      averageTimeInPipeline = `${Math.round(totalDays / hiredApps.length)} days`;
    }

    const overview = {
      totalJobs: await Job.count(),
      activeJobs: await Job.count({ where: { status: 'published' } }),
      totalApplications: await Application.count(),
      hired: await Application.count({ where: { status: 'hired' } }),
      rejected: await Application.count({ where: { status: 'rejected' } }),
      averageTimeInPipeline,
    };

    const insights = await claudeService.analyzeHiringTrends(overview);
    res.json({ insights, data: overview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/generate-job
router.post('/generate-job', authenticate, async (req, res) => {
  try {
    const { title, department, location, type, experience, skills } = req.body;
    if (!title) return res.status(400).json({ error: 'Job title is required' });

    const result = await claudeService.generateJobDescription({ title, department, location, type, experience, skills });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
