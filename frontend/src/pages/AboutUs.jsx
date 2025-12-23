import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeaderNav from '../components/HeaderNav';
import SearchBar from '../components/SearchBar';
import RoomCard from '../components/RoomCard';
import Footer from '../components/Footer';
import styles from './AboutUs.module.css';
import { useAuth } from '../context/AuthContext';

import aboutUsImg1 from '../assets/about us 1.jpg';
import aboutUsImg2 from '../assets/about us 2.png';

// Fade-up animation (same as Home)
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

function AboutUs() {
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const { favourites, toggleFavourite, user } = useAuth();

  // Fetch cheapest 4 rooms from backend
  useEffect(() => {
    const fetchCheapestRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/rooms/cheapest');
        setFeaturedRooms(response.data);
      } catch (error) {
        console.error('Error fetching cheapest rooms:', error);
      }
    };

    fetchCheapestRooms();
  }, []);

  return (
    <div>
      <HeaderNav activePage="about" />

      {/* === PAGE BANNER === */}
      <motion.section
        className={styles.pageBanner}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <div className={styles.container}>
          <div className={styles.bannerContent}>
            <motion.h2
              className={styles.bannerTitle}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              About Us
            </motion.h2>
          </div>
        </div>
      </motion.section>

      <div className={styles.container}>
        {/* === ABOUT SECTION 1 === */}
        <motion.section
          className={styles.aboutSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className={styles.aboutRow}>
            <motion.div
              className={styles.aboutText}
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className={styles.aboutAccent}>Meet caGrand</div>
              <h2 className={styles.aboutMainTitle}>
                Wholesome Senior Travel Experience From A Single Platform
              </h2>
              <p className={styles.aboutBody}>
                At caGrand, we're redefining senior travel across Southeast Asia.
                Through our platform, seniors can discover trusted,
                elder-friendly accommodations with ease via SRAVEL, and enjoy
                personalised concierge care with SERU. Our mission is to make
                senior journeys safer, smoother, and more fulfilling, all in one
                seamless experience.
              </p>
              <Link to="/register" className={styles.aboutGreenButton}>
                Join The Tribe
              </Link>
            </motion.div>

            <motion.div
              className={styles.aboutImage}
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <img
                src={aboutUsImg1}
                alt="Happy senior couple at airport"
                className={styles.aboutHeroImg}
              />
            </motion.div>
          </div>
        </motion.section>

        {/* === ABOUT SECTION 2 === */}
        <motion.section
          className={styles.aboutSectionWhite}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className={styles.aboutRow}>
            <motion.div
              className={styles.aboutImage}
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <img
                src={aboutUsImg2}
                alt="Senior travel ecosystem diagram"
                className={styles.aboutHeroImg}
              />
            </motion.div>

            <motion.div
              className={styles.aboutText}
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className={styles.aboutAccent}>Our Differentiator</div>
              <h2 className={styles.aboutMainTitle}>
                Connected Across the Senior Travel Ecosystem
              </h2>
              <p className={styles.aboutBody}>
                caGrand connects senior travellers, accommodation providers, and
                concierge services in one integrated platform. With SRAVEL for
                discovering trusted stays and SERU for personalised travel
                support, we foster collaboration that delivers safe, comfortable,
                and worry-free journeys for seniors.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* === STAYS SECTION (Dynamic) === */}
        <motion.section
          className={styles.staysSectionWrapper}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className={styles.sectionHeader}>
            <motion.h2
              className={styles.sectionTitle}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              Browse our senior-friendly stays
            </motion.h2>
          </div>

          <motion.div
            className={styles.searchBarWrapper}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <SearchBar />
          </motion.div>

          {/* Featured rooms grid */}
          <div className={styles.featuredGrid}>
            {featuredRooms.length > 0 ? (
              featuredRooms.map((room, index) => (
                <motion.div
                  key={room.room_id || index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={index * 0.1}
                  variants={fadeUp}
                >
                  <RoomCard
                    room={room}
                    isFavourite={favourites.includes(room.room_id.toString())}
                    onToggleFavourite={() => toggleFavourite(room.room_id)}
                    isLoggedIn={!!user}
/>

                </motion.div>
              ))
            ) : (
              <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '1.1rem' }}>
                Loading senior-friendly stays...
              </p>
            )}
          </div>

          <motion.div
            className={styles.exploreMoreWrapper}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Link to="/listing" className={styles.exploreMoreButton}>
              Explore More
            </Link>
          </motion.div>
        </motion.section>
      </div>

      {/* === CTA FOOTER === */}
      <motion.section
        className={styles.aboutGreenSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <div className={styles.aboutGreenContent}>
          <motion.h2
            className={styles.aboutGreenTitle}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Join caGrand & Experience Travel, Made for Seniors.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className={styles.registerNowWrapper}
          >
            <Link to="/register" className={styles.registerNowButton}>
              Register Now
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}

export default AboutUs;
