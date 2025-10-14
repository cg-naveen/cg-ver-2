import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiKey,
  FiCalendar,
  FiCreditCard,
  FiUsers,
  FiUserCheck,
  FiTool,
  FiMessageSquare,
  FiBarChart2,
  FiSettings,
  FiBell,
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiPieChart,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiFilter,
  FiDownload,
  FiUpload,
  FiStar,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';
import styles from './Admin.module.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'rooms', label: 'Rooms', icon: FiKey },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar },
    { id: 'payments', label: 'Payments', icon: FiCreditCard },
    { id: 'guests', label: 'Guests', icon: FiUsers },
    { id: 'staff', label: 'Staff', icon: FiUserCheck },
    { id: 'maintenance', label: 'Maintenance', icon: FiTool },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare },
    { id: 'reports', label: 'Reports', icon: FiBarChart2 },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  const metricCards = [
    { title: 'Occupancy Rate', value: '87%', icon: FiPieChart, color: 'green', trend: '+5%' },
    { title: 'Bookings Today', value: '24', icon: FiCalendar, color: 'blue', trend: '+12%' },
    { title: 'Available Rooms', value: '8', icon: FiKey, color: 'purple', trend: '-2' },
    { title: 'Total Revenue', value: 'RM 45,230', icon: FiDollarSign, color: 'yellow', trend: '+8%' }
  ];

  const recentBookings = [
    { guest: 'John Smith', room: 'Deluxe 201', checkin: '2024-01-15', checkout: '2024-01-18', status: 'confirmed' },
    { guest: 'Sarah Johnson', room: 'Suite 305', checkin: '2024-01-16', checkout: '2024-01-20', status: 'pending' },
    { guest: 'Mike Wilson', room: 'Standard 102', checkin: '2024-01-14', checkout: '2024-01-16', status: 'completed' },
    { guest: 'Emily Davis', room: 'Deluxe 203', checkin: '2024-01-17', checkout: '2024-01-19', status: 'confirmed' }
  ];

  const rooms = [
    { id: 1, name: 'Deluxe Suite 201', type: 'Deluxe', price: 350, status: 'available', floor: '2nd', amenities: 'WiFi, AC, TV, Mini-bar' },
    { id: 2, name: 'Standard Room 102', type: 'Standard', price: 180, status: 'occupied', floor: '1st', amenities: 'WiFi, AC, TV' },
    { id: 3, name: 'Premium Suite 305', type: 'Premium', price: 450, status: 'maintenance', floor: '3rd', amenities: 'WiFi, AC, TV, Mini-bar, Balcony' },
    { id: 4, name: 'Standard Room 103', type: 'Standard', price: 180, status: 'available', floor: '1st', amenities: 'WiFi, AC, TV' },
    { id: 5, name: 'Deluxe Suite 202', type: 'Deluxe', price: 350, status: 'occupied', floor: '2nd', amenities: 'WiFi, AC, TV, Mini-bar' },
    { id: 6, name: 'Standard Room 104', type: 'Standard', price: 180, status: 'available', floor: '1st', amenities: 'WiFi, AC, TV' },
    { id: 7, name: 'Premium Suite 306', type: 'Premium', price: 450, status: 'available', floor: '3rd', amenities: 'WiFi, AC, TV, Mini-bar, Balcony' },
    { id: 8, name: 'Standard Room 105', type: 'Standard', price: 180, status: 'maintenance', floor: '1st', amenities: 'WiFi, AC, TV' },
    { id: 9, name: 'Deluxe Suite 203', type: 'Deluxe', price: 350, status: 'available', floor: '2nd', amenities: 'WiFi, AC, TV, Mini-bar' },
    { id: 10, name: 'Standard Room 106', type: 'Standard', price: 180, status: 'occupied', floor: '1st', amenities: 'WiFi, AC, TV' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'occupied': return '#F59E0B';
      case 'maintenance': return '#EF4444';
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'completed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Payments data
  const payments = [
    { id: 1, date: '2024-01-15', guest: 'John Smith', room: 'Deluxe 201', amount: 1050, method: 'Credit Card', status: 'completed' },
    { id: 2, date: '2024-01-16', guest: 'Sarah Johnson', room: 'Suite 305', amount: 1800, method: 'Bank Transfer', status: 'pending' },
    { id: 3, date: '2024-01-14', guest: 'Mike Wilson', room: 'Standard 102', amount: 360, method: 'Credit Card', status: 'completed' },
    { id: 4, date: '2024-01-17', guest: 'Emily Davis', room: 'Deluxe 203', amount: 700, method: 'Cash', status: 'completed' }
  ];

  // Guests data
  const guests = [
    { id: 1, name: 'John Smith', email: 'john@email.com', phone: '+60123456789', totalStays: 5, lastStay: '2024-01-15', loyalty: 'Gold' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+60123456790', totalStays: 3, lastStay: '2024-01-16', loyalty: 'Silver' },
    { id: 3, name: 'Mike Wilson', email: 'mike@email.com', phone: '+60123456791', totalStays: 8, lastStay: '2024-01-14', loyalty: 'Platinum' },
    { id: 4, name: 'Emily Davis', email: 'emily@email.com', phone: '+60123456792', totalStays: 2, lastStay: '2024-01-17', loyalty: 'Bronze' }
  ];

  // Staff data
  const staff = [
    { id: 1, name: 'Alice Brown', role: 'Front Desk', department: 'Reception', shift: 'Day', contact: '+60123456793', status: 'active' },
    { id: 2, name: 'Bob Green', role: 'Housekeeping', department: 'Maintenance', shift: 'Night', contact: '+60123456794', status: 'active' },
    { id: 3, name: 'Carol White', role: 'Manager', department: 'Administration', shift: 'Day', contact: '+60123456795', status: 'active' },
    { id: 4, name: 'David Black', role: 'Security', department: 'Security', shift: 'Night', contact: '+60123456796', status: 'on-leave' }
  ];

  // Maintenance data
  const maintenance = [
    { id: 'MT-001', room: 'Standard 105', issue: 'AC not working', assignedTo: 'Bob Green', priority: 'high', status: 'in-progress' },
    { id: 'MT-002', room: 'Deluxe 201', issue: 'TV remote missing', assignedTo: 'Alice Brown', priority: 'low', status: 'completed' },
    { id: 'MT-003', room: 'Premium 305', issue: 'Toilet blocked', assignedTo: 'Bob Green', priority: 'high', status: 'pending' },
    { id: 'MT-004', room: 'Standard 102', issue: 'WiFi connectivity', assignedTo: 'Carol White', priority: 'medium', status: 'completed' }
  ];

  // Messages data
  const messages = [
    { id: 1, sender: 'John Smith', message: 'Can I get extra towels?', time: '10:30 AM', room: 'Deluxe 201', status: 'unread' },
    { id: 2, sender: 'Sarah Johnson', message: 'Room service menu please', time: '09:15 AM', room: 'Suite 305', status: 'read' },
    { id: 3, sender: 'Mike Wilson', message: 'Check-out time extension', time: '08:45 AM', room: 'Standard 102', status: 'read' },
    { id: 4, sender: 'Emily Davis', message: 'Laundry service request', time: '07:20 AM', room: 'Deluxe 203', status: 'unread' }
  ];

  const renderDashboard = () => (
    <div className={styles.dashboardContent}>
      {/* Metrics Overview */}
      <div className={styles.metricsGrid}>
        {metricCards.map((card, index) => (
          <motion.div
            key={card.title}
            className={styles.metricCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.metricInfo}>
              <h4 className={styles.metricTitle}>{card.title}</h4>
              <p className={styles.metricValue}>{card.value}</p>
              <span className={`${styles.metricTrend} ${card.trend.startsWith('+') ? styles.trendUp : styles.trendDown}`}>
                {card.trend}
              </span>
            </div>
            <div className={`${styles.metricIcon} ${styles[card.color]}`}>
              <card.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className={styles.chartTitle}>Occupancy Trend</h3>
          <div className={styles.chartPlaceholder}>
            <FiTrendingUp size={48} className={styles.chartIcon} />
            <p>Line chart showing occupancy over time</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.chartCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={styles.chartTitle}>Revenue Summary</h3>
          <div className={styles.chartPlaceholder}>
            <FiBarChart2 size={48} className={styles.chartIcon} />
            <p>Bar chart showing revenue breakdown</p>
          </div>
        </motion.div>
      </div>

      {/* Activity & Notifications */}
      <div className={styles.activitySection}>
        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className={styles.cardTitle}>Recent Bookings</h3>
          <div className={styles.bookingsTable}>
            {recentBookings.map((booking, index) => (
              <div key={index} className={styles.bookingRow}>
                <div className={styles.bookingInfo}>
                  <span className={styles.guestName}>{booking.guest}</span>
                  <span className={styles.roomNumber}>{booking.room}</span>
                </div>
                <div className={styles.bookingDates}>
                  <span>{booking.checkin} - {booking.checkout}</span>
                </div>
                <span 
                  className={styles.statusBadge}
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className={styles.activityCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className={styles.cardTitle}>Recent Reviews</h3>
          <div className={styles.reviewsList}>
            <div className={styles.reviewItem}>
              <div className={styles.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} size={16} className={styles.star} />
                ))}
              </div>
              <p className={styles.reviewText}>"Excellent service and beautiful rooms!"</p>
              <span className={styles.reviewGuest}>- John Smith</span>
            </div>
            <div className={styles.reviewItem}>
              <div className={styles.reviewStars}>
                {[...Array(4)].map((_, i) => (
                  <FiStar key={i} size={16} className={styles.star} />
                ))}
              </div>
              <p className={styles.reviewText}>"Great location and friendly staff."</p>
              <span className={styles.reviewGuest}>- Sarah Johnson</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className={styles.roomsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Rooms Management</h2>
        <button className={styles.addButton}>
          <FiPlus size={18} />
          Add Room
        </button>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search rooms..." />
        </div>
        <select className={styles.filterSelect}>
          <option>All Rooms</option>
          <option>Available</option>
          <option>Under Cleaning</option>
          <option>Out of Order</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.roomsTable}>
          <thead>
            <tr>
              <th>Room Name</th>
              <th>Type</th>
              <th>Floor</th>
              <th>Price</th>
              <th>Status</th>
              <th>Amenities</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, index) => (
              <motion.tr
                key={room.id}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={styles.tableCell}>{room.name}</td>
                <td className={styles.tableCell}>{room.type}</td>
                <td className={styles.tableCell}>{room.floor}</td>
                <td className={styles.tableCell}>RM {room.price}/night</td>
                <td className={styles.tableCell}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(room.status) }}
                  >
                    {room.status}
                  </span>
                </td>
                <td className={styles.tableCell}>{room.amenities}</td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                      <FiEdit size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className={styles.bookingsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Bookings Management</h2>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search by guest or date..." />
        </div>
        <select className={styles.filterSelect}>
          <option>All Bookings</option>
          <option>Upcoming</option>
          <option>Completed</option>
          <option>Canceled</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking, index) => (
              <motion.tr
                key={index}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={styles.tableCell}>{booking.guest}</td>
                <td className={styles.tableCell}>{booking.room}</td>
                <td className={styles.tableCell}>{booking.checkin}</td>
                <td className={styles.tableCell}>{booking.checkout}</td>
                <td className={styles.tableCell}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span className={styles.paymentStatus}>Paid</span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                      <FiEye size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiEdit size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className={styles.paymentsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Payments & Finance</h2>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.tabButtons}>
          <button className={`${styles.tabButton} ${styles.active}`}>Daily</button>
          <button className={styles.tabButton}>Weekly</button>
          <button className={styles.tabButton}>Monthly</button>
        </div>
        <select className={styles.filterSelect}>
          <option>All Payments</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.paymentsTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <motion.tr
                key={payment.id}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={styles.tableCell}>{payment.date}</td>
                <td className={styles.tableCell}>{payment.guest}</td>
                <td className={styles.tableCell}>{payment.room}</td>
                <td className={styles.tableCell}>RM {payment.amount}</td>
                <td className={styles.tableCell}>{payment.method}</td>
                <td className={styles.tableCell}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                      <FiEye size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiDownload size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGuests = () => (
    <div className={styles.guestsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Guest Management</h2>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search guests..." />
        </div>
        <select className={styles.filterSelect}>
          <option>All Guests</option>
          <option>Gold Members</option>
          <option>Silver Members</option>
          <option>Bronze Members</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.guestsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Total Stays</th>
              <th>Last Stay</th>
              <th>Loyalty Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => (
              <motion.tr
                key={guest.id}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={styles.tableCell}>{guest.name}</td>
                <td className={styles.tableCell}>
                  <div>{guest.email}</div>
                  <div className={styles.contactSecondary}>{guest.phone}</div>
                </td>
                <td className={styles.tableCell}>{guest.totalStays}</td>
                <td className={styles.tableCell}>{guest.lastStay}</td>
                <td className={styles.tableCell}>
                  <span className={`${styles.loyaltyBadge} ${styles[guest.loyalty.toLowerCase()]}`}>
                    {guest.loyalty}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                      <FiEye size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiEdit size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStaff = () => (
    <div className={styles.staffContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Staff Management</h2>
        <button className={styles.addButton}>
          <FiPlus size={18} />
          Add Staff
        </button>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <FiSearch size={18} />
          <input type="text" placeholder="Search staff..." />
        </div>
        <select className={styles.filterSelect}>
          <option>All Staff</option>
          <option>Front Desk</option>
          <option>Housekeeping</option>
          <option>Maintenance</option>
          <option>Security</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.staffTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Shift</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member, index) => (
              <motion.tr
                key={member.id}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={styles.tableCell}>{member.name}</td>
                <td className={styles.tableCell}>{member.role}</td>
                <td className={styles.tableCell}>{member.department}</td>
                <td className={styles.tableCell}>{member.shift}</td>
                <td className={styles.tableCell}>{member.contact}</td>
                <td className={styles.tableCell}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(member.status) }}
                  >
                    {member.status}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                      <FiEdit size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiUserCheck size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className={styles.maintenanceContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Maintenance Management</h2>
        <button className={styles.addButton}>
          <FiPlus size={18} />
          Add Ticket
        </button>
      </div>

      <div className={styles.filtersBar}>
        <select className={styles.filterSelect}>
          <option>All Issues</option>
          <option>High Priority</option>
          <option>Medium Priority</option>
          <option>Low Priority</option>
        </select>
        <select className={styles.filterSelect}>
          <option>All Status</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.maintenanceTable}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Room</th>
              <th>Issue</th>
              <th>Assigned To</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenance.map((ticket, index) => (
              <motion.tr
                key={ticket.id}
                className={styles.tableRow}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className={styles.tableCell}>{ticket.id}</td>
                <td className={styles.tableCell}>{ticket.room}</td>
                <td className={styles.tableCell}>{ticket.issue}</td>
                <td className={styles.tableCell}>{ticket.assignedTo}</td>
                <td className={styles.tableCell}>
                  <span className={`${styles.priorityBadge} ${styles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(ticket.status) }}
                  >
                    {ticket.status}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button className={styles.actionButton}>
                      <FiEdit size={14} />
                    </button>
                    <button className={styles.actionButton}>
                      <FiCheckCircle size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className={styles.messagesContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Messages & Communication</h2>
      </div>

      <div className={styles.messagesLayout}>
        <div className={styles.conversationList}>
          <h3>Recent Conversations</h3>
          {messages.map((message, index) => (
            <div key={message.id} className={`${styles.conversationItem} ${message.status === 'unread' ? styles.unread : ''}`}>
              <div className={styles.conversationInfo}>
                <span className={styles.senderName}>{message.sender}</span>
                <span className={styles.messageTime}>{message.time}</span>
              </div>
              <p className={styles.messagePreview}>{message.message}</p>
              <span className={styles.roomInfo}>Room: {message.room}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <h3>Guest Support</h3>
          </div>
          <div className={styles.chatMessages}>
            <div className={styles.messageBubble}>
              <p>Hello! How can I help you today?</p>
              <span className={styles.messageTime}>10:30 AM</span>
            </div>
          </div>
          <div className={styles.chatInput}>
            <input type="text" placeholder="Type your message..." />
            <button className={styles.sendButton}>
              <FiMessageSquare size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className={styles.reportsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Reports & Analytics</h2>
        <div className={styles.reportActions}>
          <button className={styles.downloadButton}>
            <FiDownload size={18} />
            Export PDF
          </button>
          <button className={styles.downloadButton}>
            <FiDownload size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className={styles.reportsTabs}>
        <button className={`${styles.reportTab} ${styles.active}`}>Occupancy Trends</button>
        <button className={styles.reportTab}>Revenue Breakdown</button>
        <button className={styles.reportTab}>Booking Sources</button>
        <button className={styles.reportTab}>Room Performance</button>
      </div>

      <div className={styles.reportContent}>
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Monthly Occupancy Rate</h3>
          <div className={styles.chartPlaceholder}>
            <FiTrendingUp size={48} className={styles.chartIcon} />
            <p>Line chart showing occupancy trends over time</p>
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue by Room Type</h3>
          <div className={styles.chartPlaceholder}>
            <FiPieChart size={48} className={styles.chartIcon} />
            <p>Pie chart showing revenue distribution</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className={styles.settingsContent}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Settings</h2>
      </div>

      <div className={styles.settingsTabs}>
        <button className={`${styles.settingsTab} ${styles.active}`}>Hotel Info</button>
        <button className={styles.settingsTab}>User Management</button>
        <button className={styles.settingsTab}>Integrations</button>
        <button className={styles.settingsTab}>Theme</button>
      </div>

      <div className={styles.settingsContent}>
        <div className={styles.settingsCard}>
          <h3>Hotel Information</h3>
          <form className={styles.settingsForm}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Hotel Name</label>
                <input type="text" defaultValue="caGrand Hotel" />
              </div>
              <div className={styles.inputGroup}>
                <label>Contact Number</label>
                <input type="tel" defaultValue="+6014 932 1140" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Address</label>
              <textarea defaultValue="3&5, Lorong Sultan, PJS 52, 46200 Petaling Jaya, Selangor, Malaysia" />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" defaultValue="care@cagrand.com" />
            </div>
            <button className={styles.saveButton}>Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'rooms':
        return renderRooms();
      case 'bookings':
        return renderBookings();
      case 'payments':
        return renderPayments();
      case 'guests':
        return renderGuests();
      case 'staff':
        return renderStaff();
      case 'maintenance':
        return renderMaintenance();
      case 'messages':
        return renderMessages();
      case 'reports':
        return renderReports();
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
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Content Area */}
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

      {/* Mobile Overlay */}
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
