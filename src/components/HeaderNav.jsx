import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './HeaderNav.module.css';
import { FiLogIn, FiUserPlus, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';

function HeaderNav() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect active page from current path
  const activePage =
    location.pathname === '/' ? 'home' :
    location.pathname.includes('/about') ? 'about' :
    location.pathname.includes('/stays') ? 'stays' :
    location.pathname.includes('/contact') ? 'contact' :
    '';

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <>
      <div className={styles['top-fill']}></div>

      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={closeMobileMenu} />
      )}

      {/* Mobile Side Panel */}
      <div className={`${styles.mobilePanel} ${isMobileMenuOpen ? styles.mobilePanelOpen : ''}`}>
        <div className={styles.panelHeader}>
          <button className={styles.closeBtn} onClick={closeMobileMenu}>
            <FiX size={20} />
            <span>Close</span>
          </button>
        </div>

        <nav className={styles.mobileNavList}>
          <Link to="/" className={`${styles.mobileNavItem} ${activePage === 'home' ? styles.activeTab : ''}`} onClick={closeMobileMenu}>
            <span>HOME</span>
            <FiChevronRight size={20} />
          </Link>
          <Link to="/about" className={`${styles.mobileNavItem} ${activePage === 'about' ? styles.activeTab : ''}`} onClick={closeMobileMenu}>
            <span>ABOUT US</span>
            <FiChevronRight size={20} />
          </Link>
          <Link to="/stays" className={`${styles.mobileNavItem} ${activePage === 'stays' ? styles.activeTab : ''}`} onClick={closeMobileMenu}>
            <span>STAYS</span>
            <FiChevronRight size={20} />
          </Link>
          <Link to="/contact" className={`${styles.mobileNavItem} ${activePage === 'contact' ? styles.activeTab : ''}`} onClick={closeMobileMenu}>
            <span>CONTACT</span>
            <FiChevronRight size={20} />
          </Link>
        </nav>

        <div className={styles.mobileAuthSection}>
          <Link to="/signup" className={styles.mobileSignInBtn} onClick={closeMobileMenu}>
            <FiLogIn size={18} />
            <span>SIGN IN</span>
          </Link>
          <Link to="/register" className={styles.mobileRegisterBtn} onClick={closeMobileMenu}>
            <FiUserPlus size={18} />
            <span>REGISTER</span>
          </Link>
        </div>
      </div>

      <header className={styles['main-header']}>
        <div className={styles.logoBox}>
          <img
            src={require('../assets/header.png')}
            alt="Company Logo"
            className={styles.logo}
          />
        </div>

        <nav className={styles['main-nav']}>
          <Link to="/" className={`${styles.navTab} ${activePage === 'home' ? styles.activeTab : ''}`}>
            Home
          </Link>
          <Link to="/about" className={`${styles.navTab} ${activePage === 'about' ? styles.activeTab : ''}`}>
            About Us
          </Link>
          <Link to="/stays" className={`${styles.navTab} ${activePage === 'stays' ? styles.activeTab : ''}`}>
            Stays
          </Link>
          <Link to="/contact" className={`${styles.navTab} ${activePage === 'contact' ? styles.activeTab : ''}`}>
            Contact
          </Link>
        </nav>

        <div className={styles.authBtns}>
          <Link to="/signup" className={styles.signInBtn}>
            <FiLogIn style={{ marginRight: 8 }} />
            Sign In
          </Link>
          <Link to="/register" className={styles.registerBtn}>
            <FiUserPlus style={{ marginRight: 8 }} />
            Register
          </Link>
        </div>

        <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
          <FiMenu size={24} />
        </button>
      </header>
    </>
  );
}

export default HeaderNav;
