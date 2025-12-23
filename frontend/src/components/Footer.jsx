import React from 'react';
import styles from './Footer.module.css';
import seniorStayIcon from '../assets/senior_stay_icon.png';
import conciergeIcon from '../assets/concierge_icon.png';

export default function Footer() {
  return (
    <footer className={styles.footerWrap}>

      {/* === CTA ROW === */}
      <div className={styles.preFooterCta}>
        {/* Senior Stay CTA */}
        <div className={styles.ctaBlock}>
          <span className={styles.ctaIcon}>
            <img src={seniorStayIcon} alt="Senior Stay Icon" className={styles.ctaImage} />
          </span>
          <div className={styles.ctaTextWrap}>
            <span className={styles.ctaHeading}>
              Find senior-friendly stays with ease.
            </span>
          </div>
          <a href="#stays" className={styles.ctaCircle} aria-label="Browse stays">
            <span className={styles.ctaArrow}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="13" fill="#FBBF24" />
                <path
                  d="M10 7l6 6-6 6"
                  stroke="#202422"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>

        {/* Concierge CTA */}
        <div className={styles.ctaBlock}>
          <span className={styles.ctaIcon}>
            <img src={conciergeIcon} alt="Concierge Icon" className={styles.ctaImage} />
          </span>
          <div className={styles.ctaTextWrap}>
            <span className={styles.ctaHeading}>
              Travel better with concierge support.
            </span>
          </div>
          <a href="#services" className={styles.ctaCircle} aria-label="Browse concierge">
            <span className={styles.ctaArrow}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="13" fill="#FBBF24" />
                <path
                  d="M10 7l6 6-6 6"
                  stroke="#202422"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* === MAIN FOOTER === */}
      <div className={styles.footerMain}>

        {/* Logo + Description */}
        <div className={styles.logoCol}>
          <img
            src={require('../assets/footer.png')}
            alt="caGrand Logo"
            className={styles.logoImage}
          />
          <div className={styles.logoDesc}>
            Introducing caGrand – South East Asia's first integrated platform for senior travel and living.
            Powered by SRAVEL for trusted bookings and SERI for personalized concierge care, we’re redefining
            how seniors explore and experience life.
          </div>

          {/* Social Icons */}
          <div className={styles.socialsRow}>
            <a href="#" className={styles.socialIcon} aria-label="Facebook">
              <svg width="22" height="22" fill="none">
                <path
                  d="M15 1.5V5.1c0 .34.29.61.62.61h2.27c.48 0 .85.34.85.81v2.02c0 .47-.38.77-.85.77H15.62V20.4c0 .35-.26.58-.61.58H11.2c-.37 0-.59-.22-.59-.58V9.31H8c-.45 0-.73-.31-.73-.78V6.56C7.27 6.1 7.56 5.9 8 5.9h2.61V3.73C10.6 1.93 11.3 1 13.18 1c.6 0 1.08.09 1.22.12.08.01.15.12.15.24Z"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <a href="#" className={styles.socialIcon} aria-label="Twitter">
              <svg width="22" height="22" fill="none">
                <path
                  d="M18.67 7.32c.01.14.01.29.01.43 0 4.42-3.37 9.52-9.54 9.52a9.59 9.59 0 0 1-5.13-1.51c.17.02.35.03.53.03a6.85 6.85 0 0 0 4.26-1.47A3.42 3.42 0 0 1 4.3 11.6c.48.07.97.07 1.46-.04a3.43 3.43 0 0 1-2.74-3.36v-.05c.45.26.97.42 1.52.44A3.43 3.43 0 0 1 3.02 4.72c0-.64.18-1.23.48-1.74a9.66 9.66 0 0 0 6.97 3.54c-.06-.25-.09-.52-.09-.8C10.38 4.23 11.61 3 13.11 3c.68 0 1.29.29 1.72.75.54-.1 1.06-.3 1.53-.57-.18.56-.56 1.03-1.06 1.32.48-.06.95-.18 1.39-.38-.33.48-.74.94-1.22 1.3Z"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <svg width="22" height="22" fill="none">
                <rect x="2.2" y="2.2" width="17.6" height="17.6" rx="5.2" stroke="#fff" strokeWidth="1.7" />
                <path
                  d="M16.2 7.5a1 1 0 1 1 .6-2 1 1 0 1 1-.6 2Zm-5.2 6.3a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Z"
                  stroke="#fff"
                  strokeWidth="1.7"
                />
              </svg>
            </a>

            <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
              <svg width="22" height="22" fill="none">
                <rect x="2.2" y="2.2" width="17.6" height="17.6" rx="3.2" stroke="#fff" strokeWidth="1.7" />
                <path
                  d="M6.9 10.8h2.4v7.3H6.9v-7.3Zm1.2-3.61c.77 0 1.4.63 1.4 1.4 0 .78-.63 1.41-1.4 1.41-.77 0-1.4-.63-1.4-1.4 0-.78.62-1.41 1.4-1.41Zm2.97 3.61h2.3v1h.04c.32-.61 1.08-1.24 2.23-1.24 2.39 0 2.83 1.57 2.83 3.61v4.08h-2.4v-3.62c0-.86-.02-1.96-1.19-1.96-1.2 0-1.39.94-1.39 1.91v3.67h-2.39v-7.45Z"
                  fill="#fff"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Quicklinks */}
        <div className={styles.linksCol}>
          <div className={styles.linksHeading}>Quicklinks</div>
          <a href="#about" className={styles.footerLink}>About</a>
          <a href="#facilities" className={styles.footerLink}>Facilities</a>
          <a href="#contact" className={styles.footerLink}>Contact Us</a>
        </div>

        {/* Contact Section */}
        <div className={styles.contactCol}>
          <div className={styles.contactHeading}>Contact</div>

          {/* Phone */}
          <div className={styles.footerContactItem}>
            <span className={styles.contactIcon}>
              <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#FFD54F" />
                <path
                  d="M13 11l3 5a1 1 0 0 1-.2 1.2l-1.4 1.3a10 10 0 0 0 5.3 5.3l1.2-1.3a1 1 0 0 1 1.2-.2l3.8 2.2a1 1 0 0 1 .4 1.3l-.9 1.6a1.4 1.4 0 0 1-1.3.7c-8.6-1-14.6-7-15.6-15.6a1.3 1.3 0 0 1 .7-1.3l1.6-.9a1 1 0 0 1 1.2.3Z"
                  stroke="#2C2C2C"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <div className={styles.contactLabel}>Drop a Line</div>
              <a href="tel:+60149321140" className={styles.contactLink}>
                +6014 932 1140
              </a>
            </div>
          </div>

          {/* Email */}
          <div className={styles.footerContactItem}>
            <span className={styles.contactIcon}>
              <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#FFD54F" />
                <rect
                  x="10" y="12" width="16" height="12" rx="1.2"
                  stroke="#2C2C2C" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M10 13l8 5.6L26 13"
                  stroke="#2C2C2C" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <div className={styles.contactLabel}>Email Address</div>
              <a href="mailto:care@cagrand.com" className={styles.contactLink}>
                care@cagrand.com
              </a>
            </div>
          </div>

          {/* Building */}
          <div className={styles.footerContactItem}>
            <span className={styles.contactIcon}>
              <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="18" fill="#FFD54F" />
                <rect
                  x="11" y="10" width="10" height="14"
                  stroke="#2C2C2C" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M21 17h4v7h-4v-7Z"
                  stroke="#2C2C2C" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"
                />
                <path
                  d="M14 13h1M17 13h1M14 16h1M17 16h1"
                  stroke="#2C2C2C" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <div className={styles.contactLabel}>Visit Office</div>
              <address className={styles.contactAddress}>
                3&5, Lorong Sultan, PJS 52, 46200<br />
                Petaling Jaya, Selangor, Malaysia.
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* === COPYRIGHT BAR === */}
      <div className={styles.footerCopyrightBar}>
        <div className={styles.copyrightText}>
          © 2025 Care Grand Sdn Bhd (1557677-M). All Rights Reserved
        </div>
        <div className={styles.copyrightLinks}>
          <a href="#" className={styles.copyrightLink}>Terms & Conditions</a>
          <span className={styles.copyrightSep}>|</span>
          <a href="#" className={styles.copyrightLink}>Privacy Policy</a>
          <span className={styles.copyrightSep}>|</span>
          <a href="#" className={styles.copyrightLink}>Refund Policy</a>
        </div>
      </div>

    </footer>
  );
}
