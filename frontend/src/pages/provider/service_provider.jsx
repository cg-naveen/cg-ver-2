import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  FiBriefcase,
  FiCalendar,
  FiPieChart,
  FiPlus,
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2
} from "react-icons/fi";
import {useAuth} from '../../context/AuthContext';
import api from "../../api/axios";
import styles from "./provider.module.css";

const Metric = ({ title, value, icon }) => (
    <div className={styles.metricCard}>
      <div>
        <p className={styles.metricTitle}>{title}</p>
        <h3 className={styles.metricValue}>{value}</h3>
      </div>
      <div className={styles.metricIcon}>{icon}</div>
    </div>
  );  

const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case "active":
      case "completed":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  
  const ServiceForm = ({
    title,
    form,
    handleInput,
    onSubmit,
    onCancel
  }) => {
    return (
      <div className={styles.activitySection}>
        <div className={styles.settingsCard}>
          <h3>{title}</h3>
  
          <form
            className={styles.settingsForm}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <div className={styles.inputGroup}>
              <label>Service Name</label>
              <input
                name="service_name"
                value={form.service_name}
                onChange={handleInput}
                placeholder="Service Name"
                required
              />
            </div>
  
            <div className={styles.inputGroup}>
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInput}
                placeholder="Description"
              />
            </div>
  
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Price (RM)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInput}
                  min="0"
                  required
                />
              </div>
  
              <div className={styles.inputGroup}>
                <label>Max Quantity</label>
                <input
                  type="number"
                  name="max_quantity"
                  value={form.max_quantity}
                  onChange={handleInput}
                  min="1"
                  required
                />
              </div>
  
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) =>
                    handleInput({
                      target: {
                        name: "is_active",
                        value: e.target.value === "true"
                      }
                    })
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
  
            <div className={styles.actionButtons}>
              <button
                type="submit"
                className={styles.saveButton}
              >
                Save
              </button>
  
              <button
                type="button"
                className={styles.actionButton}
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  

  //MANAGE SERVICES CRUD
  const Modal = ({ title, children, onClose }) => {
    return (
      <div className={styles.activitySection}>
        <div className={styles.settingsCard}>
          <h3>{title}</h3>
  
          <div>{children}</div>
  
          <button
            className={styles.actionButton}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  

export default function ServiceProvider() {
  const { service_provider_id } = useParams();
  const {user} = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.service_provider_id != service_provider_id) {
    return <Navigate to="/" replace />
  }

  /* ======================================================
     STATE
  ====================================================== */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [provider, setProvider] = useState(null);
  const [stats, setStats] = useState(null);

  const [services, setServices] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");

  /* ===== MODALS ===== */
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedService, setSelectedService] = useState(null);

  const [form, setForm] = useState({
    service_name: "",
    description: "",
    price: "",
    max_quantity: 1,
    is_active: true
  });
  

  /* ======================================================
     FETCH DASHBOARD
  ====================================================== */
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/provider/service/${service_provider_id}/dashboard`
      );

      const {
        provider,
        stats,
        services,
        upcomingBookings,
        activeBookings,
        allBookings
      } = res.data;

      setProvider(provider);
      setStats(stats);
      setServices(services || []);
      setUpcomingBookings(upcomingBookings || []);
      setActiveBookings(activeBookings || []);
      setAllBookings(allBookings || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load service provider dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [service_provider_id]);

  /* ======================================================
     FILTER BOOKINGS (FIXED)
  ====================================================== */
  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => {
      const guest =
        `${b.first_name} ${b.last_name}`.toLowerCase();

      const matchesSearch =
        !searchText ||
        guest.includes(searchText.toLowerCase()) ||
        String(b.service_booking_id).includes(searchText);

      const matchesService =
        serviceFilter === "All" ||
        b.service_name === serviceFilter;

      return matchesSearch && matchesService;
    });
  }, [allBookings, searchText, serviceFilter]);

  /* ======================================================
     FORM HELPERS
  ====================================================== */
  const resetForm = () => {
    setForm({
      service_name: "",
      description: "",
      price: "",
      max_quantity: "",
      is_active: true
    });
    setSelectedService(null);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* ======================================================
     CRUD HANDLERS
  ====================================================== */
  const handleAddService = async () => {
    try {
      await api.post("/api/services", {
        service_name: form.service_name,
        description: form.description,
        price: Number(form.price),
        max_quantity: Number(form.max_quantity),
        is_active: form.is_active,
        service_provider_id
      });
  
      resetForm();
      setShowAddModal(false);
      fetchDashboard();
    } catch (err) {
      console.error("Add service error:", err);
      alert("Failed to add service");
    }
  };

  const openEditService = (service) => {
    setSelectedService(service);
    setForm({
      service_name: service.service_name,
      description: service.description || "",
      price: service.price,
      max_quantity: service.max_quantity,
      is_active: service.is_active
    });
    setShowEditModal(true);
  };  

  const handleEditService = async () => {
    try {
      await api.put(`/api/services/${selectedService.service_id}`, {
        service_name: form.service_name,
        description: form.description,
        price: Number(form.price),
        max_quantity: Number(form.max_quantity),
        is_active: form.is_active
      });
  
      setSelectedService(null);
      setShowEditModal(false)
      fetchDashboard();
    } catch (err) {
      console.error("Update service error:", err);
      alert("Failed to update service");
    }
  };  

  const handleDeleteService = async () => {
    if (!selectedService) return;
  
    if (!window.confirm("Delete this service permanently?")) return;
  
    try {
      await api.delete(`/api/services/${selectedService.service_id}`);
      setSelectedService(null);
      setShowDeleteModal(false);
      fetchDashboard();
    } catch (err) {
      console.error("Delete service error:", err);
      alert("Failed to delete service");
    }
  };
  /* ======================================================
     RENDER GUARDS
  ====================================================== */
  if (loading) return <p className={styles.loading}>Loading…</p>;
  if (error) return <p className={styles.emptyText}>{error}</p>;
  if (!provider || !stats) return null;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className={styles.dashboardContent}>

      {/* HEADER */}
      <div className={styles.headerRow}>
        <h1 className={styles.hotelTitle}>{provider.org_name}</h1>
        <button
          className={styles.addButton}
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <FiPlus /> Add Service
        </button>
      </div>

      {/* METRICS */}
      <div className={styles.metricsGrid}>
        <Metric title="Total Services" value={stats.total_services} icon={<FiBriefcase />} />
        <Metric title="Total Bookings" value={stats.total_bookings} icon={<FiCalendar />} />
        <Metric title="Active Bookings" value={stats.active_bookings} icon={<FiPieChart />} />
        <Metric title="Upcoming Bookings" value={stats.upcoming_bookings} icon={<FiCalendar />} />
      </div>

      {/* MANAGE SERVICES */}
      <div className={styles.bookingsContent}>
        <h3 className={styles.cardTitle}>Manage Services</h3>

        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Service</th>
              <th>Price</th>
              <th>Max Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.service_id}>
                <td>{s.service_name}</td>
                <td>{s.price}</td>
                <td>{s.max_quantity}</td>
                <td>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: getStatusColor(
                        s.is_active ? "active" : "pending"
                      )
                    }}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className={styles.actionButtonsRow}>
                  <button onClick={() => {
                    setSelectedService(s);
                    setShowViewModal(true);
                  }}>
                    <FiEye />
                  </button>

                  <button onClick={() => {
                    setSelectedService(s);
                    setForm(s);
                    setShowEditModal(true);
                  }}>
                    <FiEdit />
                  </button>

                  <button
                    className={styles.danger}
                    onClick={() => {
                      setSelectedService(s);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== VIEW / ADD / EDIT / DELETE MODALS ===== */}

      {/* View */}
      {showViewModal && selectedService && (
        <Modal title="View Service Details" onClose={() => setShowViewModal(false)}>
          <p><strong>ID:</strong> {selectedService.service_id}</p>
          <p><strong>Service:</strong> {selectedService.service_name}</p>
          <p><strong>Description:</strong> {selectedService.description || "-"}</p>
          <p><strong>Max Quantity:</strong> {selectedService.max_quantity}</p>
          <p><strong>Status:</strong> {selectedService.is_active ? "Active" : "Inactive"}</p>
        </Modal>
      )}

      {(showAddModal || showEditModal) && (
        <ServiceForm
          title={showAddModal ? "Add Service" : "Edit Service"}
          form={form}
          handleInput={handleInput}
          onSubmit={showAddModal ? handleAddService : handleEditService}
          onCancel={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
        />
      )}

      {showDeleteModal && selectedService && (
        <Modal title="Delete Service" onClose={() => setShowDeleteModal(false)}>
          <p>Are you sure you want to delete this service?</p>
          <button onClick={handleDeleteService} className={styles.addButton}>Delete</button>
        </Modal>
      )}

      {/* BOOKING HISTORY */}
      <div className={styles.bookingsContent}>
        <h3 className={styles.cardTitle}>Service Booking History</h3>

        <div className={styles.filtersBar}>
          <div className={styles.searchBox}>
            <FiSearch />
            <input
              placeholder="Search bookings"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>

          <select
            className={styles.filterSelect}
            value={serviceFilter}
            onChange={e => setServiceFilter(e.target.value)}
          >
            <option value="All">All services</option>
            {[...new Set(allBookings.map(b => b.service_name))].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <table className={styles.bookingsTable}>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Service</th>
              <th>Qty</th>
              <th>Location</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
  {filteredBookings.length ? filteredBookings.map(b => (
    <tr key={b.service_booking_id}>
      <td>{b.first_name} {b.last_name}</td>
      <td>{b.service_name}</td>
      <td>{b.quantity}</td>
      <td>
        {b.hotel_name} | {b.room_name} ({b.room_number})
      </td>
        
      <td>{b.check_in_date}</td>
    </tr>
  )) : (
    <tr>
      <td colSpan="7" className={styles.emptyText}>
        No bookings found
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

    </div>
  );
}

