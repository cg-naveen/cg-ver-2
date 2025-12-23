import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import {AuthProvider} from './context/AuthContext';

function RouteAwareLayout() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    // Scroll to top when route changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const t = setTimeout(() => setIsTransitioning(false), 250);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div className="route-shell">
  <div className={`route-content ${isTransitioning ? 'is-blurring' : ''}`}>
  {!location.pathname.startsWith('/admin') && <HeaderNav />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listing" element={<Listing/>} />
      <Route path="/rooms/:id" element={<RoomDetails />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/user" element={<User />} />
    </Routes>
  </div>
  <div className={`route-overlay ${isTransitioning ? 'show' : ''}`} />
</div>

  );
}

function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="app-container">
        <RouteAwareLayout />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
