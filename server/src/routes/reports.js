const express = require("express");
const router = express.Router();

const db = require("../db/database");
const { verifyJwt, requireAdmin } = require("../utils/auth");

// ✅ POST /reports (authenticated users)
router.post("/", verifyJwt, async (req, res) => {
  try {
    const { title, description, category, problem, latitude, longitude } = req.body;

    if (!title || !category) {
      return res
        .status(400)
        .json({ error: "Title and category are required" });
    }

    const result = await db.query(
      `
      INSERT INTO reports 
      (user_id, title, description, category,problem, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        req.user.id,
        title,
        description || "",
        category,
        problem || "",
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

// ✅ GET /reports (public / authenticated – your choice)
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

// ✅ PATCH /reports/:id/status (admin only)
router.patch(
  "/:id/status",
  verifyJwt,
  requireAdmin,
  async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    const allowedStatuses = ["open", "in-progress", "resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    try {
      const result = await db.query(
        `
        UPDATE reports
        SET status = $1
        WHERE id = $2
        RETURNING *
        `,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating status:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
