import React, { useState } from 'react';
import { FiDownload, FiPieChart, FiBarChart2, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import styles from './Admin.module.css';

export default function Analytics() {
  // -------------------------------
  // MOCK DATA
  // -------------------------------
  const countries = ['Malaysia', 'Singapore', 'Thailand'];
  const states = ['Penang', 'Kuala Lumpur', 'Johor'];
  const hotels = ['Trigo KL', 'Bayview Penang', 'Hotel Sunshine'];

  const occupancyData = [
    { hotel: 'Trigo KL', occupied: 30, available: 20 },
    { hotel: 'Bayview Penang', occupied: 25, available: 15 },
    { hotel: 'Hotel Sunshine', occupied: 40, available: 10 },
  ];

  const revenueData = [
    { period: 'Jan', gross: 5000, cancellations: 300, net: 4700, commissions: 500 },
    { period: 'Feb', gross: 6000, cancellations: 200, net: 5800, commissions: 600 },
  ];

  const cancellationData = [
    { hotel: 'Trigo KL', cancelRate: 0.05, noShowRate: 0.02, leadTime: 5 },
    { hotel: 'Bayview Penang', cancelRate: 0.08, noShowRate: 0.01, leadTime: 3 },
  ];

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedState, setSelectedState] = useState(states[0]);
  const [selectedHotel, setSelectedHotel] = useState(hotels[0]);

  return (
    <div className={styles.roomsContent}>

      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Analytics and Reports</h2>
        <div className={styles.reportActions}>
          <button className={styles.downloadButton}>
            <FiDownload size={16}/> Export PDF
          </button>
          <button className={styles.downloadButton}>
            <FiDownload size={16}/> Export CSV
          </button>
        </div>
      </div>

      <div className={styles.reportsTabs}>
        <button className={`${styles.reportTab} ${styles.active}`}>Daily KPI</button>
        <button className={styles.reportTab}>Weekly KPI</button>
        <button className={styles.reportTab}>Monthly KPI</button>
      </div>

      <div className={styles.reportContent}>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Occupancy Report</h3>
          <p>Filter by country, state, city, hotel with custom date range.</p>

          <div className={styles.filtersBar}>
            <select
              className={styles.filterSelect}
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
            >
              {countries.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              className={styles.filterSelect}
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
            <select
              className={styles.filterSelect}
              value={selectedHotel}
              onChange={e => setSelectedHotel(e.target.value)}
            >
              {hotels.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>

          <div className={styles.chartPlaceholder}>
            <FiPieChart size={48} className={styles.chartIcon}/>
            <p>
              {occupancyData.find(o => o.hotel === selectedHotel)?.occupied ?? 0} occupied rooms,{' '}
              {occupancyData.find(o => o.hotel === selectedHotel)?.available ?? 0} available rooms
            </p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue Report</h3>
          <p>Gross bookings, cancellations, net payouts, commissions.</p>
          <div className={styles.chartPlaceholder}>
            <FiBarChart2 size={48} className={styles.chartIcon}/>
            <p>
              Current month: Gross ${revenueData[0].gross}, Net ${revenueData[0].net}, Commissions ${revenueData[0].commissions}
            </p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Cancellation and Behaviour Analytics</h3>
          <p>Cancellation rate, no show rate, lead time distribution.</p>
          <div className={styles.chartPlaceholder}>
            <FiTrendingDown size={48} className={styles.chartIcon}/>
            <p>
              {cancellationData.find(c => c.hotel === selectedHotel)?.cancelRate ?? 0 * 100}% cancellation rate,{' '}
              {cancellationData.find(c => c.hotel === selectedHotel)?.noShowRate ?? 0 * 100}% no-show
            </p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>KPI Dashboards</h3>
          <p>Daily, weekly and monthly metrics for occupancy, revenue, bookings and cancellations.</p>
          <div className={styles.chartPlaceholder}>
            <FiTrendingUp size={48} className={styles.chartIcon}/>
            <p>Drill down to hotel level performance.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
