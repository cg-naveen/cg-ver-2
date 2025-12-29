import express from "express";
import pool from "../db.js";
import { requireAuth } from "../authMiddleware.js";

const router = express.Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const { occupancyDate, hotelFilter = "all_time", stateFilter = "all_time" } = req.query;
    const occupancyTargetDate = occupancyDate ? new Date(occupancyDate) : new Date();

    /* =====================
       BOOKINGS COUNT + TRENDS
    ===================== */
    const bookingsCountQuery = `
      SELECT
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS bookings_today,
        COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days') AS bookings_last_7_days,
        COUNT(*) FILTER (WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') AS bookings_last_30_days,
        COUNT(*) FILTER (WHERE booking_status = 'Cancelled') AS cancelled_total
      FROM bookings
    `;

    const previous7DaysQuery = `
      SELECT COUNT(*) AS previous_7_days
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      AND created_at < CURRENT_DATE - INTERVAL '7 days'
    `;

    const previous30DaysQuery = `
      SELECT COUNT(*) AS previous_30_days
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '60 days'
      AND created_at < CURRENT_DATE - INTERVAL '30 days'
    `;

    /* =====================
       OCCUPANCY RATE FOR SELECTED DATE
    ===================== */
    const occupancyQuery = `
      SELECT
        COUNT(DISTINCT r.room_id) FILTER (
          WHERE $1::date BETWEEN b.check_in_date AND b.check_out_date
          AND b.booking_status IN ('Completed', 'Pending Payment', 'pending payment')

        ) AS occupied,
        COUNT(DISTINCT r.room_id) AS total
      FROM rooms r
      LEFT JOIN bookings b ON b.room_id = r.room_id
    `;

    /* =====================
       REVENUE SUMMARY
    ===================== */
    const revenueQuery = `
      SELECT
        COALESCE(SUM(amount), 0) AS gross,
        COALESCE(SUM(amount * 0.9), 0) AS net,
        COALESCE(SUM(amount * 0.1), 0) AS commissions
      FROM payments
    `;

    const revenueTrendQuery = `
      SELECT
        payment_date::date AS day,
        COALESCE(SUM(amount), 0) AS revenue
      FROM payments
      WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day ASC
    `;

    /* =====================
       UPCOMING STAYS (3 DAYS)
    ===================== */
    const upcomingStaysQuery = `
      SELECT
        b.booking_id AS reference,
        CONCAT(b.first_name, ' ', b.last_name) AS guest,
        r.room_name AS room,
        h.name AS hotel,
        CASE
          WHEN b.check_in_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
            THEN 'Check-in'
          ELSE 'Check-out'
        END AS type,
        CASE
          WHEN b.check_in_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
            THEN b.check_in_date
          ELSE b.check_out_date
        END AS date
      FROM bookings b
      JOIN rooms r ON r.room_id = b.room_id
      JOIN hotels h ON h.hotel_id = r.hotel_id
      WHERE
        b.check_in_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
        OR b.check_out_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
      ORDER BY date ASC
      LIMIT 5
    `;

    /* =====================
       PENDING PAYMENTS + AGE
    ===================== */
    const pendingPaymentsQuery = `
      SELECT
        b.booking_id AS reference,
        CONCAT(b.first_name, ' ', b.last_name) AS guest,
        h.name AS hotel,
        b.total_price AS amount,
        'Pending Payment' AS status,
        CURRENT_DATE - b.check_in_date AS days_pending
      FROM bookings b
      JOIN rooms r ON r.room_id = b.room_id
      JOIN hotels h ON h.hotel_id = r.hotel_id
      WHERE b.booking_status = 'Pending Payment'
      ORDER BY b.check_in_date ASC
      LIMIT 5
    `;

    /* =====================
       BOOKINGS BY HOTEL & STATE FILTERED
    ===================== */
    const getInterval = (filter) => {
      if (filter === "past_week") return "WHERE DATE(b.created_at) >= CURRENT_DATE - INTERVAL '7 days'";
      if (filter === "past_month") return "WHERE DATE(b.created_at) >= CURRENT_DATE - INTERVAL '30 days'";
      return "";
    };
    

    const bookingsByHotelQuery = `
      SELECT h.name AS hotel, COUNT(*) AS bookings
      FROM bookings b
      JOIN rooms r ON r.room_id = b.room_id
      JOIN hotels h ON h.hotel_id = r.hotel_id
      ${getInterval(hotelFilter)}
      GROUP BY h.name
      ORDER BY bookings DESC
    `;

    const bookingsByStateQuery = `
      SELECT h.state AS state, COUNT(*) AS bookings
      FROM bookings b
      JOIN rooms r ON r.room_id = b.room_id
      JOIN hotels h ON h.hotel_id = r.hotel_id
      ${getInterval(stateFilter)}
      GROUP BY h.state
      ORDER BY bookings DESC
    `;

    // Execute queries in parallel
    const [
      bookingsCountResult,
      previous7DaysResult,
      previous30DaysResult,
      occupancyResult,
      revenueResult,
      revenueTrendResult,
      upcomingStaysResult,
      pendingPaymentsResult,
      bookingsByHotelResult,
      bookingsByStateResult
    ] = await Promise.all([
      pool.query(bookingsCountQuery),
      pool.query(previous7DaysQuery),
      pool.query(previous30DaysQuery),
      pool.query(occupancyQuery, [occupancyTargetDate]),
      pool.query(revenueQuery),
      pool.query(revenueTrendQuery),
      pool.query(upcomingStaysQuery),
      pool.query(pendingPaymentsQuery),
      pool.query(bookingsByHotelQuery),
      pool.query(bookingsByStateQuery)
    ]);

    const bookingCounts = bookingsCountResult.rows[0];
    const previous7 = previous7DaysResult.rows[0].previous_7_days || 0;
    const previous30 = previous30DaysResult.rows[0].previous_30_days || 0;
    const occupancy = occupancyResult.rows[0];
    const revenue = revenueResult.rows[0];

    const occupancyRate =
      occupancy.total === 0 ? 0 : Math.round((occupancy.occupied / occupancy.total) * 100);

    // Safe trends: avoid Infinity
    const calcTrend = (current, previous) => {
      if (previous === 0) return current === 0 ? "0%" : "+100%";
      return `${Math.round(((current - previous) / previous) * 100)}%`;
    };

    const trend7Days = calcTrend(bookingCounts.bookings_last_7_days, previous7);
    const trend30Days = calcTrend(bookingCounts.bookings_last_30_days, previous30);

    const cancellationCount = bookingCounts.cancelled_total;
    const cancellationRate =
    bookingCounts.bookings_last_30_days === 0
    ? 0
    : Math.round((cancellationCount / bookingCounts.bookings_last_30_days) * 100);

    res.json({
      bookingStats: [
        { label: "Today", value: Number(bookingCounts.bookings_today), trend: "" }, //
        { label: "Last 7 Days", value: Number(bookingCounts.bookings_last_7_days), trend: trend7Days },
        { label: "Last 30 Days", value: Number(bookingCounts.bookings_last_30_days), trend: trend30Days },
        { label: "Cancellations", value: Number(cancellationCount), trend: `${cancellationRate}%` }


      ],

      occupancySummary: {
        percentage: occupancyRate,
        occupied: Number(occupancy.occupied),
        total: Number(occupancy.total),
        date: occupancyDate
      },

      revenueSummary: {
        gross: Number(revenue.gross),
        net: Number(revenue.net),
        commissions: Number(revenue.commissions),
        revenueTrend: revenueTrendResult.rows
      },

      upcomingStays: upcomingStaysResult.rows,
      pendingPayments: pendingPaymentsResult.rows,
      bookingsByHotel: bookingsByHotelResult.rows,
      bookingsByState: bookingsByStateResult.rows
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
});

export default router;
