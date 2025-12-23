import React from 'react';
import styles from './Admin.module.css';

export default function AccountsManagement() {
  // -------------------------------
  // MOCK DATA
  // -------------------------------
  const partnerAccounts = [
    { partner_id: 1, partner: 'Trigo KL', type: 'Accommodation', onboardingStatus: 'Approved', status: 'Active' },
    { partner_id: 2, partner: 'Bayview Penang', type: 'Accommodation', onboardingStatus: 'Pending', status: 'Suspended' },
    { partner_id: 3, partner: 'Sunshine Spa', type: 'Service', onboardingStatus: 'Under Review', status: 'Active' },
  ];

  const roleAccessControl = [
    { role: 'Admin', permissions: ['Manage bookings', 'Manage payments', 'View analytics'] },
    { role: 'Manager', permissions: ['Manage rooms', 'Approve bookings'] },
    { role: 'Staff', permissions: ['View bookings', 'Update status'] },
  ];

  return (
    <div className={styles.roomsContent}>

      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Accounts Management</h2>
      </div>

      <div className={styles.filtersBar}>
        <select className={styles.filterSelect}>
          <option>Partner Type</option>
          <option>Accommodation</option>
          <option>Service</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Onboarding Status</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Suspended</option>
        </select>
        <select className={styles.filterSelect}>
          <option>Account Status</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.roomsTable}>
          <thead>
            <tr>
              <th>Partner</th>
              <th>Type</th>
              <th>Onboarding Status</th>
              <th>Account Status</th>
            </tr>
          </thead>
          <tbody>
            {partnerAccounts.map(partner => (
              <tr key={partner.partner_id}>
                <td>{partner.partner}</td>
                <td>{partner.type}</td>
                <td>{partner.onboardingStatus}</td>
                <td>{partner.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.activitySection}>

        <div className={styles.settingsCard}>
          <h3>Accommodation Provider Onboarding</h3>
          <form className={styles.settingsForm}>
            <div className={styles.inputGroup}>
              <label>Onboarding Status</label>
              <select>
                <option>Pending</option>
                <option>Under Review</option>
                <option>Approved</option>
                <option>Rejected</option>
                <option>Suspended</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>KYC Documents</label>
              <input type="file" multiple />
            </div>

            <div className={styles.inputGroup}>
              <label>Contact Persons</label>
              <textarea placeholder="Name, email, phone, role (one per line)" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Contract Dates</label>
                <input type="text" placeholder="Start - End" />
              </div>
              <div className={styles.inputGroup}>
                <label>Commission Rate</label>
                <input type="number" placeholder="15%" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Payout Cycle</label>
              <select>
                <option>Monthly</option>
                <option>Bi-weekly</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Attached Agreements</label>
              <input type="file" />
            </div>

            <button className={styles.saveButton}>Save Accommodation Account</button>
          </form>
        </div>

        <div className={styles.settingsCard}>
          <h3>Service Provider Accounts</h3>
          <form className={styles.settingsForm}>
            <div className={styles.inputGroup}>
              <label>KYC Documents</label>
              <input type="file" multiple />
            </div>

            <div className={styles.inputGroup}>
              <label>Scheduling Preferences</label>
              <textarea placeholder="Preferred work days, time slots, max job capacity" />
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Operating Hours</label>
                <input type="text" placeholder="Opening time" />
              </div>
              <div className={styles.inputGroup}>
                <label>Closing Time</label>
                <input type="text" placeholder="Closing time" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Working Days</label>
              <input type="text" placeholder="Mon - Sun" />
            </div>

            <button className={styles.saveButton}>Save Service Provider</button>
          </form>
        </div>

        <div className={styles.settingsCard}>
          <h3>Role Based Access Control</h3>
          <div className={styles.bookingsTable}>
            {roleAccessControl.map(role => (
              <div key={role.role} className={styles.bookingRow}>
                <div>
                  <strong>{role.role}</strong>
                  <p>{role.permissions.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
