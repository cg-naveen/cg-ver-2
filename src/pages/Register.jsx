import React, { useState } from 'react';
import styles from './Register.module.css';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [activeTab] = useState('register');
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  
  function goToLogin() {
    navigate('/signup');
  }

  // Prevent form submit if checkboxes not checked
  const handleSubmit = e => {
    e.preventDefault();
    if (checkbox1 && checkbox2) {
      // ...submit logic
    }
  };

  return (
    <div className={styles.loginPage}>
      <HeaderNav />
      <div className={styles.profileTitle}>Profile</div>
      <div className={styles.loginContent}>
        {/* Tabs */}
        <div className={styles.tabsRow}>
          <button
            className={styles.tab}
            type="button"
            onClick={goToLogin}
          >
            Log In
          </button>
          <button
            className={styles.activeTab}
            type="button"
          >
            Register
            <div className={styles.tabUnderline} />
          </button>
        </div>
        {/* Register Form */}
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            className={styles.inputField}
            type="text"
            placeholder="Username"
            required
          />
          <input
            className={styles.inputField}
            type="email"
            placeholder="Email"
            required
          />
          <input
            className={styles.inputField}
            type="password"
            placeholder="Password"
            required
          />
          <input
            className={styles.inputField}
            type="password"
            placeholder="Confirm Password"
            required
          />
          <div className={styles.rememberRow} style={{flexDirection:'column', alignItems:'flex-start', gap:'16px', marginBottom:'16px'}}>
            <label className={styles.rememberLabel} style={{display:'flex',alignItems:'center', fontSize:'13px', cursor:'pointer'}}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checkbox1}
                onChange={e => setCheckbox1(e.target.checked)}
                required
              />
              <span style={{marginLeft:8}}>
                I agree to the <a href="#" style={{color:'#2B615F', textDecoration:'underline'}}>Privacy Policy</a>
              </span>
            </label>
            <label className={styles.rememberLabel} style={{display:'flex',alignItems:'center', fontSize:'13px', cursor:'pointer'}}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checkbox2}
                onChange={e => setCheckbox2(e.target.checked)}
                required
              />
              <span style={{marginLeft:8}}>
                I agree to the <a href="#" style={{color:'#2B615F', textDecoration:'underline'}}>Terms and Conditions</a>
              </span>
            </label>
          </div>
          <button className={styles.loginButton} type="submit">
            Register
          </button>
        </form>
      </div>
      
      {/* === FOOTER === */}
      <Footer />
    </div>
  );
}

export default Register;
