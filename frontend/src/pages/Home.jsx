import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiZap, FiUsers, FiHeart, FiSmile } from 'react-icons/fi';
import styles from './Home.module.css';
import SearchBar from '../components/SearchBar';
import RoomCard from '../components/RoomCard';
import Footer from '../components/Footer';
import {useAuth} from '../context/AuthContext';
import api from '../api/axios';

function Home() {
  const [featuredrooms, setFeaturedrooms] = useState([]);
  const {favourites, toggleFavourite, user} = useAuth();

  // Fetch cheapest 4 rooms from backend
  useEffect(() => {
    const fetchCheapestRooms = async () => {
      try {
        const response = await api.get('/api/rooms/cheapest');
        setFeaturedrooms(response.data || []);
      } catch (error) {
        console.error('Error fetching cheapest rooms:', error);
      }
    };

    fetchCheapestRooms();
  }, []);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
    }),
  };

  return (
    <div className={styles.homePage}>
      {/* === HERO SECTION === */}
      <section className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className={styles.heroHeadline}>
            Find Trusted Stays for Senior Travelers
          </h1>
          <p className={styles.heroSubline}>
            Explore elder-friendly accommodations with personalised concierge support
            for a safe, comfortable journey.
          </p>
          <button
            className={styles.exploreBtn}
            onClick={() => window.location.assign('/listing')}
          >
            Explore Now
          </button>
        </motion.div>
      </section>

      {/* === SEARCH SECTION === */}
      <motion.section
        className={styles.searchSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <SearchBar />
      </motion.section>

      {/* === FEATURED ROOMS === */}
      <section id="featured" className={styles.featuredSection}>
        <div className={styles.sectionContainer}>
          <motion.div
            className={styles.sectionHeader}
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <h2 className={styles.sectionTitle}>Senior-Ready Stays Near You</h2>
            <p className={styles.sectionSubtitle}>
              Browse affordable and comfortable accommodations designed with accessibility in mind.
            </p>
          </motion.div>

          <div className={styles.featuredGrid}>
            {featuredrooms.length > 0 ? (
              featuredrooms.map((room, index) => (
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
                Loading affordable stays...
              </p>
            )}
          </div>
        </div>
      </section>

      {/* === FEATURE BANNER === */}
      <motion.section
        className={styles.featureBanner}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <div className={styles.bannerContainer}>
          <h2 className={styles.bannerHeading}>Travel Made Senior-Friendly</h2>
          <p className={styles.bannerDescription}>
            More than just bookings — caGrand ensures every senior journey is safe,
            supported, and thoughtfully planned. From verified stays to personalised
            concierge care, we make senior travel worry-free.
          </p>

          <div className={styles.featureCards}>
            {[
              { icon: <FiCheck />, title: 'Curated Stays', desc: 'Verified for senior comfort & accessibility.' },
              { icon: <FiUsers />, title: 'Concierge Support', desc: 'Help at every step, from booking to stay.' },
              { icon: <FiHeart />, title: 'Wholesome Experience', desc: 'Peace of mind for seniors and families.' },
              { icon: <FiSmile />, title: 'Simple Interface', desc: 'Easy to browse, filter, and book.' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* === INFO SECTION === */}
      <motion.section
        className={styles.infoSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <div className={styles.infoContainer}>
          <motion.div
            className={styles.infoImage}
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80"
              alt="Senior travellers enjoying comfortable accommodation"
              className={styles.infoImg}
              loading="lazy"
            />
          </motion.div>

          <motion.div
            className={styles.infoContent}
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h2 className={styles.infoHeading}>
              Wholesome Senior Travel, Simplified
            </h2>
            <p className={styles.infoParagraph}>
              At caGrand, we bring together everything seniors need — in one easy-to-use
              platform. All facilities and service providers are carefully vetted to ensure
              a seamless, safe, and enriching experience.
            </p>

            <ul className={styles.infoList}>
              {[
                {
                  title: 'Easy',
                  desc: 'Find senior-friendly accommodations based on your preferences.',
                  icon: <IconCircle icon={<FiMapPin />} />,
                },
                {
                  title: 'Convenient',
                  desc: 'Access a range of concierge services to make your stay comfortable.',
                  icon: <IconCircle icon={<FiCheck />} />,
                },
                {
                  title: 'Fast',
                  desc: 'Our experts are readily available to fulfil your travel needs.',
                  icon: <IconCircle icon={<FiZap />} />,
                },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  className={styles.infoItem}
                  style={{ display: 'flex', alignItems: 'center', gap: '18px' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                >
                  {item.icon}
                  <div>
                    <h4 className={styles.bulletTitle}>{item.title}</h4>
                    <p className={styles.bulletDescription}>{item.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

// Small helper component for icon bubbles
function IconCircle({ icon }) {
  return (
    <span
      style={{
        background: '#FFD54F',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '45px',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, {
        style: { color: '#fff', width: '24px', height: '24px', strokeWidth: 3 },
      })}
    </span>
  );
}

export default Home;



