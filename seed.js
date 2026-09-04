/* Seeds the database the first time:
     1. Creates the admin account (email + bcrypt-hashed password from .env)
     2. Populates the content document with the initial portfolio data

   Run once after configuring .env:
       npm run seed

   The script is idempotent: running it again never duplicates records and
   never overwrites content you have already edited from the admin panel. */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const config = require("./src/config/env");
const { connectDB } = require("./src/config/db");
const Admin = require("./src/models/admin.model");
const Content = require("./src/models/content.model");
const { isPopulated } = require("./src/services/content.service");
const { seedContent } = require("./src/seed-data");

async function seed() {
  await connectDB();

  /* 1. Admin account */
  if (!config.admin.email) {
    console.error("ADMIN_EMAIL is not set in .env");
    process.exit(1);
  }

  const existingAdmin = await Admin.findOne();
  if (existingAdmin) {
    console.log(`[seed] Admin already exists (${existingAdmin.email}). Skipping.`);
  } else {
    const hash = await bcrypt.hash(config.admin.password, 10);
    await Admin.create({ email: config.admin.email, passwordHash: hash });
    console.log(`[seed] Admin account created for ${config.admin.email}`);
  }

  /* 2. Initial content */
  const doc = await Content.getSingleton();
  if (isPopulated(doc.data)) {
    console.log("[seed] Content already populated. Skipping (your edits are safe).");
  } else {
    doc.data = seedContent;
    doc.markModified("data");
    await doc.save();
    console.log("[seed] Initial portfolio content inserted.");
  }

  await mongoose.disconnect();
  console.log("[seed] Done.");
}

seed().catch((err) => {
  console.error("[seed] Failed:", err.message);
  process.exit(1);
});
