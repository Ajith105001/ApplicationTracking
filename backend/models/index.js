const User = require('./User');
const Job = require('./Job');
const Candidate = require('./Candidate');
const Application = require('./Application');
const Interview = require('./Interview');
const InterviewRoom = require('./InterviewRoom');
const Evaluation = require('./Evaluation');
const Activity = require('./Activity');
const OfferLetter = require('./OfferLetter');
const Comment = require('./Comment');

// Job belongs to a hiring manager (User)
Job.belongsTo(User, { as: 'hiringManager', foreignKey: 'hiringManagerId' });
User.hasMany(Job, { as: 'jobs', foreignKey: 'hiringManagerId' });

// Application belongs to Job and Candidate
Application.belongsTo(Job, { foreignKey: 'jobId' });
Application.belongsTo(Candidate, { foreignKey: 'candidateId' });
Job.hasMany(Application, { foreignKey: 'jobId' });
Candidate.hasMany(Application, { foreignKey: 'candidateId' });

// Interview belongs to Application
Interview.belongsTo(Application, { foreignKey: 'applicationId' });
Application.hasMany(Interview, { foreignKey: 'applicationId' });

// Interview scheduled by a User
Interview.belongsTo(User, { as: 'scheduler', foreignKey: 'scheduledBy' });

// InterviewRoom belongs to Interview
InterviewRoom.belongsTo(Interview, { foreignKey: 'interviewId' });
Interview.hasOne(InterviewRoom, { foreignKey: 'interviewId' });

// Evaluation belongs to Interview and User (evaluator)
Evaluation.belongsTo(Interview, { foreignKey: 'interviewId' });
Evaluation.belongsTo(User, { as: 'evaluator', foreignKey: 'evaluatorId' });
Interview.hasMany(Evaluation, { foreignKey: 'interviewId' });

// Activity belongs to User
Activity.belongsTo(User, { as: 'actor', foreignKey: 'userId' });

// OfferLetter belongs to Application
OfferLetter.belongsTo(Application, { foreignKey: 'applicationId' });
OfferLetter.belongsTo(User, { as: 'createdByUser', foreignKey: 'createdBy' });
Application.hasOne(OfferLetter, { foreignKey: 'applicationId' });

// Comment belongs to User
Comment.belongsTo(User, { as: 'author', foreignKey: 'userId' });

module.exports = {
  User,
  Job,
  Candidate,
  Application,
  Interview,
  InterviewRoom,
  Evaluation,
  Activity,
  OfferLetter,
  Comment,
};
