const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OfferLetter = sequelize.define('OfferLetter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  salary: {
    type: DataTypes.INTEGER,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  startDate: {
    type: DataTypes.DATE,
  },
  expiresAt: {
    type: DataTypes.DATE,
  },
  benefits: {
    type: DataTypes.TEXT,
  },
  content: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'negotiating'),
    defaultValue: 'draft',
  },
  candidateResponse: {
    type: DataTypes.TEXT,
  },
  respondedAt: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
});

module.exports = OfferLetter;
