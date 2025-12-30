import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCalendar, FiHome, FiUsers, FiCreditCard } from 'react-icons/fi';
import styles from './BookingConfirmation.module.css';
import Footer from '../components/Footer';
import api from '../api/axios';

function BookingConfirmation() {
  const location = useLocation();
  const bookingData = location.state || {};
  console.log('Received booking data:', bookingData);

  // === USER FORM STATE ===
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    message: ''
  });
  const [phoneError, setPhoneError] = useState(false);
  const [loading, setLoading] = useState(false);

  // === INPUT HANDLER ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'phone' && phoneError) setPhoneError(false);
  };

  // === FORM SUBMIT HANDLER ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError(true);
      return;
    }

    setLoading(true);
    try {
      // Prepare payload for backend
      const payload = {
        user_id: bookingData.userId || null,
        room_id: bookingData.roomId,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        num_guests: bookingData.guests,
        total_price: totalCost,
        first_name: formData.firstName,
        last_name: formData.lastName || null,
        email: formData.email || null,
        phone_number: formData.phone,
        age: formData.age || null,
        message: formData.message || null,
        selected_services: bookingData.selectedServices.map(s => ({
          service_id: s.service_id,
          quantity: s.quantity
        }))
      };
      

  console.log("Booking payload:", payload);

  //POST request
    const result = await api.post('/api/bookings', payload);
    alert(`Booking confirmed! Booking ID: ${result.data.booking_id}`);
    
  } catch (err) {
    console.error('Booking submission error:', err);
    alert('An error occurred while submitting your booking.');
  } finally {
    setLoading(false);
  }
};

  const data = bookingData.roomName ? bookingData : {};
  const checkInDate = new Date(data.checkIn);
  const checkOutDate = new Date(data.checkOut);
  const nights = isNaN(checkInDate) || isNaN(checkOutDate)
    ? data.nights || 1
    : Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
const roomPrice = Number(data.roomPrice);
const roomCost = roomPrice * nights;
const selectedServices = Array.isArray(data.selectedServices)
  ? data.selectedServices
  : [];

const serviceCost = selectedServices.reduce((sum, s) => sum + Number(s.price) * Number(s.quantity || 1), 0);
const totalCost = roomCost + serviceCost;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Booking Confirmation</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {/* === FORM SECTION === */}
<section className={styles.formSection}>
  <h2 className={styles.formTitle}>Guest Details</h2>
  <form onSubmit={handleSubmit} className={styles.form}>
    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label htmlFor="firstName" className={styles.label}>
          First Name<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="lastName" className={styles.label}>
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          E-Mail Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="phone" className={styles.label}>
          Phone<span className={styles.required}>*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
        />
        {phoneError && (
          <span className={styles.errorMessage}>Please enter a valid phone number</span>
        )}
      </div>
    </div>

    <div className={styles.inputGroup}>
      <label htmlFor="age" className={styles.label}>Enter Age</label>
      <input
        type="number"
        id="age"
        name="age"
        value={formData.age}
        onChange={handleInputChange}
        min="1"
        max="120"
        className={styles.input}
      />
    </div>

    <div className={styles.inputGroup}>
      <label htmlFor="message" className={styles.label}>Message</label>
      <textarea
        id="message"
        name="message"
        value={formData.message}
        onChange={handleInputChange}
        placeholder="Any special requests or additional information..."
        className={styles.textarea}
        rows="4"
      />
    </div>

    <div className={styles.checkboxGroup}>
      <input type="checkbox" id="privacyPolicy" name="privacyPolicy" required />
      <label htmlFor="privacyPolicy">
        I agree to the Privacy Policy<span className={styles.required}>*</span>
      </label>
    </div>

    <div className={styles.checkboxGroup}>
      <input type="checkbox" id="terms" name="terms" required />
      <label htmlFor="terms">
        I agree to the Terms and Conditions<span className={styles.required}>*</span>
      </label>
    </div>

    <button 
      type="submit" 
      className={styles.submitButton} 
      disabled={loading}
    >
      <FiCreditCard className={styles.submitIcon} />
      {loading ? 'Processing...' : 'Confirm and Pay'}
    </button>

  </form>
</section>


          {/* === SUMMARY SECTION === */}
          <aside className={styles.summarySection}>
            <div className={styles.imageContainer}>
              <img
                src={data.image}
                alt="Room view"
                className={styles.hotelImage}
              />
            </div>

            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Booking Summary</h3>

              <div className={styles.summaryItem}>
                <FiCalendar className={styles.summaryIcon} />
                <div className={styles.summaryDetails}>
                  <span className={styles.summaryLabel}>Dates:</span>
                  <span className={styles.summaryValue}>
                    {data.checkIn} – {data.checkOut}
                  </span>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <FiUsers className={styles.summaryIcon} />
                <div className={styles.summaryDetails}>
                  <span className={styles.summaryLabel}>Guests:</span>
                  <span className={styles.summaryValue}>{data.guests}</span>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <FiHome className={styles.summaryIcon} />
                <div className={styles.summaryDetails}>
                  <span className={styles.summaryLabel}>Room:</span>
                  <span className={styles.summaryValue}>{data.roomName}</span>
                </div>
              </div>

              {/* === COST DETAILS === */}
              <div className={styles.costSummarySection}>
                <h4 className={styles.costSectionTitle}>Room Charges</h4>
                <div className={styles.breakdownRow}>
                  <span>{data.roomName} × {nights} nights</span>
                  <span>RM {roomCost.toFixed(2)}</span>
                </div>

                {selectedServices.length > 0 && (
                <>
    <h4 className={styles.costSectionTitle} style={{ marginTop: '14px' }}>Additional Services</h4>
    {selectedServices.map((s, index) => (
  <div key={index} className={styles.breakdownRow}>
    <span>{s.service_name} × {s.quantity}</span>
    <span>
      RM {(Number(s.price) * Number(s.quantity)).toFixed(2)}
    </span>
  </div>
))}
  </>
)}


                <div className={styles.breakdownTotalRow}>
                  <span className={styles.totalLabel}>Total Cost</span>
                  <span className={styles.totalAmount}>RM {totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default BookingConfirmation;