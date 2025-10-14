import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HeaderNav from './components/HeaderNav';
import Home from './pages/Home';
import Stays from './pages/Stays';
import HotelDetails from './pages/HotelDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import AboutUs from './pages/AboutUs'; 
import Contact from './pages/Contact'; 
import Login from './pages/Login'; 
import Register from './pages/Register';
import Admin from './pages/Admin';

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
    {location.pathname !== '/admin' && <HeaderNav />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/stays" element={<Stays />} />
      <Route path="/hotel/:id" element={<HotelDetails />} />
      <Route path="/hotels/:id" element={<HotelDetails />} />
      <Route path="/booking-confirmation" element={<BookingConfirmation />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  </div>
  <div className={`route-overlay ${isTransitioning ? 'show' : ''}`} />
</div>

  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <RouteAwareLayout />
      </div>
    </Router>
  );
}

export default App;
