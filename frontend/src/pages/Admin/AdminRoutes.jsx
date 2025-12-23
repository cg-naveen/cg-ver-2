import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import ListingManagement from './ListingManagement';
import ServiceManagement from './ServiceManagement';
import BookingManagement from './BookingManagement';
import PaymentManagement from './PaymentManagement';
import AccountsManagement from './AccountsManagement';
import Analytics from './Analytics';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="listings" element={<ListingManagement />} />
      <Route path="services" element={<ServiceManagement />} />
      <Route path="bookings" element={<BookingManagement />} />
      <Route path="payments" element={<PaymentManagement />} />
      <Route path="accounts" element={<AccountsManagement />} />
      <Route path="analytics" element={<Analytics />} />
    </Routes>
  );
}
