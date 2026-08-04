const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const permissionsSchema = new mongoose.Schema(
  {
    standards: {
      type: Boolean,
      default: false,
    },
    abstracts: {
      type: Boolean,
      default: false,
    },
    periodicals: {
      type: Boolean,
      default: false,
    },
    kcMembers: {
      type: Boolean,
      default: false,
    },
    arrivalsNews: {
      type: Boolean,
      default: false,
    },
    ajmtPapers: {
      type: Boolean,
      default: false,
    },
    reports: {
      type: Boolean,
      default: false,
    },
    upload: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["ADMIN", "STAFF1", "STAFF2", "STAFF3", "STAFF4"],
      required: [true, "Please provide a role"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
