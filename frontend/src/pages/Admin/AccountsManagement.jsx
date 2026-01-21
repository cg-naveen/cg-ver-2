import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiEdit, FiTrash2, FiX, FiPlus } from 'react-icons/fi';
import api from '../../api/axios';
import styles from './Admin.module.css';

export default function AccountsManagement() {
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  // ==================== LOADING STATES ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==================== SUPERADMIN CREDENTIALS ====================
  const [superadminCredentials, setSuperadminCredentials] = useState({
    email: '',
    phone: '',
    username: '',
    password: ''
  });

  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [visibleFields, setVisibleFields] = useState({
    email: false,
    phone: false,
    username: false,
    password: false
  });

  const [editCredentialsForm, setEditCredentialsForm] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showConfirmEdit, setShowConfirmEdit] = useState(false);

  // Password validation
  const hasMinLength = editCredentialsForm.newPassword.length >= 8;
  const hasNumber = /\d/.test(editCredentialsForm.newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(editCredentialsForm.newPassword);
  const passwordValid = hasMinLength && hasNumber && hasSpecialChar;
  const passwordMatch = editCredentialsForm.newPassword === editCredentialsForm.confirmNewPassword && editCredentialsForm.newPassword.length > 0;
  const oldPasswordDifferent = editCredentialsForm.oldPassword !== editCredentialsForm.newPassword && editCredentialsForm.newPassword.length > 0;

  const toggleFieldVisibility = (field) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEditCredentials = () => {
    setIsEditingCredentials(true);
    setEditCredentialsForm({
      email: superadminCredentials.email,
      phone: superadminCredentials.phone,
      username: superadminCredentials.username,
      password: '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setIsEditingPassword(false);
  };

  const handleCancelEdit = () => {
    setIsEditingCredentials(false);
    setIsEditingPassword(false);
    setEditCredentialsForm({
      email: '',
      phone: '',
      username: '',
      password: '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const handlePasswordEdit = () => {
    setIsEditingPassword(true);
  };

  const handleCredentialsChange = (e) => {
    const { name, value } = e.target;
    setEditCredentialsForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitCredentials = () => {
    setShowConfirmEdit(true);
  };

  // Fetch superadmin credentials
  const fetchSuperadminCredentials = async () => {
    try {
      const res = await api.get('/api/admin/superadmin/credentials');
      setSuperadminCredentials({
        email: res.data.email || '',
        phone: res.data.phone || '',
        username: res.data.username || '',
        password: '********' // Masked password
      });
    } catch (err) {
      console.error('Error fetching superadmin credentials:', err);
      setError('Failed to load superadmin credentials');
    }
  };

  const handleConfirmEdit = async () => {
    setShowConfirmEdit(false);
    
    if (isEditingPassword) {
      if (!oldPasswordDifferent) {
        alert('Old password and new password cannot be the same');
        return;
      }
      if (!passwordValid) {
        alert('Password does not meet strength requirements');
        return;
      }
      if (!passwordMatch) {
        alert('New password and confirm password do not match');
        return;
      }
    }

    try {
      const payload = {
        email: editCredentialsForm.email,
        phone: editCredentialsForm.phone,
        username: editCredentialsForm.username
      };

      if (isEditingPassword) {
        payload.oldPassword = editCredentialsForm.oldPassword;
        payload.newPassword = editCredentialsForm.newPassword;
      }

      await api.put('/api/admin/superadmin/credentials', payload);
      
      setIsEditingCredentials(false);
      setIsEditingPassword(false);

      // Logout and navigate
      await api.post('/api/auth/logout');
      navigate('/');
    } catch (err) {
      console.error('Error updating credentials:', err);
      alert(err.response?.data?.message || 'Failed to update credentials');
    }
  };

  const handleCancelConfirmEdit = () => {
    setShowConfirmEdit(false);
  };

  // ==================== HOTEL PROVIDERS ====================
  const [hotelProviders, setHotelProviders] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [hotelProviderAction, setHotelProviderAction] = useState(null); // 'view', 'edit', 'delete', 'add'
  const [selectedHotelProvider, setSelectedHotelProvider] = useState(null);
  const [hotelProviderForm, setHotelProviderForm] = useState({
    provider_name: '',
    pic_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    contact_num: '',
    hotel_name: '',
    hotel_id: '',
    num_rooms: ''
  });

  const [isEditingHotelPassword, setIsEditingHotelPassword] = useState(false);
  const [hotelPasswordFocused, setHotelPasswordFocused] = useState(false);
  const [showConfirmHotelEdit, setShowConfirmHotelEdit] = useState(false);
  const [showConfirmHotelDelete, setShowConfirmHotelDelete] = useState(false);
  const [showConfirmHotelAdd, setShowConfirmHotelAdd] = useState(false);

  // Hotel provider password validation
  const hotelHasMinLength = hotelProviderForm.password.length >= 8;
  const hotelHasNumber = /\d/.test(hotelProviderForm.password);
  const hotelHasSpecialChar = /[^A-Za-z0-9]/.test(hotelProviderForm.password);
  const hotelPasswordValid = hotelHasMinLength && hotelHasNumber && hotelHasSpecialChar;
  const hotelPasswordMatch = hotelProviderForm.password === hotelProviderForm.confirmPassword && hotelProviderForm.password.length > 0;

  const openHotelView = (provider) => {
    setSelectedHotelProvider(provider);
    setHotelProviderAction('view');
  };

  const openHotelEdit = (provider) => {
    setSelectedHotelProvider(provider);
    setHotelProviderAction('edit');
    setHotelProviderForm({
      provider_name: provider.provider_name || '',
      pic_name: provider.pic_name || '',
      username: provider.username || '',
      password: '',
      confirmPassword: '',
      email: provider.email || '',
      contact_num: provider.contact_num || '',
      hotel_name: provider.hotel_name || '',
      hotel_id: provider.hotel_id || '',
      num_rooms: provider.num_rooms || ''
    });
    setIsEditingHotelPassword(false);
  };

  const openHotelDelete = (provider) => {
    setSelectedHotelProvider(provider);
    setHotelProviderAction('delete');
    setShowConfirmHotelDelete(true);
  };

  const openHotelAdd = () => {
    setHotelProviderAction('add');
    setHotelProviderForm({
      provider_name: '',
      pic_name: '',
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      contact_num: '',
      hotel_name: '',
      hotel_id: '',
      num_rooms: ''
    });
    setIsEditingHotelPassword(false);
  };

  const handleHotelFormChange = (e) => {
    const { name, value } = e.target;
    setHotelProviderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleHotelPasswordEdit = () => {
    setIsEditingHotelPassword(true);
  };

  const handleHotelSubmit = () => {
    if (hotelProviderAction === 'edit') {
      if (isEditingHotelPassword) {
        if (!hotelPasswordValid) {
          alert('Password does not meet strength requirements');
          return;
        }
        if (!hotelPasswordMatch) {
          alert('Password and confirm password do not match');
          return;
        }
      }
      setShowConfirmHotelEdit(true);
    } else if (hotelProviderAction === 'add') {
      if (!hotelPasswordValid) {
        alert('Password does not meet strength requirements');
        return;
      }
      if (!hotelPasswordMatch) {
        alert('Password and confirm password do not match');
        return;
      }
      setShowConfirmHotelAdd(true);
    }
  };

  // Fetch hotel providers
  const fetchHotelProviders = async () => {
    try {
      const res = await api.get('/api/admin/hotel-providers');
      setHotelProviders(res.data);
    } catch (err) {
      console.error('Error fetching hotel providers:', err);
      setError('Failed to load hotel providers');
    }
  };

  // Fetch hotels for dropdown
  const fetchHotels = async () => {
    try {
      const res = await api.get('/api/admin/hotels');
      setHotels(res.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    }
  };

  const handleConfirmHotelEdit = async () => {
    setShowConfirmHotelEdit(false);
    try {
      const payload = {
        provider_name: hotelProviderForm.provider_name,
        pic_name: hotelProviderForm.pic_name,
        username: hotelProviderForm.username,
        email: hotelProviderForm.email,
        contact_num: hotelProviderForm.contact_num,
        hotel_id: hotelProviderForm.hotel_id
      };

      if (isEditingHotelPassword) {
        payload.password = hotelProviderForm.password;
      }

      await api.put(`/api/admin/hotel-providers/${selectedHotelProvider.hotel_provider_id}`, payload);
      await fetchHotelProviders();
      setHotelProviderAction(null);
      setSelectedHotelProvider(null);
    } catch (err) {
      console.error('Error updating hotel provider:', err);
      alert(err.response?.data?.message || 'Failed to update hotel provider');
    }
  };

  const handleConfirmHotelDelete = async () => {
    setShowConfirmHotelDelete(false);
    try {
      await api.delete(`/api/admin/hotel-providers/${selectedHotelProvider.hotel_provider_id}`);
      await fetchHotelProviders();
      setHotelProviderAction(null);
      setSelectedHotelProvider(null);
    } catch (err) {
      console.error('Error deleting hotel provider:', err);
      alert(err.response?.data?.message || 'Failed to delete hotel provider');
    }
  };

  const handleConfirmHotelAdd = async () => {
    setShowConfirmHotelAdd(false);
    try {
      // Validate required fields
      if (!hotelProviderForm.provider_name || !hotelProviderForm.pic_name || 
          !hotelProviderForm.username || !hotelProviderForm.password || 
          !hotelProviderForm.email || !hotelProviderForm.contact_num || 
          !hotelProviderForm.hotel_id) {
        alert('All fields are required');
        return;
      }

      await api.post('/api/admin/hotel-providers', {
        provider_name: hotelProviderForm.provider_name,
        pic_name: hotelProviderForm.pic_name,
        username: hotelProviderForm.username,
        password: hotelProviderForm.password,
        email: hotelProviderForm.email,
        contact_num: hotelProviderForm.contact_num,
        hotel_id: hotelProviderForm.hotel_id
      });
      await fetchHotelProviders();
      setHotelProviderAction(null);
      setHotelProviderForm({
        provider_name: '',
        pic_name: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        contact_num: '',
        hotel_name: '',
        hotel_id: '',
        num_rooms: ''
      });
    } catch (err) {
      console.error('Error adding hotel provider:', err);
      alert(err.response?.data?.message || 'Failed to add hotel provider');
    }
  };

  // ==================== SERVICE PROVIDERS ====================
  const [serviceProviders, setServiceProviders] = useState([]);
  const [services, setServices] = useState([]);

  const [serviceProviderAction, setServiceProviderAction] = useState(null); // 'view', 'edit', 'delete', 'add'
  const [selectedServiceProvider, setSelectedServiceProvider] = useState(null);
  const [serviceProviderForm, setServiceProviderForm] = useState({
    provider_name: '',
    pic_name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    contact_num: '',
    service_names: [],
    num_services: 0
  });

  const [isEditingServicePassword, setIsEditingServicePassword] = useState(false);
  const [servicePasswordFocused, setServicePasswordFocused] = useState(false);
  const [showConfirmServiceEdit, setShowConfirmServiceEdit] = useState(false);
  const [showConfirmServiceDelete, setShowConfirmServiceDelete] = useState(false);
  const [showConfirmServiceAdd, setShowConfirmServiceAdd] = useState(false);

  // Service provider password validation
  const serviceHasMinLength = serviceProviderForm.password.length >= 8;
  const serviceHasNumber = /\d/.test(serviceProviderForm.password);
  const serviceHasSpecialChar = /[^A-Za-z0-9]/.test(serviceProviderForm.password);
  const servicePasswordValid = serviceHasMinLength && serviceHasNumber && serviceHasSpecialChar;
  const servicePasswordMatch = serviceProviderForm.password === serviceProviderForm.confirmPassword && serviceProviderForm.password.length > 0;

  const openServiceView = (provider) => {
    setSelectedServiceProvider(provider);
    setServiceProviderAction('view');
  };

  const openServiceEdit = (provider) => {
    setSelectedServiceProvider(provider);
    setServiceProviderAction('edit');
    setServiceProviderForm({
      provider_name: provider.provider_name || '',
      pic_name: provider.pic_name || '',
      username: provider.username || '',
      password: '',
      confirmPassword: '',
      email: provider.email || '',
      contact_num: provider.contact_num || '',
      service_names: provider.service_names || [],
      num_services: provider.num_services || 0
    });
    setIsEditingServicePassword(false);
  };

  const openServiceDelete = (provider) => {
    setSelectedServiceProvider(provider);
    setServiceProviderAction('delete');
    setShowConfirmServiceDelete(true);
  };

  const openServiceAdd = () => {
    setServiceProviderAction('add');
    setServiceProviderForm({
      provider_name: '',
      pic_name: '',
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      contact_num: '',
      service_names: [],
      num_services: 0
    });
    setIsEditingServicePassword(false);
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'service_names') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setServiceProviderForm(prev => ({
        ...prev,
        service_names: selectedOptions,
        num_services: selectedOptions.length
      }));
    } else {
      setServiceProviderForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServicePasswordEdit = () => {
    setIsEditingServicePassword(true);
  };

  const handleServiceSubmit = () => {
    if (serviceProviderAction === 'edit') {
      if (isEditingServicePassword) {
        if (!servicePasswordValid) {
          alert('Password does not meet strength requirements');
          return;
        }
        if (!servicePasswordMatch) {
          alert('Password and confirm password do not match');
          return;
        }
      }
      setShowConfirmServiceEdit(true);
    } else if (serviceProviderAction === 'add') {
      if (!servicePasswordValid) {
        alert('Password does not meet strength requirements');
        return;
      }
      if (!servicePasswordMatch) {
        alert('Password and confirm password do not match');
        return;
      }
      setShowConfirmServiceAdd(true);
    }
  };

  // Fetch service providers
  const fetchServiceProviders = async () => {
    try {
      const res = await api.get('/api/admin/service-providers');
      setServiceProviders(res.data);
    } catch (err) {
      console.error('Error fetching service providers:', err);
      setError('Failed to load service providers');
    }
  };

  // Fetch services for dropdown
  const fetchServices = async () => {
    try {
      const res = await api.get('/api/admin/services');
      setServices(res.data);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const handleConfirmServiceEdit = async () => {
    setShowConfirmServiceEdit(false);
    try {
      const payload = {
        provider_name: serviceProviderForm.provider_name,
        pic_name: serviceProviderForm.pic_name,
        username: serviceProviderForm.username,
        email: serviceProviderForm.email,
        contact_num: serviceProviderForm.contact_num,
        service_names: serviceProviderForm.service_names
      };

      if (isEditingServicePassword) {
        payload.password = serviceProviderForm.password;
      }

      await api.put(`/api/admin/service-providers/${selectedServiceProvider.service_provider_id}`, payload);
      await fetchServiceProviders();
      setServiceProviderAction(null);
      setSelectedServiceProvider(null);
    } catch (err) {
      console.error('Error updating service provider:', err);
      alert(err.response?.data?.message || 'Failed to update service provider');
    }
  };

  const handleConfirmServiceDelete = async () => {
    setShowConfirmServiceDelete(false);
    try {
      await api.delete(`/api/admin/service-providers/${selectedServiceProvider.service_provider_id}`);
      await fetchServiceProviders();
      setServiceProviderAction(null);
      setSelectedServiceProvider(null);
    } catch (err) {
      console.error('Error deleting service provider:', err);
      alert(err.response?.data?.message || 'Failed to delete service provider');
    }
  };

  const handleConfirmServiceAdd = async () => {
    setShowConfirmServiceAdd(false);
    try {
      await api.post('/api/admin/service-providers', {
        provider_name: serviceProviderForm.provider_name,
        pic_name: serviceProviderForm.pic_name,
        username: serviceProviderForm.username,
        password: serviceProviderForm.password,
        email: serviceProviderForm.email,
        contact_num: serviceProviderForm.contact_num,
        service_names: serviceProviderForm.service_names
      });
      await fetchServiceProviders();
      setServiceProviderAction(null);
      setServiceProviderForm({
        provider_name: '',
        pic_name: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        contact_num: '',
        service_names: [],
        num_services: 0
      });
    } catch (err) {
      console.error('Error adding service provider:', err);
      alert(err.response?.data?.message || 'Failed to add service provider');
    }
  };

  // ==================== USE EFFECT ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([
          fetchSuperadminCredentials(),
          fetchHotelProviders(),
          fetchHotels(),
          fetchServiceProviders(),
          fetchServices()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={styles.roomsContent}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Accounts Management</h2>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.roomsContent}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Accounts Management</h2>
        </div>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.roomsContent}>
      {/* Page Header */}
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Accounts Management</h2>
      </div>

      {/* ==================== SUPERADMIN CREDENTIALS SECTION ==================== */}
      <div className={styles.settingsCard}>
        <h3>Superadmin Credentials</h3>
        
        {!isEditingCredentials ? (
          <div className={styles.settingsForm}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={visibleFields.email ? superadminCredentials.email : '*'.repeat(superadminCredentials.email.length)}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => toggleFieldVisibility('email')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                  {visibleFields.email ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={visibleFields.phone ? superadminCredentials.phone : '*'.repeat(superadminCredentials.phone.length)}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => toggleFieldVisibility('phone')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                  {visibleFields.phone ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Username</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={visibleFields.username ? superadminCredentials.username : '*'.repeat(superadminCredentials.username.length)}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => toggleFieldVisibility('username')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                  {visibleFields.username ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={visibleFields.password ? superadminCredentials.password : '*'.repeat(12)}
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => toggleFieldVisibility('password')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                  {visibleFields.password ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button className={styles.saveButton} onClick={handleEditCredentials}>
              Edit Credentials
            </button>
          </div>
        ) : (
          <form className={styles.settingsForm} onSubmit={(e) => e.preventDefault()}>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={editCredentialsForm.email}
                onChange={handleCredentialsChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={editCredentialsForm.phone}
                onChange={handleCredentialsChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={editCredentialsForm.username}
                onChange={handleCredentialsChange}
                required
              />
          </div>

{!isEditingPassword ? (
  <div className={styles.inputGroup}>
    <label>Password</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="text"
        value="********"
        readOnly
        style={{ flex: 1 }}
      />
      <button
        type="button"
        onClick={handlePasswordEdit}
        className={styles.actionButton}
      >
        Edit Password
      </button>
    </div>
  </div>
) : (
  <>
    <div className={styles.inputGroup}>
      <label>Old Password</label>
      <input
        type="password"
        name="oldPassword"
        value={editCredentialsForm.oldPassword}
        onChange={handleCredentialsChange}
        required
      />
    </div>

    <div className={styles.inputGroup}>
      <label>New Password</label>
      <input
        type="password"
        name="newPassword"
        value={editCredentialsForm.newPassword}
        onChange={handleCredentialsChange}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
        required
      />
      {passwordFocused && (
        <div style={{ fontSize: 12, marginTop: 6 }}>
          <p style={{ color: hasMinLength ? 'green' : 'red' }}>
            * Minimum 8 characters
          </p>
          <p style={{ color: hasNumber ? 'green' : 'red' }}>
            * At least 1 number
          </p>
          <p style={{ color: hasSpecialChar ? 'green' : 'red' }}>
            * At least 1 special character
          </p>
        </div>
      )}
    </div>

    <div className={styles.inputGroup}>
      <label>Confirm New Password</label>
      <input
        type="password"
        name="confirmNewPassword"
        value={editCredentialsForm.confirmNewPassword}
        onChange={handleCredentialsChange}
        required
      />
      {editCredentialsForm.confirmNewPassword && (
        <p
          style={{
            fontSize: 12,
            marginTop: 4,
            color: passwordMatch ? 'green' : 'red'
          }}
        >
          {passwordMatch ? 'Password match' : 'Password do not match'}
        </p>
      )}
      {editCredentialsForm.newPassword && editCredentialsForm.oldPassword && (
        <p
          style={{
            fontSize: 12,
            marginTop: 4,
            color: oldPasswordDifferent ? 'green' : 'red'
          }}
        >
          {oldPasswordDifferent ? 'Old and new passwords are different' : 'Old password and new password cannot be the same'}
        </p>
      )}
    </div>
  </>
)}

<div className={styles.modalActions}>
  <button
    type="button"
    className={styles.saveButton}
    onClick={handleSubmitCredentials}
    disabled={isEditingPassword && (!passwordValid || !passwordMatch || !oldPasswordDifferent)}
  >
    Save Changes
  </button>
  <button
    type="button"
    className={styles.actionButton}
    onClick={handleCancelEdit}
  >
    Cancel
  </button>
</div>
</form>
)}
</div>

{/* Confirmation Modal for Superadmin Edit */}
{showConfirmEdit && (
<div className={styles.panelOverlay}>
<div className={styles.panelCard}>
<div className={styles.panelHeader}>
  <h3>Confirm Edit</h3>
  <button onClick={handleCancelConfirmEdit} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
    <FiX size={20} />
  </button>
</div>
<div className={styles.panelBody}>
  <div>
    <p>Do you want to confirm edit?</p>
    <div className={styles.modalActions}>
      <button className={styles.saveButton} onClick={handleConfirmEdit}>
        Continue
      </button>
      <button className={styles.actionButton} onClick={handleCancelConfirmEdit}>
        Cancel
      </button>
    </div>
  </div>
</div>
</div>
</div>
)}

{/* ==================== HOTEL PROVIDERS SECTION ==================== */}
<div className={styles.settingsCard}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
<h3>Hotel Providers</h3>
<button className={styles.addButton} onClick={openHotelAdd}>
<FiPlus size={18} /> Add Hotel Provider
</button>
</div>

<div className={styles.tableContainer}>
<table className={styles.roomsTable}>
<thead>
  <tr>
    <th>Provider</th>
    <th>Hotel Name</th>
    <th>Actions</th>
  </tr>
</thead>
      <tbody>
        {hotelProviders.length === 0 ? (
          <tr>
            <td colSpan="3" style={{ textAlign: 'center' }}>No hotel providers found</td>
          </tr>
        ) : (
          hotelProviders.map(provider => (
            <tr key={provider.hotel_provider_id}>
              <td>{provider.provider_name}</td>
              <td>{provider.hotel_name || '-'}</td>
      <td>
        <div className={styles.actionButtonsRow}>
          <button
            className={styles.actionButton}
            onClick={() => openHotelView(provider)}
            title="View"
          >
            <FiEye size={14} />
          </button>
          <button
            className={styles.actionButton}
            onClick={() => openHotelEdit(provider)}
            title="Edit"
          >
            <FiEdit size={14} />
          </button>
          <button
            className={styles.actionButton}
            onClick={() => openHotelDelete(provider)}
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
          ))
        )}
      </tbody>
</table>
</div>
</div>

{/* Hotel Provider View Panel */}
{hotelProviderAction === 'view' && selectedHotelProvider && (
<div className={styles.activitySection}>
<div className={styles.settingsCard}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <h3>View Hotel Provider</h3>
  <button className={styles.actionButton} onClick={() => setHotelProviderAction(null)}>
    <FiX size={18} />
  </button>
</div>
<div className={styles.settingsForm}>
  <p><strong>Provider Name:</strong> {selectedHotelProvider.provider_name}</p>
  <p><strong>PIC Name:</strong> {selectedHotelProvider.pic_name}</p>
  <p><strong>Username:</strong> {selectedHotelProvider.username}</p>
  <p><strong>Password:</strong> {'*'.repeat(12)}</p>
  <p><strong>Email:</strong> {selectedHotelProvider.email}</p>
  <p><strong>Contact Number:</strong> {selectedHotelProvider.contact_num}</p>
  <p><strong>Hotel Name:</strong> {selectedHotelProvider.hotel_name}</p>
              <p><strong>Number of Rooms:</strong> {selectedHotelProvider.num_rooms || 0}</p>
  <button className={styles.actionButton} onClick={() => setHotelProviderAction(null)}>
    Close
  </button>
</div>
</div>
</div>
)}

{/* Hotel Provider Edit Panel */}
{hotelProviderAction === 'edit' && selectedHotelProvider && (
<div className={styles.activitySection}>
<div className={styles.settingsCard}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
  <h3>Edit Hotel Provider</h3>
  <button className={styles.actionButton} onClick={() => setHotelProviderAction(null)}>
    <FiX size={18} />
  </button>
</div>
<form className={styles.settingsForm} onSubmit={(e) => e.preventDefault()}>
  <div className={styles.inputGroup}>
    <label>Provider Name</label>
    <input
      type="text"
      name="provider_name"
      value={hotelProviderForm.provider_name}
      onChange={handleHotelFormChange}
      required
    />
  </div>

  <div className={styles.inputGroup}>
    <label>PIC Name</label>
    <input
      type="text"
      name="pic_name"
      value={hotelProviderForm.pic_name}
      onChange={handleHotelFormChange}
      required
    />
  </div>

  <div className={styles.inputGroup}>
    <label>Username</label>
    <input
      type="text"
      name="username"
      value={hotelProviderForm.username}
      onChange={handleHotelFormChange}
      required
    />
  </div>

  {!isEditingHotelPassword ? (
    <div className={styles.inputGroup}>
      <label>Password</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          value="********"
          readOnly
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={handleHotelPasswordEdit}
          className={styles.actionButton}
        >
          Edit Password
        </button>
      </div>
    </div>
  ) : (
    <>
      <div className={styles.inputGroup}>
        <label>New Password</label>
        <input
          type="password"
          name="password"
          value={hotelProviderForm.password}
          onChange={handleHotelFormChange}
          onFocus={() => setHotelPasswordFocused(true)}
          onBlur={() => setHotelPasswordFocused(false)}
          required
        />
        {hotelPasswordFocused && (
          <div style={{ fontSize: 12, marginTop: 6 }}>
            <p style={{ color: hotelHasMinLength ? 'green' : 'red' }}>
              * Minimum 8 characters
            </p>
            <p style={{ color: hotelHasNumber ? 'green' : 'red' }}>
              * At least 1 number
            </p>
            <p style={{ color: hotelHasSpecialChar ? 'green' : 'red' }}>
              * At least 1 special character
            </p>
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={hotelProviderForm.confirmPassword}
          onChange={handleHotelFormChange}
          required
        />
        {hotelProviderForm.confirmPassword && (
          <p
            style={{
              fontSize: 12,
              marginTop: 4,
              color: hotelPasswordMatch ? 'green' : 'red'
            }}
          >
            {hotelPasswordMatch ? 'Password match' : 'Password do not match'}
          </p>
        )}
      </div>
    </>
  )}

  <div className={styles.inputGroup}>
    <label>Email</label>
    <input
      type="email"
      name="email"
      value={hotelProviderForm.email}
      onChange={handleHotelFormChange}
      required
    />
  </div>

  <div className={styles.inputGroup}>
    <label>Contact Number</label>
    <input
      type="tel"
      name="contact_num"
      value={hotelProviderForm.contact_num}
      onChange={handleHotelFormChange}
      required
    />
  </div>

  <div className={styles.inputGroup}>
    <label>Hotel Name</label>
    <select
      name="hotel_name"
      value={hotelProviderForm.hotel_id || ''}
      onChange={(e) => {
        const selectedHotelId = e.target.value;
        const selectedHotel = hotels.find(h => h.hotel_id === selectedHotelId);
        setHotelProviderForm(prev => ({
          ...prev,
          hotel_id: selectedHotelId || '',
          hotel_name: selectedHotel ? selectedHotel.name : ''
        }));
      }}
      required
    >
      <option value="">Select Hotel</option>
      {hotels.map(hotel => (
        <option key={hotel.hotel_id} value={hotel.hotel_id}>
          {hotel.name}
        </option>
      ))}
    </select>
  </div>

              <div className={styles.inputGroup}>
                <label>Number of Rooms</label>
                <input
                  type="number"
                  name="num_rooms"
                  value={hotelProviderForm.num_rooms}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleHotelSubmit}
                  disabled={isEditingHotelPassword && (!hotelPasswordValid || !hotelPasswordMatch)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setHotelProviderAction(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hotel Provider Add Panel */}
      {hotelProviderAction === 'add' && (
        <div className={styles.activitySection}>
          <div className={styles.settingsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Add Hotel Provider</h3>
              <button className={styles.actionButton} onClick={() => setHotelProviderAction(null)}>
                <FiX size={18} />
              </button>
            </div>
            <form className={styles.settingsForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputGroup}>
                <label>Provider Name</label>
                <input
                  type="text"
                  name="provider_name"
                  value={hotelProviderForm.provider_name}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>PIC Name</label>
                <input
                  type="text"
                  name="pic_name"
                  value={hotelProviderForm.pic_name}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={hotelProviderForm.username}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={hotelProviderForm.password}
                  onChange={handleHotelFormChange}
                  onFocus={() => setHotelPasswordFocused(true)}
                  onBlur={() => setHotelPasswordFocused(false)}
                  required
                />
                {hotelPasswordFocused && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    <p style={{ color: hotelHasMinLength ? 'green' : 'red' }}>
                      * Minimum 8 characters
                    </p>
                    <p style={{ color: hotelHasNumber ? 'green' : 'red' }}>
                      * At least 1 number
                    </p>
                    <p style={{ color: hotelHasSpecialChar ? 'green' : 'red' }}>
                      * At least 1 special character
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={hotelProviderForm.confirmPassword}
                  onChange={handleHotelFormChange}
                  required
                />
                {hotelProviderForm.confirmPassword && (
                  <p
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: hotelPasswordMatch ? 'green' : 'red'
                    }}
                  >
                    {hotelPasswordMatch ? 'Password match' : 'Password do not match'}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={hotelProviderForm.email}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_num"
                  value={hotelProviderForm.contact_num}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Hotel Name</label>
                <select
                  name="hotel_name"
                  value={hotelProviderForm.hotel_id || ''}
                  onChange={(e) => {
                    const selectedHotelId = e.target.value;
                    const selectedHotel = hotels.find(h => h.hotel_id === selectedHotelId);
                    setHotelProviderForm(prev => ({
                      ...prev,
                      hotel_id: selectedHotelId || '',
                      hotel_name: selectedHotel ? selectedHotel.name : ''
                    }));
                  }}
                  required
                >
                  <option value="">Select Hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel.hotel_id} value={hotel.hotel_id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Number of Rooms</label>
                <input
                  type="number"
                  name="num_rooms"
                  value={hotelProviderForm.num_rooms}
                  onChange={handleHotelFormChange}
                  required
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleHotelSubmit}
                  disabled={!hotelPasswordValid || !hotelPasswordMatch}
                >
                  Add Provider
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setHotelProviderAction(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hotel Provider Delete Confirmation Modal */}
      {showConfirmHotelDelete && selectedHotelProvider && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Confirm Delete</h3>
              <button 
                onClick={() => {
                  setShowConfirmHotelDelete(false);
                  setHotelProviderAction(null);
                }} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div>
                <p>Are you sure you want to delete this hotel provider?</p>
                <div className={styles.modalActions}>
                  <button className={styles.saveButton} onClick={handleConfirmHotelDelete}>
                    Continue
                  </button>
                  <button 
                    className={styles.actionButton} 
                    onClick={() => {
                      setShowConfirmHotelDelete(false);
                      setHotelProviderAction(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Provider Edit Confirmation Modal */}
      {showConfirmHotelEdit && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Confirm Edit</h3>
              <button 
                onClick={() => setShowConfirmHotelEdit(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div>
                <p>Do you want to confirm edit?</p>
                <div className={styles.modalActions}>
                  <button className={styles.saveButton} onClick={handleConfirmHotelEdit}>
                    Continue
                  </button>
                  <button className={styles.actionButton} onClick={() => setShowConfirmHotelEdit(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Provider Add Confirmation Modal */}
      {showConfirmHotelAdd && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Confirm Add</h3>
              <button 
                onClick={() => setShowConfirmHotelAdd(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div>
                <p>Do you want to confirm adding this hotel provider?</p>
                <div className={styles.modalActions}>
                  <button className={styles.saveButton} onClick={handleConfirmHotelAdd}>
                    Continue
                  </button>
                  <button className={styles.actionButton} onClick={() => setShowConfirmHotelAdd(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SERVICE PROVIDERS SECTION ==================== */}
      <div className={styles.settingsCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Service Providers</h3>
          <button className={styles.addButton} onClick={openServiceAdd}>
            <FiPlus size={18} /> Add Service Provider
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Services</th>
                <th>Actions</th>
              </tr>
            </thead>
      <tbody>
        {serviceProviders.length === 0 ? (
          <tr>
            <td colSpan="3" style={{ textAlign: 'center' }}>No service providers found</td>
          </tr>
        ) : (
          serviceProviders.map(provider => (
            <tr key={provider.service_provider_id}>
              <td>{provider.provider_name}</td>
              <td>{Array.isArray(provider.service_names) ? provider.service_names.join(', ') : '-'}</td>
                  <td>
                    <div className={styles.actionButtonsRow}>
                      <button
                        className={styles.actionButton}
                        onClick={() => openServiceView(provider)}
                        title="View"
                      >
                        <FiEye size={14} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => openServiceEdit(provider)}
                        title="Edit"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => openServiceDelete(provider)}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Service Provider View Panel */}
      {serviceProviderAction === 'view' && selectedServiceProvider && (
        <div className={styles.activitySection}>
          <div className={styles.settingsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>View Service Provider</h3>
              <button className={styles.actionButton} onClick={() => setServiceProviderAction(null)}>
                <FiX size={18} />
              </button>
            </div>
            <div className={styles.settingsForm}>
              <p><strong>Provider Name:</strong> {selectedServiceProvider.provider_name}</p>
              <p><strong>PIC Name:</strong> {selectedServiceProvider.pic_name}</p>
              <p><strong>Username:</strong> {selectedServiceProvider.username}</p>
              <p><strong>Password:</strong> {'*'.repeat(12)}</p>
              <p><strong>Email:</strong> {selectedServiceProvider.email}</p>
              <p><strong>Contact Number:</strong> {selectedServiceProvider.contact_num}</p>
              <p><strong>Service Names:</strong> {Array.isArray(selectedServiceProvider.service_names) ? selectedServiceProvider.service_names.join(', ') : '-'}</p>
              <p><strong>Number of Services:</strong> {selectedServiceProvider.num_services || 0}</p>
              <button className={styles.actionButton} onClick={() => setServiceProviderAction(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Provider Edit Panel */}
      {serviceProviderAction === 'edit' && selectedServiceProvider && (
        <div className={styles.activitySection}>
          <div className={styles.settingsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Edit Service Provider</h3>
              <button className={styles.actionButton} onClick={() => setServiceProviderAction(null)}>
                <FiX size={18} />
              </button>
            </div>
            <form className={styles.settingsForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputGroup}>
                <label>Provider Name</label>
                <input
                  type="text"
                  name="provider_name"
                  value={serviceProviderForm.provider_name}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>PIC Name</label>
                <input
                  type="text"
                  name="pic_name"
                  value={serviceProviderForm.pic_name}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={serviceProviderForm.username}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              {!isEditingServicePassword ? (
                <div className={styles.inputGroup}>
                  <label>Password</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      value="********"
                      readOnly
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleServicePasswordEdit}
                      className={styles.actionButton}
                    >
                      Edit Password
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.inputGroup}>
                    <label>New Password</label>
                    <input
                      type="password"
                      name="password"
                      value={serviceProviderForm.password}
                      onChange={handleServiceFormChange}
                      onFocus={() => setServicePasswordFocused(true)}
                      onBlur={() => setServicePasswordFocused(false)}
                      required
                    />
                    {servicePasswordFocused && (
                      <div style={{ fontSize: 12, marginTop: 6 }}>
                        <p style={{ color: serviceHasMinLength ? 'green' : 'red' }}>
                          * Minimum 8 characters
                        </p>
                        <p style={{ color: serviceHasNumber ? 'green' : 'red' }}>
                          * At least 1 number
                        </p>
                        <p style={{ color: serviceHasSpecialChar ? 'green' : 'red' }}>
                          * At least 1 special character
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={serviceProviderForm.confirmPassword}
                      onChange={handleServiceFormChange}
                      required
                    />
                    {serviceProviderForm.confirmPassword && (
                      <p
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                          color: servicePasswordMatch ? 'green' : 'red'
                        }}
                      >
                        {servicePasswordMatch ? 'Password match' : 'Password do not match'}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={serviceProviderForm.email}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_num"
                  value={serviceProviderForm.contact_num}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Service Names</label>
                <select
                  name="service_names"
                  multiple
                  value={serviceProviderForm.service_names}
                  onChange={handleServiceFormChange}
                  required
                  style={{ minHeight: '100px' }}
                >
                  {services.map(service => (
                    <option key={service.service_id} value={service.service_name}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple services
                </p>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleServiceSubmit}
                  disabled={isEditingServicePassword && (!servicePasswordValid || !servicePasswordMatch)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setServiceProviderAction(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Provider Add Panel */}
      {serviceProviderAction === 'add' && (
        <div className={styles.activitySection}>
          <div className={styles.settingsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Add Service Provider</h3>
              <button className={styles.actionButton} onClick={() => setServiceProviderAction(null)}>
                <FiX size={18} />
              </button>
            </div>
            <form className={styles.settingsForm} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputGroup}>
                <label>Provider Name</label>
                <input
                  type="text"
                  name="provider_name"
                  value={serviceProviderForm.provider_name}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>PIC Name</label>
                <input
                  type="text"
                  name="pic_name"
                  value={serviceProviderForm.pic_name}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={serviceProviderForm.username}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={serviceProviderForm.password}
                  onChange={handleServiceFormChange}
                  onFocus={() => setServicePasswordFocused(true)}
                  onBlur={() => setServicePasswordFocused(false)}
                  required
                />
                {servicePasswordFocused && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    <p style={{ color: serviceHasMinLength ? 'green' : 'red' }}>
                      * Minimum 8 characters
                    </p>
                    <p style={{ color: serviceHasNumber ? 'green' : 'red' }}>
                      * At least 1 number
                    </p>
                    <p style={{ color: serviceHasSpecialChar ? 'green' : 'red' }}>
                      * At least 1 special character
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={serviceProviderForm.confirmPassword}
                  onChange={handleServiceFormChange}
                  required
                />
                {serviceProviderForm.confirmPassword && (
                  <p
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: servicePasswordMatch ? 'green' : 'red'
                    }}
                  >
                    {servicePasswordMatch ? 'Password match' : 'Password do not match'}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={serviceProviderForm.email}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_num"
                  value={serviceProviderForm.contact_num}
                  onChange={handleServiceFormChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Service Names</label>
                <select
                  name="service_names"
                  multiple
                  value={serviceProviderForm.service_names}
                  onChange={handleServiceFormChange}
                  required
                  style={{ minHeight: '100px' }}
                >
                  {services.map(service => (
                    <option key={service.service_id} value={service.service_name}>
                      {service.service_name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 12, marginTop: 4, color: '#666' }}>
                  Hold Ctrl (Windows) or Cmd (Mac) to select multiple services
                </p>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleServiceSubmit}
                  disabled={!servicePasswordValid || !servicePasswordMatch}
                >
                  Add Provider
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setServiceProviderAction(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Provider Delete Confirmation Modal */}
      {showConfirmServiceDelete && selectedServiceProvider && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Confirm Delete</h3>
              <button 
                onClick={() => {
                  setShowConfirmServiceDelete(false);
                  setServiceProviderAction(null);
                }} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div>
                <p>Are you sure you want to delete this service provider?</p>
                <div className={styles.modalActions}>
                  <button className={styles.saveButton} onClick={handleConfirmServiceDelete}>
                    Continue
                  </button>
                  <button 
                    className={styles.actionButton} 
                    onClick={() => {
                      setShowConfirmServiceDelete(false);
                      setServiceProviderAction(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Provider Edit Confirmation Modal */}
      {showConfirmServiceEdit && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Confirm Edit</h3>
              <button 
                onClick={() => setShowConfirmServiceEdit(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div>
                <p>Do you want to confirm edit?</p>
                <div className={styles.modalActions}>
                  <button className={styles.saveButton} onClick={handleConfirmServiceEdit}>
                    Continue
                  </button>
                  <button className={styles.actionButton} onClick={() => setShowConfirmServiceEdit(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Provider Add Confirmation Modal */}
      {showConfirmServiceAdd && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>Confirm Add</h3>
              <button 
                onClick={() => setShowConfirmServiceAdd(false)} 
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div>
                <p>Do you want to confirm adding this service provider?</p>
                <div className={styles.modalActions}>
                  <button className={styles.saveButton} onClick={handleConfirmServiceAdd}>
                    Continue
                  </button>
                  <button className={styles.actionButton} onClick={() => setShowConfirmServiceAdd(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}