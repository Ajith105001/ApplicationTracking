const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InterviewRoom = sequelize.define('InterviewRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('waiting', 'live', 'completed', 'expired'),
    defaultValue: 'waiting',
  },
  startedAt: {
    type: DataTypes.DATE,
  },
  endedAt: {
    type: DataTypes.DATE,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  participants: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('participants');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('participants', JSON.stringify(val));
    },
  },
  chatMessages: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('chatMessages');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('chatMessages', JSON.stringify(val));
    },
  },
  liveNotes: {
    type: DataTypes.TEXT,
  },
  recordingConsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recordingUrl: {
    type: DataTypes.STRING,
  },
  settings: {
    type: DataTypes.TEXT,
    get() {
      const val = this.getDataValue('settings');
      return val ? JSON.parse(val) : { videoEnabled: true, audioEnabled: true, screenShareEnabled: true, chatEnabled: true, whiteboardEnabled: true };
    },
    set(val) {
      this.setDataValue('settings', JSON.stringify(val));
    },
  },
}, {
  timestamps: true,
});

module.exports = InterviewRoom;
