import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './HotelCard.module.css';
import { FiHeart } from 'react-icons/fi';

function HotelCard({ hotel }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Always show a rating: use hotel.rating or generate a random one (memoized per hotel.id)
  const rating = useMemo(() => {
    if (hotel.rating !== undefined && hotel.rating !== null) {
      return Number(hotel.rating).toFixed(1);
    }
    // Deterministic random for same hotel.id
    const seed = typeof hotel.id === 'number' ? hotel.id : hotel.name.length;
    const pseudoRandom = ((Math.sin(seed) + 1) / 2) * (1.0) + 4.0; // 4.0 - 5.0
    return pseudoRandom.toFixed(1);
  }, [hotel.rating, hotel.id, hotel.name]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Link
      to={`/hotel/${hotel.id}`}
      className={styles['stay-card']}
      aria-label={`View details for ${hotel.name}`}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img src={hotel.image} alt={hotel.name} className={styles.hotelImage} />
        {/* Heart */}
        <button
          className={`${styles.heartBtn} ${isBookmarked ? styles.heartActive : ''}`}
          onClick={toggleBookmark}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <FiHeart size={18} />
        </button>
      </div>

      {/* Text content */}
      <div className={styles.cardContent}>
        <div className={styles.title}>{hotel.name}</div>
        <div className={styles.location}>{hotel.location}</div>
        <div className={styles.priceRow}>
          <span className={styles.priceGreen}>RM{hotel.price}</span>
          <span className={styles.perNight}> /night</span>
        </div>
      </div>

      {/* Rating (bottom left, always shown, blends with card) */}
      <div className={styles.rating}>
        <span className={styles.ratingValue}>{rating}</span>
        <svg
          className={styles.starIcon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="16"
          height="16"
        >
          <path d="M10 15l-5.878 3.09 1.122-6.545L.487 6.91l6.562-.955L10 0l2.951 5.955 6.562.955-4.757 4.635 1.122 6.545z" />
        </svg>
      </div>

      {/* Arrow button (bottom right) */}
      <span className={styles.arrowLink}>
        <svg
          className={styles.arrowIcon}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 8l4 4-4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}

export default HotelCard;
