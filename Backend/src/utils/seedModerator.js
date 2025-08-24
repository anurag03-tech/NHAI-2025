const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const seedModerator = async () => {
  try {
    const existingModerator = await User.findOne({ role: "Moderator" });
    if (existingModerator) {
      console.log(`⚠️ Moderator already exists: ${existingModerator.email}`);
      return;
    }

    const moderator = await User.create({
      name: "Default Moderator",
      email: process.env.MODERATOR_EMAIL,
      password: process.env.MODERATOR_PASSWORD,
      role: "Moderator",
    });

    console.log(`✅ Moderator created successfully: ${moderator.email}`);
  } catch (err) {
    console.error("❌ Error creating moderator:", err.message);
  }
};

module.exports = seedModerator;
