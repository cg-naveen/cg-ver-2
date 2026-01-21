import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import styles from './Register.module.css';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useRef } from 'react';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [form, setForm] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const hasMinLength = form.password.length >= 8;
  const hasNumber = /\d/.test(form.password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(form.password);
  const passwordValid = hasMinLength && hasNumber && hasSpecialChar;
  const passwordMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const debounceTimer = useRef(null);

  function debounceCheck(fn, delay = 400) {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(fn, delay);
  }


  function handleChange(e) {
    const {name, value} = e.target;
    setForm(prev => ({ ...prev, [name]: value}));
    if (name === 'username' && value.trim().length >= 3) {
      setUsernameStatus('checking');
    
      debounceCheck(async () => {
        try {
          const res = await api.get('/api/users/check', {
            params: { username: value }
          });
          setUsernameStatus(res.data.exists ? 'taken' : 'available');
        } catch {
          setUsernameStatus(null);
        }
      });
    }
    
    if (name === 'email' && value.includes('@')) {
      setEmailStatus('checking');
    
      debounceCheck(async () => {
        try {
          const res = await api.get('/api/users/check', {
            params: { email: value }
          });
          setEmailStatus(res.data.exists ? 'taken' : 'available');
        } catch {
          setEmailStatus(null);
        }
      });
    }}

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
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
            required
          />
          {usernameFocused && usernameStatus && (
            <p style={{ fontSize: 12, marginTop:4,
              color: 
              usernameStatus === 'available' ? 'green' :
              usernameStatus === 'taken'? 'red' : '#555'
            }}>
              {usernameStatus === 'checking' && 'Checking username...'}
              {usernameStatus === 'available' && 'Username is available'}
              {usernameStatus === 'taken' && 'Username already taken'} 
            </p>
          )}

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
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            required
          />
          {emailFocused && emailStatus && (
            <p style={{fontSize:12, marginTop:4,
              color: 
              emailStatus === 'available' ? 'green' :
              emailStatus === 'taken' ? 'red' : '#555'
            }}>
              {emailStatus === 'checking' && 'Checking email...'}
              {emailStatus === 'available' && 'Email is available'}
              {emailStatus === 'taken' && 'Email already in use'}
            </p>
          )}

          <input
            name="password"
            className={styles.inputField}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
          />
          {passwordFocused && (
            <div style={{fontSize:12, marginTop: 6}}>
              <p style={{color:hasMinLength ? 'green' : 'red'}}>
                * Minimum 8 characters
              </p>
              <p style={{color:hasNumber ? 'green' : 'red'}}>
                * At least 1 number
              </p>
              <p style={{color: hasSpecialChar ? 'green' : 'red'}}>
                * At least 1 special character
              </p>
            </div>
          )}

          <input
            name="confirmPassword"
            className={styles.inputField}
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          {form.confirmPassword && (
            <p style = {{ fontSize: 12, marginTop: 4, color: passwordMatch ? 'green' : 'red'

            }} >
              {passwordMatch? 'Password match' : 'Password do not match'}
            </p>
          )}

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
  disabled={loading || !passwordMatch || !passwordValid || usernameStatus === 'taken' || emailStatus === 'taken'}
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
