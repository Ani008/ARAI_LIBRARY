const mongoose = require('mongoose');
const Counter = require('./Counter');

const kcMemberSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    unique: true,
    trim: true
  },
  institutionName: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  membershipType: {
    type: String,
    enum: ['Automotive Abstract', 'ARAI Journal', 'KC Membership Option 1', 'KC Membership Option 2'],
  },
  subscriptionType: {
    type: String,
    default: ''
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
  membershipStatus: {
    type: String,
    enum: ['Active', 'Inactive',''],
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

kcMemberSchema.pre("save", async function () {
  if (!this.isNew) return;

  try {
    // 1. Create a unique key for this specific membership combination
    const typeKey = `${this.membershipType}_${this.subscriptionType}`;

    // 2. Update the counter using that unique key as the _id
    const counter = await Counter.findByIdAndUpdate(
      { _id: typeKey }, 
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    // 3. Logic to determine prefix/startValue
    let prefix = "";
    let startValue = 0;
    let padding = 0;

    switch (typeKey) {
      case "Automotive Abstract_Subscribers": prefix = "SUB"; break;
      case "Automotive Abstract_Exchange": prefix = "EXC"; break;
      case "Automotive Abstract_GOI": prefix = "GOI"; break;
      case "KC Membership Option 1_Individual": startValue = 10000; break;
      case "KC Membership Option 1_Educational": startValue = 12000; break;
      case "KC Membership Option 1_Company": startValue = 11000; break;
      case "KC Membership Option 2_Educational": prefix = "ERB"; padding = 5; break;
      case "KC Membership Option 2_ARAI Member Company": prefix = "MCB"; padding = 5; break;
      case "KC Membership Option 2_Other Company": prefix = "OCB"; padding = 4; break;
      default: prefix = "MEM"; // Fallback
    }

    // 4. Calculate Final ID (The Math Fix)
    const finalNum = counter.sequence_value + startValue;
    
    // Formatting: Apply padding if needed, otherwise just join
    this.membershipId = padding > 0 
      ? prefix + finalNum.toString().padStart(padding, '0') 
      : prefix + finalNum;

  } catch (error) {
    console.error("Counter Error:", error);
    throw error;
  }
});

// 3. COMPILE AND EXPORT LAST
module.exports = mongoose.model('KCMember', kcMemberSchema);