import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      hotel_provider_id: user.hotel_provider_id || null,
      service_provider_id: user.service_provider_id || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  });
};

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  const { email, password, username, phone } = req.body || {};

  if (!email || !password || !username || !phone) {
    return res.status(400).json({ message: "All details are required." });
  }

  try {
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (email, password_hash, username, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, email, username, phone, role
      `,
      [email.toLowerCase(), hashed, username, phone]
    );

    const user = result.rows[0];
    const token = signToken(user);
    setTokenCookie(res, token);

    res.status(201).json({ user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body || {};

  if ((!email && !username) || !password) {
    return res.status(400).json({ message: "All credentials required" });
  }

  try {
    const identifier = email ? email.toLowerCase() : username;

    const result = await pool.query(
      `
      SELECT u.user_id, u.email, u.password_hash, u.username, u.phone, u.role,
             hp.hotel_provider_id,
             sp.service_provider_id
      FROM users u
      LEFT JOIN hotel_providers hp ON hp.user_id = u.user_id
      LEFT JOIN service_providers sp ON sp.user_id = u.user_id
      WHERE u.email = $1 OR u.username = $1
      `,
      [identifier]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    setTokenCookie(res, token);

    delete user.password_hash;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGOUT ================= */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
});

/* ================= CURRENT USER ================= */
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      `
      SELECT u.user_id, u.email, u.username, u.phone, u.role,
             hp.hotel_provider_id,
             sp.service_provider_id
      FROM users u
      LEFT JOIN hotel_providers hp ON hp.user_id = u.user_id
      LEFT JOIN service_providers sp ON sp.user_id = u.user_id
      WHERE u.user_id = $1
      `,
      [payload.user_id]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export default router;
