import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ identifier: form.identifier, password: form.password });
      navigate('/');
    } catch (err) {
      console.error('Login error (frontend):', err);
      setError(err.response?.data?.message || 'Invalid credentials');
    }

    setLoading(false);
  }

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
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
              name="identifier"
              className={styles.inputField}
              type="text"
              placeholder="Username or Email"
              value={form.identifier}
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

            <div className={styles.lostPasswordRow}>
              <a href="#" className={styles.lostPasswordLink}>
                Lost Your Password?
              </a>
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
    'Login'
  )}
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
      <Footer />
    </div>
  );
}

export default Login;
