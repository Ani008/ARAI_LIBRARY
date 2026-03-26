const mongoose = require("mongoose");

// Sub-schema for Author
const authorSchema = new mongoose.Schema({
  authorName: { type: String, trim: true },
  authorAddress: { type: String, trim: true },
  authorCity: { type: String, trim: true },
  authorInstitution: { type: String, trim: true },
  authorEmail: { type: String, trim: true, lowercase: true },
  authorPhone: { type: String, trim: true },
});

// Sub-schema for Reviewer Review Entry
const reviewSchema = new mongoose.Schema({
  plagiarismPercentage: { type: Number },
  remarks: { type: String, trim: true },
  sentDate: { type: Date },
}, { timestamps: true });

// Sub-schema for Reviewer
const reviewerSchema = new mongoose.Schema({
  reviewerNumber: { type: Number },
  reviewerName: { type: String, trim: true },
  reviewerEmail: { type: String, trim: true, lowercase: true },
  emailSent: { type: Boolean, default: false },
  emailSentDate: { type: Date },
});

// Main AJMT Paper Schema
const ajmtPaperSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, trim: true, uppercase: true },
    paperTitle: { type: String, trim: true },
    titleSubject: { type: String, trim: true },
    paperType: { type: String, trim: true },
    date: { type: Date },
    plagiarismPercentage: { type: Number, default: 0 },
    reviewDate: { type: Date },
    paperFile: { type: String },
    paperFileName: { type: String },
    paperFileSize: { type: Number },
    paperUploadDate: { type: Date },
    authors: [authorSchema], // Now optional, can be an empty array
    reviewers: [reviewerSchema], // Now optional, no max limit enforced here
    tentativeDateOfPublication: { type: Date },
    websiteUpdateDate: { type: Date },
    hardcopyDate: { type: Date },
    remarks: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Draft", "Under Review", "Accepted", "Rejected", "Published"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes kept for performance, but they don't block null data
ajmtPaperSchema.index({ paperTitle: "text", titleSubject: "text" });
ajmtPaperSchema.index({ date: -1 });
ajmtPaperSchema.index({ status: 1 });

// Helper method
ajmtPaperSchema.methods.getReviewerByNumber = function (reviewerNumber) {
  return this.reviewers.find(
    (r) => r.reviewerNumber === parseInt(reviewerNumber)
  );
};

const AJMTPaper = mongoose.model("AJMTPaper", ajmtPaperSchema);

module.exports = AJMTPaper;