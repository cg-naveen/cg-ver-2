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



// ==============================
// REFUNDS CRUD
// ==============================

// GET all refunds
router.get("/refunds", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT refund_id, booking_id, refund_amount, reason, status,
                    created_at, updated_at
             FROM refunds
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching refunds:", err);
        res.status(500).json({ message: "Error fetching refunds" });
    }
});


// CREATE a refund request
router.post("/refunds", async (req, res) => {
    const { booking_id, refund_amount, reason } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO refunds (booking_id, refund_amount, reason, status)
             VALUES ($1, $2, $3, 'pending')
             RETURNING *`,
            [booking_id, refund_amount, reason]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating refund:", err);
        res.status(500).json({ message: "Error creating refund" });
    }
});


// UPDATE refund status (approve or reject)
router.put("/refunds/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // expected 'approved' or 'rejected'

    try {
        const result = await pool.query(
            `UPDATE refunds
             SET status = $1,
                 updated_at = NOW()
             WHERE refund_id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Refund not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating refund status:", err);
        res.status(500).json({ message: "Error updating refund status" });
    }
});


// DELETE a refund (if needed)
router.delete("/refunds/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM refunds WHERE refund_id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Refund not found" });
        }

        res.json({ message: "Refund deleted successfully" });
    } catch (err) {
        console.error("Error deleting refund:", err);
        res.status(500).json({ message: "Error deleting refund" });
    }
});



export default router;
