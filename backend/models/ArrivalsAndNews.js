const mongoose = require('mongoose');

const newsRowSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    trim: true,
  },
  newsTopic: {
    type: String,
    trim: true,
    default: ''
  },
  link: {
    type: String,
  },
  source: {
    type: String,
  }
});

const arrivalAndNewsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
    },

    heading: {
      type: String,
    },

    news: [newsRowSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArrivalAndNews", arrivalAndNewsSchema);