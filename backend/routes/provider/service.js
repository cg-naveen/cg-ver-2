import express from "express";
import pool from "../../db.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { requireAuth, requireRole } from "../../authMiddleware.js";
dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();
const MALAYSIA_TZ = "Asia/Kuala_Lumpur";

/* ======================================================
   Helper: convert booking dates to Malaysia timezone
===================================================== */
const convertBookingDates = (booking) => ({
  ...booking,
  check_in_date: booking.check_in_date
    ? dayjs.utc(booking.check_in_date).tz(MALAYSIA_TZ).format("YYYY-MM-DD")
    : null,
  check_out_date: booking.check_out_date
    ? dayjs.utc(booking.check_out_date).tz(MALAYSIA_TZ).format("YYYY-MM-DD")
    : null,
});

/* ======================================================
   SERVICE PROVIDER DASHBOARD
   GET /providers/service/:service_provider_id/dashboard
===================================================== */
router.get("/:service_provider_id/dashboard", requireAuth, requireRole("service_provider"), async (req, res) => {
  const { service_provider_id } = req.params;
  if (req.user.service_provider_id !== service_provider_id) {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    /* --------------------------------------------------
       PROVIDER INFO
    -------------------------------------------------- */
    const providerRes = await pool.query(
      `
      SELECT service_provider_id, org_name, contact
      FROM service_providers
      WHERE service_provider_id = $1
      `,
      [service_provider_id]
    );

    const provider = providerRes.rows[0];
    if (!provider) {
      return res.status(404).json({ message: "Service provider not found" });
    }

    /* --------------------------------------------------
       STATS
    -------------------------------------------------- */
    const statsRes = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM services WHERE service_provider_id = $1) AS total_services,
        (SELECT COUNT(*)
         FROM service_bookings sb
         JOIN services s ON s.service_id = sb.service_id
         WHERE s.service_provider_id = $1) AS total_bookings,
        (SELECT COUNT(*)
         FROM service_bookings sb
         JOIN services s ON s.service_id = sb.service_id
         JOIN bookings b ON b.booking_id = sb.booking_id
         WHERE s.service_provider_id = $1
           AND b.check_in_date <= CURRENT_DATE
           AND b.check_out_date >= CURRENT_DATE) AS active_bookings,
        (SELECT COUNT(*)
         FROM service_bookings sb
         JOIN services s ON s.service_id = sb.service_id
         JOIN bookings b ON b.booking_id = sb.booking_id
         WHERE s.service_provider_id = $1
           AND b.check_in_date > CURRENT_DATE) AS upcoming_bookings
      `,
      [service_provider_id]
    );

    /* --------------------------------------------------
       SERVICES
    -------------------------------------------------- */
    const servicesRes = await pool.query(
      `
      SELECT service_id, service_name, description, price, max_quantity, is_active, created_at, updated_at
      FROM services
      WHERE service_provider_id = $1
      ORDER BY created_at DESC
      `,
      [service_provider_id]
    );

    /* --------------------------------------------------
       ALL SERVICE BOOKINGS
    -------------------------------------------------- */
    const allBookingsRes = await pool.query(
      `SELECT sb.service_booking_id, sb.quantity, sb.subtotal, sb.created_at AS service_booked_at, s.service_id,
        s.service_name, s.price, b.booking_id, b.check_in_date, b.check_out_date, b.booking_status, b.first_name, 
        b.last_name, b.email, b.phone_number, h.name AS hotel_name, r.room_number, r.room_name FROM service_bookings sb
        JOIN services s ON s.service_id = sb.service_id
        JOIN bookings b ON b.booking_id = sb.booking_id
        JOIN rooms r ON r.room_id = b.room_id
        JOIN hotels h
        ON h.hotel_id = r.hotel_id
        WHERE s.service_provider_id = $1
        ORDER BY b.check_in_date DESC;
      `,
      [service_provider_id]
    );

    const allBookings = allBookingsRes.rows.map(convertBookingDates);

    /* --------------------------------------------------
       UPCOMING & ACTIVE SERVICE BOOKINGS
    -------------------------------------------------- */
    const today = dayjs().format("YYYY-MM-DD");

    const upcomingBookings = allBookings.filter(
      b => b.check_in_date && b.check_in_date > today
    );

    const activeBookings = allBookings.filter(
      b =>
        b.check_in_date &&
        b.check_out_date &&
        b.check_in_date <= today &&
        b.check_out_date >= today
    );

    /* --------------------------------------------------
       FINAL RESPONSE
    -------------------------------------------------- */
    res.json({
      provider,             // added provider info
      stats: statsRes.rows[0],
      upcomingBookings,
      activeBookings,
      services: servicesRes.rows,
      allBookings
    });

  } catch (err) {
    console.error("Service provider dashboard error:", err);
    res.status(500).json({ message: "Failed to load service provider dashboard" });
  }
});

export default router;
