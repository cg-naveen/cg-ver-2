import { FiCalendar, FiClipboard, FiTrendingUp } from 'react-icons/fi';

// Utility functions
export const formatCurrency = (value) =>
  `RM ${value.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

export const getStatusColor = (status) => {
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

// Navigation
export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'FiHome' },
  { id: 'listings', label: 'Listings', iconName: 'FiKey' },
  { id: 'services', label: 'Services', iconName: 'FiBriefcase' },
  { id: 'bookings', label: 'Bookings', iconName: 'FiCalendar' },
  { id: 'payments', label: 'Payments', iconName: 'FiCreditCard' },
  { id: 'accounts', label: 'Accounts', iconName: 'FiUsers' },
  { id: 'analytics', label: 'Analytics', iconName: 'FiBarChart2' }
];

// Dashboard / overview
export const bookingStats = [
  { label: 'Today', value: 3, context: 'vs 2 yesterday', trend: '+14%', color: 'green', icon: FiCalendar },
  { label: 'Past 7 days', value: 14, context: 'vs 12 last week', trend: '+4.7%', color: 'blue', icon: FiClipboard },
  { label: 'Past 30 days', value: 50, context: 'vs 41 last month', trend: '+6.4%', color: 'purple', icon: FiTrendingUp }
];

export const occupancySummary = {
  month: 'November 2025',
  percentage: 76,
  occupied: 25,
  available: 33
};

export const revenueSummary = {
  gross: 15120,
  net: 13830,
  commissions: 4130,
  trend: '+6.2% vs last month'
};

export const upcomingStays = [
  { type: 'Check-in', guest: 'Mohd Amir', room: 'Deluxe Twin Room', hotel: 'Trigo KL', reference: 'BKG1134', date: '2025-11-21' },
  { type: 'Check-out', guest: 'Emily Tan', room: 'Single King Room', hotel: 'Wyndham Trinidad', reference: 'BKG1123', date: '2025-11-21' },
  { type: 'Check-in', guest: 'Nur Idris', room: 'Executive Queen Room', hotel: 'Trinidad Suites', reference: 'BKG1135', date: '2025-11-22' },
  { type: 'Check-out', guest: 'Alicia Wong', room: 'Premium Suite', hotel: 'Sukha Golden', reference: 'BKG-1128', date: '2025-11-23' }
];

export const pendingPayments = [
  { guest: 'Daniel Lim', hotel: 'Trigo KL', amount: 1980, method: 'Credit Card', reference: 'PMT98765', status: 'Pending verification' },
  { guest: 'Jason Teo', hotel: 'Sukha Golden', amount: 860, method: 'FPX', reference: 'PMT98732', status: 'Awaiting proof' },
  { guest: 'Kumar Raj', hotel: 'Wyndham Trinidad', amount: 1260, method: 'Bank transfer', reference: 'PMT98690', status: 'Pending release' }
];

// Hotels & rooms
export const hotels = [
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

export const roomInventory = {
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

// Services
export const services = [
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

export const serviceBookings = [
  { date: '2025-11-21', service: 'Airport Transfer', room: '1903', hotel: 'Trigo KL', reference: 'BKG1121' },
  { date: '2025-11-22', service: 'Medical Assistant', room: '504', hotel: 'Sukha Golden', reference: 'BKG1123' },
  { date: '2025-11-23', service: 'Personal Assistant', room: '803', hotel: 'Wyndham Trinidad', reference: 'BKG1125' }
];

// Bookings
export const bookingList = [
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
    status: 'Cancelled'
  }
];

export const cancellationRequests = [
  { booking_id: 'BKG1113', guest: 'Nur Nabil', refundAmount: 580, reason: 'Medical emergency', status: 'Awaiting approval' },
  { booking_id: 'BKG1121', guest: 'Sri Devi', refundAmount: 860, reason: 'Flight cancelled', status: 'Pending documents' }
];

export const paymentTransactions = [
  { transaction_id: 'PMT98765', booking_id: 'BKG1120', method: 'Credit Card', amount: 1980, status: 'Pending', date: '2025-11-20', payer: 'Daniel Lim' },
  { transaction_id: 'PMT98732', booking_id: 'BKG1119', method: 'FPX', amount: 2140, status: 'Completed', date: '2025-11-19', payer: 'Emily Tan' },
  { transaction_id: 'PMT98690', booking_id: 'BKG1125', method: 'Credit Card', amount: 1520, status: 'Completed', date: '2025-11-18', payer: 'Alicia Wong' },
  { transaction_id: 'PMT98645', booking_id: 'BKG1123', method: 'Bank Transfer', amount: 860, status: 'Refund pending', date: '2025-11-12', payer: 'Jason Teo' }
];

export const refundProcesses = [
  { booking_id: 'BKG1109', amount: 860, reason: 'Cancelled stay', status: 'Awaiting approval' },
  { booking_id: 'BKG1112', amount: 420, reason: 'Overcharge adjustment', status: 'Processed' }
];

export const commissionPartners = [
  { partner_id: 'PT-001', partner_name: 'Sukha Golden', commission: 12, total_commission: 18520 },
  { partner_id: 'PT-002', partner_name: 'Trigo KL', commission: 15, total_commission: 23140 },
  { partner_id: 'PT-003', partner_name: 'Wyndham Trinidad', commission: 10, total_commission: 12800 }
];

export const partnerAccounts = [
  { partner_id: 'PA-2001', partner: 'Sukha Golden', type: 'Accommodation', onboardingStatus: 'Approved', status: 'Active' },
  { partner_id: 'PA-2002', partner: 'Wyndham Trinidad Sdn Bhd', type: 'Accommodation', onboardingStatus: 'Pending', status: 'Pending' },
  { partner_id: 'PA-3011', partner: 'Serenity Wellness', type: 'Service', onboardingStatus: 'Under Review', status: 'Active' },
  { partner_id: 'PA-3050', partner: 'SkyLift Logistics', type: 'Service', onboardingStatus: 'Approved', status: 'Suspended' }
];

export const roleAccessControl = [
  { role: "Admin", permissions: ["Manage Users", "Manage Hotels", "Manage Payments", "Access Reports"] },
  { role: "Accommodation Partner", permissions: ["Manage Rooms", "View Bookings", "Update Availability"] },
  { role: "Service Provider", permissions: ["Accept Jobs", "View Schedule", "Update Status"] }
];

// Optional default export
const mockData = {
  navigationItems, bookingStats, occupancySummary, revenueSummary,
  upcomingStays, pendingPayments, hotels, roomInventory, services,
  serviceBookings, bookingList, cancellationRequests, paymentTransactions,
  refundProcesses, commissionPartners, partnerAccounts, roleAccessControl,
  formatCurrency, getStatusColor
};

export default mockData;
