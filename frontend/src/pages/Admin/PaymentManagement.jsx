import React, { useState, useMemo } from "react";
import {
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload
} from "react-icons/fi";
import { useAdmin } from "./AdminContext";
import styles from "./Admin.module.css";

export default function PaymentManagement() {
  const {
    payments,
    loadingPayments,
    refunds,
    updateRefundStatus,
    formatCurrency,
    getStatusColor
  } = useAdmin();

  const commissionPartners = [
    { partner_id: 1, partner_name: "Partner A", commission: 10, total_commission: 1000 },
    { partner_id: 2, partner_name: "Partner B", commission: 15, total_commission: 2000 }
  ];
  
  const [filterDate, setFilterDate] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  const filteredPayments = useMemo(() => {
    let data = [...payments];
  
    if (filterDate) {
      data = data.filter(p => p.payment_date?.startsWith(filterDate));
    }
  
    if (filterMethod) {
      data = data.filter(
        p => p.payment_method?.toLowerCase() === filterMethod.toLowerCase()
      );
    }
  
    return data;
  }, [payments, filterDate, filterMethod]);
  

  return (
    <div className={styles.paymentsContent}>
      {/* HEADER */}
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Payment Management</h2>
      </div>

      {/* FILTER BAR */}
      <div className={styles.filtersBar}>
        <input
          type="date"
          className={styles.filterSelect}
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />

        <select
          className={styles.filterSelect}
          value={filterMethod}
          onChange={e => setFilterMethod(e.target.value)}
        >
          <option value="">Payment Method</option>
          <option>Credit Card</option>
          <option>FPX</option>
          <option>Bank Transfer</option>
        </select>
      </div>

                {/* PAYMENTS TABLE */}
<div className={styles.tableContainer}>
  <table className={styles.paymentsTable}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Booking</th>
        <th>Name</th>
        <th>Method</th>
        <th>Amount</th>
        <th>Date</th>
        <th>Reference</th>
      </tr>
    </thead>

    <tbody>
      {loadingPayments ? (
        <tr>
          <td colSpan="7" style={{ textAlign: "center" }}>Loading payments...</td>
        </tr>
      ) : filteredPayments.length === 0 ? (
        <tr>
          <td colSpan="7" style={{ textAlign: "center" }}>No payments found</td>
        </tr>
      ) : (
        filteredPayments.map(payment => (
          <tr key={payment.payment_id}>
            <td>{payment.payment_id}</td>
            <td>{payment.booking_id}</td>
            <td>{payment.guest_name}</td>
            <td>{payment.payment_method}</td>
            <td>{formatCurrency(payment.amount)}</td>
            <td>{payment.payment_date?.split("T")[0]}</td>
            <td>{payment.payment_reference || "-"}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
      {/* REFUND PROCESS */}
      <div className={styles.settingsCard} style={{ width: "100%" }}>
        <h3>Refund Processes</h3>

        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Booking</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No refunds found
                  </td>
                </tr>
              ) : (
                refunds.map(refund => (
                  <tr key={refund.refund_id}>
                    <td>{refund.booking_id}</td>
                    <td>{formatCurrency(refund.refund_amount)}</td>
                    <td>{refund.reason}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(refund.status) }}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtonsRow}>
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            updateRefundStatus(refund.refund_id, "approved")
                          }
                        >
                          <FiCheckCircle size={14} />
                        </button>

                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            updateRefundStatus(refund.refund_id, "rejected")
                          }
                        >
                          <FiAlertCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p>Approval or rejection triggers confirmation pop up.</p>
      </div>

      {/* INVOICE + EXPORT */}
      <div className={styles.twoColumnRow}>
        <div className={styles.settingsCard}>
          <h3>Invoice Generation</h3>
          <form className={styles.settingsForm}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Booking ID</label>
                <input type="text" placeholder="BKG1121" />
              </div>
              <div className={styles.inputGroup}>
                <label>Payer Email</label>
                <input type="email" placeholder="guest@email.com" />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Charges / Taxes / Commissions</label>
              <textarea placeholder="Break down charges, taxes, commissions" />
            </div>

            <div className={styles.formRow}>
              <button className={styles.downloadButton}>
                <FiDownload size={16} />
                Download Invoice
              </button>
              <button className={styles.addButton}>
                <FiUpload size={16} />
                Resend Invoice
              </button>
            </div>
          </form>
        </div>

        <div className={styles.settingsCard}>
          <h3>Export Documents</h3>
          <p>Payment reports, monthly statements, commission summaries.</p>
          <div className={styles.actionButtons}>
            <button className={styles.downloadButton}>CSV</button>
            <button className={styles.downloadButton}>PDF</button>
            <button className={styles.downloadButton}>XLSX</button>
          </div>
        </div>
      </div>

      {/* COMMISSION MANAGEMENT */}
      <div className={styles.settingsCard}>
        <h3>Commission Management</h3>

        <div className={styles.tableContainer}>
          <table className={styles.roomsTable}>
            <thead>
              <tr>
                <th>Partner</th>
                <th>Commission %</th>
                <th>Total Commissions</th>
              </tr>
            </thead>

            <tbody>
              {commissionPartners.map(partner => (
                <tr key={partner.partner_id}>
                  <td>{partner.partner_name}</td>
                  <td>{partner.commission}%</td>
                  <td>{formatCurrency(partner.total_commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className={styles.settingsForm}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Partner Name</label>
              <input type="text" />
            </div>
            <div className={styles.inputGroup}>
              <label>Commission Percentage</label>
              <input type="number" placeholder="0" />
            </div>
          </div>
          <button className={styles.saveButton}>Update Commission</button>
        </form>
      </div>
    </div>
  );
}

