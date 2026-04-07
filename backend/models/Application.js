const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM(
      'new',
      'screening',
      'shortlisted',
      'interview',
      'technical',
      'offer',
      'hired',
      'rejected',
      'withdrawn'
    ),
    defaultValue: 'new',
  },
  aiScore: {
    type: DataTypes.FLOAT,
  },
  aiAnalysis: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('aiAnalysis');
      return val ? JSON.parse(val) : null;
    },
    set(val) {
      this.setDataValue('aiAnalysis', JSON.stringify(val));
    },
  },
  aiStrengths: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('aiStrengths');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('aiStrengths', JSON.stringify(val));
    },
  },
  aiWeaknesses: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('aiWeaknesses');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('aiWeaknesses', JSON.stringify(val));
    },
  },
  recruiterNotes: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  rejectionReason: {
    type: DataTypes.STRING,
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

module.exports = Application;
