import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import styles from './Register.module.css';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!checkbox1 || !checkbox2) {
      setError('You must agree to the Privacy Policy and Terms & Conditions');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: form.username,
        phone: form.phone,
        email: form.email,
        password: form.password
      });

      navigate('/');
    } catch (err) {
      console.error('Register error (frontend):', err);
      setError(err.response?.data?.message || 'Something went wrong');
    }

    setLoading(false);
  }

  return (
    <div className={styles.loginPage}>
      <HeaderNav />
      <div className={styles.profileTitle}>Profile</div>

      <div className={styles.loginContent}>
        <div className={styles.tabsRow}>
          <button className={styles.tab} type="button" onClick={() => navigate('/login')}>
            Log In
          </button>

          <button className={styles.activeTab} type="button">
            Register
            <div className={styles.tabUnderline} />
          </button>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <input
            name="username"
            className={styles.inputField}
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            className={styles.inputField}
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            className={styles.inputField}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            className={styles.inputField}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            name="confirmPassword"
            className={styles.inputField}
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <div style={{ flexDirection: 'column', display: 'flex', gap: 12, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checkbox1}
                onChange={(e) => setCheckbox1(e.target.checked)}
                required
              />
              <span style={{ marginLeft: 8 }}>
                I agree to the <a href="#" style={{ color: '#2B615F', textDecoration: 'underline' }}>Privacy Policy</a>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checkbox2}
                onChange={(e) => setCheckbox2(e.target.checked)}
                required
              />
              <span style={{ marginLeft: 8 }}>
                I agree to the <a href="#" style={{ color: '#2B615F', textDecoration: 'underline' }}>Terms and Conditions</a>
              </span>
            </label>
          </div>

          <button
  className={styles.loginButton}
  type="submit"
  disabled={loading}
>
  {loading ? (
    <div className={styles.loadingDots}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  ) : (
    'Register'
  )}
</button>

        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Register;
