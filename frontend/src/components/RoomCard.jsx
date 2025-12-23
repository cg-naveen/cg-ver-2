import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './RoomCard.module.css';
import { FiHeart } from 'react-icons/fi';

function RoomCard({ room, isFavourite, onToggleFavourite, isLoggedIn }) {

  // Get search parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const check_in = params.get('check_in') || '';
  const check_out = params.get('check_out') || '';

  // Rating logic
  const rating = useMemo(() => {
    if (room.rating !== undefined && room.rating !== null) {
      return Number(room.rating).toFixed(1);
    }
    const seed = typeof room.room_id === 'number' ? room.room_id : room.room_name.length;
    const pseudoRandom = ((Math.sin(seed) + 1) / 2) * 1.0 + 4.0;
    return pseudoRandom.toFixed(1);
  }, [room.rating, room.room_id, room.room_name]);

  // Prevent navigation when clicking the heart
  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      alert('Please log in to save favourites');
      return;
    }

    onToggleFavourite();
  };

  // Resolve image URL
  let image = '';
  try {
    if (typeof room.image_url === 'string') {
      image = room.image_url;
    } else if (Array.isArray(room.image_url)) {
      image = room.image_url[0];
    } else if (typeof room.image_url === 'object' && room.image_url !== null) {
      image = Object.values(room.image_url)[0];
    }
  } catch (error) {
    console.error('Error parsing image_url:', error);
  }
  if (!image) image = 'https://via.placeholder.com/400x250?text=No+Image';

  return (
    <Link
      to={`/rooms/${room.room_id}?check_in=${check_in}&check_out=${check_out}`}
      className={styles['stay-card']}
      aria-label={`View details for ${room.room_name}`}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        <img src={image} alt={room.room_name} className={styles.roomImage} />

        <button
          className={`${styles.heartBtn} ${isFavourite ? styles.heartActive : ''}`}
          onClick={handleBookmarkClick}
          disabled={!isLoggedIn}
          aria-label={isFavourite ? 'Remove bookmark' : 'Add bookmark'}
        >
          <FiHeart size={18} />
        </button>
      </div>

      {/* Card content */}
      <div className={styles.cardContent}>
        <div className={styles.roomName}>{room.room_name}</div>
        <div className={styles.hotelNameBlack}>{room.hotel_name}</div>
        <div className={styles.location}>{room.location}</div>

        <div className={styles.priceRow}>
          <span className={styles.priceGreen}>RM{room.rate}</span>
          <span className={styles.perNight}> /night</span>
        </div>
      </div>

      {/* Rating */}
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

      {/* Arrow */}
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

export default RoomCard;
