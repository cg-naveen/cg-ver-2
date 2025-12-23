import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [guestPopup, setGuestPopup] = React.useState(false);
  const [guests, setGuests] = React.useState(1);
  const [state, setState] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [checkin, setCheckin] = React.useState('');
  const [checkout, setCheckOut] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Restore user inputs from URL query when on Listing page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stateParam = params.get('state') || '';
    const categoryParam = params.get('category') || '';
    const guestsParam = params.get('guests') ? parseInt(params.get('guests')) : 1;

    // FIXED: use check_in and check_out
    const checkinParam = params.get('check_in') || '';
    const checkoutParam = params.get('check_out') || '';

    setState(stateParam);
    setCategory(categoryParam);
    setGuests(guestsParam);
    setCheckin(checkinParam);
    setCheckOut(checkoutParam);
  }, [location.search]);

  const handleGuestChange = (change) => {
    setGuests((prev) => Math.max(1, prev + change));
  };

  const pruneEmpty = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) acc[key] = value;
      return acc;
    }, {});
  };

  const handleFindRoom = () => {
    const rawData = {
      state,
      category,
      guests: String(guests),

      check_in: checkin,
      check_out: checkout
    };

    const searchData = pruneEmpty(rawData);

    if (location.pathname === '/listing' && typeof onSearch === 'function') {
      onSearch(searchData);
      const query = new URLSearchParams(searchData).toString();
      navigate(`/listing?${query}`, { replace: true });
    } else {
      const query = new URLSearchParams(searchData).toString();
      navigate(`/listing?${query}`);
    }
  };

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <div className={styles.rowTop}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>State</label>
          <select
            className={styles.input}
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            <option value="">State</option>
            <option value="Selangor">Selangor</option>
            <option value="Penang">Penang</option>
            <option value="Johor">Johor</option>
            <option value="Wilayah Persekutuan">Wilayah Persekutuan</option>
            <option value="Negeri Sembilan">Negeri Sembilan</option>
            <option value="Sabah">Sabah</option>
            <option value="Sarawak">Sarawak</option>
            <option value="Kedah">Kedah</option>
            <option value="Pahang">Pahang</option>
            <option value="Melaka">Melaka</option>
            <option value="Perak">Perak</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Category</label>
          <select
            className={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Category</option>
            <option value="Budget">Budget</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
      </div>

      <div className={styles.rowBottom}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Check-in</label>
          <input
            type="date"
            className={styles.input}
            value={checkin}
            onChange={(e) => setCheckin(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Check-out</label>
          <input
            type="date"
            className={styles.input}
            value={checkout}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Guests</label>
          <button
            type="button"
            className={styles.guestBox}
            onClick={() => setGuestPopup((v) => !v)}
          >
            {guests} Guests
          </button>
        </div>

        <div className={styles.buttonWrap}>
          <label className={styles.label} style={{ visibility: 'hidden' }}>
            Find Room
          </label>
          <button className={styles.findRoomBtn} onClick={handleFindRoom}>
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
