import express from "express";
import pool from "../db.js";

const router = express.Router();

/* =========================================
   GET all active services
========================================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         service_id,
         service_name,
         description,
         price,
         max_quantity,
         is_active,
         created_at,
         updated_at
       FROM services
       WHERE is_active = TRUE`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Error fetching services" });
  }
});

/* =========================================
   CREATE a new service
========================================= */
router.post("/", async (req, res) => {
  const { user_id, service_name, description, price, max_quantity } = req.body;

  if (!service_name || !price) {
    return res.status(400).json({ message: "service_name and price are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services 
         (user_id, service_name, description, price, max_quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        user_id || null,
        service_name,
        description || null,
        price,
        max_quantity || 1 // default 1
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ message: "Error creating service" });
  }
});

/* =========================================
   UPDATE a service
========================================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { service_name, description, price, is_active, max_quantity } = req.body;

  try {
    const result = await pool.query(
      `UPDATE services
       SET 
         service_name = COALESCE($1, service_name),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         is_active = COALESCE($4, is_active),
         max_quantity = COALESCE($5, max_quantity),
         updated_at = NOW()
       WHERE service_id = $6
       RETURNING *`,
      [
        service_name,
        description,
        price,
        is_active,
        max_quantity,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ message: "Error updating service" });
  }
});

/* =========================================
   DELETE a service (hard delete)
========================================= */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM services
       WHERE service_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ message: "Error deleting service" });
  }
});

export default router;
