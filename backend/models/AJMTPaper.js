const mongoose = require("mongoose");

// Sub-schema for Author
const authorSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: true,
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
      required: true,
      min: 1,
      max: 3,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    reviews: [reviewSchema],
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
      required: [true, "Unique ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    paperTitle: {
      type: String,
      required: [true, "Paper title is required"],
      trim: true,
    },
    titleSubject: {
      type: String,
      required: [true, "Title subject is required"],
      trim: true,
    },
    paperType: {
      type: String,
      required: [true, "Paper type is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
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
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
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

// Method to add a new author
ajmtPaperSchema.methods.addAuthor = function (authorData) {
  this.authors.push(authorData);
  return this.save();
};

// Method to add a reviewer
ajmtPaperSchema.methods.addReviewer = function (reviewerData) {
  if (this.reviewers.length >= 3) {
    throw new Error("Maximum 3 reviewers allowed");
  }
  this.reviewers.push(reviewerData);
  return this.save();
};

// Method to add a review to a specific reviewer
ajmtPaperSchema.methods.addReview = function (reviewerId, reviewData) {
  const reviewer = this.reviewers.id(reviewerId);
  if (!reviewer) {
    throw new Error("Reviewer not found");
  }
  reviewer.reviews.push(reviewData);
  return this.save();
};

ajmtPaperSchema.methods.hasPaperFile = function () {
  return !!this.paperFile;
};

ajmtPaperSchema.methods.getReviewerByNumber = function (reviewerNumber) {
  return this.reviewers.find(
    (r) => r.reviewerNumber === parseInt(reviewerNumber),
  );
};

const AJMTPaper = mongoose.model("AJMTPaper", ajmtPaperSchema);

module.exports = AJMTPaper;
