import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {FiHome, FiKey, FiCalendar, FiCreditCard, FiBarChart2, FiSettings, FiSearch, FiPlus, FiEdit, FiTrash2, FiEye, FiPieChart, FiTrendingUp, FiTrendingDown, 
    FiDownload, FiUpload, FiCheckCircle, FiAlertCircle, FiUsers, FiBriefcase, FiClipboard} from 'react-icons/fi';
import styles from './Admin/Admin.module.css';

const formatCurrency = (value) => `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [listingAction, setListingAction] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(false);


  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'listings', label: 'Listings', icon: FiKey },
    { id: 'services', label: 'Services', icon: FiBriefcase },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar },
    { id: 'payments', label: 'Payments', icon: FiCreditCard },
    { id: 'accounts', label: 'Accounts', icon: FiUsers },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 }
  ];

  const bookingStats = [
    { label: 'Today', value: 3, context: 'vs 2 yesterday', trend: '+14%', color: 'green', icon: FiCalendar },
    { label: 'Past 7 days', value: 14, context: 'vs 12 last week', trend: '+4.7%', color: 'blue', icon: FiClipboard },
    { label: 'Past 30 days', value: 50, context: 'vs 41 last month', trend: '+6.4%', color: 'purple', icon: FiTrendingUp }
  ];

  const occupancySummary = {
    month: 'November 2025',
    percentage: 76,
    occupied: 25,
    available: 33
  };

  const revenueSummary = {
    gross: 15120,
    net: 13830,
    commissions: 4130,
    trend: '+6.2% vs last month'
  };

  const upcomingStays = [
    { type: 'Check-in', guest: 'Mohd Amir', room: 'Deluxe Twin Room', hotel: 'Trigo KL', reference: 'BKG1134', date: '2025-11-21' },
    { type: 'Check-out', guest: 'Emily Tan', room: 'Single King Room', hotel: 'Wyndham Trinidad', reference: 'BKG1123', date: '2025-11-21' },
    { type: 'Check-in', guest: 'Nur Idris', room: 'Executive Queen Room', hotel: 'Trinidad Suites', reference: 'BKG1135', date: '2025-11-22' },
    { type: 'Check-out', guest: 'Alicia Wong', room: 'Premium Suite', hotel: 'Sukha Golden', reference: 'BKG-1128', date: '2025-11-23' }
  ];

  const pendingPayments = [
    { guest: 'Daniel Lim', hotel: 'Trigo KL', amount: 1980, method: 'Credit Card', reference: 'PMT98765', status: 'Pending verification' },
    { guest: 'Jason Teo', hotel: 'Sukha Golden', amount: 860, method: 'FPX', reference: 'PMT98732', status: 'Awaiting proof' },
    { guest: 'Kumar Raj', hotel: 'Wyndham Trinidad', amount: 1260, method: 'Bank transfer', reference: 'PMT98690', status: 'Pending release' }
  ];

  const hotels = [
    {
      id: 'HTL-001',
      name: 'Sukha Golden',
      town: 'Petaling Jaya',
      state: 'Selangor',
      address: '3 & 5, Lorong Sultan, PJS 52, 46200 Petaling Jaya, Selangor, Malaysia',
      latitude: '3.0821',
      longitude: '101.6460',
      description: 'Flagship city property with 180 keys and full-service amenities.',
      num_of_room: 16,
      tags: ['urban', 'premium', 'business'],
      video_url: 'https://example.com/ca-grand-kl.mp4'
    },
    {
      id: 'HTL-002',
      name: 'Trigo KL',
      town: 'KLCC',
      state: 'Kuala Lumpur',
      address: '18, Jalan Tun Ali, 75300 Kuala Lumpur',
      latitude: '2.1980',
      longitude: '102.2460',
      description: 'Boutique riverside hotel with loft and garden suites.',
      num_of_room: 12,
      tags: ['heritage', 'loft', 'long-stay'],
      video_url: 'https://example.com/riverside.mp4'
    },
    {
      id: 'HTL-003',
      name: 'Wyndham Trinidad',
      town: 'George Town',
      state: 'Penang',
      address: '23, Lebuh Armenian, 10450 George Town, Penang',
      latitude: '5.4141',
      longitude: '100.3288',
      description: 'Restored pre-war mansion with curated premium suites.',
      num_of_room: 25,
      tags: ['cultural', 'premium', 'bespoke'],
      video_url: 'https://example.com/heritage.mp4'
    }
  ];

  const roomInventory = {
    'HTL-001': [
      {
        id: 'RM-1903',
        room_number: '1903',
        room_name: 'Skyview Suite',
        rate: 860,
        availability_status: true,
        features: {
          region: ['City Centre'],
          features: ['Bathtub', 'Smart TV', 'Workspace'],
          categories: ['Suite'],
          rentalCategories: ['Nightly']
        },
        max_guests: 3,
        category: 'Premium'
      },
      {
        id: 'RM-1508',
        room_number: '1508',
        room_name: 'Executive Twin',
        rate: 540,
        availability_status: false,
        features: {
          region: ['City Centre'],
          features: ['Twin beds', 'Fast WiFi'],
          categories: ['Executive'],
          rentalCategories: ['Nightly']
        },
        max_guests: 2,
        category: 'Standard'
      }
    ],
    'HTL-002': [
      {
        id: 'RM-0504',
        room_number: '504',
        room_name: 'Garden View Twin Room',
        rate: 640,
        availability_status: true,
        features: {
          region: ['Riverfront'],
          features: ['Private patio', 'Kitchenette'],
          categories: ['Loft'],
          rentalCategories: ['Nightly', 'Weekly']
        },
        max_guests: 4,
        category: 'Premium'
      }
    ],
    'HTL-003': [
      {
        id: 'RM-0803',
        room_number: '803',
        room_name: 'King Suite',
        rate: 720,
        availability_status: true,
        features: {
          region: ['Heritage zone'],
          features: ['Antique furnishings', 'Balcony'],
          categories: ['Suite'],
          rentalCategories: ['Nightly']
        },
        max_guests: 3,
        category: 'Premium'
      }
    ]
  };

  const services = [
    {
      id: 'SRV-001',
      service_name: 'Airport Transfer',
      description: 'Private sedan transfer from KUL to hotel',
      price: 180,
      is_active: true,
      provider: 'SkyLift Logistics',
      user_id: 'USR-201'
    },
    {
      id: 'SRV-002',
      service_name: 'In-room Spa',
      description: '60-min signature massage',
      price: 320,
      is_active: true,
      provider: 'Serenity Wellness',
      user_id: 'USR-305'
    },
    {
      id: 'SRV-003',
      service_name: 'Laundry Express',
      description: 'Same day laundry pickup & drop-off',
      price: 90,
      is_active: false,
      provider: 'FreshFold Services',
      user_id: 'USR-411'
    }
  ];

  const serviceBookings = [
    { date: '2025-11-21', service: 'Airport Transfer', room: '1903', hotel: 'Trigo KL', reference: 'BKG1121' },
    { date: '2025-11-22', service: 'Medical Assistant', room: '504', hotel: 'Sukha Golden', reference: 'BKG1123' },
    { date: '2025-11-23', service: 'Personal Assistant', room: '803', hotel: 'Wyndham Trinidad', reference: 'BKG1125' }
  ];

  const bookingList = [
    {
      id: 'BKG1101',
      guest: 'Daniel Lim',
      hotel: 'Trigo KL',
      room: 'Skyview Suite',
      checkIn: '2025-11-21',
      checkOut: '2025-11-24',
      guests: 2,
      services: ['Airport Transfer'],
      total: 1980,
      paymentStatus: 'Pending payment',
      status: 'Pending payment'
    },
    {
      id: 'BKG1102',
      guest: 'Alicia Wong',
      hotel: 'Trigo KL',
      room: 'Premium Suite',
      checkIn: '2025-11-19',
      checkOut: '2025-11-23',
      guests: 2,
      services: ['Breakfast'],
      total: 1520,
      paymentStatus: 'Paid',
      status: 'Complete'
    },
    {
      id: 'BKG1103',
      guest: 'Emily Tan',
      hotel: 'Sukha Golden',
      room: 'Double Queen Room',
      checkIn: '2025-11-18',
      checkOut: '2025-11-21',
      guests: 4,
      services: ['In-room Spa'],
      total: 2140,
      paymentStatus: 'Paid',
      status: 'Complete'
    },
    {
      id: 'BKG1104',
      guest: 'Jason Teo',
      hotel: 'Wyndham Trinidad',
      room: 'Executive Twin',
      checkIn: '2025-11-10',
      checkOut: '2025-11-12',
      guests: 2,
      services: [],
      total: 860,
      paymentStatus: 'Refund pending',
      status: 'Cancelled'
    }
  ];

  const cancellationRequests = [
    { booking_id: 'BKG1113', guest: 'Nur Nabil', refundAmount: 580, reason: 'Medical emergency', status: 'Awaiting approval' },
    { booking_id: 'BKG1121', guest: 'Sri Devi', refundAmount: 860, reason: 'Flight cancelled', status: 'Pending documents' }
  ];

  const paymentTransactions = [
    { transaction_id: 'PMT98765', booking_id: 'BKG1120', method: 'Credit Card', amount: 1980, status: 'Pending', date: '2025-11-20', payer: 'Daniel Lim' },
    { transaction_id: 'PMT98732', booking_id: 'BKG1119', method: 'FPX', amount: 2140, status: 'Completed', date: '2025-11-19', payer: 'Emily Tan' },
    { transaction_id: 'PMT98690', booking_id: 'BKG1125', method: 'Credit Card', amount: 1520, status: 'Completed', date: '2025-11-18', payer: 'Alicia Wong' },
    { transaction_id: 'PMT98645', booking_id: 'BKG1123', method: 'Bank Transfer', amount: 860, status: 'Refund pending', date: '2025-11-12', payer: 'Jason Teo' }
  ];

  const refundProcesses = [
    { booking_id: 'BKG1109', amount: 860, reason: 'Cancelled stay', status: 'Awaiting approval' },
    { booking_id: 'BKG1112', amount: 420, reason: 'Overcharge adjustment', status: 'Processed' }
  ];

  const commissionPartners = [
    { partner_id: 'PT-001', partner_name: 'Sukha Golden', commission: 12, total_commission: 18520 },
    { partner_id: 'PT-002', partner_name: 'Trigo KL', commission: 15, total_commission: 23140 },
    { partner_id: 'PT-003', partner_name: 'Wyndham Trinidad', commission: 10, total_commission: 12800 }
  ];

  const partnerAccounts = [
    { partner_id: 'PA-2001', partner: 'Sukha Golden', type: 'Accommodation', onboardingStatus: 'Approved', status: 'Active' },
    { partner_id: 'PA-2002', partner: 'Wyndham Trinidad Sdn Bhd', type: 'Accommodation', onboardingStatus: 'Pending', status: 'Pending' },
    { partner_id: 'PA-3011', partner: 'Serenity Wellness', type: 'Service', onboardingStatus: 'Under Review', status: 'Active' },
    { partner_id: 'PA-3050', partner: 'SkyLift Logistics', type: 'Service', onboardingStatus: 'Approved', status: 'Suspended' }
  ];

  const roleAccessControl = [
    {
      role: "Admin",
      permissions: ["Manage Users", "Manage Hotels", "Manage Payments", "Access Reports"]
    },
    {
      role: "Accommodation Partner",
      permissions: ["Manage Rooms", "View Bookings", "Update Availability"]
    },
    {
      role: "Service Provider",
      permissions: ["Accept Jobs", "View Schedule", "Update Status"]
    }
  ];
  

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
      case 'complete':
      case 'approved':
      case 'processed':
        return '#10B981';
      case 'pending':
      case 'pending payment':
      case 'pending verification':
      case 'awaiting approval':
      case 'pending documents':
      case 'under review':
        return '#F59E0B';
      case 'cancelled':
      case 'suspended':
      case 'refund pending':
      case 'awaiting proof':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const handleHotelAction = (type, hotel = null) => {
    setListingAction(type);
    setSelectedHotel(hotel);
    setSelectedRoom(null);
  };

  const handleRoomAction = (type, hotel, room = null) => {
    setListingAction(type);
    setSelectedHotel(hotel);
    setSelectedRoom(room);
  };

  const renderDashboard = () => (
    <div className={styles.dashboardContent}>
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
              <h4 className={styles.metricTitle}>Bookings {stat.label}</h4>
              <p className={styles.metricValue}>{stat.value}</p>
              <span className={`${styles.metricTrend} ${stat.trend.startsWith('+') ? styles.trendUp : styles.trendDown}`}>
                {stat.trend}
              </span>
              <p className={styles.bookingDates}>{stat.context}</p>
            </div>
            <div className={`${styles.metricIcon} ${styles[stat.color]}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className={styles.activitySection}>
        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className={styles.cardTitle}>Occupancy Rate</h3>
          <p>Monthly overview for {occupancySummary.month}</p>
          <div className={styles.metricValue}>{occupancySummary.percentage}%</div>
          <p>{occupancySummary.occupied} occupied / {occupancySummary.occupied + occupancySummary.available} rooms</p>
          <div className={styles.chartPlaceholder}>
            <FiPieChart size={48} className={styles.chartIcon} />
            <p>Monthly occupancy percentage by hotel</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={styles.cardTitle}>Revenue Summary & Trend</h3>
          <div className={styles.bookingsTable}>
            <div className={styles.bookingRow}>
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>Gross Revenue</span>
                <span>{formatCurrency(revenueSummary.gross)}</span>
              </div>
            </div>
            <div className={styles.bookingRow}>
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>Net Revenue</span>
                <span>{formatCurrency(revenueSummary.net)}</span>
              </div>
            </div>
            <div className={styles.bookingRow}>
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>Commissions</span>
                <span>{formatCurrency(revenueSummary.commissions)}</span>
              </div>
            </div>
          </div>
          <div className={styles.chartPlaceholder}>
            <FiTrendingUp size={48} className={styles.chartIcon} />
            <p>{revenueSummary.trend}</p>
          </div>
        </motion.div>
      </div>

      <div className={styles.activitySection}>
        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={styles.cardTitle}>Upcoming Check-in & Check-out</h3>
          <div className={styles.bookingsTable}>
            {upcomingStays.map((stay) => (
              <div key={stay.reference} className={styles.bookingRow}>
                <div className={styles.bookingInfo}>
                  <span className={styles.guestName}>{stay.guest}</span>
                  <span className={styles.roomNumber}>{stay.room} · {stay.hotel}</span>
                </div>
                <div className={styles.bookingDates}>
                  <span>{stay.type} · {stay.date}</span>
                  <p>Ref: {stay.reference}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={styles.cardTitle}>Pending Payments</h3>
          <div className={styles.bookingsTable}>
            {pendingPayments.map((payment) => (
              <div key={payment.reference} className={styles.bookingRow}>
                <div className={styles.bookingInfo}>
                  <span className={styles.guestName}>{payment.guest}</span>
                  <span className={styles.roomNumber}>{payment.hotel}</span>
                </div>
                <div className={styles.bookingDates}>
                  <span>{formatCurrency(payment.amount)} · {payment.method}</span>
                  <p>{payment.reference}</p>
                </div>
                <span
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(payment.status) }}
                >
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderListingManagement = () => {
    const roomsForSelectedHotel = selectedHotel ? roomInventory[selectedHotel.id] || [] : [];

    return (
      <div className={styles.roomsContent}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Listing Management</h2>
          <button className={styles.addButton} onClick={() => handleHotelAction('addHotel')}>
            <FiPlus size={18} />
            Add Hotel
          </button>
        </div>

        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <FiSearch size={18} />
            <input type="text" placeholder="Search hotels..." />
          </div>
          <select className={styles.filterSelect}>
            <option>All States</option>
            {[...new Set(hotels.map((hotel) => hotel.state))].map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
          <select className={styles.filterSelect}>
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Hotel</th>
                <th>Town</th>
                <th>State</th>
                <th>Number of Rooms</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((hotel, index) => (
                <motion.tr
                  key={hotel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>
                    <div className={styles.bookingInfo}>
                      <span className={styles.guestName}>{hotel.name}</span>
                      <span className={styles.roomNumber}>ID: {hotel.id}</span>
                    </div>
                  </td>
                  <td>{hotel.town}</td>
                  <td>{hotel.state}</td>
                  <td>{hotel.num_of_room || 0}</td>
                  <td>
                    <div className={styles.actionButtonsRow}>
                      <button className={styles.actionButton} onClick={() => handleHotelAction('editHotel', hotel)}>
                        <FiEdit size={14} />
                      </button>
                      <button className={styles.actionButton} onClick={() => handleHotelAction('deleteHotel', hotel)}>
                        <FiTrash2 size={14} />
                      </button>
                      <button className={styles.actionButton} onClick={() => handleHotelAction('viewRooms', hotel)}>
                        <FiEye size={14} />
                      </button>
                      <button className={styles.actionButton} onClick={() => handleHotelAction('addRoom', hotel)}>
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {listingAction === 'editHotel' && selectedHotel && (
          <div className={styles.settingsCard}>
            <h3>Edit Hotel — {selectedHotel.name}</h3>
            <form className={styles.settingsForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Name</label>
                  <input type="text" defaultValue={selectedHotel.name} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Town</label>
                  <input type="text" defaultValue={selectedHotel.town} />
                </div>
                <div className={styles.inputGroup}>
                  <label>State</label>
                  <input type="text" defaultValue={selectedHotel.state} />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Address</label>
                <textarea defaultValue={selectedHotel.address} />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Latitude</label>
                  <input type="text" defaultValue={selectedHotel.latitude} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Longitude</label>
                  <input type="text" defaultValue={selectedHotel.longitude} />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea defaultValue={selectedHotel.description} />
              </div>
              <div className={styles.inputGroup}>
                <label>Tags (comma separated)</label>
                <input type="text" defaultValue={selectedHotel.tags.join(', ')} />
              </div>
              <div className={styles.inputGroup}>
                <label>video_url</label>
                <input type="text" defaultValue={selectedHotel.video_url} />
              </div>
              <button className={styles.saveButton}>Save Hotel</button>
            </form>
          </div>
        )}

        {listingAction === 'deleteHotel' && selectedHotel && (
          <div className={styles.settingsCard}>
            <h3>Delete Hotel</h3>
            <p>If you delete this hotel, all listing rooms from this hotel will also be deleted.</p>
            <div className={styles.actionButtons}>
              <button className={styles.addButton}>Continue</button>
              <button className={styles.actionButton}>Cancel</button>
            </div>
          </div>
        )}

        {listingAction === 'viewRooms' && selectedHotel && (
          <div className={styles.settingsCard}>
            <h3>Rooms — {selectedHotel.name}</h3>
            <div className={styles.tableContainer}>
              <table className={styles.roomsTable}>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Rate</th>
                    <th>Availability</th>
                    <th>Pax</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomsForSelectedHotel.map((room) => (
                    <tr key={room.id}>
                      <td>{room.room_name} ({room.room_number})</td>
                      <td>{formatCurrency(room.rate)}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(room.availability_status ? 'active' : 'pending') }}
                        >
                          {room.availability_status ? 'True' : 'False'}
                        </span>
                      </td>
                      <td>{room.max_guests}</td>
                      <td>{room.category}</td>
                      <td>
                        <div className={styles.actionButtonsRow}>
                          <button className={styles.actionButton} onClick={() => handleRoomAction('editRoom', selectedHotel, room)}>
                            <FiEdit size={14} />
                          </button>
                          <button className={styles.actionButton} onClick={() => handleRoomAction('deleteRoom', selectedHotel, room)}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className={styles.addButton} onClick={() => handleRoomAction('addRoom', selectedHotel)}>
              <FiPlus size={18} />
              Add Room
            </button>
          </div>
        )}

        {listingAction === 'addHotel' && (
          <div className={styles.settingsCard}>
            <h3>Add Hotel</h3>
            <form className={styles.settingsForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Name</label>
                  <input type="text" placeholder="Hotel name" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Town</label>
                  <input type="text" />
                </div>
                <div className={styles.inputGroup}>
                  <label>State</label>
                  <input type="text" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Address</label>
                <textarea placeholder="Full address" />
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Latitude</label>
                  <input type="text" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Longitude</label>
                  <input type="text" />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Description</label>
                <textarea placeholder="Short description" />
              </div>
              <div className={styles.inputGroup}>
                <label>Tags</label>
                <input type="text" placeholder="premium, urban, business" />
              </div>
              <div className={styles.inputGroup}>
                <label>video_url</label>
                <input type="text" placeholder="https://" />
              </div>
              <button className={styles.saveButton}>Save Hotel</button>
              <p>“Are you confirming all details for this hotel to be added?”</p>
              <div className={styles.actionButtons}>
                <button className={styles.addButton}>Continue</button>
                <button className={styles.actionButton}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {listingAction === 'addRoom' && selectedHotel && (
          <div className={styles.settingsCard}>
            <h3>Add Room — {selectedHotel.name}</h3>
            <form className={styles.settingsForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Room number</label>
                  <input type="text" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Room name</label>
                  <input type="text" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Rate</label>
                  <input type="number" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Availability status</label>
                  <select defaultValue="true">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Max guests</label>
                  <input type="number" />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <select defaultValue="Standard">
                    <option>Standard</option>
                    <option>Budget</option>
                    <option>Premium</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Images</label>
                  <input type="file" multiple />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Region</label>
                <input type="text" placeholder="Add region" />
              </div>
              <div className={styles.inputGroup}>
                <label>Features</label>
                <input type="text" placeholder="Add features (comma separated)" />
              </div>
              <div className={styles.inputGroup}>
                <label>Categories</label>
                <input type="text" placeholder="Add categories" />
              </div>
              <div className={styles.inputGroup}>
                <label>Rental Categories</label>
                <input type="text" placeholder="Nightly, Weekly..." />
              </div>
              <button className={styles.saveButton}>Save Room</button>
              <p>“Are you confirming all details for this room to be listed?”</p>
              <div className={styles.actionButtons}>
                <button className={styles.addButton}>Continue</button>
                <button className={styles.actionButton}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {listingAction === 'editRoom' && selectedHotel && selectedRoom && (
          <div className={styles.settingsCard}>
            <h3>Edit Room — {selectedRoom.room_name}</h3>
            <form className={styles.settingsForm}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Room number</label>
                  <input type="text" defaultValue={selectedRoom.room_number} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Room name</label>
                  <input type="text" defaultValue={selectedRoom.room_name} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Rate</label>
                  <input type="number" defaultValue={selectedRoom.rate} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Availability status</label>
                  <select defaultValue={selectedRoom.availability_status ? 'true' : 'false'}>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Max guests</label>
                  <input type="number" defaultValue={selectedRoom.max_guests} />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Category</label>
                  <select defaultValue={selectedRoom.category}>
                    <option>Standard</option>
                    <option>Budget</option>
                    <option>Premium</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Images</label>
                  <input type="file" multiple />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Region</label>
                <input type="text" defaultValue={selectedRoom.features.region.join(', ')} />
              </div>
              <div className={styles.inputGroup}>
                <label>Features</label>
                <input type="text" defaultValue={selectedRoom.features.features.join(', ')} />
              </div>
              <div className={styles.inputGroup}>
                <label>Categories</label>
                <input type="text" defaultValue={selectedRoom.features.categories.join(', ')} />
              </div>
              <div className={styles.inputGroup}>
                <label>Rental Categories</label>
                <input type="text" defaultValue={selectedRoom.features.rentalCategories.join(', ')} />
              </div>
              <button className={styles.saveButton}>Save Room</button>
            </form>
          </div>
        )}

        {listingAction === 'deleteRoom' && selectedHotel && selectedRoom && (
          <div className={styles.settingsCard}>
            <h3>Delete Room — {selectedRoom.room_name}</h3>
            <p>“Do you want to delete this room?”</p>
            <div className={styles.actionButtons}>
              <button className={styles.addButton}>Continue</button>
              <button className={styles.actionButton}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderServiceManagement = () => (
    <div className={styles.roomsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Service Management</h2>
        <button className={styles.addButton} onClick={() => {setShowAdd(true);setShowView(false); setShowEdit(false); setShowDelete(false);}}>
  <FiPlus size={18} />
  Add Service
</button>

      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search services..." />
        </div>
        <select className={styles.filterSelect}>
          <option>All Providers</option>
          {[...new Set(services.map((service) => service.provider))].map((provider) => (
            <option key={provider}>{provider}</option>
          ))}
        </select>
        <select className={styles.filterSelect}>
          <option>Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.roomsTable}>
          <thead>
            <tr>
              <th>Service</th>
              <th>Provider</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.service_name}</td>
                <td>{service.provider}</td>
                <td>{formatCurrency(service.price)}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(service.is_active ? 'active' : 'pending') }}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtonsRow}>
                    <button className={styles.actionButton} onClick={() => {setSelectedService(service); setShowView(true); setShowEdit(false); setShowDelete(false);}}>
                      <FiEye size={14} />
                    </button>
                    <button className={styles.actionButton} onClick={() => {setSelectedService(service); setShowEdit(true); setShowView(false); setShowDelete(false);}}>
                      <FiEdit size={14} />
                    </button>
                    <button className={styles.actionButton} onClick={() => {setSelectedService(service); setShowDelete(true); setShowView(false); setShowEdit(false);}}>
                      <FiTrash2 size={14} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW SERVICE */}
{showView && selectedService && (
  <div className={styles.activitySection}>
    <div className={styles.settingsCard}>
      <h3>View Service Details</h3>
      <p>ID: {selectedService.id}</p>
      <p><strong>Description:</strong> {selectedService.description}</p>
      <p><strong>Provider:</strong> {selectedService.provider}</p>
      <p><strong>Status:</strong> {selectedService.is_active ? 'Active' : 'Inactive'}</p>
    </div>
  </div>
)}

{/* EDIT SERVICE */}
{showEdit && selectedService && (
  <div className={styles.activitySection}>
    <div className={styles.settingsCard}>
      <h3>Edit Service</h3>
      <form className={styles.settingsForm}>
        <div className={styles.inputGroup}>
          <label>Service Name</label>
          <input type="text" defaultValue={selectedService.service_name} />
        </div>
        <div className={styles.inputGroup}>
          <label>Description</label>
          <textarea defaultValue={selectedService.description} />
        </div>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label>Price</label>
            <input type="number" defaultValue={selectedService.price} />
          </div>
          <div className={styles.inputGroup}>
            <label>Status</label>
            <select defaultValue={selectedService.is_active ? 'true' : 'false'}>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>
        </div>
        <button className={styles.saveButton}>Save Service</button>
      </form>
    </div>
  </div>
)}

{/* DELETE SERVICE */}
{showDelete && selectedService && (
  <div className={styles.activitySection}>
    <div className={styles.settingsCard}>
      <h3>Delete Service</h3>
      <p>Do you want to delete this service?</p>
      <div className={styles.actionButtons}>
        <button className={styles.addButton}>Continue</button>
        <button className={styles.actionButton}>Cancel</button>
      </div>
    </div>
  </div>
)}

{/* ADD SERVICE */}
{showAdd && (
  <div className={styles.activitySection}>
    <div className={styles.settingsCard}>
      <h3>Add Service</h3>
      <form className={styles.settingsForm}>
        <div className={styles.inputGroup}>
          <label>Service Name</label>
          <input type="text" placeholder="Service name" />
        </div>
        <div className={styles.inputGroup}>
          <label>Description</label>
          <textarea placeholder="Describe the service" />
        </div>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label>Price (RM)</label>
            <input type="number" placeholder="0" />
          </div>
          <div className={styles.inputGroup}>
            <label>Availability</label>
            <select>
              <option>true</option>
              <option>false</option>
            </select>
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label>Provider</label>
          <select>
            {partnerAccounts
              .filter((p) => p.type === 'Service')
              .map((partner) => (
                <option key={partner.partner_id}>{partner.partner}</option>
              ))}
          </select>
        </div>
        <button className={styles.saveButton}>Add Service</button>
      </form>
    </div>
  </div>
)}

{/* SERVICE BOOKINGS TRACKER — ALWAYS SHOW */}
<div className={styles.activitySection}>
  <div className={styles.settingsCard}>
    <h3>Service Booking Tracker</h3>
    <div className={styles.tableContainer}>
      <table className={styles.roomsTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Room</th>
            <th>Hotel</th>
            <th>Booking Reference</th>
          </tr>
        </thead>
        <tbody>
          {serviceBookings.map((entry) => (
            <tr key={entry.reference}>
              <td>{entry.date}</td>
              <td>{entry.service}</td>
              <td>{entry.room}</td>
              <td>{entry.hotel}</td>
              <td>{entry.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

    
    </div>
  );

  const renderBookingManagement = () => (
    <div className={styles.bookingsContent}>
      {/* HEADER */}
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Booking Management</h2>
  
        <button
          className={styles.addButton}
          onClick={() => {
            setSelectedBooking(null);
            setShowAdd(true);
            setShowView(false);
            setShowEdit(false);
          }}
        >
          <FiPlus size={18} />
          Create Manual Booking
        </button>
      </div>
  
      {/* SEARCH + FILTER */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search by guest, hotel or reference..." />
        </div>
        <select className={styles.filterSelect}>
          <option>All Status</option>
          <option>Pending payment</option>
          <option>Complete</option>
          <option>Cancelled</option>
        </select>
      </div>
  
      {/* BOOKINGS TABLE */}
      <div className={styles.tableContainer}>
        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Booking</th>
              <th>Guest</th>
              <th>Hotel / Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
  
          <tbody>
            {bookingList.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.guest}</td>
                <td>
                  {booking.hotel}
                  <br />
                  {booking.room}
                </td>
                <td>{booking.checkIn}</td>
                <td>{booking.checkOut}</td>
  
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </span>
                </td>
  
                <td>{booking.paymentStatus}</td>
  
                <td>
                  <div className={styles.actionButtonsRow}>
                    {/* VIEW */}
                    <button
                      className={styles.actionButton}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowView(true);
                        setShowEdit(false);
                        setShowAdd(false);
                      }}
                    >
                      <FiEye size={14} />
                    </button>
  
                    {/* EDIT */}
                    <button
                      className={styles.actionButton}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowEdit(true);
                        setShowView(false);
                        setShowAdd(false);
                      }}
                    >
                      <FiEdit size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* VIEW PANEL */}
      {selectedBooking && showView && (
        <div className={styles.settingsCard}>
          <h3>Booking Details — {selectedBooking.id}</h3>
  
          <div className={styles.detailsBox}>
            <p><strong>Guest Name:</strong> {selectedBooking.guest}</p>
            <p><strong>Email:</strong> {selectedBooking.email}</p>
            <p><strong>Phone:</strong> {selectedBooking.phone}</p>
            <p><strong>Age:</strong> {selectedBooking.age}</p>
            <p><strong>Hotel:</strong> {selectedBooking.hotel}</p>
            <p><strong>Room:</strong> {selectedBooking.room}</p>
            <p><strong>Check-in:</strong> {selectedBooking.checkIn}</p>
            <p><strong>Check-out:</strong> {selectedBooking.checkOut}</p>
            <p><strong>Number of Guests:</strong> {selectedBooking.guests}</p>
            <p><strong>Services:</strong> {selectedBooking.services.join(', ')}</p>
            <p><strong>Total Price:</strong> {selectedBooking.total}</p>
            <p><strong>Message:</strong> {selectedBooking.message}</p>
            <p><strong>Booking Status:</strong> {selectedBooking.status}</p>
          </div>
        </div>
      )}
  
      {/* EDIT FORM */}
      {selectedBooking && showEdit && (
        <div className={styles.settingsCard}>
          <h3>Edit Booking — {selectedBooking.id}</h3>
  
          <form className={styles.settingsForm}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Guest Name</label>
                <input type="text" defaultValue={selectedBooking.guest} />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="email" defaultValue={selectedBooking.email} />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input type="tel" defaultValue={selectedBooking.phone} />
              </div>
              <div className={styles.inputGroup}>
                <label>Age</label>
                <input type="number" defaultValue={selectedBooking.age} />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Hotel</label>
                <input type="text" defaultValue={selectedBooking.hotel} />
              </div>
              <div className={styles.inputGroup}>
                <label>Room</label>
                <input type="text" defaultValue={selectedBooking.room} />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Check-in</label>
                <input type="date" defaultValue={selectedBooking.checkIn} />
              </div>
              <div className={styles.inputGroup}>
                <label>Check-out</label>
                <input type="date" defaultValue={selectedBooking.checkOut} />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Number of Guests</label>
                <input type="number" defaultValue={selectedBooking.guests} />
              </div>
              <div className={styles.inputGroup}>
                <label>Total Amount</label>
                <input type="number" defaultValue={selectedBooking.total} />
              </div>
            </div>
  
            <div className={styles.inputGroup}>
              <label>Services</label>
              <input type="text" defaultValue={selectedBooking.services.join(', ')} />
            </div>
  
            <div className={styles.inputGroup}>
              <label>Message</label>
              <input type="text" defaultValue={selectedBooking.message} />
            </div>
  
            <div className={styles.inputGroup}>
              <label>Payment Status</label>
              <select defaultValue={selectedBooking.paymentStatus}>
                <option>Pending payment</option>
                <option>Paid</option>
                <option>Refund pending</option>
              </select>
            </div>
  
            <div className={styles.inputGroup}>
              <label>Booking Status</label>
              <select defaultValue={selectedBooking.status}>
                <option>Pending payment</option>
                <option>Complete</option>
                <option>Cancelled</option>
              </select>
            </div>
  
            <button className={styles.saveButton}>Save Booking</button>
          </form>
        </div>
      )}
  
      {/* CREATE BOOKING FORM */}
      {showAdd && (
        <div className={styles.settingsCard}>
          <h3>Create Manual Booking</h3>
  
          <form className={styles.settingsForm}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Guest Name</label>
                <input type="text" />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input type="text" />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Phone</label>
                <input type="text" />
              </div>
              <div className={styles.inputGroup}>
                <label>Age</label>
                <input type="number" />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Hotel</label>
                <input type="text" />
              </div>
              <div className={styles.inputGroup}>
                <label>Room</label>
                <input type="text" />
              </div>
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Check-in</label>
                <input type="date" />
              </div>
              <div className={styles.inputGroup}>
                <label>Check-out</label>
                <input type="date" />
              </div>
            </div>
  
            <div className={styles.inputGroup}>
              <label>Number of Guests</label>
              <input type="number" />
            </div>
  
            <div className={styles.inputGroup}>
              <label>Services</label>
              <input type="text" placeholder="Airport transfer, Spa..." />
            </div>
  
            <div className={styles.inputGroup}>
              <label>Total Amount</label>
              <input type="number" />
            </div>
  
            <div className={styles.inputGroup}>
              <label>Message</label>
              <input type="text" />
            </div>
  
            <button className={styles.saveButton}>Submit Booking</button>
  
            <p>“Are you confirming these booking details?”</p>
  
            <div className={styles.actionButtons}>
              <button className={styles.addButton}>Continue</button>
              <button
                className={styles.actionButton}
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
  
      {/* CANCELLATION TABLE */}
      <div className={styles.settingsCard}>
        <h3>Cancellation and Refund Approvals</h3>
  
        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Guest</th>
                <th>Refund Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
  
            <tbody>
              {cancellationRequests.map((request) => (
                <tr key={request.booking_id}>
                  <td>{request.booking_id}</td>
                  <td>{request.guest}</td>
                  <td>{formatCurrency(request.refundAmount)}</td>
                  <td>{request.reason}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtonsRow}>
                      <button className={styles.actionButton}>
                        <FiCheckCircle size={14} />
                      </button>
                      <button className={styles.actionButton}>
                        <FiAlertCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <p>Approvals require confirmation pop up before final action.</p>
      </div>
    </div>
  );  

  const renderPaymentManagement = () => (
    <div className={styles.paymentsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Payment Management</h2>
      </div>
  
      <div className={styles.filtersBar}>
        <input type="date" className={styles.filterSelect} />
        <select className={styles.filterSelect}>
          <option>Payment Method</option>
          <option>Credit Card</option>
          <option>FPX</option>
          <option>Bank Transfer</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Status</option>
          <option>Pending</option>
          <option>Completed</option>
          <option>Refund pending</option>
        </select>
      </div>
  
      <div className={styles.tableContainer}>
        <table className={styles.paymentsTable}>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Booking</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Payer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentTransactions.map(payment => (
              <tr key={payment.transaction_id}>
                <td>{payment.transaction_id}</td>
                <td>{payment.booking_id}</td>
                <td>{payment.method}</td>
                <td>{formatCurrency(payment.amount)}</td>
                <td>{payment.date}</td>
                <td>{payment.payer}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* FULL WIDTH REFUND PROCESS */}
      <div className={styles.settingsCard} style={{ width: "100%" }}>
        <h3>Refund Processes</h3>
        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {refundProcesses.map(refund => (
                <tr key={refund.booking_id}>
                  <td>{refund.booking_id}</td>
                  <td>{formatCurrency(refund.amount)}</td>
                  <td>{refund.reason}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(refund.status) }}
                    >
                      {refund.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtonsRow}>
                      <button className={styles.actionButton}>
                        <FiCheckCircle size={14} />
                      </button>
                      <button className={styles.actionButton}>
                        <FiAlertCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Approval or rejection triggers confirmation pop up.</p>
      </div>
  
      {/* INVOICE GENERATION + EXPORT DOCUMENTS SIDE BY SIDE */}
      <div className={styles.twoColumnRow}>
        <div className={styles.settingsCard}>
          <h3>Invoice Generation</h3>
          <form className={styles.settingsForm}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Booking ID</label>
                <input type="text" placeholder="BKG1121" />
              </div>
              <div className={styles.inputGroup}>
                <label>Payer Email</label>
                <input type="email" placeholder="guest@email.com" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Charges / Taxes / Commissions</label>
              <textarea placeholder="Break down charges, taxes, commissions" />
            </div>
            <div className={styles.formRow}>
              <button className={styles.downloadButton}>
                <FiDownload size={16} />
                Download Invoice
              </button>
              <button className={styles.addButton}>
                <FiUpload size={16} />
                Resend Invoice
              </button>
            </div>
          </form>
        </div>
  
        <div className={styles.settingsCard}>
          <h3>Export Documents</h3>
          <p>Payment reports, monthly statements, commission summaries.</p>
          <div className={styles.actionButtons}>
            <button className={styles.downloadButton}>CSV</button>
            <button className={styles.downloadButton}>PDF</button>
            <button className={styles.downloadButton}>XLSX</button>
          </div>
        </div>
      </div>
  
      <div className={styles.settingsCard}>
        <h3>Commission Management</h3>
        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Partner</th>
                <th>Commission %</th>
                <th>Total Commissions</th>
              </tr>
            </thead>
            <tbody>
              {commissionPartners.map(partner => (
                <tr key={partner.partner_id}>
                  <td>{partner.partner_name}</td>
                  <td>{partner.commission}%</td>
                  <td>{formatCurrency(partner.total_commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <form className={styles.settingsForm}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Partner Name</label>
              <input type="text" />
            </div>
            <div className={styles.inputGroup}>
              <label>Commission Percentage</label>
              <input type="number" placeholder="0" />
            </div>
          </div>
          <button className={styles.saveButton}>Update Commission</button>
        </form>
      </div>
    </div>
  );  

  const renderAccountsManagement = () => (
    <div className={styles.roomsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Accounts Management</h2>
      </div>

      <div className={styles.filtersBar}>
        <select className={styles.filterSelect}>
          <option>Partner Type</option>
          <option>Accommodation</option>
          <option>Service</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Onboarding Status</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Suspended</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Account Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.roomsTable}>
          <thead>
            <tr>
              <th>Partner</th>
              <th>Type</th>
              <th>Onboarding Status</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {partnerAccounts.map((partner) => (
              <tr key={partner.partner_id}>
                <td>{partner.partner}</td>
                <td>{partner.type}</td>
                <td>{partner.onboardingStatus}</td>
                <td>{partner.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.activitySection}>
        <div className={styles.settingsCard}>
          <h3>Accommodation Provider Onboarding</h3>
          <form className={styles.settingsForm}>
            <div className={styles.inputGroup}>
              <label>Onboarding Status</label>
              <select>
                <option>Pending</option>
                <option>Under Review</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Suspended</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>KYC Documents</label>
              <input type="file" multiple />
            </div>
            <div className={styles.inputGroup}>
              <label>Contact Persons</label>
              <textarea placeholder="Name, email, phone, role (one per line)" />
            </div>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Contract Dates</label>
                <input type="text" placeholder="Start - End" />
              </div>
              <div className={styles.inputGroup}>
                <label>Commission Rate</label>
                <input type="number" placeholder="15%" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Payout Cycle</label>
              <select>
                <option>Monthly</option>
                <option>Bi-weekly</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Attached Agreements</label>
              <input type="file" />
            </div>
            <button className={styles.saveButton}>Save Accommodation Account</button>
          </form>
        </div>

        <div className={styles.settingsCard}>
          <h3>Service Provider Accounts</h3>
          <form className={styles.settingsForm}>
            <div className={styles.inputGroup}>
              <label>KYC Documents</label>
              <input type="file" multiple />
            </div>
            <div className={styles.inputGroup}>
              <label>Scheduling Preferences</label>
              <textarea placeholder="Preferred work days, time slots, max job capacity" />
            </div>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Operating Hours</label>
                <input type="text" placeholder="Opening time" />
              </div>
              <div className={styles.inputGroup}>
                <label>Closing Time</label>
                <input type="text" placeholder="Closing time" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Working Days</label>
              <input type="text" placeholder="Mon - Sun" />
            </div>
            <button className={styles.saveButton}>Save Service Provider</button>
          </form>
        </div>

        <div className={styles.settingsCard}>
          <h3>Role Based Access Control</h3>
          <div className={styles.bookingsTable}>
            {roleAccessControl.map((role) => (
              <div key={role.role} className={styles.bookingRow}>
                <div>
                  <strong>{role.role}</strong>
                  <p>{role.permissions.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className={styles.roomsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Analytics & Reports</h2>
        <div className={styles.reportActions}>
          <button className={styles.downloadButton}>
            <FiDownload size={16} />
            Export PDF
          </button>
          <button className={styles.downloadButton}>
            <FiDownload size={16} />
            Export CSV
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
            <select className={styles.filterSelect}>
              <option>Country</option>
              <option>Malaysia</option>
            </select>
            <select className={styles.filterSelect}>
              <option>State</option>
              <option>Penang</option>
            </select>
            <select className={styles.filterSelect}>
              <option>Hotel</option>
              <option>Trigo KL</option>
            </select>
          </div>
          <div className={styles.chartPlaceholder}>
            <FiPieChart size={48} className={styles.chartIcon} />
            <p>Occupancy %, occupied rooms, available rooms</p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue Report</h3>
          <p>Gross bookings, cancellations, net payouts, commissions.</p>
          <div className={styles.chartPlaceholder}>
            <FiBarChart2 size={48} className={styles.chartIcon} />
            <p>Trend charts comparing previous periods.</p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Cancellation & Behaviour Analytics</h3>
          <p>Cancellation rate, no-show rate, lead time distribution.</p>
          <div className={styles.chartPlaceholder}>
            <FiTrendingDown size={48} className={styles.chartIcon} />
            <p>Charts with drill downs by hotel.</p>
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>KPI Dashboards</h3>
          <p>Daily / Weekly / Monthly metrics for occupancy, revenue, bookings, cancellations.</p>
          <div className={styles.chartPlaceholder}>
            <FiTrendingUp size={48} className={styles.chartIcon} />
            <p>Drill down to hotel level performance.</p>
          </div>
        </div>
      </div>
    </div>
  );


  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'listings':
        return renderListingManagement();
      case 'services':
        return renderServiceManagement();
      case 'bookings':
        return renderBookingManagement();
      case 'payments':
        return renderPaymentManagement();
      case 'accounts':
        return renderAccountsManagement();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return (
          <div className={styles.comingSoon}>
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
            <p>This section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.adminContainer}>
      <motion.div
        className={`${styles.sidebar} ${showMobileMenu ? styles.sidebarOpen : ''}`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <FiKey size={24} />
            <span>Hotel Admin</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      <div className={styles.mainContent}>
        <main className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {showMobileMenu && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
}

export default Admin;

