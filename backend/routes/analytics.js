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
    const totalJobs = await Job.count();
    const activeJobs = await Job.count({ where: { status: 'published' } });
    const totalCandidates = await Candidate.count();
    const totalApplications = await Application.count();
    const pendingReview = await Application.count({ where: { status: 'new' } });
    const inInterview = await Application.count({ where: { status: 'interview' } });
    const hired = await Application.count({ where: { status: 'hired' } });
    const rejected = await Application.count({ where: { status: 'rejected' } });
    const upcomingInterviews = await Interview.count({
      where: { scheduledAt: { [Op.gte]: new Date() }, status: 'scheduled' },
    });

    // Application status breakdown
    const statusBreakdown = await Application.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    // Jobs by department
    const jobsByDepartment = await Job.findAll({
      attributes: ['department', [fn('COUNT', col('id')), 'count']],
      group: ['department'],
      raw: true,
    });

    // Recent applications (last 30 days, grouped by date)
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

    // Average AI score
    const avgScore = await Application.findOne({
      attributes: [[fn('AVG', col('aiScore')), 'avgScore']],
      where: { aiScore: { [Op.ne]: null } },
      raw: true,
    });

    // Source breakdown
    const sourceBreakdown = await Candidate.findAll({
      attributes: ['source', [fn('COUNT', col('id')), 'count']],
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
    const overview = {
      totalJobs: await Job.count(),
      activeJobs: await Job.count({ where: { status: 'published' } }),
      totalApplications: await Application.count(),
      hired: await Application.count({ where: { status: 'hired' } }),
      rejected: await Application.count({ where: { status: 'rejected' } }),
      averageTimeInPipeline: '14 days',
    };

    const insights = await claudeService.analyzeHiringTrends(overview);
    res.json({ insights, data: overview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
