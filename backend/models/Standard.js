const mongoose = require("mongoose");
const Counter = require("./Counter");

const standardSchema = new mongoose.Schema(
  {
    icnNumber: {
      type: Number,
      unique: true,
    },
    requisition_no: { type: String, trim: true, default: "" },
    requisition_date: { type: Date },
    pr_no: { type: String, trim: true, default: "" },
    po_no: { type: String, trim: true, default: "" },
    amount: { type: Number, default: 0 },
    date_received: { type: Date },

    standardNumber: {
      type: String,
      required: [true, "Standard Number is required"],
      index: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    accnNumber: { type: String, trim: true, default: "" },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    edition: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Active", "Superseded", "Withdrawn"],
      default: "Active",
    },
    publisher: { type: String, trim: true, default: "" },
    publication_date: { type: Date },
    pages: { type: String, default: "" },
    isbn_issn: { type: String, trim: true, default: "" },
    doi_url: { type: String, trim: true, default: "" },

    amendment_date: { type: Date },
    amendment_remarks: { type: String, trim: true, default: "" },

    summary: { type: String, trim: true, default: "" },
    remarks: { type: String, trim: true, default: "" },
    keywords: { type: String, trim: true, default: "" },
  },
  {
    timestamps: true,
  },
);

standardSchema.pre("save", async function () {
  if (!this.isNew) return;

  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "icnNumber" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true },
    );
    this.icnNumber = counter.sequence_value;
  } catch (error) {
    throw error;
  }
});

module.exports = mongoose.model("Standard", standardSchema);
