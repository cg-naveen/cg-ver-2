import React, { useState, useEffect } from 'react';
import styles from './BookingCard.module.css';
import api from '../api/axios';

function BookingCard({ booking, onCancelSuccess }) {
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelled, setCancelled] = useState(booking.status.toLowerCase() === 'cancelled');
  const [message, setMessage] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
    const statusMap = {
      completed: styles.statusCompleted,
      pendingpayment: styles.statusPending,
      cancelled: styles.statusCancelled,
    };
    return statusMap[normalizedStatus] || styles.statusDefault;
  };

  const formatStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'Completed';
      case 'pending':
      case 'pendingpayment':
      case 'pending payment': return 'Pending Payment';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const today = new Date();
  const checkInDate = new Date(booking.check_in);

  const cancellable = !cancelled && (
  (booking.status.toLowerCase() === 'pending payment' ||
   booking.status.toLowerCase() === 'completed') &&
  checkInDate > today
  );

  const handleCancelSubmit = async () => {
    if (!reason.trim()) {
      setMessage('Please provide a reason for cancellation.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await api.post(`/api/bookings/${booking.booking_id}/cancel`, {
        reason,
        note
      });

      setCancelled(true);
      setShowCancelForm(false);
      setMessage('Cancellation request sent.');
      if (onCancelSuccess) onCancelSuccess(booking.booking_id);
    } catch (err) {
      console.error('Cancellation failed:', err);
      setMessage('Failed to cancel booking. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCancelled(booking.status.toLowerCase() === 'cancelled');
  }, [booking.status]);

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingHeader}>
        <div className={styles.bookingInfo}>
          <h3 className={styles.hotelName}>{booking.hotel_name}</h3>
          <p className={styles.roomName}>{booking.room_name}</p>
        </div>
        <span className={`${styles.statusBadge} ${getStatusClass(formatStatus(booking.status))}`}>
          {formatStatus(booking.status)}
        </span>
      </div>

      <div className={styles.bookingDetails}>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Check-in:</span>
          <span className={styles.detailValue}>{formatDate(booking.check_in)}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Check-out:</span>
          <span className={styles.detailValue}>{formatDate(booking.check_out)}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.detailLabel}>Total Price:</span>
          <span className={styles.priceValue}>RM {Number(booking.price).toFixed(2)}</span>
        </div>

        {booking.services && booking.services.length > 0 && (
          <div className={styles.servicesSection}>
            <span className={styles.detailLabel}>Services:</span>
            <div className={styles.servicesPills}>
              {booking.services.map(service => (
                <span key={service.service_id} className={styles.servicePill}>
                  {service.service_name}{service.quantity > 1 ? ` (x${service.quantity})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ================= CANCEL BUTTON ================= */}
        {cancellable && !showCancelForm && !cancelled && (
          <div className={styles.cancelButtonWrapper}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowCancelForm(true)}
            >
              Cancel Booking
          </button>
          </div>
        )}


        {/* ================= CANCEL FORM ================= */}
        {showCancelForm && (
          <div className={styles.cancelForm}>
            <h4>Cancel Booking</h4>
            <label>Reason *</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason for cancellation"
            />
            <label>Additional Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note"
            />
            <div className={styles.formActions}>
              <button
                className={styles.saveButton}
                onClick={handleCancelSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowCancelForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
            {message && <p className={styles.cancelMessage}>{message}</p>}
          </div>
        )}

      </div>
    </div>
  );
}

export default BookingCard;
