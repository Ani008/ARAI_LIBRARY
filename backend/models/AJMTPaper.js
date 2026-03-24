const mongoose = require("mongoose");

// Sub-schema for Author
const authorSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      trim: true,
    },
    authorAddress: {
      type: String,
      trim: true,
    },
    authorCity: {
      type: String,
      trim: true,
    },
    authorInstitution: {
      type: String,
      trim: true,
    },
    authorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    authorPhone: {
      type: String,
      trim: true,
    },
  },
  { _id: true },
);

// Sub-schema for Reviewer Review Entry
const reviewSchema = new mongoose.Schema(
  {
    plagiarismPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    remarks: {
      type: String,
      trim: true,
    },
    sentDate: {
      type: Date,
    },
  },
  { _id: true, timestamps: true },
);

// Sub-schema for Reviewer
const reviewerSchema = new mongoose.Schema(
  {
    reviewerNumber: {
      type: Number,
      min: 1,
      max: 3,
    },
    reviewerName: {
      type: String,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentDate: {
      type: Date,
    },
  },
  { _id: true },
);

// Main AJMT Paper Schema
const ajmtPaperSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    paperTitle: {
      type: String,
      trim: true,
    },
    titleSubject: {
      type: String,
      trim: true,
    },
    paperType: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
    plagiarismPercentage: { type: Number, min: 0, max: 100, default: 0 },
    reviewDate: { type: Date },
    paperFile: {
      type: String, // Stores file path: /uploads/papers/filename.pdf
      required: false, // Not required initially, can be added later
    },
    paperFileName: {
      type: String, // Original filename
      required: false,
    },
    paperFileSize: {
      type: Number, // File size in bytes
      required: false,
    },
    paperUploadDate: {
      type: Date,
      required: false,
    },
    authors: {
      type: [authorSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one author is required",
      },
    },
    reviewers: {
      type: [reviewerSchema],
      validate: {
        validator: function (v) {
          return !v || v.length <= 3;
        },
        message: "Maximum 3 reviewers allowed",
      },
    },
    tentativeDateOfPublication: {
      type: Date,
    },
    websiteUpdateDate: {
      type: Date,
    },
    hardcopyDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Under Review", "Accepted", "Rejected", "Published"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
ajmtPaperSchema.index({ paperTitle: "text", titleSubject: "text" });
ajmtPaperSchema.index({ date: -1 });
ajmtPaperSchema.index({ status: 1 });

// Method to calculate total plagiarism score
ajmtPaperSchema.methods.calculateTotalScore = function () {
  if (!this.reviewers || this.reviewers.length === 0) {
    return 0;
  }

  let total = 0;

  this.reviewers.forEach((reviewer) => {
    if (reviewer.reviews && reviewer.reviews.length > 0) {
      reviewer.reviews.forEach((review) => {
        if (
          review.plagiarismPercentage !== undefined &&
          review.plagiarismPercentage !== null
        ) {
          total += review.plagiarismPercentage;
        }
      });
    }
  });

  return total;
};

ajmtPaperSchema.methods.getReviewerByNumber = function (reviewerNumber) {
  return this.reviewers.find(
    (r) => r.reviewerNumber === parseInt(reviewerNumber),
  );
};

const AJMTPaper = mongoose.model("AJMTPaper", ajmtPaperSchema);

module.exports = AJMTPaper;
