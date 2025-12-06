require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

require("./utils/passport-google");
app.use("/auth", require("./routes/auth"));


function verifyJwt(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}


app.get("/me", verifyJwt, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
  });
});


app.get("/", (req, res) => {
  res.json({ message: "Neighbourhood Reporter API is running" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
