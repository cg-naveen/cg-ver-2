import express from "express";
import pool from "../../db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { requireAuth, requireRole } from "../../authMiddleware.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const MALAYSIA_TZ = "Asia/Kuala_Lumpur";
const router = express.Router();

/* ======================================================
   Helpers
====================================================== */
const convertBookingDates = booking => ({
  ...booking,
  check_in_date: dayjs
    .utc(booking.check_in_date)
    .tz(MALAYSIA_TZ)
    .format("YYYY-MM-DD"),
  check_out_date: dayjs
    .utc(booking.check_out_date)
    .tz(MALAYSIA_TZ)
    .format("YYYY-MM-DD")
});

const getHotelIdFromProvider = async hotel_provider_id => {
  const res = await pool.query(
    `SELECT * FROM hotels WHERE hotel_provider_id = $1`,
    [hotel_provider_id]
  );
  if (!res.rows[0]) throw new Error("Hotel not found");
  return res.rows[0];
};

/* ======================================================
   DASHBOARD
====================================================== */
router.get(
  "/:hotel_provider_id/dashboard",
  requireAuth,
  requireRole("hotel_provider"),
  async (req, res) => {
    const { hotel_provider_id } = req.params;

    if (req.user.hotel_provider_id !== hotel_provider_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const hotel = await getHotelIdFromProvider(hotel_provider_id);
      const hotel_id = hotel.hotel_id;

      /* ---------- STATS ---------- */
      const statsRes = await pool.query(
        `
        SELECT
          (SELECT COUNT(*) FROM rooms WHERE hotel_id = $1) AS total_rooms,

          (SELECT COUNT(*)
           FROM bookings b
           JOIN rooms r ON b.room_id = r.room_id
           WHERE r.hotel_id = $1
             AND b.booking_status <> 'cancelled'
             AND b.check_in_date <= CURRENT_DATE
             AND b.check_out_date >= CURRENT_DATE
          ) AS active_bookings,

          (SELECT COUNT(*)
           FROM bookings b
           JOIN rooms r ON b.room_id = r.room_id
           WHERE r.hotel_id = $1
             AND b.booking_status <> 'cancelled'
             AND b.check_in_date > CURRENT_DATE
          ) AS incoming_checkins,

          (SELECT COUNT(*)
           FROM bookings b
           JOIN rooms r ON b.room_id = r.room_id
           WHERE r.hotel_id = $1
             AND b.booking_status <> 'cancelled'
             AND DATE(b.created_at) = CURRENT_DATE
          ) AS bookings_today,

          COALESCE(
            ROUND(
              (
                (SELECT COUNT(*)
                 FROM bookings b
                 JOIN rooms r ON b.room_id = r.room_id
                 WHERE r.hotel_id = $1
                   AND b.booking_status = 'cancelled'
                )::decimal
                /
                NULLIF(
                  (SELECT COUNT(*)
                   FROM bookings b
                   JOIN rooms r ON b.room_id = r.room_id
                   WHERE r.hotel_id = $1
                  ), 0
                )
              ) * 100,
              2
            ),
            0
          ) AS cancellation_rate
        `,
        [hotel_id]
      );

      /* ---------- ROOMS ---------- */
      const roomsRes = await pool.query(
        `SELECT * FROM rooms WHERE hotel_id = $1 ORDER BY created_at DESC`,
        [hotel_id]
      );

      /* ---------- BOOKINGS (EXCLUDE CANCELLED) ---------- */
      const bookingsRes = await pool.query(
        `
        SELECT
          b.booking_id,
          b.user_id,
          b.first_name,
          b.last_name,
          b.email,
          b.phone_number,
          b.age,
          b.message,
          b.num_guests,
          b.total_price,
          b.booking_status,
          b.check_in_date,
          b.check_out_date,
          r.room_name,
          COALESCE(
  JSON_AGG(
    jsonb_build_object(
      'service_id', s.service_id,
      'service_name', s.service_name,
      'quantity', sb.quantity
    )
  )
  FILTER (WHERE s.service_id IS NOT NULL),
  '[]'
) AS services

        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN service_bookings sb ON sb.booking_id = b.booking_id
        LEFT JOIN services s ON s.service_id = sb.service_id
        WHERE r.hotel_id = $1
          AND b.booking_status <> 'cancelled'
        GROUP BY
          b.booking_id,
          b.user_id,
          b.first_name,
          b.last_name,
          b.email,
          b.phone_number,
          b.age,
          b.message,
          b.num_guests,
          b.total_price,
          b.booking_status,
          b.check_in_date,
          b.check_out_date,
          r.room_name
        ORDER BY b.check_in_date DESC
        `,
        [hotel_id]
      );

      /* ---------- CANCELLED BOOKINGS ---------- */
      const cancelledBookingsRes = await pool.query(
        `
        SELECT
          b.booking_id,
          b.user_id,
          b.first_name,
          b.last_name,
          b.email,
          b.phone_number,
          b.age,
          b.message,
          b.num_guests,
          b.total_price,
          b.booking_status,
          b.check_in_date,
          b.check_out_date,
          b.created_at,
          r.room_name
        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        WHERE r.hotel_id = $1
          AND b.booking_status = 'cancelled'
        ORDER BY b.created_at DESC
        `,
        [hotel_id]
      );

      /* ---------- UPCOMING & ACTIVE ---------- */
      const today = dayjs().format("YYYY-MM-DD");
      const allBookings = bookingsRes.rows.map(convertBookingDates);

      const upcomingBookings = allBookings.filter(
        b => b.check_in_date > today
      );

      const activeBookings = allBookings.filter(
        b =>
          b.check_in_date <= today &&
          b.check_out_date >= today
      );

      res.json({
        hotel,
        stats: statsRes.rows[0],
        rooms: roomsRes.rows,
        bookings: allBookings,
        upcomingBookings,
        activeBookings,
        cancelledBookings: cancelledBookingsRes.rows.map(convertBookingDates)
      });
    } catch (err) {
      console.error("Hotel dashboard error:", err);
      res.status(500).json({ message: "Failed to load hotel dashboard" });
    }
  }
);

/* ======================================================
   ROOMS MANAGEMENT
====================================================== */
router.get(
  "/:hotel_provider_id/rooms",
  requireAuth,
  requireRole("hotel_provider"),
  async (req, res) => {
    const { hotel_provider_id } = req.params;

    if (req.user.hotel_provider_id !== hotel_provider_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const hotel = await getHotelIdFromProvider(hotel_provider_id);
      const result = await pool.query(
        `SELECT * FROM rooms WHERE hotel_id = $1 ORDER BY created_at DESC`,
        [hotel.hotel_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  }
);

router.post(
  "/:hotel_provider_id/rooms",
  requireAuth,
  requireRole("hotel_provider"),
  async (req, res) => {
    const { hotel_provider_id } = req.params;

    if (req.user.hotel_provider_id !== hotel_provider_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const hotel = await getHotelIdFromProvider(hotel_provider_id);
      const {
        room_number,
        room_name,
        category,
        rate,
        availability_status = true,
        room_features,
        images,
        max_guests,
        rating = 0
      } = req.body;

      const result = await pool.query(
        `
        INSERT INTO rooms
        (hotel_id, room_number, room_name, category, rate, availability_status,
         room_features, images, max_guests, rating)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
        `,
        [
          hotel.hotel_id,
          room_number,
          room_name,
          category,
          rate,
          availability_status,
          JSON.stringify(room_features || {}),
          JSON.stringify(images || []),
          max_guests,
          rating
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error adding room:", err);
      res.status(500).json({ message: "Failed to add room" });
    }
  }
);

/* ======================================================
   BOOKINGS HISTORY
====================================================== */
router.get(
  "/:hotel_provider_id/bookings",
  requireAuth,
  requireRole("hotel_provider"),
  async (req, res) => {
    const { hotel_provider_id } = req.params;

    if (req.user.hotel_provider_id !== hotel_provider_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const hotel = await getHotelIdFromProvider(hotel_provider_id);

      const result = await pool.query(
        `
        SELECT
          b.booking_id,
          b.user_id,
          b.first_name,
          b.last_name,
          b.email,
          b.phone_number,
          b.age,
          b.message,
          b.num_guests,
          b.total_price,
          b.booking_status,
          b.check_in_date,
          b.check_out_date,
          r.room_name,
          COALESCE(
  JSON_AGG(
    jsonb_build_object(
      'service_id', s.service_id,
      'service_name', s.service_name,
      'quantity', sb.quantity
    )
  )
  FILTER (WHERE s.service_id IS NOT NULL),
  '[]'
) AS services

        FROM bookings b
        JOIN rooms r ON b.room_id = r.room_id
        LEFT JOIN service_bookings sb ON sb.booking_id = b.booking_id
        LEFT JOIN services s ON s.service_id = sb.service_id
        WHERE r.hotel_id = $1
        GROUP BY
          b.booking_id,
          b.user_id,
          b.first_name,
          b.last_name,
          b.email,
          b.phone_number,
          b.age,
          b.message,
          b.num_guests,
          b.total_price,
          b.booking_status,
          b.check_in_date,
          b.check_out_date,
          r.room_name
        ORDER BY b.check_in_date DESC
        `,
        [hotel.hotel_id]
      );

      res.json(result.rows.map(convertBookingDates));
    } catch (err) {
      console.error("Error fetching bookings:", err);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  }
);

export default router;


