import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiHome, FiKey, FiCalendar, FiCreditCard, FiBarChart2, FiUsers, FiBriefcase
} from 'react-icons/fi';
import { AdminProvider, useAdmin } from './AdminContext';
import styles from './Admin.module.css';
import AdminRoutes from './AdminRoutes';

const iconMap = {
  FiHome, FiKey, FiCalendar, FiCreditCard, FiBarChart2, FiUsers, FiBriefcase
};

function AdminLayout() {
  const { navigationItems } = useAdmin();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  return (
    <div className={styles.adminContainer}>
      <motion.div
        className={`${styles.sidebar} ${showMobileMenu ? styles.sidebarOpen : ''}`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <FiKey size={24} />
            <span>Hotel Admin</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navigationItems.map(item => {
            const Icon = iconMap[item.iconName] || FiKey;
            const active = location.pathname.includes(item.id);
            return (
              <Link
                key={item.id}
                to={item.id}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </motion.div>

      <div className={styles.mainContent}>
        <main className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AdminRoutes />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {showMobileMenu && <div className={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminLayout />
    </AdminProvider>
  );
}
