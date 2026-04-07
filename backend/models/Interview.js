const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interview = sequelize.define('Interview', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('phone', 'video', 'onsite', 'technical', 'panel', 'final'),
    defaultValue: 'video',
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  location: {
    type: DataTypes.STRING,
  },
  meetingLink: {
    type: DataTypes.STRING,
  },
  interviewers: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('interviewers');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('interviewers', JSON.stringify(val));
    },
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'),
    defaultValue: 'scheduled',
  },
  feedback: {
    type: DataTypes.TEXT,
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  aiQuestions: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('aiQuestions');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('aiQuestions', JSON.stringify(val));
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
});

module.exports = Interview;
