const express = require('express');
const { OfferLetter, Application, Candidate, Job } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const includeOpts = [
  {
    model: Application,
    include: [
      { model: Candidate, attributes: ['id', 'firstName', 'lastName', 'email', 'currentTitle'] },
      { model: Job, attributes: ['id', 'title', 'department'] },
    ],
  },
];

// GET /api/offers
router.get('/', authenticate, async (req, res) => {
  try {
    const offers = await OfferLetter.findAll({
      include: includeOpts,
      order: [['createdAt', 'DESC']],
    });
    res.json({ offers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const offer = await OfferLetter.findByPk(req.params.id, { include: includeOpts });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    res.json({ offer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offers
router.post('/', authenticate, async (req, res) => {
  try {
    const { applicationId, salary, currency, startDate, expiresAt, benefits, content } = req.body;
    if (!applicationId) return res.status(400).json({ error: 'applicationId required' });

    const application = await Application.findByPk(applicationId);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // Move application to offer stage
    await application.update({ status: 'offer' });

    const offer = await OfferLetter.create({
      applicationId,
      salary: salary ? parseInt(salary) : null,
      currency: currency || 'USD',
      startDate: startDate || null,
      expiresAt: expiresAt || null,
      benefits: benefits || null,
      content: content || null,
      createdBy: req.user.id,
      status: 'draft',
    });

    const full = await OfferLetter.findByPk(offer.id, { include: includeOpts });
    res.status(201).json({ offer: full });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/offers/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const offer = await OfferLetter.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    await offer.update(req.body);

    // Sync application status on accept / reject
    if (req.body.status === 'accepted') {
      await Application.update({ status: 'hired' }, { where: { id: offer.applicationId } });
      offer.respondedAt = new Date();
      await offer.save();
    } else if (req.body.status === 'rejected') {
      await Application.update({ status: 'rejected' }, { where: { id: offer.applicationId } });
      offer.respondedAt = new Date();
      await offer.save();
    }

    const updated = await OfferLetter.findByPk(offer.id, { include: includeOpts });
    res.json({ offer: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/offers/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const offer = await OfferLetter.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    await offer.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
