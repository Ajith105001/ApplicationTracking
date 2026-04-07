const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
  },
  entityName: {
    type: DataTypes.STRING,
  },
  details: {
    type: DataTypes.TEXT,
  },
  metadata: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('metadata');
      return val ? JSON.parse(val) : {};
    },
    set(val) {
      this.setDataValue('metadata', JSON.stringify(val));
    },
  },
}, {
  timestamps: true,
});

module.exports = Activity;
