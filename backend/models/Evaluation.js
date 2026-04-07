const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evaluation = sequelize.define('Evaluation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  technicalSkills: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  communication: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  problemSolving: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  cultureFit: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  leadership: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 },
  },
  overallRating: {
    type: DataTypes.FLOAT,
  },
  recommendation: {
    type: DataTypes.ENUM('strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire'),
  },
  strengths: {
    type: DataTypes.TEXT,
  },
  concerns: {
    type: DataTypes.TEXT,
  },
  detailedNotes: {
    type: DataTypes.TEXT,
  },
  isComplete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = Evaluation;
