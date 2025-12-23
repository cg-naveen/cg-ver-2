import React, { useState } from "react";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { useAdmin } from "./AdminContext";
import styles from "./Admin.module.css";

export default function ServiceManagement() {
    const {
        services = [],
        loadingServices,
        partnerAccounts = [],
        serviceBookings = [],
        loadingServiceBookings,
        addService,
        updateService,
        deleteService,
        formatCurrency,
        getStatusColor
    } = useAdmin();

    const [search, setSearch] = useState("");
    const [selectedService, setSelectedService] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [form, setForm] = useState({
        service_name: "",
        description: "",
        price: "",
        max_quantity: 1,
        is_active: true,
        provider: ""
    });

    const handleInput = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const openAddModal = () => {
        setForm({
            service_name: "",
            description: "",
            price: "",
            max_quantity: 1,
            is_active: true,
            provider: partnerAccounts.find(p => p.type === "Service")?.partner || ""
        });
        setShowAddModal(true);
    };

    const openEditModal = (service) => {
        setSelectedService(service);
        setForm({
            service_name: service.service_name,
            description: service.description || "",
            price: service.price,
            max_quantity: service.max_quantity || 1,
            is_active: service.is_active,
            provider: service.provider || ""
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (service) => {
        setSelectedService(service);
        setShowDeleteModal(true);
    };

    const openViewModal = (service) => {
        setSelectedService(service);
        setShowViewModal(true);
    };

    const handleAdd = async () => {
        const payload = {
            service_name: form.service_name,
            description: form.description,
            price: form.price,
            max_quantity: Number(form.max_quantity),
            is_active: form.is_active,
            provider: form.provider
        };

        const result = await addService(payload);
        if (result.success) setShowAddModal(false);
    };

    const handleEdit = async () => {
        const result = await updateService(selectedService.service_id, {
            ...form,
            max_quantity: Number(form.max_quantity)
        });
        if (result.success) setShowEditModal(false);
    };

    const handleDelete = async () => {
        const result = await deleteService(selectedService.service_id);
        if (result.success) setShowDeleteModal(false);
    };

    const filteredServices = services.filter((s) =>
        s.service_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.roomsContent}>
            <div className={styles.contentHeader}>
                <h2 className={styles.pageTitle}>Service Management</h2>
                <button className={styles.addButton} onClick={openAddModal}>
                    <FiPlus size={18} /> Add Service
                </button>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                    <FiSearch size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className={styles.filterSelect}
                    onChange={(e) => setSearch(e.target.value)}
                >
                    <option value="">All Providers</option>
                    {[...new Set(services.map(s => s.provider))]
                        .filter(Boolean)
                        .map((provider, index) => (
                            <option key={`${provider}-${index}`} value={provider}>
                                {provider}
                            </option>
                        ))}
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.roomsTable}>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Price</th>
                            <th>Max Qty</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingServices ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>Loading...</td>
                            </tr>
                        ) : filteredServices.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center" }}>
                                    No services found
                                </td>
                            </tr>
                        ) : (
                            filteredServices.map((service) => (
                                <tr key={service.service_id}>
                                    <td>{service.service_name}</td>
                                    <td>{service.provider}</td>
                                    <td>{formatCurrency(service.price)}</td>
                                    <td>{service.max_quantity}</td>
                                    <td>
                                        <span
                                            className={styles.statusBadge}
                                            style={{
                                                backgroundColor: getStatusColor(
                                                    service.is_active ? "active" : "pending"
                                                ),
                                            }}
                                        >
                                            {service.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtonsRow}>
                                            <button className={styles.actionButton} onClick={() => openViewModal(service)}>
                                                <FiEye size={14} />
                                            </button>
                                            <button className={styles.actionButton} onClick={() => openEditModal(service)}>
                                                <FiEdit size={14} />
                                            </button>
                                            <button className={styles.actionButton} onClick={() => openDeleteModal(service)}>
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

            {showViewModal && selectedService && (
                <div className={styles.activitySection}>
                    <div className={styles.settingsCard}>
                        <h3>View Service Details</h3>
                        <p>ID: {selectedService.service_id}</p>
                        <p><strong>Service:</strong> {selectedService.service_name}</p>
                        <p><strong>Description:</strong> {selectedService.description || "-"}</p>
                        <p><strong>Provider:</strong> {selectedService.provider}</p>
                        <p><strong>Max Quantity:</strong> {selectedService.max_quantity}</p>
                        <p><strong>Status:</strong> {selectedService.is_active ? "Active" : "Inactive"}</p>
                        <button className={styles.actionButton} onClick={() => setShowViewModal(false)}>Close</button>
                    </div>
                </div>
            )}

            {(showAddModal || showEditModal) && (
                <div className={styles.activitySection}>
                    <div className={styles.settingsCard}>
                        <h3>{showAddModal ? "Add Service" : `Edit Service (${form.service_name || "..."})`}</h3>
                        <form className={styles.settingsForm} onSubmit={(e) => e.preventDefault()}>

                            <div className={styles.inputGroup}>
                                <label>Service Name</label>
                                <input
                                    name="service_name"
                                    value={form.service_name}
                                    onChange={handleInput}
                                    placeholder="Service Name"
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
                                        name="price"
                                        type="number"
                                        value={form.price}
                                        onChange={handleInput}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Max Quantity</label>
                                    <input
                                        name="max_quantity"
                                        type="number"
                                        min="1"
                                        value={form.max_quantity}
                                        onChange={handleInput}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Status</label>
                                    <select
                                        name="is_active"
                                        value={form.is_active ? "true" : "false"}
                                        onChange={(e) =>
                                            setForm({ ...form, is_active: e.target.value === "true" })
                                        }
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Provider</label>
                                <select
                                    name="provider"
                                    value={form.provider}
                                    onChange={handleInput}
                                >
                                    {partnerAccounts
                                        .filter((p) => p.type === "Service")
                                        .map((partner) => (
                                            <option key={partner.partner_id} value={partner.partner}>
                                                {partner.partner}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.sendButton} onClick={showAddModal ? handleAdd : handleEdit}>
                                    {showAddModal ? "Add Service" : "Save Changes"}
                                </button>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setShowEditModal(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedService && (
                <div className={styles.activitySection}>
                    <div className={styles.settingsCard}>
                        <h3>Delete Service</h3>
                        <p>Are you sure you want to delete this service?</p>
                        <div className={styles.actionButtons}>
                            <button onClick={handleDelete} className={styles.addButton}>Delete</button>
                            <button className={styles.actionButton} onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVICE BOOKING TRACKER*/}
            <div className={styles.activitySection}>
  <div className={styles.settingsCard}>
    <h3>Service Booking Tracker</h3>

    <div className={styles.tableContainer}>
      <table className={styles.roomsTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Guest Name</th>
            <th>Service</th>
            <th>Quantity</th>
            <th>Booking ID</th>
          </tr>
        </thead>
        <tbody>
          {loadingServiceBookings ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>Loading...</td>
            </tr>
          ) : serviceBookings.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>No service bookings found</td>
            </tr>
          ) : (
            serviceBookings.map(entry => {
              const checkIn = new Date(entry.check_in_date);
              const formattedDate =
                checkIn.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

              return (
                <tr key={entry.service_booking_id}>
                  <td>{formattedDate}</td>
                  <td>{entry.first_name} {entry.last_name}</td>
                  <td>{entry.service_name}</td>
                  <td>{entry.quantity}</td>
                  <td>{entry.booking_id}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>

        </div>
    );
}