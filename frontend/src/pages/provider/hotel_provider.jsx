import React, { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {useAuth} from '../../context/AuthContext';
import { FiHome, FiCalendar, FiPieChart, FiPlus, FiSearch, FiEye, FiEdit, FiTrash2, FiXCircle } from "react-icons/fi";
import api from "../../api/axios";
import styles from "./provider.module.css";
import BookingMultiSelect from "../../components/BookingMultiSelect";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
const today = dayjs().startOf("day");
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
// Utility for booking status colour
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'available':
    case 'active':
    case 'completed':
      return '#10B981';
    case 'pending':
    case 'pending payment':
      return '#F59E0B';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#3B82F6';
  }
};

export default function HotelProvider() {
  const { hotel_provider_id } = useParams();
  const { user} = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.hotel_provider_id !== hotel_provider_id) {
    return <Navigate to="/" replace />;
  }

  // === STATES ===
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hotel, setHotel] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [stats, setStats] = useState(null);

  const [allBookings, setAllBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [listingAction, setListingAction] = useState("none");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const emptyRoomForm = {
    room_number: "",
    room_name: "",
    rate: "",
    category: "",
    max_guests: "",
    availability_status: true,
    room_features: { regions: [], features: [], categories: [], rentalCategories: [] },
    images: []
  };
  const [roomForm, setRoomForm] = useState(emptyRoomForm);

  const [services, setServices] = useState([]);

  // === FETCH DATA ===
  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/provider/hotel/${hotel_provider_id}/dashboard`);
      const { hotel, stats, upcomingBookings, activeBookings } = res.data;
      setHotel(hotel || { name: "Hotel" });
      setStats(stats || {});
      setUpcomingBookings(upcomingBookings || []);
      setActiveBookings(activeBookings || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load hotel dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    if (!hotel_provider_id) return;

    setLoadingRooms(true);
    try {
      const res = await api.get(`/api/rooms/by-hotel/${hotel.hotel_id}`);
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data ?? [];
      setRooms(data);
    } catch (err) {
      console.error(err);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get(`/api/provider/hotel/${hotel_provider_id}/bookings`);
      const bookings = Array.isArray(res.data) ? res.data : [];
  
      setAllBookings(bookings);
  
      setUpcomingBookings(
        bookings.filter(b =>
          b.booking_status !== "cancelled" &&
          dayjs(b.check_in_date).isAfter(today)
        )
      );
  
      setActiveBookings(
        bookings.filter(b =>
          b.booking_status !== "cancelled" &&
          dayjs(b.check_in_date).isSameOrBefore(today) &&
          dayjs(b.check_out_date).isSameOrAfter(today)
        )
      );
    } catch (err) {
      console.error("Fetch bookings failed:", err);
      setAllBookings([]);
      setUpcomingBookings([]);
      setActiveBookings([]);
    }
  };  

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setServices([]);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchBookings();
    fetchServices();
  }, [hotel_provider_id]);

  useEffect(() => {
    if (hotel?.hotel_id) {
      fetchRooms();
    }
  }, [hotel]);  

  // === BOOKING FILTER ===
  const filteredBookings = useMemo(() => {
    return allBookings.filter(b => {
      const guestName = `${b.first_name} ${b.last_name}`.toLowerCase();
      const matchesSearch = !searchText || guestName.includes(searchText.toLowerCase()) || String(b.booking_id).includes(searchText);
      const matchesStatus = statusFilter === "All" || b.booking_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allBookings, searchText, statusFilter]);

  // === ROOM CRUD ===
  const resetRoomAction = () => {
    setListingAction("none");
    setSelectedRoom(null);
    setEditingRoom(null);
    setRoomForm(emptyRoomForm);
  };

  const handleDeleteRoom = async (room_id) => {
    if (!window.confirm("Delete this room permanently?")) return;
    try {
      await api.delete(`/api/rooms/${room_id}`);
      await fetchRooms();
      await fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to delete room");
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...roomForm, rate: Number(roomForm.rate), max_guests: Number(roomForm.max_guests) };
    try {
      if (editingRoom) {
        await api.put(`/api/rooms/${editingRoom.room_id}`, payload);
      } else {
        await api.post("/api/rooms", payload);
      }
      resetRoomAction();
      await fetchRooms();
      await fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Failed to save room");
    }
  };

  // === BOOKING CRUD ===
  const handleViewBooking = (booking) => { setSelectedBooking(booking); setShowView(true); setShowEdit(false); };
  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      room_id: booking.room_id,
      first_name: booking.first_name,
      last_name: booking.last_name,
      email: booking.email,
      phone_number: booking.phone_number,
      age: booking.age,
      num_guests: booking.num_guests,
      booking_status: booking.booking_status,
      message: booking.message || "",
      selected_services: Array.isArray(booking.services)
    ? booking.services.map(s => ({
        service_id: s.service_id,
        name: s.service_name,
        quantity: s.quantity
      }))
    : []
})
    const room = rooms.find(r => r.room_id === booking.room_id);
    setSelectedRoom(room || null);
    setShowEdit(true);
    setShowView(false);
  };

  const resetBookingPanels = () => { setSelectedBooking(null); setShowView(false); setShowEdit(false); };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (name === "room_id") setSelectedRoom(rooms.find(r => r.room_id === value) || null);
  };

  const updateEditGuests = (delta) => {
    setEditFormData(prev => ({ ...prev, num_guests: Math.max(1, Number(prev.num_guests || 1) + delta) }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      user_id: selectedBooking.user_id,
      room_id: editFormData.room_id,
      check_in_date: selectedBooking.check_in_date,
      check_out_date: selectedBooking.check_out_date,
      num_guests: editFormData.num_guests,
      total_price: selectedBooking.total_price,
      first_name: editFormData.first_name,
      last_name: editFormData.last_name,
      email: editFormData.email,
      phone_number: editFormData.phone_number,
      age: editFormData.age,
      message: editFormData.message,
      booking_status: editFormData.booking_status,
      selected_services: editFormData.selected_services
    };
  
    try {
      await api.put(`/api/bookings/${selectedBooking.booking_id}`, payload);
      await fetchBookings();
      await fetchDashboard();
      resetBookingPanels();
    } catch (err) {
      console.error(err);
      alert("Failed to update booking");
    }
  };  

  const roomsOptions = useMemo(() => rooms.map(r => ({
    room_id: r.room_id,
    label: `${r.room_name} (${r.room_number})`,
    max_guests: r.max_guests
  })), [rooms]);

  // === RENDER LOADING / ERROR ===
  if (loading) return <p className={styles.loading}>Loading hotel dashboard…</p>;
  if (error) return <p className={styles.emptyText}>{error}</p>;
  if (!hotel || !stats) return null;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className={styles.dashboardContent}>
        <div className={styles.headerRow}>
  <h1 className={styles.hotelTitle}>
    {hotel.name}
  </h1>

  <div className={styles.buttonGroup}>
  <button
  className={styles.addButton}
  onClick={() => {
    setSelectedHotel(hotel);
    setListingAction("editHotel");
  }}
>
  <FiEdit /> Edit Hotel Info
</button>


    <button
      className={styles.addButton}
      onClick={() => setListingAction("add")}
    >
      <FiPlus /> Add Room
    </button>
  </div>
</div>



      {/* METRICS */}
<div className={styles.metricsGrid}>
  <div className={styles.metricCard}>
    <div>
      <p className={styles.metricTitle}>Total Rooms</p>
      <h3 className={styles.metricValue}>{stats.total_rooms}</h3>
    </div>
    <div className={`${styles.metricIcon} ${styles.green}`}>
      <FiHome />
    </div>
  </div>

  <div className={styles.metricCard}>
    <div>
      <p className={styles.metricTitle}>Active Bookings</p>
      <h3 className={styles.metricValue}>{stats.active_bookings}</h3>
    </div>
    <div className={`${styles.metricIcon} ${styles.blue}`}>
      <FiCalendar />
    </div>
  </div>

  <div className={styles.metricCard}>
    <div>
      <p className={styles.metricTitle}>Upcoming Check-ins</p>
      <h3 className={styles.metricValue}>{stats.incoming_checkins}</h3>
    </div>
    <div className={`${styles.metricIcon} ${styles.purple}`}>
      <FiPieChart />
    </div>
  </div>

  <div className={styles.metricCard}>
    <div>
      <p className={styles.metricTitle}>Bookings Today</p>
      <h3 className={styles.metricValue}>{stats.bookings_today}</h3>
    </div>
    <div className={`${styles.metricIcon} ${styles.yellow}`}>
      <FiCalendar />
    </div>
  </div>

  <div className={styles.metricCard}>
    <div>
      <p className={styles.metricTitle}>Cancellation Rate</p>
      <h3 className={styles.metricValue}>{stats.cancellation_rate}%</h3>
    </div>
    <div className={`${styles.metricIcon} ${styles.red}`}>
      <FiXCircle />
    </div>
  </div>
</div>


{/* UPCOMING & ACTIVE BOOKINGS */}
      <div className={styles.activitySection}>
        <div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Upcoming Bookings</h3>
          {upcomingBookings.length ? upcomingBookings.map(b => (
            <div
              key={b.booking_id}
              className={styles.bookingRow}
            >
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>
                  {b.first_name} {b.last_name}
                </span>
                <span className={styles.bookingDates}>
                  {b.check_in_date} → {b.check_out_date}
                </span>
              </div>
              <FiEye
    onClick={e => {
      e.stopPropagation();
      handleViewBooking(b);
    }}
  />
  <FiEdit
    onClick={e => {
      e.stopPropagation();
      handleEditBooking(b);
    }}
  />
            </div>
          )) : (
            <p className={styles.emptyText}>No upcoming bookings</p>
          )}
        </div>

        <div className={styles.activityCard}>
          <h3 className={styles.cardTitle}>Active Bookings</h3>
          {activeBookings.length ? activeBookings.map(b => (
            <div
              key={b.booking_id}
              className={styles.bookingRow}
            >
              <div className={styles.bookingInfo}>
                <span className={styles.guestName}>
                  {b.first_name} {b.last_name}
                </span>
                <span className={styles.bookingDates}>
                  {b.check_in_date} → {b.check_out_date}
                </span>
              </div>
              <FiEye
    onClick={e => {
      e.stopPropagation();
      handleViewBooking(b);
    }}
  />
  <FiEdit
    onClick={e => {
      e.stopPropagation();
      handleEditBooking(b);
    }}
  />
            </div>
          )) : (
            <p className={styles.emptyText}>No active bookings</p>
          )}
        </div>
      </div>

{/* BOOKING HISTORY */}
      <div className={styles.bookingsContent}>
        <h3 className={styles.cardTitle}>Booking History</h3>

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
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>pending payment</option>
            <option>completed</option>
            <option>cancelled</option>
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {filteredBookings.length ? (
    filteredBookings.map(b => (
      <tr key={b.booking_id}>
        <td>{b.booking_id}</td>
        <td>{b.first_name} {b.last_name}</td>
        <td>{b.room_name}</td>
        <td>{b.check_in_date}</td>
        <td>{b.check_out_date}</td>
        <td>
          <span
            className={styles.statusBadge}
            style={{ backgroundColor: getStatusColor(b.booking_status) }}
          >
            {b.booking_status}
          </span>
        </td>
        <td className={styles.actionButtonsRow}>
                <button
                    onClick={() => handleViewBooking(b)}
                >
                  <FiEye />
                </button>
                <button
                  onClick={() => handleEditBooking(b)}
                  
                >
                  <FiEdit />
                </button>
              </td>
      </tr>
    ))
  ) : (
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

{/*View Panel*/}
{selectedBooking && showView && (
  <div className={styles.settingsCard}>
    <h3>Booking Details — {selectedBooking.booking_id}</h3>

    <div className={styles.detailsBox}>
      <p><strong>Guest:</strong> {selectedBooking.first_name} {selectedBooking.last_name}</p>
      <p><strong>Email:</strong> {selectedBooking.email || '-'}</p>
      <p><strong>Phone:</strong> {selectedBooking.phone_number}</p>
      <p><strong>Age:</strong> {selectedBooking.age || '-'}</p>
      <p><strong>Room:</strong> {selectedBooking.room_name}</p>
      <p><strong>Check-in:</strong> {selectedBooking.check_in_date}</p>
      <p><strong>Check-out:</strong> {selectedBooking.check_out_date}</p>
      <p><strong>Guests:</strong> {selectedBooking.num_guests}</p>
      <p><strong>Total (RM):</strong> {selectedBooking.total_price}</p>
      <p><strong>Status:</strong> {selectedBooking.booking_status}</p>
      <p><strong>Services:</strong></p>

{Array.isArray(selectedBooking.services) &&
selectedBooking.services.length > 0 ? (
  <ul>
    {selectedBooking.services.map(s => (
      <li key={s.service_id}>
        {s.service_name} × {s.quantity}
      </li>
    ))}
  </ul>
) : (
  <p>-</p>
)}
    </div>

    <button onClick={resetBookingPanels}>Close</button>
  </div>
)}

{/* EDIT PANEL */}
{selectedBooking && showEdit && (
  <div className={styles.settingsCard}>
    <h3>Edit Booking — {selectedBooking.booking_id}</h3>

    <form className={styles.settingsForm} onSubmit={handleEditSubmit}>
      <div className={styles.inputGroup}>
        <label>Room</label>
        <select
          name="room_id"
          value={editFormData.room_id || ""}
          onChange={handleEditChange}
        >
          <option value="">Select room</option>
          {roomsOptions.map(r => (
            <option key={r.room_id} value={r.room_id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>First Name</label>
          <input
            name="first_name"
            value={editFormData.first_name || ""}
            onChange={handleEditChange}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Last Name</label>
          <input
            name="last_name"
            value={editFormData.last_name || ""}
            onChange={handleEditChange}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={editFormData.email || ""}
            onChange={handleEditChange}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Phone</label>
          <input
            name="phone_number"
            value={editFormData.phone_number || ""}
            onChange={handleEditChange}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={editFormData.age || ""}
            onChange={handleEditChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Guests</label>
          <div className={styles.counter}>
            <button type="button" onClick={() => updateEditGuests(-1)}>-</button>
            <span>{editFormData.num_guests || 1}</span>
            <button
              type="button"
              onClick={() => updateEditGuests(1)}
              disabled={
                selectedRoom &&
                Number(editFormData.num_guests || 1) >=
                  Number(selectedRoom.max_guests ?? Infinity)
              }
              
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Services</label>
        <BookingMultiSelect
          value={editFormData.selected_services || []}
          onChange={vals =>
            setEditFormData(prev => {
              const merged = vals.map(v => {
                if (v.service_id) return v;
                const existing = prev.selected_services?.find(
                  s => s.name === v.name
                );
                return { ...v, service_id: existing?.service_id };
              });
              return { ...prev, selected_services: merged };
            })
          }
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Message</label>
        <input
          name="message"
          value={editFormData.message || ""}
          onChange={handleEditChange}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Status</label>
        <select
          name="booking_status"
          value={editFormData.booking_status || ""}
          onChange={handleEditChange}
        >
          <option>pending payment</option>
          <option>completed</option>
          <option>cancelled</option>
        </select>
      </div>

      <button type="submit" className={styles.saveButton}>
        Save Booking
      </button>
    </form>
  </div>
)}

{/* EDIT HOTEL */}
{listingAction === "editHotel" && selectedHotel && (
  <div className={styles.settingsCard}>
    <h3>Edit Hotel — {selectedHotel.name}</h3>

    <form
      className={styles.settingsForm}
      onSubmit={async e => {
        e.preventDefault();
        const form = e.target;

        const payload = {
          name: form.name.value,
          town: form.town.value,
          state: form.state.value,
          address: form.address.value,
          latitude: form.latitude.value,
          longitude: form.longitude.value,
          description: form.description.value,
          tags: form.tags.value
            ? form.tags.value.split(",").map(t => t.trim())
            : [],
          video_url: form.video_url.value
        };

        try {
          await api.put(`/api/hotels/${selectedHotel.hotel_id}`, payload);
          await fetchDashboard();
          setListingAction("view");
          setSelectedHotel(null);
        } catch (err) {
          console.error("Update hotel error:", err);
          alert("Failed to update hotel");
        }
      }}
    >
      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Name</label>
          <input name="name" defaultValue={selectedHotel.name} />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Town</label>
          <input name="town" defaultValue={selectedHotel.town} />
        </div>

        <div className={styles.inputGroup}>
          <label>State</label>
          <select name="state" defaultValue={selectedHotel.state}>
            <option value="">Select a state</option>
            <option value="Johor">Johor</option>
            <option value="Kedah">Kedah</option>
            <option value="Kelantan">Kelantan</option>
            <option value="Melaka">Melaka</option>
            <option value="Negeri Sembilan">Negeri Sembilan</option>
            <option value="Pahang">Pahang</option>
            <option value="Perak">Perak</option>
            <option value="Perlis">Perlis</option>
            <option value="Pulau Pinang">Pulau Pinang</option>
            <option value="Sabah">Sabah</option>
            <option value="Sarawak">Sarawak</option>
            <option value="Selangor">Selangor</option>
            <option value="Terengganu">Terengganu</option>
            <option value="Wilayah Persekutuan Kuala Lumpur">
              Wilayah Persekutuan Kuala Lumpur
            </option>
            <option value="Wilayah Persekutuan Labuan">
              Wilayah Persekutuan Labuan
            </option>
            <option value="Wilayah Persekutuan Putrajaya">
              Wilayah Persekutuan Putrajaya
            </option>
          </select>
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Address</label>
        <textarea name="address" defaultValue={selectedHotel.address} />
      </div>

      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <label>Latitude</label>
          <input name="latitude" defaultValue={selectedHotel.latitude} />
        </div>

        <div className={styles.inputGroup}>
          <label>Longitude</label>
          <input name="longitude" defaultValue={selectedHotel.longitude} />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>Description</label>
        <textarea name="description" defaultValue={selectedHotel.description} />
      </div>

      <div className={styles.inputGroup}>
        <label>Tags</label>
        <input
          name="tags"
          defaultValue={(selectedHotel.tags || []).join(", ")}
        />
      </div>

      <div className={styles.inputGroup}>
        <label>Video URL</label>
        <input
          name="video_url"
          defaultValue={selectedHotel.video_url || ""}
        />
      </div>

      <div className={styles.actionButtons}>
        <button type="submit" className={styles.saveButton}>
          Save Hotel
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => {
            setListingAction("none");
            setSelectedHotel(null);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}



{/* =========================
    ROOMS SECTION (ADMIN 1:1)
========================= */}
<div className={styles.bookingsContent}>
<h1 className={styles.cardTitle}>
    Manage Rooms
  </h1>

{/* VIEW ROOMS */}

    <div className={styles.tableContainer}>
      <table className={styles.bookingsTable}>
        <thead>
          <tr>
            <th>Room</th>
            <th>Rate (RM) </th>
            <th>Availability</th>
            <th>Pax</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.length ? rooms.map(room => (
            <tr key={room.room_id}>
              <td>{room.room_name} ({room.room_number})</td>
              <td>{(room.rate)}</td>
              <td>
                        <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(room.availability_status ? 'active' : 'pending') }}>
                          {room.availability_status ? 'True' : 'False'}
                        </span>
              </td>
              <td>{room.max_guests}</td>
              <td>{room.category}</td>
              <td className={styles.actionButtonsRow}>
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setListingAction("edit");
                  }}
                >
                  <FiEdit />
                </button>
                <button
                  className={styles.danger}
                  onClick={() => {
                    setSelectedRoom(room);
                    setListingAction("delete");
                  }}
                >
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className={styles.emptyText}>
                No rooms found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  
{/* ADD ROOM */}
{listingAction === "add" && (
  <form
    className={styles.settingsCard}
    onSubmit={async e => {
      e.preventDefault();
      const form = e.target;

      const payload = {
        hotel_id: hotel.hotel_id,
        room_number: form.room_number.value,
        room_name: form.room_name.value,
        rate: Number(form.rate.value),
        category: form.category.value,
        max_guests: Number(form.max_guests.value),
        availability_status: form.availability_status.value === "true",
        room_features: {
          regions: form.region.value
            ? form.region.value.split(",").map(r => r.trim())
            : [],
          features: form.features.value
            ? form.features.value.split(",").map(f => f.trim())
            : [],
          categories: form.categories.value
            ? form.categories.value.split(",").map(c => c.trim())
            : [],
          rentalCategories: form.rentalCategories.value
            ? form.rentalCategories.value.split(",").map(r => r.trim())
            : []
        },
        images: []
      };

      await api.post("/api/rooms", payload);
      await fetchRooms();
      await fetchDashboard();
      resetRoomAction();
    }}
  >
    <h3>Add Room</h3>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label>Room Number</label>
        <input type="text" name="room_number" required />
      </div>
      <div className={styles.inputGroup}>
        <label>Room Name</label>
        <input type="text" name="room_name" required />
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label>Rate</label>
        <input type="number" name="rate" step="0.01" />
      </div>
      <div className={styles.inputGroup}>
        <label>Max Guests</label>
        <input type="number" name="max_guests" min="1" />
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label htmlFor="category">Category</label>
        <select name="category" id="category" required>
          <option value="">Select category</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
          <option value="Budget">Budget</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>Availability</label>
        <select name="availability_status">
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>
    </div>

    <div className={styles.inputGroup}>
      <label>Regions</label>
      <input type="text" name="region" placeholder="e.g. Sea View, City" />
    </div>

    <div className={styles.inputGroup}>
      <label>Features</label>
      <input type="text" name="features" placeholder="e.g. WiFi, TV" />
    </div>

    <div className={styles.inputGroup}>
      <label>Categories</label>
      <input type="text" name="categories" placeholder="e.g. Family, Business" />
    </div>

    <div className={styles.inputGroup}>
      <label>Rental Categories</label>
      <input type="text" name="rentalCategories" placeholder="e.g. Short Stay, Long Stay" />
    </div>

    <div className={styles.formActions}>
      <button type="submit" className={styles.saveButton}>Add Room</button>
      <button type="button" className={styles.actionButton} onClick={resetRoomAction}>Cancel</button>
    </div>
  </form>
)}

{/* EDIT ROOM */}
{listingAction === "edit" && selectedRoom && (
  <form
    className={styles.settingsCard}
    onSubmit={async e => {
      e.preventDefault();
      const form = e.target;

      const payload = {
        room_number: form.room_number.value,
        room_name: form.room_name.value,
        rate: Number(form.rate.value),
        category: form.category.value,
        max_guests: Number(form.max_guests.value),
        availability_status: form.availability_status.value === "true",
        room_features: {
          regions: form.region.value.split(",").map(r => r.trim()),
          features: form.features.value.split(",").map(f => f.trim()),
          categories: form.categories.value.split(",").map(c => c.trim()),
          rentalCategories: form.rentalCategories.value.split(",").map(r => r.trim()),
        }
      };

      // API call
      await api.put(`/api/rooms/${selectedRoom.room_id}`, payload);
      await fetchRooms();
      await fetchDashboard();
      resetRoomAction();
    }}
  >
    <h3>Edit Room — {selectedRoom.room_name}</h3>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label>Room Name</label>
        <input type="text" name="room_name" defaultValue={selectedRoom.room_name} required />
      </div>
      <div className={styles.inputGroup}>
        <label>Room Number</label>
        <input type="text" name="room_number" defaultValue={selectedRoom.room_number} required />
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label>Rate</label>
        <input type="number" name="rate" defaultValue={selectedRoom.rate} step="0.01" required />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="category">Category</label>
        <select name="category" id="category" defaultValue={selectedRoom.category}>
          <option value="">Select category</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
          <option value="Budget">Budget</option>
        </select>
      </div>
    </div>

    <div className={styles.formRow}>
      <div className={styles.inputGroup}>
        <label>Max Guests</label>
        <input type="number" name="max_guests" defaultValue={selectedRoom.max_guests} required />
      </div>
      <div className={styles.inputGroup}>
        <label>Availability</label>
        <select name="availability_status" defaultValue={selectedRoom.availability_status ? 'true' : 'false'}>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>
    </div>

    <div className={styles.inputGroup}>
      <label>Regions</label>
      <input type="text" name="region" defaultValue={(selectedRoom.room_features?.regions || []).join(', ')} />
    </div>

    <div className={styles.inputGroup}>
      <label>Features</label>
      <input type="text" name="features" defaultValue={(selectedRoom.room_features?.features || []).join(', ')} />
    </div>

    <div className={styles.inputGroup}>
      <label>Categories</label>
      <input type="text" name="categories" defaultValue={(selectedRoom.room_features?.categories || []).join(', ')} />
    </div>

    <div className={styles.inputGroup}>
      <label>Rental Categories</label>
      <input type="text" name="rentalCategories" defaultValue={(selectedRoom.room_features?.rentalCategories || []).join(', ')} />
    </div>

    <div className={styles.formActions}>
      <button type="submit" className={styles.saveButton}>Update</button>
      <button type="button" className={styles.actionButton} onClick={resetRoomAction}>Cancel</button>
    </div>
  </form>
)}

{/* DELETE ROOM */}
{listingAction === "delete" && selectedRoom && (
  <div className={styles.settingsCard}>
    <h3>Delete Room</h3>
    <p>
      Are you sure you want to permanently delete
      <strong> {selectedRoom.room_name}</strong>?
    </p>

    <div className={styles.formActions}>
      <button
        className={styles.addButton}
        onClick={async () => {
          await api.delete(`/api/rooms/${selectedRoom.room_id}`);
          await fetchRooms();
          await fetchDashboard();
          resetRoomAction();
        }}
      >
        Delete
      </button>
      <button className={styles.actionButton} onClick={resetRoomAction}>Cancel</button>
    </div>
  </div>
)}
</div>
    </div>
  );
}
