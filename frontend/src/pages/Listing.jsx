import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import styles from './Listing.module.css';
import SearchBar from '../components/SearchBar';
import RoomCard from '../components/RoomCard';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// === ANIMATIONS ===
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' }
  }
};

const staggerContainer = {
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeInItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

function Listing() {
  const [rooms, setRooms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const {favourites, toggleFavourite, user} = useAuth();
  const location = useLocation();

  // Extract filters from URL
  const params = new URLSearchParams(location.search);
  const defaultFilters = {
    state: params.get('state') || '',
    category: params.get('category') || '',
    guests: params.get('guests') || '',
    check_in: params.get('checkin') || '',
    checkout: params.get('checkout') || ''
  };

  // Local filters for non-date values
  const applyFilters = (roomsArr, { state, category, guests } = {}) => {
    let filteredRooms = roomsArr;

    if (state) {
      filteredRooms = filteredRooms.filter((r) =>
        r.location?.toLowerCase().includes(state.toLowerCase())
      );
    }

    if (category) {
      filteredRooms = filteredRooms.filter(
        (r) => r.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (guests) {
      filteredRooms = filteredRooms.filter(
        (r) => parseInt(r.max_guests || 0, 10) >= parseInt(guests, 10)
      );
    }

    return filteredRooms;
  };

  // Refetch rooms when filters or URL changes
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/rooms', {
          params: {
            state: defaultFilters.state,
            category: defaultFilters.category,
            guests: defaultFilters.guests,
            check_in: defaultFilters.checkin,
            check_out: defaultFilters.checkout
          }
        });

        setRooms(response.data || []);
        setFiltered(applyFilters(response.data || [], defaultFilters));
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [location.search]);

  // Handle search inside listing page
  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      const response = await api.get('/api/rooms', {
        params: {
          state: filters.state,
          category: filters.category,
          guests: filters.guests,
          check_in: filters.checkin,
          check_out: filters.checkout
        }
      });

      setRooms(response.data);
      setFiltered(applyFilters(response.data, filters));
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.staysContainer}>
      {/* PAGE TITLE */}
      <motion.section
        className={styles.pageBanner}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>Stays</h2>
        </div>
      </motion.section>

      {/* SEARCH BAR */}
      <motion.div
        className={styles.searchBarWrapper}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        <SearchBar onSearch={handleSearch} defaultValues={defaultFilters} />
      </motion.div>

      {/* ROOM GRID */}
      <motion.div
        className={styles.cardGrid}
        variants={staggerContainer}
        initial={{ opacity: 1 }}
        whileInView="visible"
        viewport={{ once: true }}
      >
        {loading ? (
          <div className={styles.loadingSpinner}>Loading rooms...</div>
        ) : filtered.length ? (
          filtered.map((room) => (
            <motion.div key={room.room_id} variants={fadeInItem}>
              <RoomCard room={room}
               isFavourite={favourites.includes(room.room_id.toString())}
               onToggleFavourite={() => toggleFavourite(room.room_id)}
               isLoggedIn={!!user} />
            </motion.div>
          ))
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center' }}>
            No rooms match your filters.
          </p>
        )}
      </motion.div>

      <Footer />
    </div>
  );
}

export default Listing;
