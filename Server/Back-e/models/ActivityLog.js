const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'CREATE_PERIODICAL',
      'UPDATE_PERIODICAL',
      'DELETE_PERIODICAL',
      'CREATE_STANDARD',
      'UPDATE_STANDARD',
      'DELETE_STANDARD',
      'CREATE_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'OTHER'
    ]
  },
  description: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    enum: ['User', 'Periodical', 'Standard', 'System', null]
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Store before/after values
    default: null
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });

// Virtual for formatted time
activityLogSchema.virtual('formattedTime').get(function() {
  const date = this.timestamp;
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
});

// Method to format log entry
activityLogSchema.methods.formatLogEntry = function() {
  return `${this.formattedTime} : ${this.description}`;
};

activityLogSchema.set('toJSON', { virtuals: true });
activityLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);