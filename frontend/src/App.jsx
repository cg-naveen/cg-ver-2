import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import HeaderNav from './components/HeaderNav';

import Home from './pages/Home';
import Listing from './pages/Listing';
import RoomDetails from './pages/RoomDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

import Admin from './pages/Admin/AdminPage';
import User from './pages/User';

import HotelProvider from './pages/provider/hotel_provider';
import ServiceProvider from './pages/provider/service_provider';

import { AuthProvider } from './context/AuthContext';

function RouteAwareLayout({ children }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const t = setTimeout(() => setIsTransitioning(false), 250);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const hideHeader = location.pathname.startsWith('/admin') || location.pathname.startsWith('/provider');

  return (
    <div className="route-shell">
      <div className={`route-content ${isTransitioning ? 'is-blurring' : ''}`}>
        {!hideHeader && <HeaderNav />}
        {children}
      </div>
      <div className={`route-overlay ${isTransitioning ? 'show' : ''}`} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />
      <Route path="/listing" element={<Listing />} />
      <Route path="/rooms/:id" element={<RoomDetails />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User */}
      <Route element={<ProtectedRoute allowedRoles={['user']}/>}>
          <Route path="/user" element={<User />} />
      </Route>
      

      {/*Superadmin*/}
      <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/admin/*" element={<Admin />} />
      </Route>

      {/* Hotel Provider */}
      <Route element={<ProtectedRoute allowedRoles={['hotel_provider']} />}>
          <Route path="/provider/hotel/:hotel_provider_id" element={<HotelProvider />}/>
      </Route>

      {/* Service Provider */}
      <Route element={<ProtectedRoute allowedRoles={['service_provider']} />}>
          <Route path="/provider/service/:service_provider_id" element={<ServiceProvider />}/>
      </Route>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteAwareLayout>
          <AppRoutes />
        </RouteAwareLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
