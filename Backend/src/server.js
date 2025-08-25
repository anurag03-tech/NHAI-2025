const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const seedOperator = require("./utils/seedOperator");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

//  CORS - This will work for all scenarios
app.use(
  cors({
    origin: function (origin, callback) {
      // Always allow requests - for development and testing
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Seed initial users
const seedAll = async () => {
  await seedAdmin();
  await seedOperator();
};
seedAll();

// Health route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date() });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/toilets", require("./routes/location"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/penalties", require("./routes/penalties"));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Self-ping every 18 minutes using axios
setInterval(async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/health`);
    console.log("Keep-alive ping:", res.data.time);
  } catch (err) {
    console.error("Keep-alive failed:", err.message);
  }
}, 1000 * 60 * 18);
