import express from "express";
import pool from "../db.js";
import { requireAuth } from "../authMiddleware.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();
const MALAYSIA_TZ = "Asia/Kuala_Lumpur";

/* --------------------------------------------------------
   Helper to convert booking dates to Malaysia timezone
-------------------------------------------------------- */
const convertBookingDates = (booking) => ({
  ...booking,
  check_in_date: dayjs.utc(booking.check_in_date).tz(MALAYSIA_TZ).format("YYYY-MM-DD"),
  check_out_date: dayjs.utc(booking.check_out_date).tz(MALAYSIA_TZ).format("YYYY-MM-DD"),
});

/* --------------------------------------------------------
   GET ALL BOOKINGS (WITH SERVICE QUANTITY + MAX QUANTITY)
-------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          b.booking_id, b.user_id, b.room_id,
          r.room_name, h.name AS hotel_name,
          b.check_in_date, b.check_out_date,
          b.num_guests, b.booking_status, b.total_price,
          b.first_name, b.last_name, b.email, b.phone_number,
          b.age, b.message,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'service_booking_id', sb.service_booking_id,
                'service_id', s.service_id,
                'service_name', s.service_name,
                'price', s.price,
                'max_quantity', s.max_quantity,
                'quantity', sb.quantity,
                'subtotal', sb.subtotal
              )
            ) FILTER (WHERE sb.service_booking_id IS NOT NULL),
            '[]'
          ) AS services
        FROM bookings b
        LEFT JOIN rooms r ON r.room_id = b.room_id
        LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
        LEFT JOIN service_bookings sb ON sb.booking_id = b.booking_id
        LEFT JOIN services s ON s.service_id = sb.service_id
        GROUP BY b.booking_id, r.room_name, h.name
        ORDER BY b.check_in_date DESC`
    );

    const bookings = result.rows.map(convertBookingDates);

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

/* --------------------------------------------------------
   GET BOOKINGS FOR LOGGED-IN USER
-------------------------------------------------------- */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await pool.query(
      `SELECT 
          b.booking_id, b.user_id, b.room_id,
          r.room_name, h.name AS hotel_name,
          b.check_in_date, b.check_out_date, b.total_price, b.booking_status,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'service_booking_id', sb.service_booking_id,
                'service_id', s.service_id,
                'service_name', s.service_name,
                'price', s.price,
                'max_quantity', s.max_quantity,
                'quantity', sb.quantity,
                'subtotal', sb.subtotal
              )
            ) FILTER (WHERE sb.service_booking_id IS NOT NULL),
            '[]'
          ) AS services
        FROM bookings b
        LEFT JOIN rooms r ON r.room_id = b.room_id
        LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
        LEFT JOIN service_bookings sb ON sb.booking_id = b.booking_id
        LEFT JOIN services s ON s.service_id = sb.service_id
        WHERE b.user_id = $1
        GROUP BY b.booking_id, r.room_name, h.name
        ORDER BY b.check_in_date DESC`,
      [userId]
    );

    const bookings = result.rows.map(convertBookingDates);

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

/* --------------------------------------------------------
   CHECK DATE OVERLAPS
-------------------------------------------------------- */
router.get("/overlap", async (req, res) => {
  const { room_id, check_in, check_out } = req.query;

  if (!room_id || !check_in || !check_out) {
    return res.status(400).json({ message: "room_id, check_in, check_out required" });
  }

  try {
    const result = await pool.query(
      `SELECT *
       FROM bookings
       WHERE room_id = $1
         AND NOT (check_out_date < $2 OR check_in_date > $3)
       ORDER BY check_in_date`,
      [room_id, check_in, check_out]
    );

    // Optional: convert overlap dates to Malaysia timezone
    const overlaps = result.rows.map(convertBookingDates);

    res.json(overlaps);
  } catch (err) {
    console.error("Error fetching overlaps:", err);
    res.status(500).json({ message: "Error fetching overlaps" });
  }
});

/* --------------------------------------------------------
   CREATE BOOKING (WITH SERVICE QUANTITIES)
-------------------------------------------------------- */
router.post("/", async (req, res) => {
  const {
    user_id,
    room_id,
    check_in_date,
    check_out_date,
    num_guests,
    total_price,
    first_name,
    last_name,
    email,
    phone_number,
    age,
    message,
    selected_services,
  } = req.body;

  if (!room_id || !check_in_date || !check_out_date || !num_guests || !total_price || !first_name || !phone_number) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookingRes = await client.query(
      `INSERT INTO bookings
        (user_id, room_id, check_in_date, check_out_date, num_guests, total_price, first_name, last_name, email, phone_number, age, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING booking_id`,
      [
        user_id || null,
        room_id,
        check_in_date,
        check_out_date,
        num_guests,
        total_price,
        first_name,
        last_name,
        email || null,
        phone_number,
        age || null,
        message || null,
      ]
    );

    const booking_id = bookingRes.rows[0].booking_id;

    if (Array.isArray(selected_services)) {
      for (const item of selected_services) {
        const { service_id, quantity } = item;

        await client.query(
          `INSERT INTO service_bookings (service_booking_id, booking_id, service_id, quantity, subtotal)
           SELECT gen_random_uuid(), $1, service_id, $2, price * $2
           FROM services
           WHERE service_id = $3`,
          [booking_id, quantity || 1, service_id]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "Booking created", booking_id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating booking:", err);
    res.status(500).json({ message: "Error creating booking" });
  } finally {
    client.release();
  }
});

/* --------------------------------------------------------
   UPDATE BOOKING (REPLACES SERVICES)
-------------------------------------------------------- */
router.put("/:booking_id", async (req, res) => {
  const booking_id = req.params.booking_id;
  const {
    user_id,
    room_id,
    check_in_date,
    check_out_date,
    num_guests,
    total_price,
    first_name,
    last_name,
    email,
    phone_number,
    age,
    message,
    selected_services,
  } = req.body;

  if (!room_id || !check_in_date || !check_out_date || !num_guests || !total_price || !first_name || !phone_number) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE bookings
         SET user_id=$1, room_id=$2, check_in_date=$3, check_out_date=$4,
             num_guests=$5, total_price=$6, first_name=$7, last_name=$8,
             email=$9, phone_number=$10, age=$11, message=$12
       WHERE booking_id=$13`,
      [
        user_id || null,
        room_id,
        check_in_date,
        check_out_date,
        num_guests,
        total_price,
        first_name,
        last_name,
        email || null,
        phone_number,
        age || null,
        message || null,
        booking_id,
      ]
    );

    await client.query(`DELETE FROM service_bookings WHERE booking_id=$1`, [booking_id]);

    if (Array.isArray(selected_services)) {
      for (const item of selected_services) {
        const { service_id, quantity } = item;

        await client.query(
          `INSERT INTO service_bookings (service_booking_id, booking_id, service_id, quantity, subtotal)
           SELECT gen_random_uuid(), $1, service_id, $2, price * $2
           FROM services
           WHERE service_id = $3`,
          [booking_id, quantity || 1, service_id]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Booking updated", booking_id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Error updating booking" });
  } finally {
    client.release();
  }
});

export default router;


