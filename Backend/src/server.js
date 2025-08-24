const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const seedModerator = require("./utils/seedModerator");

dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow cookies across origins
  })
);

const seedAll = async () => {
  await seedAdmin();
  await seedModerator();
};

seedAll();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/toilets", require("./routes/location"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/penalties", require("./routes/penalties"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
