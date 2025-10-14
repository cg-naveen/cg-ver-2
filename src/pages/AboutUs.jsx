import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeaderNav from '../components/HeaderNav';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import Footer from '../components/Footer';
import styles from './AboutUs.module.css';

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

const featuredHotels = [
  {
    id: 1,
    name: 'Swing and Pillows @ 87, Muntri, Penang',
    location: 'Georgetown | Pulau Pinang',
    price: 80,
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: 'Swing and Pillows @ Persiaran Flora, Cyberjaya',
    location: 'Petaling Jaya | Selangor',
    price: 80,
    image:
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: 'Swing and Pillows @ Jalan Diplomatik, Putrajaya',
    location: 'Petaling Jaya | Selangor',
    price: 60,
    image:
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    name: 'Swing and Pillows @ Changkat Thambi Dollah, Pudu',
    location: 'Pudu | Kuala Lumpur',
    price: 60,
    image:
      'https://images.unsplash.com/photo-1502691876148-a84978e59af8?auto=format&fit=crop&w=400&q=80',
  },
];

function AboutUs() {
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
                personalized concierge care with SERU. Our mission is to make
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
                caGrand connects senior travelers, accommodation providers, and
                concierge services in one integrated platform. With SRAVEL for
                discovering trusted stays and SERU for personalized travel
                support, we foster collaboration that delivers safe, comfortable,
                and worry-free journeys for seniors.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* === STAYS SECTION === */}
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

          <motion.div
            className={styles.hotelCardGrid}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </motion.div>

          <motion.div
            className={styles.exploreMoreWrapper}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Link to="/stays" className={styles.exploreMoreButton}>
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

    {/* ✅ Wrap the button in a motion.div with visible overflow */}
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

      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

export default AboutUs;


