import React, { useMemo } from "react";
import { FiPieChart, FiTrendingUp, FiUsers, FiBriefcase, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAdmin } from "./AdminContext";
import styles from "./Admin.module.css";

export default function Dashboard() {
  const {
    dashboard,
    loadingDashboard,
    formatCurrency,
    getStatusColor,
    occupancyDate,
    setOccupancyDate,
    hotelFilter,
    setHotelFilter,
    stateFilter,
    setStateFilter,
    fetchDashboard,
  } = useAdmin();

  // For trend colour classes
  const trendClass = (trendText = "") => {
    if (typeof trendText !== "string") return "";
    const clean = trendText.trim();
    if (clean.startsWith("-")) return styles.trendDown;
    if (clean.startsWith("+")) return styles.trendUp;
    return "";
  };

  // Colour palette for metric icons
  const iconClassByIndex = useMemo(
    () => (index) => {
      const palette = [styles.green, styles.blue, styles.purple, styles.yellow];
      return palette[index % palette.length] || styles.green;
    },
    []
  );

  // Date formatting helper
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loadingDashboard || !dashboard) return <p>Loading dashboard…</p>;

  const {
    bookingStats = [],
    occupancySummary = {},
    revenueSummary = {},
    pendingPayments = [],
    upcomingStays = [],
    bookingsByHotel = [],
    bookingsByState = [],
  } = dashboard;

  // Handle filter changes
  const handleOccupancyDateChange = (e) => {
    const value = e.target.value;
    setOccupancyDate(value);
    fetchDashboard({ occupancyDate: value, hotelFilter, stateFilter });
  };

  const handleHotelFilterChange = (e) => {
    const value = e.target.value;
    setHotelFilter(value);
    fetchDashboard({ occupancyDate, hotelFilter: value, stateFilter });
  };

  const handleStateFilterChange = (e) => {
    const value = e.target.value;
    setStateFilter(value);
    fetchDashboard({ occupancyDate, hotelFilter, stateFilter: value });
  };

  return (
    <div className={styles.dashboardContent}>
      {/* METRICS */}
      <div className={styles.metricsGrid}>
        {bookingStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={styles.metricCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.metricInfo}>
              <p className={styles.metricTitle}>{stat.label}</p>
              <p className={styles.metricValue}>{stat.value}</p>
              <span className={`${styles.metricTrend} ${trendClass(stat.trend)}`}>
                {stat.trend}
              </span>
            </div>
            <div className={`${styles.metricIcon} ${iconClassByIndex(index)}`}>
              <FiUsers size={22} />
            </div>
          </motion.div>
        ))}

        {/* OCCUPANCY RATE */}
        <motion.div
  className={`${styles.metricCard} ${styles.occupancyCard}`}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4 }}
>
  <div className={styles.metricInfo}>
    <input
      type="date"
      value={occupancyDate}
      onChange={handleOccupancyDateChange}
      className={styles.datePickerAbsolute}
    />

    <p className={styles.metricTitle}>Occupancy Rate</p>
    <p className={styles.metricValue}>{occupancySummary.percentage ?? 0}%</p>
    <span className={styles.metricTrend}>
      {occupancySummary.occupied ?? 0} / {occupancySummary.total ?? 0} rooms
    </span>
  </div>

  <div className={`${styles.metricIcon} ${styles.purple}`}>
    <FiPieChart size={22} />
  </div>
</motion.div>

      </div>

      {/* REVENUE SUMMARY */}
      <div className={styles.activitySection}>
        <motion.div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Revenue Summary</h3>
          {[
            { label: "Gross Revenue", value: revenueSummary.gross, icon: <FiTrendingUp /> },
            { label: "Net Revenue", value: revenueSummary.net, icon: <FiBriefcase /> },
            { label: "Commissions", value: revenueSummary.commissions, icon: <FiStar /> }
          ].map((item) => (
            <div key={item.label} className={styles.bookingRow}>
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>{item.label}</span>
                <span className={styles.roomNumber}>Latest period</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong className={styles.metricValue} style={{ margin: 0, fontSize: 14 }}>
                  {formatCurrency(item.value || 0)}
                </strong>
                <span className={`${styles.metricIcon} ${styles.blue}`} style={{ width: 36, height: 36 }}>
                  {item.icon}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* UPCOMING STAYS & PENDING PAYMENTS */}
      <div className={styles.activitySection}>
        {/* UPCOMING STAYS */}
        <motion.div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Upcoming Stays (3 days)</h3>
          {upcomingStays.length === 0 && <p>No upcoming check-ins or check-outs</p>}
          {upcomingStays.map((stay) => (
            <div key={stay.reference} className={styles.bookingRow}>
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>{stay.guest}</span>
                <span className={styles.roomNumber}>{stay.room} · {stay.hotel}</span>
                <span className={styles.bookingDates}>{stay.type} · {formatDate(stay.date)}</span>
              </div>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(stay.type || "upcoming") }}
              >
                {stay.type}
              </span>
            </div>
          ))}
        </motion.div>

        {/* PENDING PAYMENTS */}
        <motion.div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Pending Payments</h3>
          {pendingPayments.length === 0 && <p>No pending payments 🎉</p>}
          {pendingPayments.map((payment) => (
            <div key={payment.reference} className={styles.bookingRow}>
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>{payment.guest}</span>
                <span className={styles.roomNumber}>{payment.hotel}</span>
                <span className={styles.bookingDates}>{payment.days_pending} days pending</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <strong className={styles.metricValue} style={{ margin: 0, fontSize: 18 }}>
                  {formatCurrency(payment.amount)}
                </strong>
                <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(payment.status) }}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* BOOKINGS BY HOTEL & STATE */}
      <div className={styles.activitySection}>
        <motion.div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Bookings by Hotel</h3>
          <select
            value={hotelFilter}
            onChange={handleHotelFilterChange}
            className={styles.filterDropdownWithArrow}
          >
            <option value="all_time">All Time</option>
            <option value="past_week">Past Week</option>
            <option value="past_month">Past Month</option>
          </select>
          {bookingsByHotel.map((b) => (
            <div key={b.hotel} className={styles.bookingRow}>
              <span>{b.hotel}</span>
              <strong>{b.bookings}</strong>
            </div>
          ))}
        </motion.div>

        <motion.div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Bookings by State</h3>
          <select
            value={stateFilter}
            onChange={handleStateFilterChange}
            className={styles.filterDropdownWithArrow}
          >
            <option value="all_time">All Time</option>
            <option value="past_week">Past Week</option>
            <option value="past_month">Past Month</option>
          </select>
          {bookingsByState.map((b) => (
            <div key={b.state} className={styles.bookingRow}>
              <span>{b.state}</span>
              <strong>{b.bookings}</strong>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
