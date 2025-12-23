import React from 'react';
import styles from './BookingCard.module.css';

function BookingCard({ booking }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      case 'completed':
        return 'Completed';
      case 'pending':
      case 'pendingpayment':
      case 'pending payment':
        return 'Pending Payment';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingHeader}>
        <div className={styles.bookingInfo}>
          <h3 className={styles.hotelName}>{booking.hotel_name}</h3>
          <p className={styles.roomName}>{booking.room_name}</p>
        </div>
        <span
          className={`${styles.statusBadge} ${getStatusClass(
            formatStatus(booking.status)
          )}`}
        >
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
                  {service.service_name}
                  {service.quantity > 1 ? ` (x${service.quantity})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingCard;
