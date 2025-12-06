const jwt = require("jsonwebtoken");


function verifyJwt(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
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
