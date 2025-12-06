const jwt = require("jsonwebtoken");

exports.verifyJwt = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
