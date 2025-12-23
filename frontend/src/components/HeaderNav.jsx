import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './HeaderNav.module.css';
import { FiLogIn, FiUser, FiLogOut, FiUserPlus, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';

function HeaderNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  // Detect active page from URL
  const activePage =
    location.pathname === '/' ? 'home' :
    location.pathname.includes('/about') ? 'about' :
    location.pathname.includes('/listing') ? 'listing' :
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
      <div
        className={`${styles.mobilePanel} ${
          isMobileMenuOpen ? styles.mobilePanelOpen : ''
        }`}
      >
        <div className={styles.panelHeader}>
          <button className={styles.closeBtn} onClick={closeMobileMenu}>
            <FiX size={20} />
            <span>Close</span>
          </button>
        </div>

        <nav className={styles.mobileNavList}>
          <Link
            to="/"
            className={`${styles.mobileNavItem} ${
              activePage === 'home' ? styles.activeTab : ''
            }`}
            onClick={closeMobileMenu}
          >
            <span>HOME</span>
            <FiChevronRight size={20} />
          </Link>

          <Link
            to="/about"
            className={`${styles.mobileNavItem} ${
              activePage === 'about' ? styles.activeTab : ''
            }`}
            onClick={closeMobileMenu}
          >
            <span>ABOUT US</span>
            <FiChevronRight size={20} />
          </Link>

          <Link
            to="/listing"
            className={`${styles.mobileNavItem} ${
              activePage === 'listing' ? styles.activeTab : ''
            }`}
            onClick={closeMobileMenu}
          >
            <span>LISTINGS</span>
            <FiChevronRight size={20} />
          </Link>

          <Link
            to="/contact"
            className={`${styles.mobileNavItem} ${
              activePage === 'contact' ? styles.activeTab : ''
            }`}
            onClick={closeMobileMenu}
          >
            <span>CONTACT</span>
            <FiChevronRight size={20} />
          </Link>
        </nav>

        {/* Mobile Auth Section */}
        <div className={styles.mobileAuthSection}>
          {!user && (
            <>
              <Link
                to="/login"
                className={styles.mobileSignInBtn}
                onClick={closeMobileMenu}
              >
                <FiLogIn size={18} />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className={styles.mobileRegisterBtn}
                onClick={closeMobileMenu}
              >
                <FiUserPlus size={18} />
                <span>REGISTER</span>
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                to="/user"
                className={styles.mobileUserBox}
                onClick={closeMobileMenu}
              >
                <FiUser size={20} />
                <span>{user.username}</span>
              </Link>

              <button
                className={styles.mobileLogoutBtn}
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                <FiLogOut size={18} />
                <span>SIGN OUT</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <header className={styles['main-header']}>
        <div className={styles.logoBox}>
          <img
            src={require('../assets/header.png')}
            alt="Company Logo"
            className={styles.logo}
          />
        </div>

        <nav className={styles['main-nav']}>
          <Link
            to="/"
            className={`${styles.navTab} ${
              activePage === 'home' ? styles.activeTab : ''
            }`}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`${styles.navTab} ${
              activePage === 'about' ? styles.activeTab : ''
            }`}
          >
            About Us
          </Link>

          <Link
            to="/listing"
            className={`${styles.navTab} ${
              activePage === 'listing' ? styles.activeTab : ''
            }`}
          >
            Stays
          </Link>

          <Link
            to="/contact"
            className={`${styles.navTab} ${
              activePage === 'contact' ? styles.activeTab : ''
            }`}
          >
            Contact
          </Link>
        </nav>

        <div className={styles.authBtns}>
          {/* Show Sign In + Register only when NOT logged in */}
          {!user && (
            <>
              <Link to="/login" className={styles.signInBtn}>
                <FiLogIn style={{ marginRight: 8 }} />
                Sign In
              </Link>

              <Link to="/register" className={styles.registerBtn}>
                <FiUserPlus style={{ marginRight: 8 }} />
                Register
              </Link>
            </>
          )}

          {/* If logged in, show user + logout button */}
          {user && (
            <>
              <Link to="/user" className={styles.userDisplay}>
                <FiUser size={28} />
                <span className={styles.username}>{user.username}</span>
              </Link>

              <button className={styles.logoutButton} onClick={handleLogout}>
                <FiLogOut size={16} style={{ marginRight: 6 }} />
                Sign Out
              </button>
            </>
          )}
        </div>

        <button className={styles.hamburgerBtn} onClick={toggleMobileMenu}>
          <FiMenu size={24} />
        </button>
      </header>
    </>
  );
}

export default HeaderNav;

