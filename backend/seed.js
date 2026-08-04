// STEP 1: Load environment variables FIRST
const dotenv = require("dotenv");
dotenv.config();

// STEP 2: Then require other files (they can now access process.env)
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const fullAccess = {
  standards: true,
  abstracts: true,
  periodicals: true,
  kcMembers: true,
  arrivalsNews: true,
  ajmtPapers: true,
  reports: true,
  upload: true,
};

const noAccess = {
  standards: false,
  abstracts: false,
  periodicals: false,
  kcMembers: false,
  arrivalsNews: false,
  ajmtPapers: false,
  reports: false,
  upload: false,
};

// These are your fixed credentials
const users = [
  {
    role: "ADMIN",
    password: "Admin@123",
    permissions: fullAccess,
  },

  {
    role: "STAFF1",
    password: "Staff1@123",
    permissions: noAccess,
  },

  {
    role: "STAFF2",
    password: "Staff2@123",
    permissions: noAccess,
  },

  {
    role: "STAFF3",
    password: "Staff3@123",
    permissions: noAccess,
  },

  {
    role: "STAFF4",
    password: "Staff4@123",
    permissions: noAccess,
  },
];

const seedUsers = async () => {
  try {
    console.log("🔄 Connecting to database...");
    console.log("URI:", process.env.MONGO_URI); // This should show your URI

    await connectDB();

    // Give database a moment to fully connect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("🗑️  Clearing existing users...");
    await User.deleteMany();

    console.log("📝 Creating new users...");
    await User.create(users);

    console.log("✅ Users seeded successfully!");
    console.log("----------------------------");
    console.log("ADMIN - Admin@123");
    console.log("USER - User@123");
    console.log("STAFF - Staff@123");
    console.log("----------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed!");
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

seedUsers();
