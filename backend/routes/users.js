import express from "express";
import pool from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

/**
 * =========================
 * ADMIN: GET all users
 * =========================
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, email, username, phone, address, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

/**
 * =========================
 * AUTH USER: GET my profile (include favourites)
 * =========================
 */
router.get("/me/profile", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, email, username, phone, address, role, created_at, favourites
       FROM users
       WHERE user_id = $1`,
      [req.user.user_id]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/**
 * =========================
 * ADMIN: GET user by ID
 * =========================
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT user_id, email, username, phone, address, role, created_at, updated_at
       FROM users
       WHERE user_id = $1`,
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

/**
 * =========================
 * AUTH USER: UPDATE my profile
 * =========================
 */
router.put("/me/profile", requireAuth, async (req, res) => {
  const { username, phone, address } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           updated_at = NOW()
       WHERE user_id = $4
       RETURNING user_id, email, username, phone, address, role, updated_at, favourites`,
      [username, phone, address, req.user.user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

/**
 * =========================
 * ADMIN: CREATE user
 * =========================
 */
router.post("/", async (req, res) => {
  const { email, username, password_hash, phone, address, role } = req.body;

  if (!email || !username || !password_hash) {
    return res.status(400).json({ message: "email, username and password_hash are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, phone, address, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, email, username, phone, address, role, created_at`,
      [
        email.toLowerCase(),
        username,
        password_hash,
        phone || null,
        address || null,
        role || "user"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "23505") return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Error creating user" });
  }
});

/**
 * =========================
 * ADMIN: UPDATE user by ID
 * =========================
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { email, username, password_hash, phone, address, role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET email = COALESCE($1, email),
           username = COALESCE($2, username),
           password_hash = COALESCE($3, password_hash),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           role = COALESCE($6, role),
           updated_at = NOW()
       WHERE user_id = $7
       RETURNING user_id, email, username, phone, address, role, updated_at`,
      [email, username, password_hash, phone, address, role, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});

/**
 * =========================
 * ADMIN: DELETE user
 * =========================
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE user_id = $1
       RETURNING user_id`,
      [id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

/**
 * =========================
 * USER FAVOURITES
 * =========================
 */

// GET favourites
router.get("/fav", requireAuth, async (req, res) => {
  try {
    const { user_id } = req.user;
    const result = await pool.query(
      "SELECT favourites FROM users WHERE user_id = $1",
      [user_id]
    );

    res.json({ favourites: result.rows[0]?.favourites || [] });
  } catch (err) {
    console.error("Error fetching favourites:", err);
    res.status(500).json({ message: "Error fetching favourites" });
  }
});

// ADD favourite
router.post("/add", requireAuth, async (req, res) => {
  const { room_id } = req.body;
  if (!room_id) return res.status(400).json({ message: "room_id is required" });

  const { user_id } = req.user;

  try {
    await pool.query(
      `UPDATE users
       SET favourites = CASE
         WHEN favourites IS NULL THEN to_jsonb(ARRAY[$1]::text[])
         WHEN NOT favourites @> to_jsonb(ARRAY[$1]::text[]) THEN favourites || to_jsonb(ARRAY[$1]::text[])
         ELSE favourites
       END
       WHERE user_id = $2`,
      [room_id, user_id]
    );

    const result = await pool.query(
      "SELECT favourites FROM users WHERE user_id = $1",
      [user_id]
    );

    res.json({ favourites: result.rows[0]?.favourites || [] });
  } catch (err) {
    console.error("Error adding favourite:", err);
    res.status(500).json({ message: "Could not add favourite" });
  }
});

// REMOVE favourite
router.post("/remove", requireAuth, async (req, res) => {
    const { room_id } = req.body;
    if (!room_id) {
      return res.status(400).json({ message: "room_id is required" });
    }
  
    const { user_id } = req.user;
  
    try {
      await pool.query(
        `
        UPDATE users
        SET favourites = (
          SELECT COALESCE(
            jsonb_agg(elem),
            '[]'::jsonb
          )
          FROM jsonb_array_elements_text(
            COALESCE(favourites, '[]'::jsonb)
          ) AS elem
          WHERE elem <> $1
        )
        WHERE user_id = $2
        `,
        [room_id, user_id]
      );
  
      const result = await pool.query(
        "SELECT favourites FROM users WHERE user_id = $1",
        [user_id]
      );
  
      res.json({ favourites: result.rows[0]?.favourites || [] });
    } catch (err) {
      console.error("Error removing favourite:", err);
      res.status(500).json({ message: "Could not remove favourite" });
    }
  });
  
export default router;
