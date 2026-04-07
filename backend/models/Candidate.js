const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Candidate = sequelize.define('Candidate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  currentTitle: {
    type: DataTypes.STRING,
  },
  currentCompany: {
    type: DataTypes.STRING,
  },
  experienceYears: {
    type: DataTypes.FLOAT,
  },
  skills: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('skills');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('skills', JSON.stringify(val));
    },
  },
  resumeUrl: {
    type: DataTypes.STRING,
  },
  resumeText: {
    type: DataTypes.TEXT,
  },
  linkedinUrl: {
    type: DataTypes.STRING,
  },
  portfolioUrl: {
    type: DataTypes.STRING,
  },
  coverLetter: {
    type: DataTypes.TEXT,
  },
  source: {
    type: DataTypes.ENUM('website', 'linkedin', 'referral', 'job-board', 'agency', 'other'),
    defaultValue: 'website',
  },
  aiSummary: {
    type: DataTypes.TEXT,
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('tags');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('tags', JSON.stringify(val));
    },
  },
}, {
  timestamps: true,
});

module.exports = Candidate;
