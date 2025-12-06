const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const db = require("../db/database");

// ✅ JWT middleware
function verifyJwt(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ✅ POST /reports
router.post("/", verifyJwt, async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    if (!title || !category) {
      return res
        .status(400)
        .json({ error: "Title and category are required" });
    }

    const result = await db.query(
      `
      INSERT INTO reports 
      (user_id, title, description, category, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        req.user.id,
        title,
        description || "",
        category,
        latitude || null,
        longitude || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ GET /reports
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM reports ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
