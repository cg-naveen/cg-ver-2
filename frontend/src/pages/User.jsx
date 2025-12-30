import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import styles from './User.module.css';
import RoomCard from '../components/RoomCard';
import BookingCard from '../components/BookingCard';
import Footer from '../components/Footer';

function User() {
  const { user, loading, favourites } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [favouriteRooms, setFavouriteRooms] = useState([]);
  const [favouritesLoading, setFavouritesLoading] = useState(true);

  /* ================= BACKEND PROFILE ================= */
  const [userData, setUserData] = useState(null);

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });

  /* ================= SETTINGS ================= */
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    darkMode: false,
    language: 'en'
  });

  /* ================= LOAD PROFILE FROM BACKEND ================= */
  useEffect(() => {
    if (!loading && user) {
      api.get('/api/users/me/profile')
      .then(res => {
        setUserData(res.data.user);
        setEditForm({
          username: res.data.user.username,
          email: res.data.user.email,
          phone: res.data.user.phone || '',
          address: res.data.user.address || ''
        });
      })
        .catch(() => console.error('Failed to load profile'));
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user) {
      setBookingLoading(true);
      api.get('/api/bookings/me')
        .then(res => {
          // res.data.bookings comes with services array
          setBookingHistory(res.data.bookings || []);
        })
        .catch(err => {
          console.error('Failed to load bookings', err);
          setBookingHistory([]);
        })
        .finally(() => {
          setBookingLoading(false);
        });
    }
  }, [loading, user]);
  

  useEffect(() => {
    if (!loading && user && favourites.length) {
      setFavouritesLoading(true);
  
      api.post('/api/rooms/by-ids', { room_ids: favourites })
        .then(res => {
          setFavouriteRooms(res.data.rooms || []);
        })
        .catch(err => {
          console.error('Failed to load favourite rooms', err);
          setFavouriteRooms([]);
        })
        .finally(() => {
          setFavouritesLoading(false);
        });
    } else {
      setFavouriteRooms([]);
      setFavouritesLoading(false);
    }
  }, [loading, user, favourites]);
  

  if (loading || !userData) {
    return <div className={styles.userPage}>Loading profile...</div>;
  }
  

  /* ================= HANDLERS ================= */
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put('/api/users/me/profile', {
        username: editForm.username,
        phone: editForm.phone,
        address: editForm.address
      });
  
      setUserData(prev => ({
        ...prev,          
        ...res.data       
      }));
  
      setIsEditingProfile(false);
      alert('Profile updated successfully');
    } catch {
      alert('Failed to update profile');
    }
  };
  

  const handleSettingsToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (e) => {
    setSettings(prev => ({ ...prev, language: e.target.value }));
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  /* ================= RENDER ================= */
  return (
    <div className={styles.userPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Account</h1>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        {['profile', 'bookings', 'favourites', 'settings'].map(tab => (
          <button
            key={tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {/* ================= PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className={styles.profileSection}>
            {!isEditingProfile ? (
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <img
                    src={userData.photo || '/default-avatar.png'}
                    alt="Profile"
                    className={styles.profilePhoto}
                  />
                  <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>{userData.username}</h2>
                    <p className={styles.profileEmail}>{userData.email}</p>
                  </div>
                </div>

                <div className={styles.profileDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phone</span>
                    <span className={styles.detailValue}>{userData.phone || '-'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Address</span>
                    <span className={styles.detailValue}>{userData.address || '-'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Member since</span>
                    <span className={styles.detailValue}>
                      {formatDate(userData.created_at)}
                    </span>
                  </div>
                </div>

                <button
                  className={styles.editButton}
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className={styles.profileCard}>
                <h2 className={styles.formTitle}>Edit Profile</h2>

                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Username</label>
                    <input
                      name="username"
                      value={editForm.username}
                      onChange={handleEditFormChange}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email</label>
                    <input
                      value={editForm.email}
                      disabled
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone</label>
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Address</label>
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditFormChange}
                      className={styles.formTextarea}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button
                      className={styles.cancelButton}
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.saveButton}
                      onClick={handleSaveProfile}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= BOOKINGS (MOCK) ================= */}
        {activeTab === 'bookings' && (
  <div className={styles.bookingsSection}>
    <h2 className={styles.sectionTitle}>My Bookings</h2>

    {bookingLoading ? (
      <p>Loading your bookings...</p>
    ) : bookingHistory.length ? (
      <div className={styles.bookingsList}>
        {bookingHistory.map(booking => (
          <BookingCard key={booking.booking_id} booking={{
            booking_id: booking.booking_id,
            hotel_name: booking.hotel_name,
            room_name: booking.room_name,
            check_in: booking.check_in_date,
            check_out: booking.check_out_date,
            price: Number(booking.total_price),
            status: booking.booking_status,
            services: booking.services
          }} />
        ))}
      </div>
    ) : (
      <p className={styles.emptyMessage}>No bookings found.</p>
    )}
  </div>
)}


        {/* ================= FAVOURITES (MOCK) ================= */}
        {activeTab === 'favourites' && (
  <div className={styles.favouritesSection}>
    <h2 className={styles.sectionTitle}>My Favourites</h2>

    {favouritesLoading ? (
      <p>Loading your favourites...</p>
    ) : favouriteRooms.length ? (
      <div className={styles.favouritesGrid}>
        {favouriteRooms.map(room => (
          <RoomCard key={room.room_id} room={room} />
        ))}
      </div>
    ) : (
      <p className={styles.emptyMessage}>No favourites yet.</p>
    )}
  </div>
)}


        {/* ================= SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className={styles.settingsSection}>
            <h2 className={styles.sectionTitle}>Account Settings</h2>

            <div className={styles.settingsCard}>
              <h3 className={styles.settingsSubtitle}>Preferences</h3>

              {Object.keys(settings).map(key => (
                <div key={key} className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <span className={styles.settingLabel}>{key}</span>
                    <span className={styles.settingDescription}>
                      Mock setting
                    </span>
                  </div>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={() => handleSettingsToggle(key)}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default User;
