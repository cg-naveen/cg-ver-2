import React from 'react';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';

// Icons
import { FaBuilding, FaEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

// === Animation Variants ===
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeInItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function Contact() {
  return (
    <div className={styles.contactPage}>
      <HeaderNav activePage="contact" />

      {/* === Banner Section === */}
      <motion.section
        className={styles.bannerSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h1 className={styles.bannerTitle}>Contact</h1>
      </motion.section>

      {/* === Info Section === */}
      <motion.section
        className={styles.infoSection}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2 className={styles.infoHeader} variants={fadeInItem}>
          We’re ready to assist you! Feel free to get in touch with us.
        </motion.h2>

        <div className={styles.cardsGrid}>
          <motion.div className={styles.infoCard} variants={fadeInItem}>
            <div className={styles.cardIconWrapper}><FaBuilding size={24} /></div>
            <div className={styles.cardTitle}>Office Location</div>
            <div className={styles.cardContent}>
              Care Grand Sdn Bhd (1557677-M) | 3&5, Lorong Sultan, Pjs 52, 46200 Petaling Jaya, Selangor, Malaysia
            </div>
          </motion.div>

          <motion.div className={styles.infoCard} variants={fadeInItem}>
            <div className={styles.cardIconWrapper}><FaEnvelope size={24} /></div>
            <div className={styles.cardTitle}>Email Address</div>
            <div className={styles.cardContent}>
              care@cagrand.com<br />support@cagrand.com
            </div>
          </motion.div>

          <motion.div className={styles.infoCard} variants={fadeInItem}>
            <div className={styles.cardIconWrapper}><FaPhoneAlt size={22} /></div>
            <div className={styles.cardTitle}>Hotline</div>
            <div className={styles.cardContent}>
              +6014 932 1140<br />+6017 200 5858
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* === Form Section === */}
      <motion.section
        className={styles.formSection}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className={styles.formSplitWrapper}>
          <motion.div className={styles.formSplit} variants={fadeUp}>
            {/* Left: Intro + Socials */}
            <motion.div className={styles.formIntro} variants={fadeInItem}>
              <div className={styles.formHeaderPill}>Send A Message</div>
              <h2 className={styles.formTitle}>Have questions? Feel free to write us.</h2>
              <p className={styles.formSubtext}>
                Our friendly representatives will revert back to your messages within the next business day. 
                Thank you for your kind cooperation.
              </p>
              <div className={styles.socialIcons}>
                <a href="#" className={styles.socialIcon} aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" className={styles.socialIcon} aria-label="X (Twitter)"><FaXTwitter /></a>
                <a href="#" className={styles.socialIcon} aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className={styles.socialIcon} aria-label="TikTok"><FaTiktok /></a>
              </div>
            </motion.div>

            {/* Right: Form */}
            <motion.form className={styles.contactForm} variants={fadeInItem}>
              <div className={styles.formGrid}>
                <input className={styles.inputField} type="text" placeholder="Name" required />
                <input className={styles.inputField} type="email" placeholder="Email" required />
                <input className={styles.inputField} type="tel" placeholder="Phone Number" required />
                <input className={styles.inputField} type="text" placeholder="Subject" required />
              </div>
              <textarea className={styles.textareaField} placeholder="Message" rows={5} required />
              <button className={styles.sendButton} type="submit">Send a Message</button>
            </motion.form>
          </motion.div>
        </div>
      </motion.section>

      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

export default Contact;
