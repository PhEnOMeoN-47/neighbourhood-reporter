require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const app = express();

// ✅ CORS (required for cookies)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// ✅ Load Google strategy
require("./utils/passport-google");

// ✅ Routes
app.use("/auth", require("./routes/auth"));

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "Neighbourhood Reporter API is running" });
});

// ✅ Start server – force IPv4
const PORT = process.env.PORT || 4000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
