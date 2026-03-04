const mongoose = require('mongoose');

const kcMemberSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    required: [true, 'Membership ID is required'],
    unique: true,
    trim: true
  },
  institutionName: {
    type: String,
    required: [true, 'Institution Name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact Person is required'],
    trim: true
  },
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  membershipType: {
    type: String,
    required: [true, 'Membership Type is required'],
    enum: ['Corporate', 'Educational Institution', 'Individual', 'Staff', 'Temp Membership', 'Student']
  },
  completeAddress: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  alternatePhone: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  membershipStartDate: {
    type: Date,
    default: null
  },
  membershipEndDate: {
    type: Date,
    default: null
  },
  subscriptionType: {
    type: String,
    default: ''
  },
  fees: {
    type: Number,
    default: null
  },
  paymentFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', ''],
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', ''],
    default: ''
  },
  lastPaymentDate: {
    type: Date,
    default: null
  },
  transactionId: {
    type: String,
    trim: true,
    default: ''
  },
  nameOfBank: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KCMember', kcMemberSchema);