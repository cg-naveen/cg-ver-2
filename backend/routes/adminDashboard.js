import express from "express";
import pool from "../db.js";
import bcrypt from "bcryptjs";
import { requireAuth, requireRole } from "../authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  requireAuth,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const {
        occupancyDate,
        hotelFilter = "all_time",
        stateFilter = "all_time"
      } = req.query;

      const occupancyTargetDate = occupancyDate
        ? new Date(occupancyDate)
        : new Date();

      /* =====================
         BOOKINGS COUNT + TRENDS
      ===================== */
      const bookingsCountQuery = `
        SELECT
          COUNT(*) AS total_bookings,
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
         OCCUPANCY RATE
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
          COALESCE(SUM(amount * 0.87), 0) AS net,
          COALESCE(SUM(amount * 0.13), 0) AS commissions
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
         UPCOMING STAYS
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
         PENDING PAYMENTS
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
         FILTER HELPERS
      ===================== */
      const getInterval = (filter) => {
        if (filter === "past_week")
          return "WHERE DATE(b.created_at) >= CURRENT_DATE - INTERVAL '7 days'";
        if (filter === "past_month")
          return "WHERE DATE(b.created_at) >= CURRENT_DATE - INTERVAL '30 days'";
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

      /* =====================
         EXECUTE QUERIES
      ===================== */
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

      /* =====================
         CALCULATIONS
      ===================== */
      const bookingCounts = bookingsCountResult.rows[0];
      const previous7 = Number(previous7DaysResult.rows[0].previous_7_days || 0);
      const previous30 = Number(previous30DaysResult.rows[0].previous_30_days || 0);

      const occupancy = occupancyResult.rows[0];
      const revenue = revenueResult.rows[0];

      const occupancyRate =
        occupancy.total === 0
          ? 0
          : Math.round((occupancy.occupied / occupancy.total) * 100);

      const calcTrend = (current, previous) => {
        if (previous === 0) return current === 0 ? "0%" : "+100%";
        return `${Math.round(((current - previous) / previous) * 100)}%`;
      };

      const trend7Days = calcTrend(
        bookingCounts.bookings_last_7_days,
        previous7
      );
      const trend30Days = calcTrend(
        bookingCounts.bookings_last_30_days,
        previous30
      );

      const totalBookings = Number(bookingCounts.total_bookings);
      const cancellationCount = Number(bookingCounts.cancelled_total);

      const cancellationRate =
        totalBookings === 0
          ? "0%"
          : `${Math.round((cancellationCount / totalBookings) * 100)}%`;

      /* =====================
         RESPONSE
      ===================== */
      res.json({
        bookingStats: [
          { label: "Today", value: Number(bookingCounts.bookings_today), trend: "" },
          {
            label: "Last 7 Days",
            value: Number(bookingCounts.bookings_last_7_days),
            trend: trend7Days
          },
          {
            label: "Last 30 Days",
            value: Number(bookingCounts.bookings_last_30_days),
            trend: trend30Days
          },
          {
            label: "Cancellations",
            value: cancellationCount,
            trend: cancellationRate
          }
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
  }
);

/* ==================== SUPERADMIN CREDENTIALS ==================== */

// GET superadmin credentials
router.get("/superadmin/credentials", requireAuth, requireRole("superadmin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, email, username, phone, password_hash
       FROM users
       WHERE role = 'superadmin'
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Superadmin not found" });
    }

    const admin = result.rows[0];
    // Don't send password_hash to frontend
    res.json({
      email: admin.email,
      phone: admin.phone,
      username: admin.username,
      user_id: admin.user_id
    });
  } catch (err) {
    console.error("Error fetching superadmin credentials:", err);
    res.status(500).json({ message: "Failed to fetch superadmin credentials" });
  }
});

// UPDATE superadmin credentials
router.put("/superadmin/credentials", requireAuth, requireRole("superadmin"), async (req, res) => {
  try {
    const { email, phone, username, oldPassword, newPassword } = req.body;

    // Get current superadmin
    const adminResult = await pool.query(
      `SELECT user_id, password_hash FROM users WHERE role = 'superadmin' LIMIT 1`
    );

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ message: "Superadmin not found" });
    }

    const admin = adminResult.rows[0];
    let passwordHash = admin.password_hash;

    // If password is being updated
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required" });
      }

      // Verify old password
      const passwordMatch = await bcrypt.compare(oldPassword, admin.password_hash);
      if (!passwordMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      // Check if old and new passwords are different
      if (oldPassword === newPassword) {
        return res.status(400).json({ message: "Old password and new password cannot be the same" });
      }

      // Hash new password
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update credentials
    const updateResult = await pool.query(
      `UPDATE users
       SET email = COALESCE($1, email),
           phone = COALESCE($2, phone),
           username = COALESCE($3, username),
           password_hash = COALESCE($4, password_hash),
           updated_at = NOW()
       WHERE user_id = $5
       RETURNING user_id, email, username, phone`,
      [email, phone, username, passwordHash, admin.user_id]
    );

    res.json({
      message: "Credentials updated successfully",
      user: updateResult.rows[0]
    });
  } catch (err) {
    console.error("Error updating superadmin credentials:", err);
    res.status(500).json({ message: "Failed to update credentials" });
  }
});

/* ==================== HOTEL PROVIDERS ==================== */

// GET all hotel providers
router.get("/hotel-providers", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         hp.hotel_provider_id,
         hp.org_name AS provider_name,
         hp.pic_name,
         u.username,
         u.email,
         u.phone AS contact_num,
         h.hotel_id,
         h.name AS hotel_name,
         COUNT(r.room_id) AS num_rooms
       FROM hotel_providers hp
       JOIN users u ON u.user_id = hp.user_id
       LEFT JOIN hotels h ON h.hotel_provider_id = hp.hotel_provider_id
       LEFT JOIN rooms r ON r.hotel_id = h.hotel_id
       GROUP BY hp.hotel_provider_id, hp.org_name, hp.pic_name, u.username, u.email, u.phone, h.hotel_id, h.name
       ORDER BY hp.hotel_provider_id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching hotel providers:", err);
    res.status(500).json({ message: "Failed to fetch hotel providers" });
  }
});

// GET single hotel provider
router.get("/hotel-providers/:id", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
         hp.hotel_provider_id,
         hp.org_name AS provider_name,
         hp.pic_name,
         u.username,
         u.email,
         u.phone AS contact_num,
         h.hotel_id,
         h.name AS hotel_name,
         COUNT(r.room_id) AS num_rooms
       FROM hotel_providers hp
       JOIN users u ON u.user_id = hp.user_id
       LEFT JOIN hotels h ON h.hotel_provider_id = hp.hotel_provider_id
       LEFT JOIN rooms r ON r.hotel_id = h.hotel_id
       WHERE hp.hotel_provider_id = $1
       GROUP BY hp.hotel_provider_id, hp.org_name, hp.pic_name, u.username, u.email, u.phone, h.hotel_id, h.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hotel provider not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching hotel provider:", err);
    res.status(500).json({ message: "Failed to fetch hotel provider" });
  }
});

// CREATE hotel provider
router.post("/hotel-providers", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { provider_name, pic_name, username, password, email, contact_num, hotel_id } = req.body;

    if (!provider_name || !pic_name || !username || !password || !email || !contact_num || !hotel_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Start transaction
    await pool.query("BEGIN");

    try {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, username, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, 'hotel_provider')
         RETURNING user_id`,
        [email.toLowerCase(), username, passwordHash, contact_num]
      );

      const userId = userResult.rows[0].user_id;

      // Create hotel provider
      const providerResult = await pool.query(
        `INSERT INTO hotel_providers (user_id, org_name, pic_name)
         VALUES ($1, $2, $3)
         RETURNING hotel_provider_id`,
        [userId, provider_name, pic_name]
      );

      const hotelProviderId = providerResult.rows[0].hotel_provider_id;

      // Update hotel with hotel_provider_id
      await pool.query(
        `UPDATE hotels SET hotel_provider_id = $1 WHERE hotel_id = $2`,
        [hotelProviderId, hotel_id]
      );

      await pool.query("COMMIT");

      res.status(201).json({
        message: "Hotel provider created successfully",
        hotel_provider_id: hotelProviderId
      });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error creating hotel provider:", err);
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email or username already exists" });
    }
    res.status(500).json({ message: "Failed to create hotel provider" });
  }
});

// UPDATE hotel provider
router.put("/hotel-providers/:id", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_name, pic_name, username, password, email, contact_num, hotel_id } = req.body;

    // Get hotel provider
    const providerResult = await pool.query(
      `SELECT user_id FROM hotel_providers WHERE hotel_provider_id = $1`,
      [id]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ message: "Hotel provider not found" });
    }

    const userId = providerResult.rows[0].user_id;

    await pool.query("BEGIN");

    try {
      // Update password if provided
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
          `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
          [passwordHash, userId]
        );
      }

      // Update user info
      await pool.query(
        `UPDATE users
         SET email = COALESCE($1, email),
             username = COALESCE($2, username),
             phone = COALESCE($3, phone),
             updated_at = NOW()
         WHERE user_id = $4`,
        [email, username, contact_num, userId]
      );

      // Update hotel provider info
      await pool.query(
        `UPDATE hotel_providers
         SET org_name = COALESCE($1, org_name),
             pic_name = COALESCE($2, pic_name)
         WHERE hotel_provider_id = $3`,
        [provider_name, pic_name, id]
      );

      // Update hotel if hotel_id provided
      if (hotel_id) {
        await pool.query(
          `UPDATE hotels SET hotel_provider_id = $1 WHERE hotel_id = $2`,
          [id, hotel_id]
        );
      }

      await pool.query("COMMIT");

      res.json({ message: "Hotel provider updated successfully" });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error updating hotel provider:", err);
    res.status(500).json({ message: "Failed to update hotel provider" });
  }
});

// DELETE hotel provider
router.delete("/hotel-providers/:id", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Get user_id
    const providerResult = await pool.query(
      `SELECT user_id FROM hotel_providers WHERE hotel_provider_id = $1`,
      [id]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ message: "Hotel provider not found" });
    }

    const userId = providerResult.rows[0].user_id;

    await pool.query("BEGIN");

    try {
      // Remove hotel_provider_id from hotels
      await pool.query(
        `UPDATE hotels SET hotel_provider_id = NULL WHERE hotel_provider_id = $1`,
        [id]
      );

      // Delete hotel provider
      await pool.query(`DELETE FROM hotel_providers WHERE hotel_provider_id = $1`, [id]);

      // Delete user
      await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId]);

      await pool.query("COMMIT");

      res.json({ message: "Hotel provider deleted successfully" });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error deleting hotel provider:", err);
    res.status(500).json({ message: "Failed to delete hotel provider" });
  }
});

/* ==================== SERVICE PROVIDERS ==================== */

// GET all service providers
router.get("/service-providers", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         sp.service_provider_id,
         sp.org_name AS provider_name,
         sp.pic_name,
         u.username,
         u.email,
         u.phone AS contact_num,
         ARRAY_AGG(DISTINCT s.service_name) FILTER (WHERE s.service_name IS NOT NULL) AS service_names,
         COUNT(DISTINCT s.service_id) AS num_services
       FROM service_providers sp
       JOIN users u ON u.user_id = sp.user_id
       LEFT JOIN services s ON s.service_provider_id = sp.service_provider_id
       GROUP BY sp.service_provider_id, sp.org_name, sp.pic_name, u.username, u.email, u.phone
       ORDER BY sp.service_provider_id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching service providers:", err);
    res.status(500).json({ message: "Failed to fetch service providers" });
  }
});

// GET single service provider
router.get("/service-providers/:id", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
         sp.service_provider_id,
         sp.org_name AS provider_name,
         sp.pic_name,
         u.username,
         u.email,
         u.phone AS contact_num,
         ARRAY_AGG(DISTINCT s.service_name) FILTER (WHERE s.service_name IS NOT NULL) AS service_names,
         COUNT(DISTINCT s.service_id) AS num_services
       FROM service_providers sp
       JOIN users u ON u.user_id = sp.user_id
       LEFT JOIN services s ON s.service_provider_id = sp.service_provider_id
       WHERE sp.service_provider_id = $1
       GROUP BY sp.service_provider_id, sp.org_name, sp.pic_name, u.username, u.email, u.phone`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service provider not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching service provider:", err);
    res.status(500).json({ message: "Failed to fetch service provider" });
  }
});

// CREATE service provider
router.post("/service-providers", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { provider_name, pic_name, username, password, email, contact_num, service_names } = req.body;

    if (!provider_name || !pic_name || !username || !password || !email || !contact_num || !service_names || service_names.length === 0) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query("BEGIN");

    try {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, username, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, 'service_provider')
         RETURNING user_id`,
        [email.toLowerCase(), username, passwordHash, contact_num]
      );

      const userId = userResult.rows[0].user_id;

      // Create service provider
      const providerResult = await pool.query(
        `INSERT INTO service_providers (user_id, org_name, pic_name)
         VALUES ($1, $2, $3)
         RETURNING service_provider_id`,
        [userId, provider_name, pic_name]
      );

      const serviceProviderId = providerResult.rows[0].service_provider_id;

      // Update services with service_provider_id
      await pool.query(
        `UPDATE services 
         SET service_provider_id = $1 
         WHERE service_name = ANY($2::text[])`,
        [serviceProviderId, service_names]
      );

      await pool.query("COMMIT");

      res.status(201).json({
        message: "Service provider created successfully",
        service_provider_id: serviceProviderId
      });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error creating service provider:", err);
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email or username already exists" });
    }
    res.status(500).json({ message: "Failed to create service provider" });
  }
});

// UPDATE service provider
router.put("/service-providers/:id", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_name, pic_name, username, password, email, contact_num, service_names } = req.body;

    // Get service provider
    const providerResult = await pool.query(
      `SELECT user_id FROM service_providers WHERE service_provider_id = $1`,
      [id]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ message: "Service provider not found" });
    }

    const userId = providerResult.rows[0].user_id;

    await pool.query("BEGIN");

    try {
      // Update password if provided
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query(
          `UPDATE users SET password_hash = $1 WHERE user_id = $2`,
          [passwordHash, userId]
        );
      }

      // Update user info
      await pool.query(
        `UPDATE users
         SET email = COALESCE($1, email),
             username = COALESCE($2, username),
             phone = COALESCE($3, phone),
             updated_at = NOW()
         WHERE user_id = $4`,
        [email, username, contact_num, userId]
      );

      // Update service provider info
      await pool.query(
        `UPDATE service_providers
         SET org_name = COALESCE($1, org_name),
             pic_name = COALESCE($2, pic_name)
         WHERE service_provider_id = $3`,
        [provider_name, pic_name, id]
      );

      // Update services if service_names provided
      if (service_names && service_names.length > 0) {
        // Remove service_provider_id from old services
        await pool.query(
          `UPDATE services SET service_provider_id = NULL WHERE service_provider_id = $1`,
          [id]
        );

        // Assign new services
        await pool.query(
          `UPDATE services 
           SET service_provider_id = $1 
           WHERE service_name = ANY($2::text[])`,
          [id, service_names]
        );
      }

      await pool.query("COMMIT");

      res.json({ message: "Service provider updated successfully" });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error updating service provider:", err);
    res.status(500).json({ message: "Failed to update service provider" });
  }
});

// DELETE service provider
router.delete("/service-providers/:id", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Get user_id
    const providerResult = await pool.query(
      `SELECT user_id FROM service_providers WHERE service_provider_id = $1`,
      [id]
    );

    if (providerResult.rows.length === 0) {
      return res.status(404).json({ message: "Service provider not found" });
    }

    const userId = providerResult.rows[0].user_id;

    await pool.query("BEGIN");

    try {
      // Remove service_provider_id from services
      await pool.query(
        `UPDATE services SET service_provider_id = NULL WHERE service_provider_id = $1`,
        [id]
      );

      // Delete service provider
      await pool.query(`DELETE FROM service_providers WHERE service_provider_id = $1`, [id]);

      // Delete user
      await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId]);

      await pool.query("COMMIT");

      res.json({ message: "Service provider deleted successfully" });
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    console.error("Error deleting service provider:", err);
    res.status(500).json({ message: "Failed to delete service provider" });
  }
});

/* ==================== HELPER ROUTES FOR DROPDOWNS ==================== */

// GET all hotels (for dropdown)
router.get("/hotels", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT hotel_id, name FROM hotels ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching hotels:", err);
    res.status(500).json({ message: "Failed to fetch hotels" });
  }
});

// GET all services (for dropdown)
router.get("/services", requireAuth, requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT service_id, service_name FROM services ORDER BY service_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

export default router;
