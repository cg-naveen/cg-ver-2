import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import navigate hook
import styles from './SearchBar.module.css';
import Button from './Button';

function SearchBar() {
  const [guestPopup, setGuestPopup] = React.useState(false);
  const [guests, setGuests] = React.useState(1);
  const navigate = useNavigate(); // ✅ init navigate

  const handleGuestChange = (change) => {
    setGuests((prev) => Math.max(1, prev + change));
  };

  const handleGuestClick = () => setGuestPopup(v => !v);

  const handleFindRoom = () => {
    // for now, just navigate — later we can pass query params
    navigate('/stays');
  };

  return (
    <div className={styles.container} style={{position: 'relative'}}>
      <div className={styles.rowTop}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>City</label>
          <select className={styles.input}>
            <option>City</option>
            <option>Kuala Lumpur</option>
            <option>Penang</option>
            <option>Johor Bahru</option>
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Category</label>
          <select className={styles.input}>
            <option>Category</option>
            <option>Budget</option>
            <option>Luxury</option>
            <option>Family</option>
          </select>
        </div>
      </div>

      <div className={styles.rowBottom}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Check-in</label>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Check-out</label>
          <input type="date" className={styles.input} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Guests</label>
          <button type="button" className={styles.guestBox} onClick={handleGuestClick}>
            {guests} Guests
          </button>
        </div>
        <div className={styles.buttonWrap}>
          <label className={styles.label} aria-hidden="true" style={{visibility:'hidden'}}>Find Room</label>
          <button 
            className={styles.findRoomBtn} 
            onClick={handleFindRoom} // ✅ navigate on click
          >
            Find Room
          </button>
        </div>
      </div>

      {guestPopup && (
        <div className={styles.guestPopup}>
          <div className={styles.guestControl}>
            <div className={styles.guestActions}>
              <button
                type="button"
                className={styles.guestBtn}
                onClick={() => handleGuestChange(-1)}
              >
                -
              </button>
              <span className={styles.guestValue}>{guests}</span>
              <button
                type="button"
                className={styles.guestBtn}
                onClick={() => handleGuestChange(1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
