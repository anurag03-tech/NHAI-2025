const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "Admin" });
    if (existingAdmin) {
      console.log(`⚠️ Admin already exists: ${existingAdmin.email}`);
      return;
    }

    const admin = await User.create({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "Admin",
    });

    console.log(`✅ Admin created successfully: ${admin.email}`);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
};

module.exports = seedAdmin;
