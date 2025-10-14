import React, { useState } from 'react';
import { FiCalendar, FiUsers, FiMapPin, FiCreditCard } from 'react-icons/fi';
import styles from './BookingConfirmation.module.css';
import Footer from '../components/Footer';

function BookingConfirmation() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    message: ''
  });
  const [phoneError, setPhoneError] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'phone' && phoneError) {
      setPhoneError(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError(true);
      return;
    }
    console.log('Form submitted:', formData);
  };

  const bookingData = {
    hotelName: 'Premium Suite (Assisted) – Sukha Senior Resort',
    checkIn: 'September 26, 2025',
    checkOut: 'September 30, 2025',
    guests: '2 Adults',
    additionalServices: [
      { name: 'Airport Transfer', price: 600.00 }
    ],
    totalCost: 2000.00
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Booking Confirmation</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <section className={styles.formSection}>
            <h2 className={styles.formTitle}>Personal Details</h2>
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
                    Last Name<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    E-Mail Address<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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
          <input
            type="checkbox"
            id="privacyPolicy"
            name="privacyPolicy"
            required
          />
          <label htmlFor="privacyPolicy">
            I agree to the Privacy Policy<span className={styles.required}>*</span>
          </label>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
          />
          <label htmlFor="terms">
            I agree to the Terms and Conditions<span className={styles.required}>*</span>
          </label>
        </div>

              <button type="submit" className={styles.submitButton}>
                <FiCreditCard className={styles.submitIcon} />
                Confirm and Pay
              </button>
            </form>
          </section>

          <aside className={styles.summarySection}>
  <div className={styles.imageContainer}>
    <img
      src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
      alt="Hotel view"
      className={styles.hotelImage}
    />
  </div>

  <div className={styles.summaryCard}>
    <h3 className={styles.summaryTitle}>Booking Summary</h3>

    <div className={styles.summaryItem}>
      <FiCalendar className={styles.summaryIcon} />
      <div className={styles.summaryDetails}>
        <span className={styles.summaryLabel}>Date:</span>
        <span className={styles.summaryValue}>
          {bookingData.checkIn} – {bookingData.checkOut}
        </span>
      </div>
    </div>

    <div className={styles.summaryItem}>
      <FiUsers className={styles.summaryIcon} />
      <div className={styles.summaryDetails}>
        <span className={styles.summaryLabel}>Guests:</span>
        <span className={styles.summaryValue}>{bookingData.guests}</span>
      </div>
    </div>

    <div className={styles.summaryItem}>
      <FiMapPin className={styles.summaryIcon} />
      <div className={styles.summaryDetails}>
        <span className={styles.summaryLabel}>Hotel:</span>
        <span className={styles.summaryValue}>{bookingData.hotelName}</span>
      </div>
    </div>

    <div className={styles.additionalServices}>
      <h4 className={styles.servicesTitle}>Additional Services:</h4>
      {bookingData.additionalServices.map((service, index) => (
        <div key={index} className={styles.serviceItem}>
          <span className={styles.serviceName}>{service.name}</span>
          <span className={styles.servicePrice}>
            RM {service.price.toFixed(2)}
          </span>
        </div>
      ))}
    </div>

    <div className={styles.totalSection}>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Cost:</span>
        <span className={styles.totalAmount}>
          RM {bookingData.totalCost.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
</aside>
        </div>
      </main>
      
      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

export default BookingConfirmation;
