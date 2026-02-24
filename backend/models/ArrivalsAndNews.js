const mongoose = require('mongoose');

const arrivalsAndNewsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['New Arrival', 'Daily News', 'Newspaper', 'Announcement', 'Events', ''],
    default: ''
  },
  priority: {
    type: String,
    enum: ['Medium', 'High', 'Urgent', ''],
    default: 'Medium'
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  itemType: {
    type: String,
    enum: ['Book', 'Journal', 'Magazine', 'Standard', 'Thesis', 'Report', 'CD/DVD', ''],
    default: ''
  },
  authorPublisher: {
    type: String,
    trim: true,
    default: ''
  },
  callNumber: {
    type: String,
    trim: true,
    default: ''
  },
  isbnIssn: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['Technical', 'Academic', 'Research', 'General', 'Sports', 'Entertainment', 'Business', 'Technology', ''],
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived', ''],
    default: 'Active'
  },
  tagsKeywords: [{
    type: String,
    trim: true
  }],
  urlLink: {
    type: String,
    trim: true,
    default: ''
  },
  attachmentImageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  targetAudience: {
    students: {
      type: Boolean,
      default: false
    },
    faculty: {
      type: Boolean,
      default: false
    },
    staff: {
      type: Boolean,
      default: false
    },
    public: {
      type: Boolean,
      default: false
    }
  },
  remarks: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ArrivalsAndNews', arrivalsAndNewsSchema);