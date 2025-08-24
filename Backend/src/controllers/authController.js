const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/userModel");
const { sendModeratorCredentials } = require("../utils/emailService");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Admin login
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    //  Universal cookie settings - works for both cross-origin and same-origin
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always true for HTTPS (required for sameSite: "none")
      sameSite: "none", // Allows cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logout = (req, res) => {
  //  Clear cookie with same settings
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.json({ message: "Logged out successfully" });
};

// Rest of your functions remain the same...
exports.createModerator = async (req, res) => {
  const { name, email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const randomPass = crypto.randomBytes(6).toString("hex");

    const moderator = await User.create({
      name,
      email,
      password: randomPass,
      role: "Moderator",
    });

    const emailResult = await sendModeratorCredentials(email, name, randomPass);

    if (emailResult.success) {
      console.log(`✅ Credentials emailed to: ${email}`);

      res.status(201).json({
        message:
          "Moderator created successfully and credentials sent via email",
        moderator: {
          id: moderator._id,
          name: moderator.name,
          email: moderator.email,
          role: moderator.role,
        },
        emailSent: true,
      });
    } else {
      console.log(`❌ Email failed for: ${email}. Password: ${randomPass}`);

      res.status(201).json({
        message: "Moderator created but email failed to send",
        moderator: {
          id: moderator._id,
          name: moderator.name,
          email: moderator.email,
          role: moderator.role,
        },
        tempPassword: randomPass,
        emailSent: false,
        emailError: emailResult.error,
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllModerators = async (req, res) => {
  try {
    const moderators = await User.find({ role: "Moderator" }).select(
      "-password"
    );

    res.status(200).json({
      count: moderators.length,
      moderators,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
