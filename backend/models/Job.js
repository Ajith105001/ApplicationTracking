const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'remote'),
    defaultValue: 'full-time',
  },
  experience: {
    type: DataTypes.STRING,
  },
  salaryMin: {
    type: DataTypes.INTEGER,
  },
  salaryMax: {
    type: DataTypes.INTEGER,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.TEXT,
  },
  responsibilities: {
    type: DataTypes.TEXT,
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
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed', 'on-hold'),
    defaultValue: 'draft',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  closingDate: {
    type: DataTypes.DATE,
  },
  publishedAt: {
    type: DataTypes.DATE,
  },
  applicationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = Job;
