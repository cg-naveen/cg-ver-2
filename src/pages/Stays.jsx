import React from 'react';
import { motion } from 'framer-motion';
import styles from './Stays.module.css';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';

// === FADE-UP ANIMATION ===
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// === STAGGER CONTAINER FOR CARDS ===
const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

// === STAGGERED ITEM VARIANT ===
const fadeInItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const hotels = [
  {
    id: 1,
    name: 'Swing and Pillows @ 87, Muntri, Penang',
    location: 'Georgetown | Pulau Pinang',
    rooms: 25,
    price: 80,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
  },
  {
    id: 2,
    name: 'Swing and Pillows @ Persiaran Flora, Cyberjaya',
    location: 'Petaling Jaya | Selangor',
    rooms: 46,
    price: 80,
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
    rating: 4.3,
  },
  {
    id: 3,
    name: 'Swing and Pillows @ Jalan Diplomatik, Putrajaya',
    location: 'Petaling Jaya | Selangor',
    rooms: 46,
    price: 60,
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
  },
  {
    id: 4,
    name: 'Swing and Pillows @ Changkat Thambi Dollah, Pudu',
    location: 'Pudu | Kuala Lumpur',
    rooms: 50,
    price: 60,
    image: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=400&q=80',
    rating: 4.5,
  },
  {
    id: 5,
    name: 'City Center Hotel, Johor Bahru',
    location: 'Johor Bahru | Johor',
    rooms: 40,
    price: 90,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    rating: 4.2,
  },
  {
    id: 6,
    name: 'Luxury Stay, Penang',
    location: 'Penang | Pulau Pinang',
    rooms: 35,
    price: 200,
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
  },
  {
    id: 7,
    name: 'Cozy Inn, Malacca',
    location: 'Malacca | Malacca',
    rooms: 15,
    price: 70,
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
    rating: 4.0,
  },
  {
    id: 8,
    name: 'Seaside Hotel, Kota Kinabalu',
    location: 'Kota Kinabalu | Sabah',
    rooms: 60,
    price: 180,
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    rating: 4.6,
  },
  {
    id: 9,
    name: 'Hilltop Retreat, Cameron Highlands',
    location: 'Cameron Highlands | Pahang',
    rooms: 22,
    price: 150,
    image: "https://images.unsplash.com/photo-1501117716987-c8e8e9a4f3ee?auto=format&fit=crop&w=400&q=80",
    rating: 4.4,
  },
  {
    id: 10,
    name: 'Urban Suites, Kuala Lumpur',
    location: 'Bukit Bintang | Kuala Lumpur',
    rooms: 55,
    price: 210,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80',
    rating: 4.1,
  },
  {
    id: 11,
    name: 'Riverside Lodge, Kuching',
    location: 'Kuching | Sarawak',
    rooms: 28,
    price: 95,
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80',
    rating: 4.0,
  },
  {
    id: 12,
    name: 'Island Escape, Langkawi',
    location: 'Langkawi | Kedah',
    rooms: 40,
    price: 180,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    rating: 5.0,
  },
];

function Stays() {
  return (
    <div className={styles.staysContainer}>
      {/* === PAGE TITLE === */}
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

      {/* === SEARCH BAR === */}
      <motion.div
        className={styles.searchBarWrapper}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        <SearchBar />
      </motion.div>

      {/* === HOTEL GRID === */}
      <motion.div
        className={styles.cardGrid}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {hotels.map((hotel) => (
          <motion.div key={hotel.id} variants={fadeInItem}>
            <HotelCard hotel={hotel} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

export default Stays;
