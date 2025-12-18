const db = require("../db/database");
const jwt = require("jsonwebtoken");


async function verifyJwt(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    await db.query(
      `
      INSERT INTO users (id, email)
      VALUES ($1, $2)
      ON CONFLICT (id) DO NOTHING
      `,
      [user.id, user.email]
    );
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

const ADMIN_EMAILS = ["anshul2004ak@gmail.com"];

function requireAdmin(req, res, next) {
  if (!ADMIN_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}


module.exports = {
  verifyJwt,
  requireAdmin,
};
