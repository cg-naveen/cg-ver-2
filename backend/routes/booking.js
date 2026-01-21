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
          b.age, b.message, b.cancelled_at, b.cancellation_reason, b.cancellation_note,
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
    booking_status,
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
             email=$9, phone_number=$10, age=$11, message=$12, booking_status=$13
       WHERE booking_id=$14`,
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
        booking_status,
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

/* --------------------------------------------------------
   CANCEL BOOKING (USER)
-------------------------------------------------------- */
router.post("/:booking_id/cancel", requireAuth, async (req, res) => {
  const { booking_id } = req.params;
  const { reason, note } = req.body;
  const userId = req.user.user_id;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: "Cancellation reason is required" });
  }

  try {
    // 1️⃣ Fetch booking
    const bookingRes = await pool.query(
      `SELECT booking_status, check_in_date
       FROM bookings
       WHERE booking_id = $1 AND user_id = $2`,
      [booking_id, userId]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingRes.rows[0];

    // 2️⃣ Prevent double cancellation
    if (booking.booking_status.toLowerCase() === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // 3️⃣ Validate booking status
    const allowedStatuses = ["pending payment", "completed"];
    if (!allowedStatuses.includes(booking.booking_status.toLowerCase())) {
      return res.status(400).json({ message: "This booking cannot be cancelled" });
    }

    // 4️⃣ Check date (must be future)
    const todayMY = dayjs().tz(MALAYSIA_TZ).startOf("day");
    const checkInMY = dayjs(booking.check_in_date).tz(MALAYSIA_TZ);

    if (!checkInMY.isAfter(todayMY)) {
      return res.status(400).json({ message: "Past or ongoing bookings cannot be cancelled" });
    }

    // 5️⃣ Update booking
    await pool.query(
      `UPDATE bookings
       SET booking_status = 'cancelled',
           cancelled_at = NOW(),
           cancellation_reason = $1,
           cancellation_note = $2,
           refund_status = 'pending',
           refund_amount = total_price,
           updated_at = NOW()
       WHERE booking_id = $3
         AND booking_status IN ('completed', 'pending payment)`,
      [reason.trim(), note || null, booking_id]
    );    

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

/* --------------------------------------------------------
   GET ALL CANCELLED BOOKINGS (SUPERADMIN)
-------------------------------------------------------- */
router.get("/cancelled", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          b.booking_id,
          b.check_in_date,
          b.cancelled_at,
          b.first_name,
          b.last_name
       FROM bookings b
       WHERE b.booking_status = 'cancelled'
       ORDER BY b.cancelled_at DESC`
       
    );

    const bookings = result.rows.map(b => ({
      ...b,
      check_in_date: dayjs.utc(b.check_in_date).tz(MALAYSIA_TZ).format("YYYY-MM-DD"),
      cancelled_at: dayjs.utc(b.cancelled_at).tz(MALAYSIA_TZ).format("YYYY-MM-DD HH:mm"),
      guest_name: `${b.first_name} ${b.last_name}`
    }));

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching cancelled bookings:", err);
    res.status(500).json({ message: "Error fetching cancelled bookings" });
  }
});

/* --------------------------------------------------------
   GET CANCELLED BOOKING DETAILS (SUPERADMIN)
-------------------------------------------------------- */
router.get("/cancelled/:booking_id", requireAuth, async (req, res) => {
  const { booking_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT
          b.booking_id,
          b.first_name,
          b.last_name,
          b.total_price,
          b.check_in_date,
          b.cancelled_at,
          b.cancellation_reason,
          b.cancellation_note,
          r.room_name,
          h.name AS hotel_name
       FROM bookings b
       LEFT JOIN rooms r ON r.room_id = b.room_id
       LEFT JOIN hotels h ON h.hotel_id = r.hotel_id
       WHERE b.booking_id = $1
         AND b.booking_status = 'cancelled'`,
      [booking_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cancelled booking not found" });
    }

    const booking = result.rows[0];

    const formattedBooking = {
      booking_id: booking.booking_id,
      guest_name: `${booking.first_name} ${booking.last_name}`,
      hotel_name: booking.hotel_name,
      room_name: booking.room_name,
      total_price: booking.total_price,
      check_in_date: dayjs.utc(booking.check_in_date).tz(MALAYSIA_TZ).format("YYYY-MM-DD"),
      cancelled_at: dayjs.utc(booking.cancelled_at).tz(MALAYSIA_TZ).format("YYYY-MM-DD HH:mm"),
      cancellation_reason: booking.cancellation_reason,
      cancellation_note: booking.cancellation_note
    };

    res.json({ booking: formattedBooking });
  } catch (err) {
    console.error("Error fetching cancelled booking details:", err);
    res.status(500).json({ message: "Error fetching booking details" });
  }
});


export default router;


