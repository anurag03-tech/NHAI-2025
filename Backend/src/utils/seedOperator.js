const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const seedOperator = async () => {
  try {
    const existingOperator = await User.findOne({ role: "Operator" });
    if (existingOperator) {
      console.log(`⚠️ Operator already exists: ${existingOperator.email}`);
      return;
    }

    const operator = await User.create({
      name: "Default Operator",
      email: process.env.OPERATOR_EMAIL,
      password: process.env.OPERATOR_PASSWORD,
      role: "Operator",
    });

    console.log(`✅ Operator created successfully: ${operator.email}`);
  } catch (err) {
    console.error("❌ Error creating operator:", err.message);
  }
};

module.exports = seedOperator;
