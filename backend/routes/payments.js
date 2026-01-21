import express from "express";
import pool from "../db.js";

const router = express.Router();

// PAYMENTS CRUD

// GET all payments
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.payment_id,
                p.booking_id,
                p.amount,
                p.payment_method,
                p.payment_date,
                p.payment_reference,
                p.created_at,
                p.updated_at,
                b.first_name || ' ' || b.last_name AS guest_name
             FROM payments p
             JOIN bookings b ON p.booking_id = b.booking_id
             ORDER BY p.payment_date DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ message: "Error fetching payments" });
    }
});

// GET single payment
router.get("/payments/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM payments WHERE payment_id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching payment:", err);
        res.status(500).json({ message: "Error fetching payment" });
    }
});

// CREATE a payment
router.post("/payments", async (req, res) => {
    const { booking_id, amount, payment_method, payment_date, payment_reference } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO payments (booking_id, amount, payment_method, payment_date, payment_reference)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [booking_id, amount, payment_method, payment_date, payment_reference]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating payment:", err);
        res.status(500).json({ message: "Error creating payment" });
    }
});

// UPDATE a payment
router.put("/payments/:id", async (req, res) => {
    const { id } = req.params;
    const { booking_id, amount, payment_method, payment_date, payment_reference } = req.body;

    try {
        const result = await pool.query(
            `UPDATE payments
             SET booking_id = $1,
                 amount = $2,
                 payment_method = $3,
                 payment_date = $4,
                 payment_reference = $5,
                 updated_at = NOW()
             WHERE payment_id = $6
             RETURNING *`,
            [booking_id, amount, payment_method, payment_date, payment_reference, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating payment:", err);
        res.status(500).json({ message: "Error updating payment" });
    }
});

// DELETE a payment
router.delete("/payments/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM payments WHERE payment_id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.json({ message: "Payment deleted successfully" });
    } catch (err) {
        console.error("Error deleting payment:", err);
        res.status(500).json({ message: "Error deleting payment" });
    }
});


// REFUNDS CRUD

// GET all refund requests
router.get("/refunds", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
            b.booking_id,
            b.first_name,
            b.last_name,
            b.refund_status,
            b.refund_amount,
            b.refunded_at,
            b.total_price,
            b.cancelled_at
         FROM bookings b
         WHERE b.booking_status = 'cancelled'
           AND b.refund_status IN ('pending', 'approved', 'rejected')
         ORDER BY b.cancelled_at DESC`
      );
  
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching refunds:", err);
      res.status(500).json({ message: "Error fetching refunds" });
    }
  });
  
  
    // ==============================
// CREATE refund request (by booking)
// ==============================
router.post("/refunds", async (req, res) => {
    const { booking_id } = req.body;
  
    try {
      const result = await pool.query(
        `UPDATE bookings
         SET refund_status = 'pending',
             refund_amount = total_price,
             updated_at = NOW()
         WHERE booking_id = $1
           AND booking_status = 'cancelled'
           AND refund_status IS NULL
         RETURNING booking_id, refund_status, refund_amount`,
        [booking_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(400).json({
          message: "Refund not applicable for this booking"
        });
      }
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating refund:", err);
      res.status(500).json({ message: "Error creating refund request" });
    }
  });
  
  
// UPDATE refund status
router.put("/refunds/:booking_id/status", async (req, res) => {
    const { booking_id } = req.params;
    const { status } = req.body; // approved | rejected
  
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid refund status" });
    }
  
    try {
      const result = await pool.query(
        `UPDATE bookings
         SET refund_status = $1,
             refunded_at = CASE 
               WHEN $1 = 'approved' THEN NOW()
               ELSE NULL
             END,
             updated_at = NOW()
         WHERE booking_id = $2 AND refund_status = 'pending'
         RETURNING booking_id, refund_status, refunded_at`,
        [status, booking_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating refund status:", err);
      res.status(500).json({ message: "Error updating refund status" });
    }
  });
  
export default router;
