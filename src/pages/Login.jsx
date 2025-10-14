import React, { useState } from 'react';
import styles from './Login.module.css';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  function handleRegisterTab() {
    setActiveTab('register');
    navigate('/register');
  }

  return (
    <div className={styles.loginPage}>
      <HeaderNav />
      <div className={styles.profileTitle}>Profile</div>
      <div className={styles.loginContent}>
        <div className={styles.tabsRow}>
          <button
            className={activeTab === 'login' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('login')}
            type="button"
          >
            Log In
            {activeTab === 'login' && <div className={styles.tabUnderline} />}
          </button>
          <button
            className={activeTab === 'register' ? styles.activeTab : styles.tab}
            onClick={handleRegisterTab}
            type="button"
          >
            Register
            {activeTab === 'register' && <div className={styles.tabUnderline} />}
          </button>
        </div>
        {activeTab === 'login' && (
          <form className={styles.loginForm}>
            <input
              className={styles.inputField}
              type="text"
              placeholder="Username / Email"
              required
            />
            <input
              className={styles.inputField}
              type="password"
              placeholder="Password"
              required
            />
            <div className={styles.lostPasswordRow}>
              <a href="#" className={styles.lostPasswordLink}>
                Lost Your Password?
              </a>
            </div>
            <button className={styles.loginButton} type="submit">
              Login
            </button>
            <div className={styles.rememberRow}>
              <input
                id="rememberMe"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className={styles.checkbox}
              />
              <label htmlFor="rememberMe" className={styles.rememberLabel}>
                Remember Me
              </label>
            </div>
          </form>
        )}
      </div>
      
      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

export default Login;
